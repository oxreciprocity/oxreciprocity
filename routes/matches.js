// This file displays the logged in user's matches.

import { Router } from 'express';
import { getMatches } from '../controllers/relationshipController.js';

const router = Router();

router.get('/', async function (req, res, next) {
  console.log('user is logged in with Facebook');
  const { id, accessToken } = req.user;
  const matches = await getMatches(id);
  res.render('matches', { user: req.user, matches: matches });
});

export default router;