const Employee = require("../models/employeeModel");
const Attendance = require('../models/attendanceModel');
const ExcelJS = require('exceljs');
const moment = require('moment');

// Create Employee
exports.create = async (req, res) => {
    try {
        const { joiningDate, leavingDate, enrollmentNumber } = req.body;

        if (enrollmentNumber) {
            return res.status(400).json({ status: false, data: "EnrollmentNumber is auto-incrementing. scSo, should not be passed in the JSON data!" });
        }

        if (!joiningDate) {
            return res.status(400).json({ status: false, data: "Joining Date is required !" });
        }
        else if (isNaN(Date.parse(joiningDate))) {
            return res.status(400).json({ status: false, data: "Joining Date should be in YYYY-MM-DD format !" })
        }

        if (!leavingDate) {
            return res.status(400).json({ status: false, data: "Leaving Date is required !" });
        }
        else if (isNaN(Date.parse(leavingDate))) {
            return res.status(400).json({ status: false, data: "Leaving Date should be in YYYY-MM-DD format !" })
        }

        // Ensure leaving date is after joining date
        if (new Date(leavingDate) <= new Date(joiningDate)) {
            return res.status(400).json({ status: false, data: "Leaving Date should be after Joining Date!" });
        }

        // Entrollment Number Auto-Increment
        const count = await Employee.countDocuments();
        const incrementedEnrollmentNumber = count + 1;

        const employeeData = req.body;
        // const newEmployee = new Employee(employeeData);
        const newEmployee = new Employee({
            ...employeeData,
            enrollmentNumber: incrementedEnrollmentNumber.toString()
        });

        await newEmployee.save();

        res.status(200).json({ status: true, data: "Employee registered Successfully !" });
    } catch (error) {
        console.error('Error creating employee:', error.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

// Read all employee
// exports.getEmployee = async (req, res) => {
//     try {
//         const employees = await Employee.find();
//         res.status(200).json(employees);
//     } catch (error) {
//         res.status(500).json(error);
//     }
// }

// Search Employee by key
exports.getEmployee = async (req, res) => {
    try {
        let query = {};

        if (req.query.value) {
            const value = req.query.value;

            if (req.query.key) {
                const searchField = req.query.key;

                if (searchField === 'enrollmentNumber' || searchField === 'name' || searchField === 'mobileNumber') {
                    query[searchField] = { $regex: new RegExp(value, 'i') };
                } else {
                    return res.status(400).json({ error: 'Invalid search field' });
                }
            }
            else {
                query = {
                    $or: [
                        { enrollmentNumber: { $regex: new RegExp(value, 'i') } },
                        { name: { $regex: new RegExp(value, 'i') } },
                        { mobileNumber: { $regex: new RegExp(value, 'i') } },
                    ],
                };
            }
        }

        const results = await Employee.find(query);

        if (results.length > 0) {
            res.json(results);
        }
        else {
            res.json({ data: "No Data Found for the given value" });
        }

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

// Get Employee Attendance 
exports.getEmployeeAttendance = async (req, res) => {
    try {
        const { date } = req.query;

        const dateFormatRegex = /^\d{4}-\d{2}-\d{2}$/;

        if (date && !dateFormatRegex.test(date)) {
            return res.status(400).json({ error: 'Invalid date format. Please use YYYY-MM-DD format.' });
        }

        const currentDate = date ? new Date(date) : new Date();

        const nextDate = new Date(currentDate);
        nextDate.setDate(currentDate.getDate() + 1);

        const attendanceRecords = await Attendance.find({ date: { $gte: currentDate, $lt: nextDate } });

        const attendanceMap = new Map();
        attendanceRecords.forEach(record => {
            attendanceMap.set(record.enrollmentNumber, record);
        });

        const employees = await Employee.find();

        const employeesWithAttendance = employees.map(employee => {
            const attendanceRecord = attendanceMap.get(employee.enrollmentNumber) || { attendance: null };

            return {
                enrollmentNumber: employee.enrollmentNumber,
                name: employee.name,
                mobileNumber: employee.mobileNumber,
                attendance: attendanceRecord.attendance,
            }
        })
        res.status(200).json(employeesWithAttendance);
    } catch (error) {
        res.status(500).json(error);
    }
}

// Get Total Employee Attendance by monthly
exports.getTotalAttendance = async (req, res) => {
    const enrollmentNumber = req.params.enrollmentNumber;
    const month = parseInt(req.params.month);

    if (enrollmentNumber == 0) {
        return res.json({ status: false, data: "Enrollment Number cannot be 0" });
    }

    if (month < 1 || month > 12) {
        return res.status(400).json({ status: false, data: "Invalid month. Month should be between 1 and 12." })
    }

    try {
        const employee = await Employee.findOne({ enrollmentNumber });

        if (!employee) {
            return res.status(404).json({ status: false, data: "Employee not found" });
        }

        const allAttendance = await Attendance.find({
            enrollmentNumber,
            date: {
                $gte: new Date(new Date().getFullYear(), month - 1, 1),
                $lt: new Date(new Date().getFullYear(), month, 1),
            }
        });

        const totalPresentAttendance = allAttendance.filter(record => record.attendance === 'present').length;
        const totalAbsentAttendance = allAttendance.filter(record => record.attendance === 'absent').length;

        const { name, mobileNumber, salary } = employee;

        const totalSalary = salary * totalPresentAttendance;

        const monthName = new Date(new Date().getFullYear(), month - 1, 1).toLocaleString('default', { month: 'long' });

        res.json({ status: true, enrollmentNumber, name, mobileNumber, month, monthName, totalPresentAttendance, totalAbsentAttendance, salary, totalSalary })

    } catch (error) {
        console.error('Error fetching total attendance:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

// Update Employee
exports.updateEmployee = async (req, res) => {
    const enrollmentNumber = req.params.enrollmentNumber;
    const updateFields = req.body;

    try {
        delete updateFields.enrollmentNumber;

        const employee = await Employee.findOneAndUpdate({ enrollmentNumber }, updateFields, { new: true });

        if (!employee) {
            return res.status(404).send({ data: 'Employee not found' });
        }

        res.send({
            success: true,
            data: [{ message: `Enrollment Number ${enrollmentNumber} data updated successfully !` },
            { employee }]
        });
    } catch (error) {
        console.error(error);
        res.status(500).send({ error: 'Server error' });
    }
}

// Delete Employee
exports.deleteEmployee = async (req, res) => {
    const enrollmentNumber = req.params.enrollmentNumber;
    try {
        const employee = await Employee.findOneAndDelete({ enrollmentNumber });

        if (!employee) {
            return res.status(404).send({ error: `Enrollment Number ${enrollmentNumber} does not exists :(` });
        }

        res.send({ data: `Enrollment Number ${enrollmentNumber} deleted successfully !` });
    } catch (error) {
        console.error(error);
        res.status(500).send({ error: 'Server error' });
    }
}

// Generate Excel file
exports.generateExcel = async (req, res) => {
    try {
        const startDate = moment().subtract(12, 'months').startOf('month').toDate();
        const endDate = moment().endOf('day').toDate();

        const allEmployees = await Employee.find({});
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Employees');

        worksheet.columns = [
            { header: 'Enrollment Number', key: 'enrollmentNumber', width: 20 },
            { header: 'Name', key: 'name', width: 30 },
            { header: 'Mobile Number', key: 'mobileNumber', width: 20 },
            { header: 'Bank', key: 'bank', width: 20 },
            { header: 'Account Number', key: 'accountNumber', width: 20 },
            { header: 'IFSC Code', key: 'ifscCode', width: 20 },
            { header: 'Salary', key: 'salary', width: 15 },
            { header: 'Total Salary', key: 'totalSalary', width: 15 },
            { header: 'Start Date', key: 'startDate', width: 20 },
            { header: 'End Date', key: 'endDate', width: 20 }
        ];

        for (const employee of allEmployees) {
            const attendance = await Attendance.find({
                enrollmentNumber: employee.enrollmentNumber,
                date: { $gte: startDate, $lte: endDate }
            });

            const totalPresentAttendance = attendance.filter(record => record.attendance === 'present').length;
            const totalSalary = totalPresentAttendance * employee.salary;

            worksheet.addRow({
                enrollmentNumber: employee.enrollmentNumber,
                name: employee.name,
                mobileNumber: employee.mobileNumber,
                bank: employee.bank,
                accountNumber: employee.accountNumber,
                ifscCode: employee.ifscCode,
                salary: employee.salary,
                totalSalary: totalSalary,
                startDate: startDate,
                endDate: endDate
            });
        }

        const stream = await workbook.xlsx.writeBuffer();
        const base64String = stream.toString('base64');

        res.json({ base64String });
    } catch (error) {
        console.error('Error generating Excel:', error);
        res.status(500).json({ error: 'An error occurred while generating Excel sheet' });
    }
}




















































// http://localhost:8000/employee/getEmployee?value=12345&key=mobileNumber -> by mobileNumber
// http://localhost:8000/employee/getEmployee?value=man&key=name  -> by name
// http://localhost:8000/employee/getEmployee?value=1&key=enrollmentNumber -> by entrollmentNumber
// http://localhost:8000/employee/getEmployee?value=mansi -> all fields
