// GPT4 suggested putting the logic for adding new relationships into a different folder to the db folder...

// This file is called after a POST request submitting new relationships is made to the server

import { changeRelationship, findMatches } from '../db/relationshipRepository.js';
import { getLastMatchUpdate, getExistingMatches, setLastMatchUpdate } from '../db/userRepository.js';


async function updateRelationship(req, res) {
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

// async function getMatches(userId) {
//   return await findMatches(userId);
// }

async function getMatches(userId) {
  // Retrieve the user's last match update timestamp from the database
  const lastMatchUpdate = await getLastMatchUpdate(userId);

  // Calculate the difference between the current time and the last update
  const oneWeek = 7 * 24 * 60 * 60 * 1000; // One week in milliseconds
  const now = new Date();
  const lastUpdateDate = new Date(lastMatchUpdate); // if null, defaults to 1970-01-01
  const timeSinceLastUpdate = now - lastUpdateDate;

  if (timeSinceLastUpdate < oneWeek) {
      // If it's been less than a week, return the existing matches without querying the database again
      console.log('Returning existing matches')
      return getExistingMatches(userId);
  } else {
      // If it's been at least a week, proceed to find and return new matches
      console.log('Finding new matches')
      const newMatches = await findMatches(userId);
      // Update the user's last match update timestamp in the database
      setLastMatchUpdate(userId, now.toISOString());
      return newMatches;
  }
}

export { updateRelationship, getMatches };