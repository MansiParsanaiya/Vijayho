var express = require('express');
var router = express.Router();

const { getEmployee, dailyAttendance, monthlyAttendance, createEmployee, test } = require('../controllers/employeeController');

// Routes

// Read
router.get('/getEmployee', getEmployee);

// Create
router.post('/postEmployee', createEmployee);

// Update daily attendance
router.patch('/daily-attendance/:enrollmentNumber', dailyAttendance);

// Get monthly attendance
// router.get('/monthly-attendance/:enrollmentNumber', monthlyAttendance);


module.exports = router;
