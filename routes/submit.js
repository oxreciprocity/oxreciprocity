// This is the router for receiving relationship information from the client and updating the database with it.

const express = require('express');
const { updateRelationship } = require('../controllers/relationshipController');

const router = express.Router();

router.post('/', updateRelationship);

module.exports = router;