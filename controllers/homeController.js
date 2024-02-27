const Employee = require("../models/employeeModel");

// Get Total Employees
exports.totalEmployee = async (req, res) => {
    try {
        const employees = await Employee.countDocuments();
        res.status(200).json({ Total_Employees: employees });
    } catch (error) {
        res.status(500).json(error);
    }
}

// Get Total Pay Per Day
exports.getTotalPayPerDay = async (req, res) => { };

// Get Total Pay Per Month
exports.getTotalPayPerDay = async (req, res) => { };