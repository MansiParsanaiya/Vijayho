var express = require('express');
var router = express.Router();

// const { getEmployee, createEmployee, updateEmployee } = require('../controllers/employeeController');
const employeeController = require('../controllers/employeeController');

// Routes

// Read
router.get('/getEmployee', employeeController.getEmployee);

// Create
router.post('/postEmployee', employeeController.createEmployee);

// Update
router.patch('/:enrollmentNumber', employeeController.updateEmployee)



module.exports = router;
