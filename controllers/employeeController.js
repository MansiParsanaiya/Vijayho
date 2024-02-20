const Employee = require("../models/employeeModel");

// Create
exports.createEmployee = async (req, res) => {
    try {
    
        const employeeData = req.body;
        const newEmployee = new Employee(employeeData);
        await newEmployee.save();

        res.status(201).json({message: "employe registered" , newEmployee});
    } catch (error) {
        console.error('Error creating employee:', error.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

// Read
exports.getEmployee = async (req, res) => {
    try {
        const employees = await Employee.find();
        console.log(employees, "i m calling employee controller")
        res.status(200).json(employees);
    } catch (error) {
        res.status(500).json(error);
    }
}

// Update Daily Attendence
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