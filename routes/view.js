const { Router } = require('express');
const router = Router();
const fetch = require('node-fetch');

router.get('/', function (req, res, next) {
  // Displays all available posts (show all posts that are NOT hidden)
  // idk if localhost will work when it not running locally, how do we dynamically adapt since we dont know what our url is gunna be
  fetch(`http://localhost:3000/api/posts`)
    .then((response) => response.json())
    .then((posts) => {
      res.render('index', { title: 'NOT HIDDEN POSTS', posts })
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

router.post(`/posts/:id/comments`, (req, res, next) => {
  // send new comment request to API
  const fetchDetails = {
    method: 'post',
    headers: { 'Content-Type' : 'application/json' },
    body: JSON.stringify({
      comment: req.body.comment,
      author: req.body.author,
    }),
  };
  fetch(`http://localhost:3000/api/posts/${req.params.id}/comments`, fetchDetails)
    .then((response) => response.json())
    .then((post) => {
      // res.render('post', { title:  })
      res.redirect(`/posts/${req.params.id}`)
    })
})

// I suppose we're done here, users should only be allowed to view posts and make comments, which can all be acomplished with these three routes

// KNOWN ISSUES:
//  - we need GET and POST pages for "getAdminStatus", if we input the correct passphrase, we will get admin privileges and redirect to /admin

module.exports = router;