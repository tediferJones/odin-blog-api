const { Router } = require('express');
const { body, validationResult } = require('express-validator');
const fetch = require('node-fetch');

const router = Router();

router.get('/', function (req, res, next) {
  // Displays all available posts (show all posts that are NOT hidden)
  // idk if localhost will work when it not running locally, how do we dynamically adapt since we dont know what our url is gunna be
  fetch(`http://localhost:3000/api/posts`)
    .then((response) => response.json())
    .then((posts) => {
      const notHiddenPosts = posts.filter(post => post.hidden === false)
      res.render('index', { title: 'Welcome!', posts: notHiddenPosts })
    });
});

router.get('/posts/:id', (req, res, next) => {
  // Displays a specific post with comments, and gives user ability to create comments
  fetch(`http://localhost:3000/api/posts/${req.params.id}`)
    .then((response) => response.json())
    .then((post) => {
      res.render('post', { post })
    })
});

router.post(`/posts/:id/comments`, [
  body('author').trim().escape().isLength({ min: 1 }).withMessage('Author not found'),
  body('comment').trim().escape().isLength({ min: 1 }).withMessage('Comment not found'),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      // fetch the specific post so we have something to render down here

      // THIS FETCH COMMAND CAUSES ISSUES

      fetch(`http://localhost:3000/api/posts/${req.params.id}`)
        .then((response) => response.json())
        .then(post => {
          // console.log(req.body.author)
          const commentData = { author: req.body.author, comment: req.body.comment }
          console.log(commentData)
          return res.render('post', { post, commentData, errors: errors.array() })
        })
      // res.render('post', { commentData: { author: req.body.author, comment: req.body.comment }, errors: errors.array() })
    }

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
        res.redirect(`/posts/${req.params.id}`)
      });
  } 
]);

// OLD COMMENT POST METHOD, it works, just doesnt actually perform validation
// router.post(`/posts/:id/comments`, (req, res, next) => {
//   // send new comment request to API
//   const fetchDetails = {
//     method: 'post',
//     headers: { 'Content-Type' : 'application/json' },
//     body: JSON.stringify({
//       comment: req.body.comment,
//       author: req.body.author,
//     }),
//   };
//   fetch(`http://localhost:3000/api/posts/${req.params.id}/comments`, fetchDetails)
//     .then((response) => response.json())
//     .then((post) => {
//       res.redirect(`/posts/${req.params.id}`)
//     });
// });

module.exports = router;