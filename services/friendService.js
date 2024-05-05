// Updates the user's friends list in the database

import { fetchFacebookFriends } from './facebookService.js';
import { addAllFriends } from '../db/userRepository.js';

async function updateUserFriends(userId, accessToken) {
    let friendsListFbIds = await fetchFacebookFriends(userId, accessToken);
    friendsListFbIds = ["123456789", "987654321", "0"] // for debugging; change previous line to let
    await addAllFriends(userId, friendsListFbIds);
}

export { updateUserFriends };