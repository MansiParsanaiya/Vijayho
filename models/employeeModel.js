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
    payType: {
        perDay: Number,
        perMonth: Number,
    },
    attendance: {
        daily: [{
            date: {
                type: Date,
                default: Date.now,
            },
            present: Boolean,
        }],
        monthly: [{
            month: {
                type: String,
                enum: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
            },
            year: Number,
            presentDays: Number,
        }],
    },
});

const Employee = mongoose.model('Employee', employeeSchema);
module.exports = Employee;