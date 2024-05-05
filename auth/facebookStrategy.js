const passport = require('passport');
const FacebookStrategy = require('passport-facebook').Strategy;
const userRepository = require('../db/userRepository');

module.exports = function() {
    passport.use(new FacebookStrategy({
        clientID: process.env.FB_CLIENT_ID,
        clientSecret: process.env.FB_CLIENT_SECRET,
        callbackURL: process.env.FB_REDIRECT_URI,
        state: true
      },
    function(accessToken, refreshToken, profile, cb) {
      profile.accessToken = accessToken;
      userRepository.findOrCreateUser(profile, accessToken)
      .then(() => cb(null, profile)) // Proceed with the callback
      .catch(error => cb(error)); // Handle any errors
    }
  ));
};
