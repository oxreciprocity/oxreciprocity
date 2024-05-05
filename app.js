import dotenv from 'dotenv';
dotenv.config();

import createError from 'http-errors';
import express from 'express';
import { join } from 'path';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import csrf from 'csurf';
import passport from 'passport';
import logger from 'morgan';
import authConfig from './auth/index.js';
import path from 'path';
import { fileURLToPath } from 'url';
import pluralize from 'pluralize';

// __dirname is not available in ES module scope, so we create it
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// pass the session to the connect sqlite3 module
// allowing it to inherit from session.Store
import connectSQLite3 from 'connect-sqlite3';
const SQLiteStore = connectSQLite3(session);

import indexRouter from './routes/index.js';
import microsoftRoutes from './routes/auth/microsoft.js';
import facebookRoutes from './routes/auth/facebook.js';
import submitRouter from './routes/submit.js';

const app = express();
authConfig(passport);

// view engine setup
app.set('views', join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.locals.pluralize = pluralize;

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(join(__dirname, 'public')));

app.use(session({
  secret: 'keyboard cat',
  resave: false, // don't save session if unmodified
  saveUninitialized: false, // don't create session until something stored
  store: new SQLiteStore({ db: 'sessions.db', dir: './var/db' })
}));

app.use(csrf());

app.use(passport.authenticate('session'));

app.use(function (req, res, next) {
  var msgs = req.session.messages || [];
  res.locals.messages = msgs;
  res.locals.hasMessages = !!msgs.length;
  req.session.messages = [];
  next();
});

app.use(function (req, res, next) {
  res.locals.csrfToken = req.csrfToken();
  next();
});

app.use('/', indexRouter);

// NOTE maybe this should be in a separate file
app.use('/auth/microsoft', microsoftRoutes);
app.use('/auth/facebook', facebookRoutes);
app.use('/auth/logout', function (req, res) {
  req.logout(function (err) {
    if (err) { return next(err); }
    res.redirect('/');
  });
});
app.use('/auth/login', function (req, res) {
  if (req.session.msAuth) {
    res.redirect('/auth/facebook');
  } else {
    res.redirect('/auth/microsoft');
  }
});

app.use('/submit', submitRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

export default app;

app.listen(3000);

console.log('App running on http://localhost:3000');