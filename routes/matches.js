import { Router } from 'express';
import { getMatches } from '../controllers/relationshipController.js';

const router = Router();

router.post('/', async (req, res) => {
  try {
    const id = req.user.id;
    await getMatches(id);
    res.redirect('/'); // TODO this should return the matches or something...
  } catch (error) {
    console.error('Failed to load matches:', error);
    res.status(500).send('Failed to load matches');
  }
});

export default router;