// Queries Graph API for Facebook friends of a user

const fetch = require('node-fetch');

const fetchFacebookFriends = async (fbId, accessToken) => {
    const url = `https://graph.facebook.com/${fbId}/friends?access_token=${accessToken}`;
    const response = await fetch(url);
    const data = await response.json();
    return data.data.map(friend => friend.id); // Return the IDs directly
};

module.exports = { fetchFacebookFriends };