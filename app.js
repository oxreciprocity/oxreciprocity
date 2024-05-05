require('dotenv').config();

const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const csrf = require('csurf');
const passport = require('passport');
const logger = require('morgan');
const authConfig = require('./auth');

// pass the session to the connect sqlite3 module
// allowing it to inherit from session.Store
const SQLiteStore = require('connect-sqlite3')(session);

const indexRouter = require('./routes/index');
const microsoftRoutes = require('./routes/auth/microsoft');
const facebookRoutes = require('./routes/auth/facebook');
const submitRouter = require('./routes/submit');

const app = express();
authConfig(passport);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.locals.pluralize = require('pluralize');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
  secret: 'keyboard cat',
  resave: false, // don't save session if unmodified
  saveUninitialized: false, // don't create session until something stored
  store: new SQLiteStore({ db: 'sessions.db', dir: './var/db' })
}));

app.use(csrf());

app.use(passport.authenticate('session'));

app.use(function(req, res, next) {
  var msgs = req.session.messages || [];
  res.locals.messages = msgs;
  res.locals.hasMessages = !! msgs.length;
  req.session.messages = [];
  next();
});

app.use(function(req, res, next) {
  res.locals.csrfToken = req.csrfToken();
  next();
});

app.use('/', indexRouter);

// NOTE maybe this should be in a separate file
app.use('/auth/microsoft', microsoftRoutes);
app.use('/auth/facebook', facebookRoutes);
app.use('/auth/logout', function(req, res) {
  req.logout(function(err) {
    if (err) { return next(err); }
    res.redirect('/');
  });
});
app.use('/auth/login', function(req, res) {
  if (req.session.msAuth) {
    res.redirect('/auth/facebook');
  } else {
    res.redirect('/auth/microsoft');
  }
});

app.use('/submit', submitRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

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

app.listen(3000);

console.log('App running on http://localhost:3000');