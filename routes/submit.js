// This is the router for receiving relationship information from the client and updating the database with it.

import { Router } from 'express';
import { updateRelationship } from '../controllers/relationshipController.js';

const router = Router();

router.post('/', updateRelationship);

export default router;