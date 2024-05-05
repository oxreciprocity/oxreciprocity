// import { session as _session } from './neo4j';
// const driver = require('./neo4j');
import driver from './neo4j';

// TODO actually call this function and set up the database
async function createConstraints() {
  // Ensures that:
  // - each user has a unique fbid (used to also check for MSID)
  // - each FRIENDS relationship has three boolean parameters (r1, r2, r3) that are not null in each direction


  // This should only be run once, at the initialisation of the database. It will not throw if you run it again, but it will not
  // modify the existing constraints.
  const session = driver.session();
  // const session = driver.session();
  try {
    // Unique constraints for User nodes
    await session.run(`
      CREATE CONSTRAINT user_unique_ids IF NOT EXISTS
      FOR (u:User) REQUIRE u.fbid IS UNIQUE
    `);

    // Constraints for FRIENDS relationships
    await session.run(`
      CREATE CONSTRAINT r1exists IF NOT EXISTS
      FOR ()-[friends:FRIENDS]-() REQUIRE friends.r1 IS NOT NULL
    `);
    await session.run(`
      CREATE CONSTRAINT r2exists IF NOT EXISTS
      FOR ()-[friends:FRIENDS]-() REQUIRE friends.r2 IS NOT NULL
    `);
    await session.run(`
      CREATE CONSTRAINT r3exists IF NOT EXISTS
      FOR ()-[friends:FRIENDS]-() REQUIRE friends.r3 IS NOT NULL
    `);

    console.log('Constraints created or already exist.');
  } catch (error) {
    console.error('Error creating constraints:', error);
  } finally {
    await session.close();
  }
}

export default createConstraints;