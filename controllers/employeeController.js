const Employee = require("../models/employeeModel");
const Attendance = require('../models/attendanceModel');
const XLSX = require('xlsx');

// Create Employee
exports.createEmployee = async (req, res) => {
    try {

        const { joiningDate, leavingDate } = req.body;
        if (!joiningDate) {
            return res.json({ message: "Joining Date is required !" });
        }
        if (!leavingDate) {
            return res.json({ message: "Leaving Date is required !" });
        }

        // Entrollment Number Auto-Increment
        const count = await Employee.countDocuments();
        const enrollNum = count + 1;

        const employeeData = req.body;
        // const newEmployee = new Employee(employeeData);
        const newEmployee = new Employee({
            ...employeeData,
            enrollmentNumber: enrollNum.toString()
        });

        await newEmployee.save();

        res.status(200).json({ message: "Employee registered Successfully !" });
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



    try {
        const allAttendance = await Attendance.find({
            enrollmentNumber ,
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
            return res.status(404).send({ error: 'Employee not found' });
        }

        res.send({ message: `Entrollment Number ${enrollmentNumber} data updated successfully !`, data: employee });
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
exports.generateExcelSheet = async (req, res) => {
    const { year, month } = req.params;
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);

    try {
        // Aggregate attendance data
        const attendanceData = await Attendance.aggregate([
            {
                $match: {
                    date: { $gte: startDate, $lte: endDate }
                }
            },
            {
                $group: {
                    _id: '$enrollmentNumber',
                    attendance: { $push: '$attendance' }
                }
            },
            {
                $lookup: {
                    from: 'employees',
                    localField: '_id',
                    foreignField: 'enrollmentNumber',
                    as: 'employee'
                }
            },
            {
                $project: {
                    name: '$employee.name',
                    attendance: 1
                }
            }
        ]);

        // Generate Excel sheet
        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.json_to_sheet(attendanceData);
        XLSX.utils.book_append_sheet(wb, ws, 'Attendance');
        const filePath = `attendance_${year}_${month}.xlsx`;
        XLSX.writeFile(wb, filePath);

        res.download(filePath); // Send Excel file as response
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal Server Error');
    }
}





















// http://localhost:8000/employee/getEmployee?value=12345&key=mobileNumber -> by mobileNumber
// http://localhost:8000/employee/getEmployee?value=man&key=name  -> by name
// http://localhost:8000/employee/getEmployee?value=1&key=enrollmentNumber -> by entrollmentNumber
// http://localhost:8000/employee/getEmployee?value=mansi -> all fields
