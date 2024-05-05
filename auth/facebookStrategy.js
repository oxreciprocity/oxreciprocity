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
    async (accessToken, refreshToken, profile, cb) => {
      try {
        profile.accessToken = accessToken;
        await findOrCreateUser(profile, accessToken);
        return cb(null, profile);
      } catch (error) {
        cb(error); // Handle any errors
      }
    }
  ));
};
