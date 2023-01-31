
const { Router } = require('express');
const router = Router();
const { body, validationResult } = require('express-validator');

const User = require('../models/user');
const Post = require('../models/post');

// /* GET home page. */
// router.get('/', function(req, res, next) {
//   // res.render('index', { title: 'Express' });
//   res.redirect('/posts')

// });

router.get('/posts', function(req, res, next) {
  Post.find({}).exec(function (err, posts) {
    if (err) { return next(err) }
    res.send(`${posts} \n`);
  });
});

router.post('/posts', [//function (req, res, next) {
  //  NEED TO SANITIZE INPUTS, validation is taken care of by models
  body('title').trim().escape().isLength({ min: 1}).withMessage('No Title Found'),
  body('content').trim().escape().isLength({ min: 1 }).withMessage('No Content Found'),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.send('Missing title or content \n');
      // would be nice if we could display error messages provided by express-validator
    }
    const newPost = new Post({
      title: req.body.title,
      content: req.body.content,
      date: new Date().toDateString() + ' at ' + new Date().toLocaleTimeString(),
      comments: [], // new post cant already have comments, so just initialize an empty array
    });
    newPost.save((err) => {
      if (err) { return next(err); }
      res.send(`POSTED: ${newPost} \n`);
    });
  }
]);

router.put('/posts/:id', [
  body('title').trim().escape().isLength({ min: 1 }).withMessage('No Title Found'),
  body('content').trim().escape().isLength({ min: 1 }).withMessage('No Content Found'),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.send('Missing title or content \n');
      // would be nice if we could display error messages provided by express-validator
    }
    Post.findById(req.params.id).exec(function (err, post) {
      if (err) { return next(err); }

      // if either title or content are being updated, we need to update the .edited and .dateEdited fields to reflect that this post has been changed from the original
      if (req.body.title || req.body.content) {
        post.edited = true;
        post.dateEdited = new Date().toDateString() + ' at ' + new Date().toLocaleTimeString();
      }
      // only update the field, if it exists inside the request data
      if (req.body.title) {
        post.title = req.body.title;
      }
      if (req.body.content) {
        post.content = req.body.content
      }
      post.save((err) => {
        if (err) { return(err); }
        res.send(`UPDATED POST: ${post} \n`)
      });
    });
  }
]);

router.delete('/posts/:id', function(req, res, next) {
  Post.findByIdAndDelete(req.params.id).exec(function(err, post) {
    if (err) { return next(err); }
    res.send(`DELETED POST: ${post} \n`)
  })
})

module.exports = router;
