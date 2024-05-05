// GPT4 suggested putting the logic for adding new relationships into a different folder to the db folder...

// This file is called after a POST request submitting new relationships is made to the server

const { changeRelationship, findMatches } = require('../db/relationshipRepository');

async function updateRelationship(req, res) {
  console.log(req.body)
  try {
    const { userFbid, targetFbid, r1, r2, r3 } = req.body;
    // Ensure userFbid is the current user to prevent unauthorized changes
    if (userFbid !== req.user.id) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }
    const relationshipCount = await changeRelationship(userFbid, targetFbid, { r1: r1 === 'true', r2: r2 === 'true', r3: r3 === 'true' })
    res.json({ success: true, relationshipCount });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
}

async function getMatches(userId) {
  return await findMatches(userId);
}

module.exports = { updateRelationship, getMatches };