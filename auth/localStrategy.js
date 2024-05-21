import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import bcrypt from 'bcrypt';
import { getSecret } from '../services/secretsService.js';

export default async function () {
  const localPasswordHash = await getSecret('LOCAL_PASSWORD_HASH');
  passport.use(new LocalStrategy({
    usernameField: 'username',
    passwordField: 'password',
  },
    async (username, password, done) => {
      if (username === process.env.LOCAL_USERNAME) {
        const match = await bcrypt.compare(password, localPasswordHash);
        if (match) {
          return done(null, { username: process.env.LOCAL_USERNAME });
        }
      }
      return done(null, false, { message: 'Invalid username or password' });
    }
  ));
};