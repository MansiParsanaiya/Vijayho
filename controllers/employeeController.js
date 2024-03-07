const Employee = require("../models/employeeModel");
const Attendance = require('../models/attendanceModel');

// Create Employee
exports.createEmployee = async (req, res) => {
    try {

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

// Update Employee
exports.updateEmployee = async (req, res) => {
    const enrollmentNumber = req.params.enrollmentNumber;
    const updateFields = req.body;

    try {
        // Exclude enrollmentNumber from updateFields
        delete updateFields.enrollmentNumber;

        // Find the employee by enrollmentNumber and update
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
























// http://localhost:8000/employee/getEmployee?value=12345&key=mobileNumber -> by mobileNumber
// http://localhost:8000/employee/getEmployee?value=man&key=name  -> by name
// http://localhost:8000/employee/getEmployee?value=1&key=enrollmentNumber -> by entrollmentNumber
// http://localhost:8000/employee/getEmployee?value=mansi -> all fields
