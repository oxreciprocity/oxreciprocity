import passport from 'passport';
import { Strategy as FacebookStrategy } from 'passport-facebook';
import { findOrCreateUser } from '../db/userRepository.js';
import { getSecret } from '../services/secretsService.js';

export default async function () {
  const callbackURL = `${process.env.BASE_URL}${process.env.FB_REDIRECT_PATH}`;
  const clientSecret = await getSecret('FB_CLIENT_SECRET');
  passport.use(new FacebookStrategy({
    clientID: process.env.FB_CLIENT_ID,
    clientSecret: clientSecret,
    callbackURL: callbackURL,
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
