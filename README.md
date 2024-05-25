# oxreciprocity
## Code structure
```plaintext
.
├── README.md
├── TODO
├── app.js # environment variables, dependencies, view engine, session store, CSRF, routes, error handling, server setup
├── app.yaml # configuration for Google App Engine
├── auth
│   ├── facebookStrategy.js
│   ├── index.js # configure all three passport-js strategies
│   ├── localStrategy.js
│   └── microsoftStrategy.js
├── controllers
│   └── relationshipController.js # manage rate-limiting for updating relationships
├── db
│   ├── initialiseDatabase.js # create constraints, not currently used
│   ├── neo4j.js # connect to Neo4j database
│   ├── relationshipRepository.js # manage relationships in the database
│   └── userRepository.js # manage users in the database
├── package-lock.json
├── package.json
├── public
│   ├── favicon
│   │   └── ...
│   ├── scripts
│   │   └── main.js # currently only relevant for homepage with submitting preferences
│   └── styles.css
├── routes
│   ├── account.js # handle account deletion
│   ├── auth # redirects for OAuth or local login
│   │   ├── facebook.js
│   │   ├── local.js
│   │   └── microsoft.js
│   ├── index.js # homepage, renders differently based on login status
│   ├── matches.js # mutual matches
│   └── submit.js # handle submission of preferences
├── services
│   ├── facebookService.js # queries to Graph API and post-processing
│   ├── friendService.js # add friends to database
│   └── secretsService.js # deal with Google Secret Manager
├── setupEnv.js # set up environment variables
├── var
│   └── db
│       └── sessions.db
└── views
    ├── error.ejs
    ├── index.ejs
    ├── innerLogin.ejs
    ├── matches.ejs
    ├── outerLogin.ejs
    ├── partials
    │   ├── _about.ejs
    │   ├── _friendsList.ejs
    │   ├── _head.ejs
    │   ├── _mutualMatches.ejs
    │   ├── _navbar.ejs
    │   └── _scripts.ejs
    └── testLogin.ejs
```

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

MATCH (a:User {fbid: "893294446174973"}), (b:User)
WHERE b.fbid IN ["123456789", "987654321"]
MERGE (a)-[rOut:FRIENDS]->(b)
  ON CREATE SET rOut.r1 = False, rOut.r2 = False, rOut.r3 = False
MERGE (a)<-[rInv:FRIENDS]-(b)
  ON CREATE SET rInv.r1 = False, rInv.r2 = False, rInv.r3 = False

MATCH (a)-[rel:FRIENDS]-(b)
WHERE a.fbid = "123456789" AND b.fbid = "893294446174973"
SET rel.r1 = true, rel.r2 = true;
MATCH (a)-[rel:FRIENDS]-(b)
WHERE a.fbid = "987654321" AND b.fbid = "893294446174973"
SET rel.r3 = true, rel.r2 = true;

MATCH (user:User {fbid: "893294446174973"})
SET user.submissionTimestamps = []
```