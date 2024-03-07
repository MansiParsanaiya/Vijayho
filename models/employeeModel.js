const mongoose = require('mongoose');

// Create Student model
const employeeSchema = new mongoose.Schema({
    enrollmentNumber: { type: String, unique: true },
    name: String,
    mobileNumber: String,
    address: String,
    bank: String,
    accountNumber: String,
    ifscCode: String,
    salary: Number
});

const Employee = mongoose.model('Employee', employeeSchema);
module.exports = Employee;