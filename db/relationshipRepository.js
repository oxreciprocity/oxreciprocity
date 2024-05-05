// This file deals with updating relationship edges in the graph, and finding mutual matches.

const driver = require('./neo4j');

async function changeRelationship(userFbid, targetFbid, levels) {
  const session = driver.session();
  try {
    const query = `
      MATCH (user:User {fbid: $userFbid})-[r:FRIENDS]->(target:User {fbid: $targetFbid})
      SET r.r1 = $levels.r1, r.r2 = $levels.r2, r.r3 = $levels.r3
      RETURN COUNT(r) AS relationshipCount
    `;
    const result = await session.run(query, { userFbid, targetFbid, levels });
    const relationshipCount = result.records[0].get('relationshipCount').toInt();

    if (relationshipCount === 0) {
      throw new Error(`No relationship found between user ${userFbid} and target ${targetFbid}`);
    }

    return relationshipCount;
  } finally {
    await session.close();
  }
}

async function findMatches(userFbid) {
  const session = driver.session();
  const rMatchesQuery = `
  MATCH (user:User {fbid: $userFbid})-[rOut:FRIENDS]->(friend:User)
  MATCH (friend)-[rInv:FRIENDS]->(user)
  WITH user, friend, rOut, rInv
  RETURN friend.fbid AS fbid, friend.name AS name,
         CASE WHEN rOut.r1 AND rInv.r1 THEN true ELSE false END AS r1,
         CASE WHEN rOut.r2 AND rInv.r2 THEN true ELSE false END AS r2,
         CASE WHEN rOut.r3 AND rInv.r3 THEN true ELSE false END AS r3
  `;

  try {
    const result = await session.run(
      `MATCH (user:User {fbid: $userFbid})-[rOut:FRIENDS]->(friend:User)
         MATCH (friend)-[rInv:FRIENDS]->(user)
         WITH user, friend, rOut, rInv
         RETURN
            collect(DISTINCT CASE WHEN rOut.r1 AND rInv.r1 THEN {fbid: friend.fbid, name: friend.name} END) AS r1,
            collect(DISTINCT CASE WHEN rOut.r2 AND rInv.r2 THEN {fbid: friend.fbid, name: friend.name} END) AS r2,
            collect(DISTINCT CASE WHEN rOut.r3 AND rInv.r3 THEN {fbid: friend.fbid, name: friend.name} END) AS r3`,
      { userFbid }
    );

    if (result.records.length > 0) {
      const record = result.records[0];
      let matches = {
        r1: record.get('r1').filter(item => item !== null),
        r2: record.get('r2').filter(item => item !== null),
        r3: record.get('r3').filter(item => item !== null),
      };
      return matches;
    } else {
      return { r1: [], r2: [], r3: [] };
    }
  } catch (error) {
    console.error(error);
    throw error;
  } finally {
    await session.close();
  }
}

module.exports = { changeRelationship, findMatches };