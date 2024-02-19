var express = require('express');
var router = express.Router();

const { createEmployee, getEmployee, dailyAttendance, monthlyAttendance } = require('../controllers/employeeController');

/* GET users listing. */
// router.get('/', function(req, res, next) {
//   res.send('respond with a resource');
// });

// Routes

// Create
router.post('/postEmployee', createEmployee);

// Read
router.get('/getEmployee', getEmployee);

// Update daily attendance
router.patch('/daily-attendance/:enrollmentNumber', dailyAttendance);

// Get monthly attendance
// router.get('/monthly-attendance/:enrollmentNumber', monthlyAttendance);


module.exports = router;
