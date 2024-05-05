const passport = require('passport');
const MicrosoftStrategy = require('passport-microsoft').Strategy;

module.exports = function () {
  passport.use(new MicrosoftStrategy({
    clientID: process.env.MS_CLIENT_ID,
    clientSecret: process.env.MS_CLIENT_SECRET,
    callbackURL: process.env.MS_REDIRECT_URI,
    scope: ['user.read'],
  },
    function (accessToken, refreshToken, profile, cb) {
      process.nextTick(function () {
        const userEmail = profile.emails && profile.emails[0].value;
        if (userEmail && userEmail.endsWith('.ox.ac.uk')) {
          // User's email domain is valid, proceed with the login process
          return cb(null, profile); // TODO usually you would either create a user in the database or find an existing user, then return that user
        } else {
          // User's email domain is invalid, do not proceed with the login
          return cb(null, false, { message: 'Invalid host domain' });
        }
      });
    }
  ));
};