const { Router } = require('express');
const router = Router();
const User = require('../models/user');
const Post = require('../models/post');

router.get('/', function (req, res, next) {
  Post.find({}).exec(function (err, posts) {
    if (err) { return next(err); }
    res.render('posts', { title: 'ALL POSTS', posts })
  })
})