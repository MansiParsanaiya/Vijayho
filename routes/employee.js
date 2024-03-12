var express = require('express');
var router = express.Router();

// const { getEmployee, createEmployee, updateEmployee } = require('../controllers/employeeController');
const employeeController = require('../controllers/employeeController');
const { totalEmployee } = require('../controllers/homeController');


// Read + Search
router.get('/getEmployee', employeeController.getEmployee);

// Get Total Attendance
router.get('/getTotalAttendance/:enrollmentNumber', employeeController.getTotalAttendance);

// Get Employee Attedance
router.get('/getEmployeeAttendance', employeeController.getEmployeeAttendance);

// Create
router.post('/postEmployee', employeeController.createEmployee);

// Update
router.patch('/:enrollmentNumber', employeeController.updateEmployee)

// Delete
router.delete('/delete/:enrollmentNumber', employeeController.deleteEmployee)

// =================================================   Home Page  ================================================

router.get('/totalEmployee', totalEmployee)

module.exports = router;
