const { Router } = require('express');
const adminController = require('../controllers/adminController');

const router = Router();

router.get('/', adminController.allPosts_GET);
router.get('/posts/hidden', adminController.hiddenPosts_GET);
router.get('/posts/public', adminController.publicPosts_GET);
router.get('/posts/new', adminController.newPost_GET);
router.post('/posts/new', adminController.newPost_POST);
router.get('/posts/:id', adminController.post_GET);
router.post('/posts/:id', adminController.post_DELETE);
router.get('/posts/:id/edit', adminController.updatePost_GET);
router.post('/posts/:id/edit', adminController.updatePost_POST);
router.post('/posts/:id/comments/:commentid', adminController.comment_DELETE);

router.get('/status', adminController.adminStatus_GET);
router.post('/status', adminController.adminStatus_POST);

module.exports = router;