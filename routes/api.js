
const { Router } = require('express');
const router = Router();
const { body, validationResult } = require('express-validator');

// const User = require('../models/user');
const Post = require('../models/post');
const Comment = require('../models/comment');
// const comment = require('../models/comment');

// /* GET home page. */
// router.get('/', function(req, res, next) {
//   // res.render('index', { title: 'Express' });
//   res.redirect('/posts')
// });

router.get('/posts', function(req, res, next) {
  // RE WRITE THIS, should deliver posts as an array of objects, each object should include the post and all its comments
  Post.find({}).exec(function (err, posts) {
    if (err) { return next(err) }
    res.send(posts);
  });
});

// NEED ROUTER.GET FOR /POSTS/:id TO SHOW COMMENTS
// or just fetch /post/:id/comments
router.get('/posts/:id', function(req, res, next) {
  // if (err) { return next(err); }
  Post.findById(req.params.id).exec(function(err, post) {
    if (err) { return next(err); }
    Comment.find({ owner: req.params.id }).exec(function(err, comments) {
      if (err) { return next(err); }
      data = { post, comments }
      res.send(data)
    })
  })
})

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
      // we get probably get rid of the 'comments' field now that we have a comments collection
      // comments: [], // new post cant already have comments, so just initialize an empty array
    });
    newPost.save((err) => {
      if (err) { return next(err); }
      res.send(`POSTED: ${newPost} \n`);
    });
  }
]);

router.put('/posts/:id', [
  // would be nice if we could update one field, without having to rewrite the others
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
  // this will apparently work
  Post.findByIdAndDelete(req.params.id).exec(function(err, post) {
    if (err) { return next(err); }
    Comment.deleteMany({ owner: req.params.id}).exec(function(err, comments) {
      res.send(`DELETED POST: ${post} \n DELETED COMMENTS: ${comments} \n`)
    })
    // res.send(`DELETED POST: ${post} \n`)
  })
});

// STILL NEED TO ADD METHOD TO TOGGLE POST.HIDDEN VALUE
//  - this will be post specific, so should go through /posts/:id

router.get('/posts/:id/comments', function(req, res, next) {
  Comment.find({ owner: req.params.id }).exec((err, comments) => {
    if (err) { return next(err); }
    res.send(`COMMENTS FOR POST ID ${req.params.id}: ${comments} \n`)
  })
});

router.post('/posts/:id/comments', [
  body('comment').trim().escape().isLength({ min: 1 }).withMessage('Comment not found'),
  body('author').trim().escape().isLength({ min: 1 }).withMessage('Author not found'),

  (req, res, next) => {
    const newComment = new Comment({
      owner: req.params.id,
      comment: req.body.comment,
      author: req.body.author,
      date: new Date().toDateString() + ' at ' + new Date().toLocaleTimeString(),
    })
    newComment.save((err) => {
      if (err) { return next(err); }
      res.send(`NEW COMMENT: ${newComment}`);

    })
  }
])

router.put('/posts/:id/comments/:commentid', [
  body('comment').trim().escape().isLength({ min: 1 }).withMessage('Comment not found'),
  body('author').trim().escape().isLength({ min: 1 }).withMessage('Author not found'),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.send('Missing comment or author')
    }
    Comment.findById(req.params.commentid).exec((err, commentToUpdate) => {
      if (err) { return next(err); }
      if (req.body.comment) {
        commentToUpdate.comment = req.body.comment;
      }
      if (req.body.author) {
        commentToUpdate.author = req.body.comment;
      }
      commentToUpdate.date = new Date().toDateString() + ' at ' + new Date().toLocaleTimeString()
      commentToUpdate.save((err) => {
        if (err) { return next(err); }
        res.send(`UPDATED COMMENT: ${commentToUpdate}`)
      })

    })
  }
])

router.delete('/posts/:id/comments/:commentid', function(req, res, next) {
  Comment.findByIdAndDelete(req.params.commentid, function(err, deletedComment) {
    if (err) { return next(err); }
    res.send(`DELETED COMMENT: ${deletedComment}`);
  });
});

module.exports = router;
