const facebookStrategy = require('./facebookStrategy');
const microsoftStrategy = require('./microsoftStrategy');

module.exports = function (passport) {
  // Passport serialization and deserialization logic here
  passport.serializeUser(function (user, cb) {
    cb(null, user); // TODO replace with user.id or something
  });

  passport.deserializeUser(function (obj, cb) {
    cb(null, obj); // TODO query database for user by id, with a try / catch block which calls cb(err) if there's an error
  });
  facebookStrategy();
  microsoftStrategy();
};