
const { Router } = require('express');
const mongoose = require('mongoose')
const { body, validationResult } = require('express-validator');
const Post = require('../models/post');

const router = Router();

router.get('/posts', function(req, res, next) {
  // returns all available post, for user view
  Post.find({ hidden: false }).exec(function (err, posts) {
    if (err) { return next(err) }
    res.send(posts);
  });
});

// CONSIDER DELETEING THE ABOVE ROUTE, filter the posts inside the view routes instead of in the api

// You will need a function to GET all posts, even ones that are hidden, so the admin can un-hide them if/when needed
router.get('/posts/all', (req, res, next) => {
  Post.find({}).exec((err, posts) => {
    // console.log(posts)
    if (err) { return next(err); }
    res.send(posts);
  });
});

router.get('/posts/:id', (req, res, next) => {
  Post.findById(req.params.id).exec((err, post) => {
    // console.log(post)
    if (err) { return next(err); }
    res.send(post)
  });
});

router.post('/posts', [
  body('title').trim().escape().isLength({ min: 1}).withMessage('No Title Found'),
  body('content').trim().escape().isLength({ min: 1 }).withMessage('No Content Found'),

  // save new post to DB
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.send('Missing title or content \n');
      // would be nice if we could display error messages provided by express-validator
    }
    console.log('INSIDE API')
    console.log()
    const newPost = new Post({
      title: req.body.title,
      content: req.body.content,
      hidden: req.body.hidden,
      date: new Date().toDateString() + ' at ' + new Date().toLocaleTimeString(),
      comments: [], // new post cant already have comments, so just initialize an empty array
    });
    newPost.save((err) => {
      if (err) { return next(err); }
      res.send(newPost)
    });
  }
]);

router.put('/posts/:id', [
  body('title').trim().escape().isLength({ min: 1 }).withMessage('No Title Found'),
  body('content').trim().escape().isLength({ min: 1 }).withMessage('No Content Found'),
  // need to validate body.hiddenVal is 1 or 0

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.send('Missing title or content \n');
      // would be nice if we could display error messages provided by express-validator
    }
    Post.findById(req.params.id).exec(function (err, post) {
      if (err) { return next(err); }

      // if the values in req.body do not match the values of post (the result of DB lookup), add edited flags
      if (req.body.title !== post.title || req.body.content !== post.content) {
        post.edited = true;
        post.dateEdited = new Date().toDateString() + ' at ' + new Date().toLocaleTimeString();
      }

      post.title = req.body.title;
      post.content = req.body.content;
      post.hidden = req.body.hidden;

      post.save((err) => {
        if (err) { return(err); }
        res.send(post)
      });
    });
  }
]);

router.delete('/posts/:id', function(req, res, next) {
  Post.findByIdAndDelete(req.params.id).exec(function(err, post) {
    if (err) { return next(err); }
    res.send(post)
  })
})

// COMMENTS
// comments can only be edited or removed by admin, otherwise it would be a complete cluster
// comment GET method is redundant, because comments are included with post data.  LOOK AT THAT MAGIC
// comment PUT method is very questionable even from the admin's perspective, they shouldnt be able to change your words, but they should be able to delete your comment if they feel that is necessary

router.post('/posts/:id/comments', [
  body('comment').trim().escape().isLength({ min: 1 }).withMessage('Comment not found'),
  body('author').trim().escape().isLength({ min: 1 }).withMessage('Author not found'),  
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.send('Missing Comment or Author')
    }
    Post.findById(req.params.id).exec((err, post) => {
      if (err) { return next(err); }
      // console.log(mongoose.Types.ObjectId().toString())
      const newComment = {
        id: mongoose.Types.ObjectId().toString(),
        comment: req.body.comment,
        author: req.body.author,
        date: new Date().toDateString() + ' at ' + new Date().toLocaleTimeString()
      }
      post.comments.push(newComment)
      post.save((err) => {
        if (err) { return next(err); }
        res.send(post)
      });
    });
  }
]);

router.delete('/posts/:id/comments/:commentid', (req, res, next) => {
  Post.findById(req.params.id).exec((err, post) => {
    if (err) { return next(err); }

    // loop through comments to find the one with a matching id, and splice it from the array
    for (let i = 0; i < post.comments.length; i++) {
      if (post.comments[i].id === req.params.commentid) {
        post.comments.splice(i, 1)
        break;
      };
    };
    post.save((err) => {
      if (err) { return next(err); }
      res.send(post)
    });
  });
});

module.exports = router;
