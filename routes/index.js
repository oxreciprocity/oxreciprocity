// This file contains the routes for the homepage of the app.
// It renders a different view depending on whether the user is logged in with Facebook, Microsoft, or not at all.

const express = require('express');
const { findFriendsByUserId } = require('../db/userRepository');
const { getMatches } = require('../controllers/relationshipController');
const { updateUserFriends } = require('../services/friendService');
const router = express.Router();

router.get('/', async function (req, res, next) {
  if (req.session.fbAuth) {
    console.log('user is logged in with Facebook');
    const { id, accessToken } = req.user;
    await updateUserFriends(id, accessToken);
    const friends = await findFriendsByUserId(id);
    const matches = await getMatches(id);
    res.render('loggedIn', { user: req.user, friends: friends, matches: matches });
  } else if (req.session.msAuth) {
    console.log('user is logged in with Microsoft');
    res.render('innerLogin');
  } else {
    console.log('user is not logged in');
    res.render('outerLogin');
  }
});

module.exports = router;