const express = require('express');
const router = express.Router();
const { addAttendance, getAttendanceByDate, getAttendanceBetweenTwoDates } = require('../controllers/attendanceController');

router.post('/:enrollmentNumber/add-attendance', addAttendance)

router.get('/getAttendance/:date', getAttendanceByDate)

// router.get('/:enrollmentNumber/:startDate/:endDate', getAttendanceBetweenTwoDates)


module.exports = router;