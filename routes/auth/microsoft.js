const express = require('express');
const passport = require('passport');

const router = express.Router();

router.get('/', passport.authenticate('microsoft'));

router.get('/callback', passport.authenticate('microsoft', { failureRedirect: '/' }), // TODO tell user reason for failure (e.g. invalid domain)
function (req, res) {
  req.session.msAuth = true;
  res.redirect('/');
});

module.exports = router;