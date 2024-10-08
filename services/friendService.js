// Updates the user's friends list in the database

import { fetchFacebookFriends } from './facebookService.js';
import { addAllFriends } from '../db/userRepository.js';

async function updateUserFriends(userId, accessToken) {
    let friendsListFbids = await fetchFacebookFriends(userId, accessToken);
    await addAllFriends(userId, friendsListFbids);
}

export { updateUserFriends };