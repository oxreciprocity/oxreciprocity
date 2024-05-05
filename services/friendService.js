// Updates the user's friends list in the database

const { fetchFacebookFriends } = require('./facebookService');
const { addAllFriends } = require('../db/userRepository');

async function updateUserFriends(userId, accessToken) {
    let friendsListFbIds = await fetchFacebookFriends(userId, accessToken);
    friendsListFbIds = ["123456789", "987654321", "0"] // for debugging; change previous line to let
    await addAllFriends(userId, friendsListFbIds);
}

module.exports = { updateUserFriends };