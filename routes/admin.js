const { Router } = require('express');
const router = Router();
const fetch = require('node-fetch');

// admin needs to be able to CRUD all posts
//  - need post_create page, can be reused for the post update page
// admin should also be able to delete specific comments on the post specific page

// WE NEED SOME KIND OF LOGIN FORM

// GET all posts, even hidden ones
router.get('/', (req, res, next) => {
  fetch('http://localhost:3000/api/posts/all')
    .then((response) => response.json()) // apparently its important this remains as one line
    .then((posts) => {
      res.render('index', { title:'ALL POSTS', posts, }); // admin: true });
    });
});

// GET page to make a new Post
router.get('/posts/new', (req, res, next) => {
  res.render('newPost', { title: 'NEW POST' })
})

// POST our new Post to the DB
router.post('/posts/new', (req, res, next) => {
  console.log('MAKING NEW POST')
  // console.log(req.body.hiddenVal)
  // console.log(typeof(req.body.hiddenVal))
  console.log(!!Number(req.body.hiddenVal))
  const fetchDetails = {
    method: 'POST',
    headers: { 'Content-Type' : 'application/json' },
    body: JSON.stringify({
      title: req.body.title,
      content: req.body.content,
      hidden: !!Number(req.body.hiddenVal)
    }),
  }
  fetch(`http://localhost:3000/api/posts`, fetchDetails)
    .then((response) => response.json())
    .then((post) => {
      res.redirect('/admin/posts/' + post._id)
    });
});

// GET page for individual post
router.get('/posts/:id', (req, res, next) => {
  fetch(`http://localhost:3000/api/posts/${req.params.id}`)
    .then((response) => response.json())
    .then((post) => {
      res.render('post', { title: 'SINGLE POST', post, }); // admin: true });
    });
});

// POST a delete request for an individual post
router.post('/posts/:id', (req, res, next) => {
  fetch(`http://localhost:3000/api/posts/${req.params.id}`, { method: 'DELETE' })
    .then((response) => response.json())
    .then((post) => {
      res.redirect('/admin')
    }) 
})

// GET page to update a post
router.get('/posts/:id/edit', (req, res, next) => {
  fetch(`http://localhost:3000/api/posts/${req.params.id}`)
    .then((response) => response.json())
    .then((post) => {
      res.render('newPost', { title: 'EDIT POST', post, }); //admin: true });
    });
});

// POST our updated post
router.post('/posts/:id/edit', (req, res, next) => {
  const fetchDetails = {
    method: 'PUT',
    headers: { 'Content-Type' : 'application/json' },
    body: JSON.stringify({
      title: req.body.title,
      content: req.body.content,
      hidden: !!Number(req.body.hiddenVal) // can't get true/false from HTML so we use double bang to coerce a raw true/false value
    }),
  };
  fetch(`http://localhost:3000/api/posts/${req.params.id}`, fetchDetails)
    .then((response) => response.json())
    .then((updatedPost) => {
      res.redirect('/admin/posts/' + updatedPost._id)
    });
});

// POST a comment create request
router.post('/posts/:id/comments', (req, res, next) => {
  const fetchDetails = {
    method: 'POST',
    headers: { 'Content-Type' : 'application/json' },
    body: JSON.stringify({
      comment: req.body.comment,
      author: req.body.author,
    }),
  };
  fetch(`http:localhost:3000/api/posts/${req.params.id}/comments`, fetchDetails)
    .then((response) => response.json())
    .then((post) => {
      res.redirect('/admin/posts/' + req.params.id)
    })
})

// POST a comment delete request to our api
router.post('/posts/:id/comments/:commentid', (req, res, next) => {
  const fetchDetails = {
    method: 'DELETE',
    headers: { 'Content-Type' : 'application/json' },
    // no body neccessary for delete request
  }
  fetch(`http://localhost:3000/api/posts/${req.params.id}/comments/${req.params.commentid}`, fetchDetails)
    .then((response) => response.json())
    .then((post) => {
      res.redirect('/admin/posts/' + req.params.id)
    })
})

router.get('/status', (req, res, next) => {
  res.render('adminStatus', { title: 'Change admin status' })
})

router.post('/status', (req, res, next) => {
  // simple and atrocious user auth, because that's not the point of this project

  if (req.body.password === 'SuperSecretPassword') {
    res.cookie('isAdmin', true)
    res.redirect('/admin')
  } else if (req.body.revoke === 'revoke') {
    res.clearCookie('isAdmin')
    res.redirect('/')
  } else{
    res.render('adminStatus', { title: 'Change admin status', errors: 'wrong password' })
  }
})

// https://jasonwatmore.com/post/2021/09/05/fetch-http-post-request-examples

module.exports = router;