// This sets up the connection to the Neo4j database.
import { driver as createDriver, auth } from 'neo4j-driver';
import { getSecret } from '../services/secretsService.js';

export default async function () {
  const URI = process.env.N4J_URI;
  const USER = process.env.N4J_USER;
  const PASSWORD = await getSecret('N4J_PASSWORD');

  return createDriver(URI, auth.basic(USER, PASSWORD));
}