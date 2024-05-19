// This file displays the logged in user's matches.

import { Router } from 'express';
import { getMatches } from '../controllers/relationshipController.js';

const router = Router();

router.get('/', async function (req, res, next) {
  console.log('user is logged in with Facebook');
  const { id, accessToken } = req.user;
  const matches = await getMatches(id);
  const currentPath = `${req.baseUrl}${req.path}`;
  console.log("currentpath: ", currentPath)
  res.render('matches', { user: req.user, matches: matches, currentPath: currentPath });
});

export default router;