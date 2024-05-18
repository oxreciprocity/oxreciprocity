import { Router } from 'express';
import passport from 'passport';

const router = Router();

router.get('/', (req, res) => {
  res.render('testLogin');
});

router.post('/', passport.authenticate('local', {
  failureRedirect: '/auth/local'
}), (req, res) => {
  // Set a custom session variable after successful login
  req.session.msAuth = true;
  res.redirect('/');
});

export default router