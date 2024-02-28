const Attendance = require('../models/attendanceModel');

// Create Attendance 
// exports.addAttendance = async (req, res) => {
//   try {
//     const { enrollmentNumber, attendance, date } = req.body;

//     const existingAttendance = await Attendance.findOne({ enrollmentNumber, date });

//     if (existingAttendance) {
//       return res.status(400).json({ message: 'Attendance already recorded for this enrollmentNumber on this date' });
//     }

//     const studentAttendance = new Attendance({ enrollmentNumber, attendance, date });
//     await studentAttendance.save();

//     res.json({ message: 'Attendance recorded successfully' });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: 'Internal Server Error' });
//   }
// }

// exports.addAttendance = async (req, res) => {
//   try {
//     const { enrollmentNumber, attendance, date } = req.body;

//     const existingAttendance = await Attendance.findOne({ enrollmentNumber });

//     // Check if there is an existing record with the same date part
//     if (existingAttendance && existingAttendance.date.toISOString().split('T')[0] === date.toISOString().split('T')[0]) {
//       return res.status(400).json({ message: 'Attendance already recorded for this enrollmentNumber on this date' });
//     }

//     const studentAttendance = new Attendance({ enrollmentNumber, attendance, date });
//     await studentAttendance.save();

//     res.json({ message: 'Attendance recorded successfully' });
//   } 
//   catch (error)
//   {
//     console.error(error);
//     res.status(500).json({ message: 'Internal Server Error' });
//   }
// }

exports.addAttendance = async (req, res) => {
  try {
    const { enrollmentNumber, attendance, date } = req.body;
    const existingAttendance = await Attendance.findOne({ enrollmentNumber });

    if (existingAttendance) {
      // Log existing attendance details for debugging
      console.log('Existing Attendance:', existingAttendance);

      if (existingAttendance.date) {
        const existingDate = existingAttendance.date.toISOString().split('T')[0];
        const currentDate = date.toISOString().split('T')[0];

        // Check if there is an existing record with the same date part
        if (existingDate === currentDate) {
          return res.status(400).json({ message: 'Attendance already recorded for this enrollmentNumber on this date' });
        }
      }
    }

    const studentAttendance = new Attendance({ enrollmentNumber, attendance, date });
    await studentAttendance.save();
    res.json({ message: 'Attendance recorded successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: `Internal Server Error ${error}` });
  }
}



// Read Attendance

// exports.getAttendanceByDate = async (req, res) => {
//   const { date } = req.params;

//   try {
//     const students = await Attendance.find({
//       'date': { $gte: new Date(date), $lt: new Date(new Date(date).setDate(new Date(date).getDate() + 1)) },
//     });

//     const attendanceByDate = students.map((student) => {
//       return {
//         enrollmentNumber: student.enrollmentNumber,
//         attendance: student.attendance,
//         date: student.date.toISOString().split('T')[0],
//       };
//     });

//     res.status(200).json({ success: true, data: attendanceByDate });
//   } catch (error) {
//     res.status(500).json({ success: false, error: error.message });
//   }
// }

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


// ===============================================  Extra Work  ============================================================ 

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



