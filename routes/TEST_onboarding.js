import { Router } from 'express';

const router = Router();

router.get('/', async function (req, res, next) {
  const tempId = 876336624537422
  // const userRef = `${req.user.id}}`;
  const userRef = `${tempId}`;
  res.render('mailingPrompt', {
    user: req.user,
    currentPath: `${req.baseUrl}${req.path}`,
    pageId: process.env.PAGE_ID, 
    appId: process.env.MESSENGER_APP_ID, 
    userRef: userRef,
  })
});

export default router;