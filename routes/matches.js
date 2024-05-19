// This file displays the logged in user's matches.

import { Router } from 'express';
import { getMatches } from '../controllers/relationshipController.js';
import { enrichMatchesWithPics } from '../services/facebookService.js';


const router = Router();

router.get('/', async function (req, res, next) {
  console.log('user is logged in with Facebook');
  const { id, accessToken } = req.user;
  const matches = await getMatches(id);
  const matchesWithPics = await enrichMatchesWithPics(matches);
  const currentPath = `${req.baseUrl}${req.path}`;
  console.log("matches: ", matches)
  res.render('matches', { user: req.user, matches: matchesWithPics, currentPath: currentPath });
});

export default router;