// const express = require('express');
// const mongoose = require('mongoose');
// const bodyParser = require('body-parser');

var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var employeeRouter = require('./routes/employee');
const connection = require('./connect');

var app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Mongo DataBase Connection
connection();

// const PORT = 3000;

// app.use(bodyParser.json());

// Start the server
const port = 8000; // or any other available port
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

app.use('/', indexRouter);
app.use('/employee', employeeRouter);

module.exports = app;
