"""
- TODO: Add hashing for ids
- TODO: Build actual tests
- TODO: Build logic to get names+profile pictures(+profile urls?) from Facebook
- TODO: Build rate limiter to prevent spam
- TODO: Build UI (post-auth flow)
- MAYBE: After someone's created an account, they don't really need to log in using their MSID -
  maybe there's a quicker flow with only FB auth?
- TODO: reminder when X friends have signed up
"""

from dataclasses import dataclass
from neo4j import GraphDatabase

# URI examples: "neo4j://localhost", "neo4j+s://xxx.databases.neo4j.io"
URI = "neo4j+s://f717d73f.databases.neo4j.io:7687"
AUTH = ("neo4j", "jHXOHLK_fai3wVP_jVFDGcfxym96MWD7TsLbNYUEC2I")


def run_in_transaction(fn, params):
    with GraphDatabase.driver(URI, auth=AUTH) as driver:
        with driver.session() as session:
            session.execute_write(fn, *params)



def create_constraints(tx):
    """
    Ensures that:
    - each user has a unique MSID and FBID
    - each FRIENDS relationship has three boolean parameters (r1, r2, r3) that are not null in each direction


    This should only be run once, at the initialisation of the database. It will not throw if you run it again, but it will not
    modify the existing constraints.
    """
    query_user_constraint = """
    CREATE CONSTRAINT user_unique_ids IF NOT EXISTS
    FOR (u:User) REQUIRE (u.MSID, u.FBID) IS UNIQUE
    """

    query_r1exists = """
    CREATE CONSTRAINT r1exists IF NOT EXISTS
    FOR ()-[friends:FRIENDS]-() REQUIRE friends.r1 IS NOT NULL
    """

    query_r2exists = """
    CREATE CONSTRAINT r2exists IF NOT EXISTS
    FOR ()-[friends:FRIENDS]-() REQUIRE friends.r2 IS NOT NULL
    """

    query_r3exists = """
    CREATE CONSTRAINT r3exists IF NOT EXISTS
    FOR ()-[friends:FRIENDS]-() REQUIRE friends.r3 IS NOT NULL
    """

    tx.run(query_user_constraint)
    tx.run(query_r1exists)
    tx.run(query_r2exists)
    tx.run(query_r3exists)


def create_user(tx, msid: str, fbid: str, active: bool = True):
    """Creates a user in Neo4j (does not add any friends)."""
    query = """
    CREATE (u:User {FBID: $fbid, MSID: $msid, Active: $active})
    """
    tx.run(query, fbid=fbid, msid=msid, active=active)


def add_all_friends(tx, user_fbid: str, friends_fbids: list[str]):
    """
    Adds bidirectional relationships between a user and all discovered Facebook friends already on OxReciprocity.
    """
    query = """
    MATCH (source:User {FBID: $user_fbid})
    UNWIND $friends_fbids AS target_fbid
    MATCH (target:User {FBID: target_fbid})
    WHERE NOT EXISTS((source)-[:FRIENDS]-(target))
    MERGE (source)-[:FRIENDS {r1: false, r2: false, r3: false}]->(target)
    MERGE (target)-[:FRIENDS {r1: false, r2: false, r3: false}]->(source)
    """
    tx.run(query, user_fbid=user_fbid, friends_fbids=friends_fbids)


def change_relationship(tx, user_fbid: str, target_fbid: str, level: int, ticked: bool):
    """
    Changes the `r` property of the relation between a user and a target for a particular level, setting it to `ticked`.
    This does nothing if `user_fbid` and `target_fbid` lack a relationship.
    """
    # TODO !Important - check that user_fbid is the current user.
    try:
        assert level in (1, 2, 3)

        query = """
        MATCH (user:User {FBID: $user_fbid})-[r:FRIENDS]->(target:User {FBID: $target_fbid})
        WITH r, CASE WHEN $level = 1 THEN $ticked ELSE r.r1 END AS r1,
                CASE WHEN $level = 2 THEN $ticked ELSE r.r2 END AS r2,
                CASE WHEN $level = 3 THEN $ticked ELSE r.r3 END AS r3
        SET r.r1 = r1, r.r2 = r2, r.r3 = r3
        RETURN COUNT(r) AS relationship_count
        """

        result = tx.run(
            query,
            user_fbid=user_fbid,
            target_fbid=target_fbid,
            level=level,
            ticked=ticked,
        )

        relationship_count = result.single()["relationship_count"]

        if relationship_count == 0:
            pass
            # raise ValueError(f"No relationship found between user {user_fbid} and target {target_fbid}")

    except AssertionError:
        pass
        # raise ValueError("Invalid level. Level must be 1, 2, or 3.")


@dataclass
class Friend:
    fbid: str
    out1: bool
    out2: bool
    out3: bool
    in1: bool = False
    in2: bool = False
    in3: bool = False


def get_friends(tx, user_fbid: str) -> list[Friend]:
    """
    Gets all the user's friends also on OxReciprocity and updates the in1, in2, in3 properties
    for the relationship from the friend to the user based on the values of r1, r2, r3 in both directions.
    """
    query = """
    MATCH (user:User {FBID: $user_fbid})-[r:FRIENDS]->(friend:User)
    MATCH (friend)-[r_inv:FRIENDS]->(user)
    WITH user, friend, r,
            r.r1 AS out1,
            r.r2 AS out2, 
            r.r3 AS out3,
            CASE WHEN r_inv IS NOT NULL THEN r.r1 AND r_inv.r1 ELSE false END AS in1,
            CASE WHEN r_inv IS NOT NULL THEN r.r2 AND r_inv.r2 ELSE false END AS in2,
            CASE WHEN r_inv IS NOT NULL THEN r.r3 AND r_inv.r3 ELSE false END AS in3
    RETURN friend.FBID AS fbid, out1, out2, out3, in1, in2, in3
    """

    result = tx.run(query, user_fbid=user_fbid)

    friends = []
    for record in result:
        friend = Friend(
            fbid=record["fbid"],
            out1=record["out1"],
            out2=record["out2"],
            out3=record["out3"],
            in1=record["in1"],
            in2=record["in2"],
            in3=record["in3"],
        )
        friends.append(friend)

    return friends


def nuke(tx):
    """
    Deletes all nodes and relationships from the graph.
    """
    if input("ARE YOU SURE (Y/n): ").strip() == "Y":
        query = """
        MATCH (n)
        DETACH DELETE n
        """
        print("All deleted")
        tx.run(query)
    else:
        print("Did not delete")


# Create a new session and transaction
def test():
    """
    Nukes the graph, then adds some examples. This shouldn't really be in here (and neither should nuke)
    """

    def test_function(tx):
        # Create 5 users
        create_user(tx, "msid1", "fbid1")
        create_user(tx, "msid2", "fbid2")
        create_user(tx, "msid3", "fbid3")
        create_user(tx, "msid4", "fbid4")
        create_user(tx, "msid5", "fbid5")

        # Set relationships between users
        add_all_friends(tx, "fbid1", ["fbid2", "fbid3"])
        add_all_friends(tx, "fbid2", ["fbid3", "fbid4"])
        add_all_friends(tx, "fbid3", ["fbid4", "fbid5"])
        add_all_friends(tx, "fbid4", ["fbid5"])
        add_all_friends(tx, "fbid5", ["fbid1"])

        # Change relationship properties
        change_relationship(tx, "fbid1", "fbid2", 1, True)
        change_relationship(tx, "fbid2", "fbid3", 2, True)
        change_relationship(tx, "fbid3", "fbid4", 3, True)
        change_relationship(tx, "fbid4", "fbid5", 2, True)
        change_relationship(tx, "fbid5", "fbid4", 2, True)
        # change_relationship(tx, "fbid5", "fbid4", 2, False)

        # Get friends and print objects
        friends = get_friends(tx, "fbid1") + get_friends(tx, "fbid4")
        for friend in friends:
            print(f"FBID: {friend.fbid}")
            print(f"Out1: {friend.out1}")
            print(f"Out2: {friend.out2}")
            print(f"Out3: {friend.out3}")
            print(f"In1: {friend.in1}")
            print(f"In2: {friend.in2}")
            print(f"In3: {friend.in3}")
            print()

    with GraphDatabase.driver(URI, auth=AUTH) as driver:
        with driver.session() as session:
            session.execute_write(nuke)
        with driver.session() as session:
            session.execute_write(create_constraints)
        with driver.session() as session:
            # Execute the test function within a transaction
            session.execute_write(test_function)
            print("Test function executed successfully.")
