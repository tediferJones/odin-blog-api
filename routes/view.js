const { Router } = require('express');
const router = Router();
const User = require('../models/user');
const Post = require('../models/post');
// const { response } = require('../app');
const fetch = require('node-fetch');

router.get('/', function (req, res, next) {
  // fuck it dont get comments for home page, only server comments on unique post pages

  fetch('http://localhost:3000/api/posts')
    .then((response) => response.text())
    .then((posts) => {
      // console.log(JSON.parse(posts));
      // console.log(typeof(JSON.parse(posts))) // ITS A FUCKING STRING, MAKE IT AN OBJECT
      res.render('posts', { title: 'HOME PAGE', posts: JSON.parse(posts) })
    })
    // SAVE YOUR DATA AS JSON, OR YOU WILL BE FUCKED, just like we are now
})

router.get('/posts/:id', function(req, res, next) {
  fetch(`http://localhost:3000/api/posts/${req.params.id}`)
    .then((response) => response.text())
    .then((post) => {
      res.render('post', { title: 'POST WITH COMMENTS', post })
    })
})

module.exports = router;