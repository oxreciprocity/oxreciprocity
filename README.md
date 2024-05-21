# oxreciprocity
## Getting profile pictures
- You can use the application-scoped user ID to get the [profile picture](https://developers.facebook.com/docs/graph-api/reference/user/picture/) without an access token but note that in development mode, you [have to give an access token](https://developers.facebook.com/docs/graph-api/changelog/non-versioned-changes/sep-16-2020/) to not just get the default picture.

## Managing OAuth
### MS 
- Managed through https://entra.microsoft.com/ with oxheart@oxheart.love
- Change URIs with authentication > redirect URIs
## FB
- managed through https://developers.facebook.com/ with personal Facebook logins
- Change URIs with use cases > authentication and account creation > customise > settings

## Resetting database
```cypher
MATCH(n)
DETACH DELETE n;
CREATE (:User {fbid: "123456789", name: "John Doe"})
CREATE (:User {fbid: "987654321", name: "Jane Roe"})

MATCH (a:User {fbid: "876336624537422"}), (b:User)
WHERE b.fbid IN ["123456789", "987654321"]
MERGE (a)-[rOut:FRIENDS]->(b)
  ON CREATE SET rOut.r1 = False, rOut.r2 = False, rOut.r3 = False
MERGE (a)<-[rInv:FRIENDS]-(b)
  ON CREATE SET rInv.r1 = False, rInv.r2 = False, rInv.r3 = False

MATCH (a)-[rel:FRIENDS]-(b)
WHERE a.fbid = "123456789" AND b.fbid = "876336624537422"
SET rel.r1 = true, rel.r2 = true;
MATCH (a)-[rel:FRIENDS]-(b)
WHERE a.fbid = "987654321" AND b.fbid = "876336624537422"
SET rel.r3 = true, rel.r2 = true;

MATCH (user:User {fbid: "876336624537422"})
SET user.submissionTimestamps = []
```