// Queries Graph API for Facebook friends of a user, or a user's profile picture

import fetch from 'node-fetch';

const fetchFacebookFriends = async (fbid, accessToken) => {
    const url = `https://graph.facebook.com/${fbid}/friends?access_token=${accessToken}`;
    const response = await fetch(url);
    const data = await response.json();
    return data.data.map(friend => friend.id); // Return the IDs directly
};

const fetchPicUrl = async (fbid) => {
    const url = `https://graph.facebook.com/${fbid}/picture?height=200&redirect=false`;
    try {
        const response = await fetch(url);
        const data = await response.json();
        return data.data.url; // Assuming the API returns the direct URL in this field
    } catch (error) {
        console.error('Error fetching profile picture:', error);
        return null;
    }
}

const enrichFriendsWithPics = async (friends) => {
    // Map each friend to a promise of fetching their profile picture URL and adding it to the friend object
    const enrichedFriendsPromises = friends.map(async (friend) => {
        friend.picUrl = await fetchPicUrl(friend.fbid);
        return friend;
    });
    // Wait for all promises to resolve
    return Promise.all(enrichedFriendsPromises);
}

export { fetchFacebookFriends, enrichFriendsWithPics };