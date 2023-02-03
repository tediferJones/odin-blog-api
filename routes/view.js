const { Router } = require('express');
const router = Router();
const fetch = require('node-fetch');

router.get('/', function (req, res, next) {
  // Displays all available posts (show all posts that are NOT hidden)
  // idk if localhost will work when it not running locally, how do we dynamically adapt since we dont know what our url is gunna be
  fetch(`http://localhost:3000/api/posts`)
    .then((response) => response.json())
    .then((posts) => {
      res.render('index', { title: 'ALL POSTS', posts })
    });
});

router.get('/posts/:id', (req, res, next) => {
  // Displays a specific post with comments, and gives user ability to create comments
  fetch(`http://localhost:3000/api/posts/${req.params.id}`)
    .then((response) => response.json())
    .then((post) => {
      res.render('post', { title: 'SPECIFIC POST', post })
    })
});

// I suppose we're done here, users should only be allowed to view posts and make comments, which can all be acomplished with these two routes

// KNOWN ISSUES:
//  - Posting a comment re-directs the user to /api/posts/POST-ID/comments, we want it to re-direct us back to /posts/POST-ID

module.exports = router;