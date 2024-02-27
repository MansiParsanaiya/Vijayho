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

        res.status(200).json({ message: "Employee registered Successfully !" });
    } catch (error) {
        console.error('Error creating employee:', error.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

// Read
exports.getEmployee = async (req, res) => {
    try {
        const employees = await Employee.find();
        res.status(200).json(employees);
    } catch (error) {
        res.status(500).json(error);
    }
}

// Update 
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

        res.send(employee);
    } catch (error) {
        console.error(error);
        res.status(500).send({ error: 'Server error' });
    }
}
