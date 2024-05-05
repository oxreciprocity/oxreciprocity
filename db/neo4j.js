// This sets up the connection to the Neo4j database.

const neo4j = require('neo4j-driver');

URI = process.env.N4J_URI
USER = process.env.N4J_USER
PASSWORD = process.env.N4J_PASSWORD

const driver = neo4j.driver(
  URI,
  neo4j.auth.basic(USER, PASSWORD)
);

module.exports = driver;