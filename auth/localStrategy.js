import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import bcrypt from 'bcrypt';

export default function () {
  passport.use(new LocalStrategy({
    usernameField: 'username',
    passwordField: 'password',
  },
    async (username, password, done) => {
      if (username === process.env.TEST_USERNAME) {
        const match = await bcrypt.compare(password, process.env.TEST_PASSWORD_HASH);
        if (match) {
          return done(null, { username: process.env.TEST_USERNAME });
        }
      }
      return done(null, false, { message: 'Invalid username or password' });
    }
  ));
};