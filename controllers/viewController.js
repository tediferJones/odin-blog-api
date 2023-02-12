const { body, validationResult } = require('express-validator');
const fetch = require('node-fetch');

exports.allPosts_GET = (req, res, next) => {
  // Displays all available posts (show all posts that are NOT hidden)
  // Not sure if localhost will work when it not running locally, how do we dynamically adapt since we dont know what our url is gunna be
  fetch(`http://localhost:3000/api/posts`)
    .then((response) => response.json())
    .then((posts) => {
      const notHiddenPosts = posts.filter(post => post.hidden === false)
      // res.render('index', { title: 'Welcome!', posts: notHiddenPosts })
      res.render('index', { posts: notHiddenPosts })
    });
};

exports.post_GET = (req, res, next) => {
  // Displays a specific post with comments, and gives user ability to create comments
  fetch(`http://localhost:3000/api/posts/${req.params.id}`)
    .then((response) => response.json())
    .then((post) => {
      res.render('post', { post })
    })
};

exports.comment_POST = [
  body('author').trim().escape().isLength({ min: 1 }).withMessage('Author not found'),
  body('comment').trim().escape().isLength({ min: 1 }).withMessage('Comment not found'),

  (req, res, next) => {
    const errors = validationResult(req);
    const commentData = {
      author: req.body.author,
      comment: req.body.comment,
    }

    // if errors exist, send user back to the post page, with their comment data and errors, otherwise post the comment
    if (!errors.isEmpty()) {
      fetch(`http://localhost:3000/api/posts/${req.params.id}`)
        .then((response) => response.json())
        .then((post) => {
          res.render('post', { post, commentData, errors: errors.array() })
        })
    } else {
      // no errors found, so we post it to the API, which will post it to the DB
      const fetchDetails = {
        method: 'post',
        headers: { 'Content-Type' : 'application/json' },
        body: JSON.stringify(commentData)
      };
      fetch(`http://localhost:3000/api/posts/${req.params.id}/comments`, fetchDetails)
        .then((response) => response.json())
        .then((post) => {
          res.redirect(`/posts/${req.params.id}`)
        });
    }
  } 
]