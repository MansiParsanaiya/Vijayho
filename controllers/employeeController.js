const Employee = require("../models/employeeModel");
const Attendance = require('../models/attendanceModel');
const exceljs = require('exceljs');

// Create Employee
exports.create = async (req, res) => {
    try {

        const { joiningDate, leavingDate } = req.body;

        if (!joiningDate) {
            return res.status(400).json({ status: false, data: ["Joining Date is required !"] });
        }
        else if (isNaN(Date.parse(joiningDate))) {
            return res.status(400).json({ status: false, data: ["Joining Date should be in YYYY-MM-DD format !"] })
        }

        if (!leavingDate) {
            return res.status(400).json({ status: false, data: ["Leaving Date is required !"] });
        }
        else if (isNaN(Date.parse(leavingDate))) {
            return res.status(400).json({ status: false, data: ["Leaving Date should be in YYYY-MM-DD format !"] })
        }

        // Ensure leaving date is after joining date
        if (new Date(leavingDate) <= new Date(joiningDate)) {
            return res.status(400).json({ status: false, data: ["Leaving Date should be after Joining Date!"] });
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

        res.status(200).json({ status: true, data: ["Employee registered Successfully !"] });

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
        res.json({ message: "Entrollment Number cannot be 0" });
    }

    try {
        const allAttendance = await Attendance.find({
            enrollmentNumber,
            date: {
                $gte: new Date(new Date().getFullYear(), month - 1, 1),
                $lt: new Date(new Date().getFullYear(), month, 1),
            }
        });

        const totalPresentAttendance = allAttendance.filter(record => record.attendance === 'present').length;
        const totalAbsentAttendance = allAttendance.filter(record => record.attendance === 'absent').length;

        res.json({ enrollmentNumber, month, totalPresentAttendance, totalAbsentAttendance });
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
            return res.status(404).send({ data: ['Employee not found'] });
        }

        res.send({ data: [`Enrollment Number ${enrollmentNumber} data updated successfully !`], data: employee });
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

        res.send({ message: `Enrollment Number ${enrollmentNumber} deleted successfully !` });
    } catch (error) {
        console.error(error);
        res.status(500).send({ error: 'Server error' });
    }
}

// Generate Excel file
// exports.generateExcel = async (req, res) => {
//     try {
//         const employees = await Employee.find();
//         const workbook = XLSX.utils.book_new();
//         const sheet = XLSX.utils.json_to_sheet(employees);
//         XLSX.utils.book_append_sheet(workbook, sheet, 'Employees');
//         XLSX.writeFile(workbook, 'employees.xlsx');
//         res.download('employees.xlsx');

//     } catch (error) {
//         console.error(error);
//         res.status(500).send({ error: 'Server error' });

//     }
// }























































// http://localhost:8000/employee/getEmployee?value=12345&key=mobileNumber -> by mobileNumber
// http://localhost:8000/employee/getEmployee?value=man&key=name  -> by name
// http://localhost:8000/employee/getEmployee?value=1&key=enrollmentNumber -> by entrollmentNumber
// http://localhost:8000/employee/getEmployee?value=mansi -> all fields
