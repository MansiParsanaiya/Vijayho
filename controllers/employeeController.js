const Employee = require("../models/employeeModel");

// exports.getUser = async (req, res) => {
//     const user = req.body;
//     res.send(user)
// }

exports.createEmployee = async (req, res) => {
    try {
        const employee = new Employee(req.body);
        await employee.save();
        res.status(201).send('Employee registered successfully');
        res.status(201).json({ message: 'Employee registered successfully' });
    } catch (error) {
        res.status(400).send(error);
        res.status(500).json({ message: 'Employee Not registered :( ' });
    }
}

exports.getEmployee = async (req, res) => {
    try {
        const employees = await Employee.find();
        res.status(200).send(employees);
    } catch (error) {
        res.status(500).send(error);
    }
}


exports.dailyAttendance = async (req, res) => {
    const { enrollmentNumber, present } = req.body;

    if (!enrollmentNumber || present === undefined) {
        return res.status(400).send("Both enrollmentNumber and present are required in the request body");
    }

    try {
        const employee = await Employee.findOneAndUpdate(
            { enrollmentNumber: enrollmentNumber },
            {
                $push: {
                    'attendance.daily': { present, date: new Date() }
                }
            },
            { new: true, upsert: false }
        );

        if (!employee) {
            return res.status(404).send("Employee not found");
        }

        res.send(employee);
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal server error");
    }
}


// Get monthly attendance
// exports.monthlyAttendance = async (req, res) => {
//     try {
//         const { month, year } = req.query;

//         const employee = await Employee.findById(req.params.id);

//         if (!employee) {
//             return res.status(404).send();
//         }

//         // Filter daily attendance for the specified month and year
//         const monthlyAttendance = employee.attendance.daily
//             .filter((entry) => entry.date.getMonth() === parseInt(month) && entry.date.getFullYear() === parseInt(year))
//             .map((entry) => ({
//                 date: entry.date,
//                 present: entry.present,
//             }));

//         res.send(monthlyAttendance);
//     } catch (error) {
//         res.status(400).send(error);
//     }
// }