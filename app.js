// var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const mongoose = require('mongoose');
const cors = require('cors');
const routes = require('./routes');
// var indexRouter = require('./routes/index');
// var usersRouter = require('./routes/users');

require('dotenv').config();
mongoose.connect(process.env.mongoDB, { useNewUrlParser: true, useUnifiedTopology: true });
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB Connection Error: '));

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(function(req, res, next) {
  // console.log(req.cookies)
  if (req.cookies.isAdmin) {
    res.locals.admin = true;
  }
  next();
})

app.use('/', routes.view);
app.use('/admin', routes.admin);
app.use('/api', routes.api);
// app.use('/', indexRouter.view);
// app.use('/api', indexRouter.api);
// app.use('/users', usersRouter);

// catch 404 and forward to error handler
// app.use(function(req, res, next) {
//   next(createError(404));
// });

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;

// CURL NOTES
//  - curl defaults to GET http method, use -X to set other http methods like so: -X POST, -X PUT, -X DELETE
//    WHEN USING THE API FOR POST AND PUT, YOU MUST INCLUDE THE PROPER HEADER BY USING -H
//      -H "Content-Type:application/json"
