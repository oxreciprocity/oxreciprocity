const express = require('express');
const passport = require('passport');

// Middleware to ensure user is authenticated with Microsoft first
function ensureMsAuth(req, res, next) {
  if (req.session.msAuth) {
    return next();
  }
  res.redirect('/auth/login');
}

const router = express.Router();

router.get('/', ensureMsAuth, passport.authenticate('facebook', { scope: ['user_friends'] })); // TODO add to authenticate call 

router.get('/callback', passport.authenticate('facebook', { failureRedirect: '/' }), // TODO tell user reason for failure
  function (req, res) {
    req.session.fbAuth = true;
    res.redirect('/');
  }
);

module.exports = router;