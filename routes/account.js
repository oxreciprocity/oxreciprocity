import { Router } from 'express';
import { deleteUser } from '../db/userRepository.js';

const router = Router();

router.post('/delete', async (req, res) => {
  try {
    await deleteUser(req.user.id); // Assuming req.user contains the authenticated user's details
    // Use req.logout with a callback
    req.logout(function(err) {
      if (err) {
        console.error('Logout error:', err);
        return next(err);
      }
      // After successful logout, redirect or respond
      res.redirect('/'); // Redirect to the home page or login page
    });
  } catch (error) {
    console.error('Account deletion failed:', error);
    res.status(500).send('Failed to delete account');
  }
});

export default router;