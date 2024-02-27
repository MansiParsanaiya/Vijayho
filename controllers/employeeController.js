const Employee = require("../models/employeeModel");

// Create
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

        res.status(200).json({message: "Employee registered Successfully !"});
    } catch (error) {
        console.error('Error creating employee:', error.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

// Read
exports.getEmployee = async (req, res) => {
    try {
        const employees = await Employee.find();
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
