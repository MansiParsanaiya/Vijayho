// const express = require('express');
// const mongoose = require('mongoose');
// const bodyParser = require('body-parser');

var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var cors=require('cors');
const XLSX = require('xlsx');

var indexRouter = require('./routes/index');
var employeeRouter = require('./routes/employee');
var attendanceRouter = require('./routes/attendance');
const connection = require('./connect');

var app = express();
app.use(cors());
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Mongo DataBase Connection
connection();

// Start the server
const port = 8000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

app.use('/', indexRouter);
app.use('/employee', employeeRouter);
app.use('/attendance', attendanceRouter);

module.exports = app;
