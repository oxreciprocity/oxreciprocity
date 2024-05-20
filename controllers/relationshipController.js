// GPT4 suggested putting the logic for adding new relationships into a different folder to the db folder...

// This file is called after a POST request submitting new relationships is made to the server

import { changeRelationship, findMatches, storeMatches } from '../db/relationshipRepository.js';
import { setLastMatchUpdate, getPrefTimestamps, appendPrefTimestamp } from '../db/userRepository.js';


// Check whether an additional call at currentTime would exceed the rate limit of maxCalls in period [currentTime - timeframe, currentTime]
function checkRateLimit(timestamps, maxCalls, timeframe, currentTime) {
  // Filter the timestamps to only include those within the [currentTime - timeframe, currentTime] interval
  const relevantTimestamps = timestamps.filter(timestampString => {
    const timestamp = new Date(timestampString).getTime();
    return currentTime - timestamp <= timeframe;
  });
  // Check if adding another call would exceed the maxCalls limit
  return relevantTimestamps.length < maxCalls;
}

async function updateRelationship(req, res) {
  try {
    const { userFbid, targetFbid, r1, r2, r3 } = req.body;
    
    // Ensure userFbid is the current user to prevent unauthorized changes
    if (userFbid !== req.user.id) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }
    // Get timestamps of last match updates
    const prefTimestamps = await getPrefTimestamps(userFbid);
    // Check whether the rate limit has been exceeded
    const maxMatches = 3;
    const timeframe = 7 * 24 * 60 * 60 * 1000; // One week in milliseconds
    const currentTime = new Date();
    const rateLimitOk = checkRateLimit(prefTimestamps, maxMatches, timeframe, currentTime);
    if (!rateLimitOk) {
      return res.status(429).json({ success: false, message: "Rate limit exceeded" });
    }
    // Update the relationship in the database
    const relationshipCount = await changeRelationship(userFbid, targetFbid, { r1: r1 === 'true', r2: r2 === 'true', r3: r3 === 'true' })
    await appendPrefTimestamp(userFbid, currentTime.toISOString()); // NOTE could also store targetFbid but would make more complicated
    res.json({ success: true, relationshipCount });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
}

async function getMatches(userId) {
  const now = new Date();
  console.log('Finding new matches')
  const newMatches = await findMatches(userId);
  await storeMatches(userId, newMatches);
  // Update the user's last match update timestamp in the database
  setLastMatchUpdate(userId, now.toISOString());
  return newMatches;
}

export { updateRelationship, getMatches };