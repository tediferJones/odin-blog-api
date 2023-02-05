const { Router, json } = require('express');
const router = Router();
const fetch = require('node-fetch');

// admin needs to be able to CRUD all posts
//  - need post_create page, can be reused for the post update page
// admin should also be able to delete specific comments on the post specific page

router.get('/', (req, res, next) => {
  fetch('http://localhost:3000/api/posts/all')
    // .then((response) => response.json())
    .then((response) => response.json()) // apparently its important this remains as one line
    .then((posts) => {
      // console.log(posts)
      res.render('index', { title:'ALL POSTS', posts, admin: true });
    });
});

router.get('/posts/new', (req, res, next) => {
  res.render('newPost', { title: 'NEW POST' })
})

router.post('/posts/new', (req, res, next) => {
  // fetch causes lung cancer, dont use it, at best it will turn you into a retard
  const fetchDetails = {
    method: 'POST',
    headers: { 'Content-Type' : 'application/json' },
    body: JSON.stringify({
      title: req.body.title,
      content: req.body.content,
    }),
  }
  fetch(`http://localhost:3000/api/posts`, fetchDetails) // { method: 'POST', body })//: JSON.stringify(body) })
    .then((response) => response.json())
    .then((post) => {
      // console.log(post)
      res.redirect('/admin/posts/' + post._id)
    })
})

router.get('/posts/:id', (req, res, next) => {
  fetch(`http://localhost:3000/api/posts/${req.params.id}`)
    .then((response) => response.json())
    .then((post) => {
      res.render('post', { title: 'SINGLE POST', post, admin: true });
    })
})

router.post('/posts/:id', (req, res, next) => {
  fetch(`http://localhost:3000/api/posts/${req.params.id}`, { method: 'DELETE' })
    .then((response) => response.json())
    .then((post) => {
      // console.log(post)
      // res.render('post', { title: 'This post has been deleted:', post, admin: true })
      res.redirect('/admin')
    }) 
})

router.get('/posts/:id/edit', (req, res, next) => {
  fetch(`http://localhost:3000/api/posts/${req.params.id}`)
    .then((response) => response.json())
    .then((post) => {
      res.render('newPost', { title: 'EDIT POST', post, admin: true });
    });
});

router.post('/posts/:id/edit', (req, res, next) => {
  // re-write this like our create post method
  // need to make a PUT request with data
  // console.log(req.body)
  const fetchDetails = {
    method: 'PUT',
    headers: { 'Content-Type' : 'application/json' },
    body: JSON.stringify({
      title: req.body.title,
      content: req.body.content,
      hidden: !!req.body.hiddenVal
    }),
  };
  fetch(`http://localhost:3000/api/posts/${req.params.id}`, fetchDetails)
    .then((response) => response.json())
    .then((updatedPost) => {
      res.redirect('/admin/posts/' + updatedPost._id)
    })

  // fetch(`http://localhost:3000/api/posts/${req.params.id}`, { method: 'PUT', body: req.body })
  //   .then((response) => response.json())
  //   .then((post) => {
  //     res.render('post', { title: 'UPDATED POST', post, admin: true });
  //   });
});

module.exports = router;