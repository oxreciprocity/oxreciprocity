import { Router } from 'express';
import passport from 'passport';

// Middleware to ensure user is authenticated with Microsoft first
function ensureMsAuth(req, res, next) {
  if (req.session.msAuth) {
    return next();
  }
  res.redirect('/auth/login');
}

const router = Router();

router.get('/', ensureMsAuth, passport.authenticate('facebook', { scope: ['user_friends'] }));

router.get('/callback', passport.authenticate('facebook', { failureRedirect: '/' }), // TODO tell user reason for failure
  function (req, res) {
    req.session.fbAuth = true;
    res.redirect('/');
  }
);

export default router;