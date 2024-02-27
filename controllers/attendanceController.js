// controllers/studentController.js
const Attendance = require('../models/attendanceModel');


exports.addAttendance = async (req, res) => {
  try {
    const { enrollmentNumber, attendance, date } = req.body;

    // Check if attendance record already exists for the enrollmentNumber and date
    const existingAttendance = await Attendance.findOne({ enrollmentNumber, date });

    if (existingAttendance) {
      return res.status(400).json({ message: 'Attendance already recorded for this enrollmentNumber on this date' });
    }

    // If the record doesn't exist for the given enrollmentNumber and date, save the new attendance record
    const studentAttendance = new Attendance({ enrollmentNumber, attendance, date });
    await studentAttendance.save();

    res.json({ message: 'Attendance recorded successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
}


exports.getAttendanceByDate = async (req, res) => {
  const { date } = req.params;

  try {
    const students = await Attendance.find({
      'date': { $gte: new Date(date), $lt: new Date(new Date(date).setDate(new Date(date).getDate() + 1)) },
    });

    const attendanceByDate = students.map((student) => {
      return {
        enrollmentNumber: student.enrollmentNumber,
        attendance: student.attendance,
        date: student.date.toISOString().split('T')[0],
      };
    });

    res.status(200).json({ success: true, data: attendanceByDate });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}


exports.getAttendanceBetweenTwoDates = async (req, res) => {
  const { enrollmentNumber, startDate, endDate } = req.params;

  try {
    const attendance = await Attendance.find({
      'enrollmentNumber': enrollmentNumber,
      'date': { $gte: new Date(startDate), $lt: new Date(new Date(endDate).setDate(new Date(endDate).getDate() + 1)) },
    });

    const attendanceBetweenDates = attendance.map((record) => {
      return {
        enrollmentNumber: record.enrollmentNumber,
        attendance: record.attendance,
        date: record.date.toISOString().split('T')[0],
      };
    });

    if (attendanceBetweenDates.data) {
      return res.status(404).json({ message: 'Attendance record not found for this enrollmentNumber on this date' });
    }
    else {
      res.status(200).json({ success: true, data: attendanceBetweenDates })
    }

    // res.status(200).json({ success: true, data: attendanceBetweenDates });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}

exports.updateAttendance = async (req, res) => {
  try {
    const { enrollmentNumber, attendance, date } = req.body;

    const existingAttendance = await Attendance.findOne({ enrollmentNumber, date });

    if (!existingAttendance) {
      return res.status(404).json({ message: 'Attendance record not found for this enrollmentNumber on this date' });
    }

    existingAttendance.attendance = attendance;
    await existingAttendance.save();

    res.json({ message: 'Attendance updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
}
