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

// Get Employee Attedance
// exports.getEmployeeAttendance = async (req, res) => {
//     try {
//         const employees = await Employee.find({}, 'enrollmentNumber name mobileNumber');

//         for (let i = 0; i < employees.length; i++) {
//             const employee = employees[i];
//             const attendanceData = await Attendance.findOne({ enrollmentNumber: employee.enrollmentNumber });

//             if (attendanceData) {
//                 employee.attendance = attendanceData.attendance;
//                 employee.date = attendanceData.date;
//             } else {
//                 employee.attendance = null;
//             }
//         }

//         const formattedEmployees = employees.map(employee => ({
//             enrollmentNumber: employee.enrollmentNumber,
//             name: employee.name,
//             mobileNumber: employee.mobileNumber,
//             attendance: employee.attendance,
//             date:employee.date
//         }));

//         res.status(200).json(formattedEmployees);
//     } catch (error) {
//         res.status(500).json(error);
//     }
// }
// OLD
// exports.getEmployeeAttendance = async (req, res) => {
//     try {
//         const queryDate = req.query.date;
//         const filterDate = new Date(queryDate);
//         const formattedFilterDate = filterDate.toISOString().split('T')[0];

//         const employees = await Employee.find({}, 'enrollmentNumber name mobileNumber');

//         const formattedEmployees = await Promise.all(employees.map(async employee => {
//             const attendanceData = await Attendance.findOne({ enrollmentNumber: employee.enrollmentNumber });

//             if (attendanceData && attendanceData.date.toISOString().split('T')[0] === formattedFilterDate) {
//                 const formattedAttendanceDate = attendanceData.date.toISOString().split('T')[0];
//                 return {
//                     enrollmentNumber: employee.enrollmentNumber,
//                     name: employee.name,
//                     mobileNumber: employee.mobileNumber,
//                     attendance: attendanceData.attendance,
//                     date: formattedAttendanceDate
//                 };
//             }
//             else {
//                 return null;
//             }
//         }));
//         const filteredEmployees = formattedEmployees.filter(employee => employee !== null);

//         res.status(200).json(filteredEmployees);
//     } catch (error) {
//         res.status(500).json(error);
//     }
// }

exports.getEmployeeAttendance = async (req, res) => {
    try {
        const queryDate = req.query.date;
        const filterDate = new Date(queryDate);
        const nextDate = new Date(filterDate);
        nextDate.setDate(filterDate.getDate() + 1);

        const employees = await Employee.find({}, 'enrollmentNumber name mobileNumber');

        const formattedEmployees = await Promise.all(employees.map(async employee => {
            const attendanceData = await Attendance.findOne({
                enrollmentNumber: employee.enrollmentNumber,
                date: { $gte: filterDate, $lt: nextDate }
            });

            if (attendanceData) {
                const formattedAttendanceDate = attendanceData.date.toISOString().split('T')[0];
                return {
                    enrollmentNumber: employee.enrollmentNumber,
                    name: employee.name,
                    mobileNumber: employee.mobileNumber,
                    attendance: attendanceData.attendance,
                    date: formattedAttendanceDate
                };
            } else {
                res.json({ message: 'Please enter valid date' })
            }
        }));

        const filteredEmployees = formattedEmployees.filter(employee => employee !== null);

        res.status(200).json(filteredEmployees);
    } catch (error) {
        res.status(500).json(error);
    }
}



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
