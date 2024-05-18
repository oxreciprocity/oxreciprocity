// This file contains the routes for the homepage of the app.
// It renders a different view depending on whether the user is logged in with Facebook, Microsoft, or not at all.

import { Router } from 'express';
import { findFriendsByUserId, getExistingMatches } from '../db/userRepository.js';
import { updateUserFriends } from '../services/friendService.js';
import { enrichFriendsWithPics } from '../services/facebookService.js';

const router = Router();

router.get('/', async function (req, res, next) {
  if (req.session.fbAuth) {
    console.log('user is logged in with Facebook');
    const { id, accessToken } = req.user;
    await updateUserFriends(id, accessToken);
    const friends = await findFriendsByUserId(id);
    const friendsWithPics = await enrichFriendsWithPics(friends);
    const matches = await getExistingMatches(id); // Don't automatically update matches; let the user decide when to do so
    res.render('loggedIn', { user: req.user, friends: friendsWithPics, matches: matches });
  } else if (req.session.msAuth) {
    console.log('user is logged in with Microsoft');
    res.render('innerLogin');
  } else {
    console.log('user is not logged in');
    res.render('outerLogin');
  }
});

export default router;