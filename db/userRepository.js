// This file provides the logic for creating and finding users in the database. It also adds friends to the database.
import driver from './neo4j.js';

async function createUser(profile, active = true) { // Originally also took msid
  const session = driver.session();
  const { id: fbid, displayName: name } = profile;
  const query = `
      CREATE (:User {fbid: $fbid, name: $name, active: $active, lastMatchUpdate: null})
  `;
  try {
    const result = await session.run(query, { fbid, active, name });
    session.close();
    console.log('User created');
    return result;
  } catch (error) {
    session.close();
    throw error;
  }
}

async function addAllFriends(userFbid, friendsFbids) {
  const session = driver.session();
  const query = `
    MATCH (source:User {fbid: $userFbid})
    UNWIND $friendsFbids AS targetFbid
    MATCH (target:User {fbid: targetFbid})
    WHERE NOT EXISTS((source)-[:FRIENDS]-(target))
    MERGE (source)-[:FRIENDS {r1: false, r2: false, r3: false}]->(target)
    MERGE (target)-[:FRIENDS {r1: false, r2: false, r3: false}]->(source)
  `;
  try {
    const result = await session.run(query, { userFbid, friendsFbids });
    session.close();
    console.log('Friends added');
    return result;
  } catch (error) {
    session.close();
    throw error;
  }
}

async function userExists(fbid) {
  const session = driver.session();
  try {
    const query = `
      MATCH (user:User {fbid: $fbid})
      RETURN user LIMIT 1
    `;
    const result = await session.run(query, { fbid });
    return result.records.length > 0;
  } catch (error) {
    console.error('Error checking user existence:', error);
    throw error;
  } finally {
    await session.close();
  }
}

async function findOrCreateUser(profile, accessToken) {
  // NOTE that this doesn't update the user's friends list. That is done in the routes/index.js file.
  // If the app changes so that the homepage is not the friends page, then we should update the friends list here.
  try {
    const fbid = profile.id;
    const exists = await userExists(fbid);
    if (!exists) {
      // User doesn't exist so add to the database
      await createUser(profile);
    } else {
      console.log('User already exists:', fbid);
    }
  } catch (error) {
    console.error('Error finding or creating user:', error);
    throw error;
  }
}

async function findFriendsByUserId(fbid) {
  const session = driver.session();
  try {
    const result = await session.run(
      `MATCH (user:User {fbid: $fbid})-[rel:FRIENDS]->(friend:User)
         RETURN friend, rel.r1 AS r1, rel.r2 AS r2, rel.r3 AS r3`,
      { fbid }
    );
    // Adjusting the mapping to include relationship properties
    return result.records.map(record => {
      return {
        ...record.get('friend').properties, // Spread the friend's properties
        r1: record.get('r1'),
        r2: record.get('r2'),
        r3: record.get('r3')
      };
    });
  } catch (error) {
    console.error('Error finding friends:', error);
    throw error;
  } finally {
    await session.close();
  }
}

async function getLastMatchUpdate(fbid) {
  const session = driver.session();
  try {
    const result = await session.run(
      `MATCH (user:User {fbid: $fbid})
       RETURN user.lastMatchUpdate AS lastMatchUpdate`,
      { fbid }
    );
    if (result.records.length > 0) {
      return result.records[0].get('lastMatchUpdate');
    }
    return null;
  } catch (error) {
    console.error('Error getting last match update:', error);
    throw error;
  } finally {
    await session.close();
  }
}

async function getExistingMatches(fbid) {
  const session = driver.session();
  const existingMatchesQuery = `
  MATCH (user:User {fbid: $fbid})-[rel:MATCHED]->(match:User)
  WITH rel, match
  RETURN
    collect(DISTINCT CASE WHEN rel.r1 THEN {fbid: match.fbid, name: match.name} END) AS r1,
    collect(DISTINCT CASE WHEN rel.r2 THEN {fbid: match.fbid, name: match.name} END) AS r2,
    collect(DISTINCT CASE WHEN rel.r3 THEN {fbid: match.fbid, name: match.name} END) AS r3
`;
  try {
    const result = await session.run(existingMatchesQuery, { fbid });
    console.log("existing matches: ", result.records)
    if (result.records.length > 0) {
      const record = result.records[0];
      let matches = {
        r1: record.get('r1').filter(item => item !== null),
        r2: record.get('r2').filter(item => item !== null),
        r3: record.get('r3').filter(item => item !== null),
      };
      return matches;
    } 
  } catch (error) {
    console.error('Error getting existing matches:', error);
    throw error;
  } finally {
    await session.close();
  }
}

async function setLastMatchUpdate(fbid, timestamp) {
  const session = driver.session();
  try {
    console.log("Setting last match update for", fbid, "to", timestamp)
    await session.run(
      `MATCH (user:User {fbid: $fbid})
       SET user.lastMatchUpdate = $timestamp`,
      { fbid, timestamp }
    );
  } catch (error) {
    console.error('Error updating last match update:', error);
    throw error;
  } finally {
    await session.close();
  }
}

export { findOrCreateUser, findFriendsByUserId, addAllFriends, getLastMatchUpdate, getExistingMatches, setLastMatchUpdate};