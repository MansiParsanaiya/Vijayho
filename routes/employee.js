var express = require('express');
var router = express.Router();

const { createEmployee, getEmployee, dailyAttendance, monthlyAttendance, test } = require('../controllers/employeeController');

/* GET users listing. */
// router.get('/', function(req, res, next) {
//   res.send('respond with a resource');
// });

// Routes

// Read
router.get('/', getEmployee);
router.post('/', test);

// Create
router.post('/postEmployee', createEmployee);

// Update daily attendance
router.patch('/daily-attendance/:enrollmentNumber', dailyAttendance);

// Get monthly attendance
// router.get('/monthly-attendance/:enrollmentNumber', monthlyAttendance);


module.exports = router;
