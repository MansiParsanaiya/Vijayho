const express = require('express');
const router = express.Router();
// const { addAttendance, getAttendanceByDate, getAttendanceBetweenTwoDates, updateAttendance } = require('../controllers/attendanceController');
const attendanceController = require('../controllers/attendanceController');

router.post('/:enrollmentNumber/add-attendance', attendanceController.addAttendance)
router.get('/getAttendance/:date', attendanceController.getAttendanceByDate)
// router.patch('/:enrollmentNumber/:date', attendanceController.updateAttendance);
router.patch('/attendance/:enrollmentNumber/:date', attendanceController.updateAttendance);

// =========================================  Extra Work  ======================================================== 

router.get('/:enrollmentNumber/:startDate/:endDate', attendanceController.getAttendanceBetweenTwoDates)


module.exports = router;