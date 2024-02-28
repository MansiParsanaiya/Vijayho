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
// exports.getEmployee = async (req, res) => {
//     try {
//         const employees = await Employee.find();
//         res.status(200).json(employees);
//     } catch (error) {
//         res.status(500).json(error);
//     }
// }

// exports.getEmployee = async (req, res) => {
//     const { search } = req.query;

//     try {
//         let query = {};

//         // Add search functionality if search query parameter is provided
//         if (search) {
//             const searchRegex = new RegExp(search, 'i'); // Case-insensitive regex for searching
//             query.$or = [
//                 { name: searchRegex }, // Search by name
//                 { employeeId: searchRegex }, // Search by employeeId
//                 // Add more fields as needed for searching
//             ];
//         }

//         const employees = await Employee.find(query);
//         res.status(200).json(employees);
//     } catch (error) {
//         res.status(500).json(error);
//     }
// }

exports.getEmployee = async (req, res) => {
    const { search } = req.query;

    try {
        let query = {};

        // Add search functionality if search query parameter is provided
        if (search) {
            const searchTerm = parseInt(search); // Convert search term to an integer
            if (!isNaN(searchTerm)) {
                query.employeeId = { $lte: searchTerm }; // Find records where employeeId is less than or equal to the search term
            } else {
                const searchRegex = new RegExp(search, 'i'); // Case-insensitive regex for searching
                query.$or = [
                    { name: searchRegex }, // Search by name
                    // Add more fields as needed for searching
                ];
            }
        }

        const employees = await Employee.find(query);
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

        res.send({ message: `Entrollment Number ${enrollmentNumber} data updated successfully !`, data: employee });
    } catch (error) {
        console.error(error);
        res.status(500).send({ error: 'Server error' });
    }
}

// Delete
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





















exports.searchUser = async (req, res) => {
    const query = req.query.key;

    if (!query) {
        return res.status(400).json({ error: 'Query parameter "searchUser?key=" is required' });
    }
    try {
        let results;
        if (isNaN(query)) {
            // http://localhost:4000/users/searchUser?key=qq
            results = await User.find({
                $or: [
                    { firstname: { $regex: new RegExp(query, 'i') } },
                    { lastname: { $regex: new RegExp(query, 'i') } },
                ],
            });
        } else {
            // http://localhost:4000/users/searchUser?key=12
            results = await User.find({
                $or: [
                    { age: { $eq: parseInt(query) } },
                    { phoneNo: { $eq: parseInt(query) } },
                ],
            });
        }
        res.json(results);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}