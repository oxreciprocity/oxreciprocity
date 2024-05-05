// This file is called after a POST request submitting new relationships is made to the server, to handle adding those edges.

const driver = require('./neo4j');

// async function changeRelationship(userFbid, targetFbid, level, ticked) {
//     if (![1, 2, 3].includes(level)) {
//       throw new Error("Invalid level. Level must be 1, 2, or 3.");
//     }
 
//     const session = driver.session();
//     try {
//       const query = `
//         MATCH (user:User {fbid: $userFbid})-[r:FRIENDS]->(target:User {fbid: $targetFbid})
//         WITH r, CASE WHEN $level = 1 THEN $ticked ELSE r.r1 END AS r1,
//                     CASE WHEN $level = 2 THEN $ticked ELSE r.r2 END AS r2,
//                     CASE WHEN $level = 3 THEN $ticked ELSE r.r3 END AS r3
//         SET r.r1 = r1, r.r2 = r2, r.r3 = r3
//         RETURN COUNT(r) AS relationshipCount
//       `;
//       const result = await session.run(query, { userFbid, targetFbid, level, ticked });
//       const relationshipCount = result.records[0].get('relationshipCount').toInt();
 
//       if (relationshipCount === 0) {
//         // Handle no relationship found case
//         throw new Error(`No relationship found between user ${userFbid} and target ${targetFbid}`);
//       }
 
//       return relationshipCount; // Or any other relevant data
//     } finally {
//       await session.close();
//     }
//   }

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

module.exports = { changeRelationship };