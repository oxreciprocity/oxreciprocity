import facebookStrategy from './facebookStrategy.js';
import microsoftStrategy from './microsoftStrategy.js';
import localStrategy from './localStrategy.js';


export default async function (passport) {
  // Passport serialization and deserialization logic here
  passport.serializeUser(function (user, cb) {
    cb(null, user); // TODO replace with user.id or something
  });

  passport.deserializeUser(function (obj, cb) {
    cb(null, obj); // TODO query database for user by id, with a try / catch block which calls cb(err) if there's an error
  });
  await facebookStrategy();
  await microsoftStrategy();
  await localStrategy();
};