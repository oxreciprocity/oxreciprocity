import './setupEnv.js' // configure environment variables
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
import { Datastore } from '@google-cloud/datastore';
import { DatastoreStore } from '@google-cloud/connect-datastore';
import connectSQLite3 from 'connect-sqlite3';
import { getSecret } from './services/secretsService.js';
import favicon from 'serve-favicon';
import cron from 'node-cron';
import createNeo4jDriver from './db/neo4j.js';

// __dirname is not available in ES module scope, so we create it
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import indexRouter from './routes/index.js';
import microsoftRoutes from './routes/auth/microsoft.js';
import facebookRoutes from './routes/auth/facebook.js';
import basicRoutes from './routes/auth/local.js';
import submitRouter from './routes/submit.js';
import accountRouter from './routes/account.js';
import matchesRouter from './routes/matches.js';
// import webhookRouter from './routes/TEST_webhook.js';
// import onboardingRouter from './routes/TEST_onboarding.js';

const app = express();
await authConfig(passport);

// view engine setup
app.set('views', join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.locals.pluralize = pluralize;

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(join(__dirname, 'public')));
app.use(favicon(path.join(__dirname, 'public', 'favicon', 'favicon.ico')));

// Enforce HTTPS in production
if (process.env.NODE_ENV === 'production') {
  app.use((req, res, next) => {
    if (req.header('x-forwarded-proto') !== 'https') {
      res.redirect(`https://${req.header('host')}${req.url}`);
    } else {
      next();
    }
  });
}

let sessionStore; // declare session store outside of if block

if (process.env.NODE_ENV === 'production') {
  // use Google Cloud Datastore in production
  const datastore = new Datastore();
  sessionStore = new DatastoreStore({
    kind: 'express-sessions',
    expirationMs: 0,
    dataset: datastore,
  });
} else {
  // use SQLite in development
  const SQLiteStore = connectSQLite3(session);
  sessionStore = new SQLiteStore({ db: 'sessions.db', dir: './var/db' });
}

const sessionSecret = await getSecret('SESSION_STORE_SECRET');
app.use(session({
  secret: sessionSecret,
  resave: false, // don't save session if unmodified
  saveUninitialized: false, // don't create session until something stored
  store: sessionStore,
}));

// app.use('/webhook', webhookRouter);

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
  res.locals.categoryNames = { 'r1': 'Hang out', 'r2': 'Hook up', 'r3': 'Date' }; // "hold hands"
  next();
});

app.use('/', indexRouter);

// NOTE maybe this should be in a separate file
app.use('/auth/microsoft', microsoftRoutes);
app.use('/auth/facebook', facebookRoutes);
app.use('/auth/local', basicRoutes); // Login for test users

// app.use('/onboarding', onboardingRouter);

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

function ensureAuthenticated(req, res, next) {
  if (req.session.fbAuth) { return next(); }
  res.redirect('/');
}

app.use('/submit', ensureAuthenticated, submitRouter);
app.use('/account', ensureAuthenticated, accountRouter);
app.use('/matches', ensureAuthenticated, matchesRouter);

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

// Keep database alive
const driver = await createNeo4jDriver();
async function keepAliveQuery() {
  const session = driver.session();
  try {
    const result = await session.run('MATCH (n) RETURN COUNT(n) AS count');
    console.log(`Number of nodes: ${result.records[0].get('count')}`);
  } catch (error) {
    console.error('Error executing keep-alive query:', error);
  } finally {
    await session.close();
  }
}

// Schedule the job to run once a day
cron.schedule('0 0 * * *', () => {
  console.log('Running keep-alive query...');
  keepAliveQuery();
});

// Listen to the App Engine-specified port, or 3000 otherwise
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  if (process.env.NODE_ENV === 'development'){
    console.log(`App running on http://localhost:3000`)
  } else {
    console.log(`Server listening on port ${PORT}...`);
  }
});