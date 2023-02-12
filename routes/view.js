const { Router } = require('express');
const viewController = require('../controllers/viewController');

const router = Router();

router.get('/', viewController.allPosts_GET);
router.get('/posts/:id', viewController.post_GET);
router.post('/posts/:id/comments', viewController.comment_POST);

module.exports = router;