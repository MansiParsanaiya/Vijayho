const Employee = require("../models/employeeModel");

// exports.getUser = async (req, res) => {
//     const user = req.body;
//     res.send(user)
// }

exports.createEmployee = async (req, res) => {
    try {
        console.log(req.body)
        const employee = new Employee(req.body);
        await employee.save();
        res.status(201).json({ message: 'Employee registered successfully' });
    } catch (error) {
        res.status(400).json(error);
        // res.status(500).json({ message: 'Employee Not registered :( ' });
    }
}
exports.test = async (req, res) => {
    try {
        res.status(201).json({ message: 'Employee registered successfully' });
    } catch (error) {
        res.status(400).json(error);
        // res.status(500).json({ message: 'Employee Not registered :( ' });
    }
}

exports.getEmployee = async (req, res) => {
    try {
        const employees = await Employee.find();
        console.log(employees, "i m calling employee controller")
        res.status(200).json(employees);
    } catch (error) {
        res.status(500).json(error);
    }
}


exports.dailyAttendance = async (req, res) => {
    const { enrollmentNumber, present } = req.body;

    if (!enrollmentNumber || present === undefined) {
        return res.status(400).json("Both enrollmentNumber and present are required in the request body");
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
            return res.status(404).json("Employee not found");
        }
        res.status(200).json(employee);

    } catch (error) {
        console.error(error);
        res.status(500).json("Internal server error");
    }
}


// Get monthly attendance
// exports.monthlyAttendance = async (req, res) => {
//     try {
//         const { month, year } = req.query;

//         const employee = await Employee.findById(req.params.id);

//         if (!employee) {
//             return res.status(404).json();
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