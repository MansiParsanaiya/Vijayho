// models/student.js
const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  enrollmentNumber: String,
  name: String,
  attendance: { type: String, enum: ['present', 'absent'] },
  date: { type: Date, default: Date.now },
})

const Attendance = mongoose.model('Attendance', attendanceSchema);

module.exports = Attendance;
