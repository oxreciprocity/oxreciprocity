import passport from 'passport';
import { Strategy as FacebookStrategy } from 'passport-facebook';
import { findOrCreateUser } from '../db/userRepository.js';

export default function () {
  passport.use(new FacebookStrategy({
    clientID: process.env.FB_CLIENT_ID,
    clientSecret: process.env.FB_CLIENT_SECRET,
    callbackURL: process.env.FB_REDIRECT_URI,
    state: true
  },
    function (accessToken, refreshToken, profile, cb) {
      profile.accessToken = accessToken;
      findOrCreateUser(profile, accessToken)
        .then(() => cb(null, profile)) // Proceed with the callback
        .catch(error => cb(error)); // Handle any errors
    }
  ));
};
