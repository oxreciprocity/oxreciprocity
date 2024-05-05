// This sets up the connection to the Neo4j database.

import { driver as createDriver, auth } from 'neo4j-driver';
import dotenv from 'dotenv';
dotenv.config();

const URI = process.env.N4J_URI;
const USER = process.env.N4J_USER;
const PASSWORD = process.env.N4J_PASSWORD;

const driver = createDriver(
  URI,
  auth.basic(USER, PASSWORD)
);

export default driver;