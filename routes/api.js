
const { Router } = require('express');
const router = Router();
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
    res.send(posts);
  });
});

router.post('/posts', function (req, res, next) {
  //  NEED TO SANITIZE INPUTS, validation is taken care of by models

  // console.log(req.body)
  // console.log(req.body.title)
  const newPost = new Post({
    title: req.body.title,
    content: req.body.content,
    date: new Date().toDateString() + ' at ' + new Date().toLocaleTimeString(),
    comments: [], // new post cant already have comments, so just initialize an empty array
  });
  newPost.save((err) => {
    if (err) { return next(err); }
    res.send(`POSTED: ${newPost}`);
  });
});

router.put('/posts/:id', function(req, res, next) {
  // console.log()
  // Post.findByIdAndUpdate(req.params.id, {  })

  // NEED TO WRITE PUT AND DELETE METHODS FOR THIS API RESOURCE
})

module.exports = router;