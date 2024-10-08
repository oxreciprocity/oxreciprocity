// This file provides the logic for creating and finding users in the database. It also adds friends to the database.
import createNeo4jDriver from './neo4j.js';

async function createUser(profile) { // Originally also took msid
  const driver = await createNeo4jDriver();
  const session = driver.session();
  const { id: fbid, displayName: name } = profile;
  const query = `
      CREATE (:User {fbid: $fbid, name: $name, submissionTimestamps: []})
  `;
  try {
    const result = await session.run(query, { fbid, name });
    session.close();
    console.log('User created');
    return result;
  } catch (error) {
    session.close();
    throw error;
  }
}

async function deleteUser(userFbid) {
  const driver = await createNeo4jDriver();
  const session = driver.session();

  try {
    await session.run(
      'MATCH (user:User {fbid: $userFbid}) DETACH DELETE user',
      { userFbid }
    );
  } catch (error) {
    console.error('Error deleting user:', error);
    throw error;
  } finally {
    await session.close();
  }
}

async function addAllFriends(userFbid, friendsFbids) {
  const driver = await createNeo4jDriver();
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
    console.log('Friends added', friendsFbids);
    return result;
  } catch (error) {
    session.close();
    throw error;
  }
}

async function userExists(fbid) {
  const driver = await createNeo4jDriver();
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
  const driver = await createNeo4jDriver();
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

async function setLastMatchUpdate(fbid, timestamp) {
  const driver = await createNeo4jDriver();
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

async function getPrefTimestamps(fbid) {
  const driver = await createNeo4jDriver();
  const session = driver.session();
  try {
    const result = await session.run(
      `MATCH (user:User {fbid: $fbid})
       RETURN user.submissionTimestamps AS timestamp`,
      { fbid }
    );
    return result.records[0].get('timestamp');
  } catch (error) {
    console.error('Error getting pref timestamps:', error);
    throw error;
  } finally {
    await session.close();
  }
}

async function appendPrefTimestamp(fbid, timestamp) {
  const driver = await createNeo4jDriver();
  const session = driver.session();
  try {
    await session.run(
      `MATCH (user:User {fbid: $fbid})
       SET user.submissionTimestamps = coalesce(user.submissionTimestamps, []) + $timestamp`,
      { fbid, timestamp }
    );
  } catch (error) {
    console.error('Error appending pref timestamp:', error);
    throw error;
  } finally {
    await session.close();
  }
}

export { 
  findOrCreateUser, deleteUser, findFriendsByUserId, addAllFriends, 
  setLastMatchUpdate,
  getPrefTimestamps, appendPrefTimestamp
};