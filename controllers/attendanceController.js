const Attendance = require('../models/attendanceModel');
const Employee = require("../models/employeeModel");


// Add Attendance
exports.addAttendance = async (req, res) => {
  try {
    let { enrollmentNumber, attendance, date } = req.body;

    if (!attendance) {
      attendance = null;
    }

    if (!date) {
      date = new Date();
    }
    else {
      date = new Date(date);
      if (isNaN(date.getTime())) {
        return res.status(400).json({ message: 'Invalid date format. Please provide a valid date.' });
      }
    }

    const employeeExists = await Employee.exists({ enrollmentNumber });

    if (!employeeExists) {
      return res.status(400).json({ message: `Employee with enrollment number ${enrollmentNumber} does not exist.` });
    }

    const formattedDate = date.toISOString().split('T')[0];

    const existingAttendance = await Attendance.findOne({
      enrollmentNumber,
      date: { $gte: formattedDate, $lt: new Date(date.getTime() + 86400000).toISOString().split('T')[0] },
    })

    if (existingAttendance) {
      return res.status(400).json({ message: `Attendance record already exists for enrollment number ${enrollmentNumber} on ${formattedDate}.` });
    }

    console.log({
      enrollmentNumber,
      date: { $gte: formattedDate, $lt: new Date(date.getTime() + 86400000).toISOString().split('T')[0] },
    })

    const studentAttendance = new Attendance({ enrollmentNumber, attendance, date });
    await studentAttendance.save();

    res.json({ message: 'Attendance recorded successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
}

// Read Attendance
// ================================================  My MongoDB Query  =================================================
// exports.getAttendanceByDate = async (req, res) => {
//   const { date } = req.params;

//   try {
//     const attendanceData = await Attendance.aggregate([
//       {
//         $match: {
//           'date': { $gte: new Date(date), $lt: new Date(new Date(date).setDate(new Date(date).getDate() + 1)) },
//         },
//       },
//       {
//         $lookup: {
//           from: 'employees',  
//           localField: 'enrollmentNumber',
//           foreignField: 'enrollmentNumber',
//           as: 'employeeData',
//         },
//       },
//       {
//         $unwind: '$employeeData', 
//       },
//       {
//         $project: {
//           enrollmentNumber: 1,
//           attendance: 1,
//           date: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
//           name: '$employeeData.name',
//           mobileNumber: '$employeeData.mobileNumber',
//         },
//       },
//     ]);

//     res.status(200).json({ success: true, data: attendanceData });
//   } catch (error) {
//     res.status(500).json({ success: false, error: error.message });
//   }
// }

// =====================================================================================================================
exports.getAttendanceByDate = async (req, res) => {
  const { date } = req.params;

  try {
    const attendanceData = await Attendance.find({
      'date': { $gte: new Date(date), $lt: new Date(new Date(date).setDate(new Date(date).getDate() + 1)) },
    });

    const result = [];

    for (const attendance of attendanceData) {
      const employee = await Employee.findOne({ enrollmentNumber: attendance.enrollmentNumber });

      if (employee) {
        result.push({
          enrollmentNumber: attendance.enrollmentNumber,
          name: employee.name,
          mobileNumber: employee.mobileNumber,
          attendance: attendance.attendance,
          date: attendance.date.toISOString().split('T')[0],
        });
      }
    }

    res.status(200).json({ data: result });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// Update Attendance
exports.updateAttendance = async (req, res) => {
  try {
    const { enrollmentNumber, date } = req.params;

    const updateDate = new Date(date);

    const existingAttendance = await Attendance.findOne({
      enrollmentNumber,
      date: { $gte: updateDate, $lt: new Date(updateDate.getTime() + 86400000) },
    });

    if (existingAttendance) {
      const { attendance } = existingAttendance;

      if (attendance === req.body.attendance) {
        return res.status(400).json({ message: `Attendance is already marked as ${req.body.attendance}.` });
      }
    }

    const updatedAttendance = await Attendance.findOneAndUpdate(
      {
        enrollmentNumber,
        date: { $gte: updateDate, $lt: new Date(updateDate.getTime() + 86400000) },
        attendance: { $ne: req.body.attendance },
      },
      { $set: req.body },
      { new: true }
    )

    if (!updatedAttendance) {
      return res.status(404).json({ message: `Attendance record not found` });
    }

    // console.log(updatedAttendance);

    return res.status(200).json({ message: `Enrollment Number ${enrollmentNumber} attendance updated successfully!`, data: updatedAttendance });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
}

// ===============================================  Extra Work  ========================================================= 

// Read enrollmentNumber records between two dates
exports.getAttendanceBetweenTwoDates = async (req, res) => {
  const { enrollmentNumber, startDate, endDate } = req.params;

  try {
    const attendance = await Attendance.find({
      'enrollmentNumber': enrollmentNumber,
      'date': { $gte: new Date(startDate), $lt: new Date(new Date(endDate).setDate(new Date(endDate).getDate() + 1)) },
    });


    if (attendance.length === 0) {
      return res.status(404).json({ message: 'Attendance record not found for this enrollmentNumber on this date' });
    }

    const attendanceBetweenDates = attendance.map((record) => {
      return {
        enrollmentNumber: record.enrollmentNumber,
        attendance: record.attendance,
        date: record.date.toISOString().split('T')[0],
      }
    })

    res.status(200).json({ success: true, data: attendanceBetweenDates });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}



