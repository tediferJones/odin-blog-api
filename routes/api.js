
const { Router } = require('express');
const router = Router();
const { body, validationResult } = require('express-validator');

// const User = require('../models/user');
const Post = require('../models/post');

const mongoose = require('mongoose')

router.get('/posts', function(req, res, next) {
  // returns all available post
  Post.find({ hidden: false }).exec(function (err, posts) {
    if (err) { return next(err) }
    // res.send(`${posts} \n`);
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

// You will need a function to GET all posts, even ones that are hidden, so the admin can un-hide them if/when needed
router.get('posts/all', (req, res, next) => {
  Post.find({}).exec((err, posts) => {
    if (err) { return next(err); }
    res.send(posts);
  })
})

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
    const newPost = new Post({
      title: req.body.title,
      content: req.body.content,
      date: new Date().toDateString() + ' at ' + new Date().toLocaleTimeString(),
      comments: [], // new post cant already have comments, so just initialize an empty array
    });
    newPost.save((err) => {
      if (err) { return next(err); }
      // res.send(`POSTED: ${newPost} \n`);
      res.redirect(`/posts/${newPost._id}}`)
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

      // TESTING
      // post.title = req.body.title || post.title;
      // post.content = req.body.content || post.content;
      // post.hidden = req.body.hidden || post.hidden; // you must validate req.body.hidden if you plan on using this

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

// this works, but there is a way to merge it with the put method above, providing dual functionality
router.put('/posts/:id/toggleHidden', (req, res, next) => {
  Post.findById(req.params.id).exec((err, post) => {
    if (err) { return next(err); }
    if (post.hidden) {
      post.hidden = false;
    } else {
      post.hidden = true;
    }
    post.save((err) => {
      if (err) { return next(err); }
      res.send(`HIDDEN SET TO: ${post.hidden}`)
    })
  })
})

router.delete('/posts/:id', function(req, res, next) {
  Post.findByIdAndDelete(req.params.id).exec(function(err, post) {
    if (err) { return next(err); }
    res.send(`DELETED POST: ${post} \n`)
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
    // WE NEED TO FIGURE OUT HOW TO DETERMINE SOURCE OF CONTENT
    //  - if its a request from curl, return json, if its a request from our HTML, send HTML
    //  - EASY FIX, get url property 
    // console.log(req.get('Accept'));
    // console.log(req.accepts('application/json'))
    // console.log(req)
    // console.log(req.originalUrl)
    // console.log((req.baseUrl).includes('api'))

    // compare a curl request to an browser request, find the difference
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.send('Missing Comment or Author')
    }
    Post.findById(req.params.id).exec((err, post) => {
      if (err) { return next(err); }
      // console.log(mongoose.Types.ObjectId().toString())
      const newComment = {
        id: mongoose.Types.ObjectId().toString(), // NEED TO FIND A WAY TO ASIGN NUMBERS
        comment: req.body.comment,
        author: req.body.author,
        date: new Date().toDateString() + ' at ' + new Date().toLocaleTimeString()
      }
      post.comments.push(newComment)
      post.save((err) => {
        if (err) { return next(err); }
        // res.send(`NEW COMMENT: ${JSON.stringify(newComment)}`)
        // this is the good stuff
        res.redirect(`/posts/${req.params.id}`)
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
      res.send(`DELETED COMMENT: ${JSON.stringify(post)}`)
    });
  });
});

module.exports = router;
