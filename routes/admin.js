const { Router } = require('express');
const router = Router();
const fetch = require('node-fetch');
const { body, validationResult } = require('express-validator');

// GET all posts, even hidden ones
router.get('/', (req, res, next) => {
  // if user is not admin, redirect to a similar user page
  if (!req.cookies.isAdmin) { res.redirect('/'); }

  fetch('http://localhost:3000/api/posts')
    .then((response) => response.json()) // apparently its important this remains as one line
    .then((posts) => {
      res.render('index', { posts });
    });
});

// GET page to make a new Post
router.get('/posts/new', (req, res, next) => {
  if (!req.cookies.isAdmin) { res.redirect('/'); }
  res.render('newPost', { title: 'NEW POST' })
})

// POST our new Post to the DB
router.post('/posts/new', [
  body('title').trim().escape().isLength({ min: 1 }).withMessage('Post title not found'),
  body('content').trim().escape().isLength({ min: 1 }).withMessage('Post content not found'),
  body('hiddenVal').trim().escape().custom((value, { req }) => {
    if (value !== '0' && value !== '1') {
      throw new Error('Bad Hidden Value')
    }
    return true;
  }),

  (req, res, next) => {
    const errors = validationResult(req);
    const postData = {
      title: req.body.title,
      content: req.body.content,
      hidden: !!Number(req.body.hiddenVal),
    }

    if (!errors.isEmpty()) {
      res.render('newPost', { title: 'NEW POST', post: postData, errors: errors.array() })
    } else {
      const fetchDetails = {
        method: 'POST',
        headers: { 'Content-Type' : 'application/json' },
        body: JSON.stringify(postData)
      }
      fetch(`http://localhost:3000/api/posts`, fetchDetails)
        .then((response) => response.json())
        .then((post) => {
          res.redirect('/admin/posts/' + post._id)
        });
    }
  }
]);

// GET page for individual post
router.get('/posts/:id', (req, res, next) => {
  if (!req.cookies.isAdmin) { res.redirect(`/posts/${req.params.id}`); }

  fetch(`http://localhost:3000/api/posts/${req.params.id}`)
    .then((response) => response.json())
    .then((post) => {
      res.render('post', { post });
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
  if (!req.cookies.isAdmin) { res.redirect(`/posts/${req.params.id}`); }

  fetch(`http://localhost:3000/api/posts/${req.params.id}`)
    .then((response) => response.json())
    .then((post) => {
      res.render('newPost', { title: 'EDIT POST', post, }); //admin: true });
    });
});

// POST our updated post
router.post('/posts/:id/edit', [
  body('title').trim().escape().isLength({ min: 1 }).withMessage('Post title not found'),
  body('content').trim().escape().isLength({ min: 1 }).withMessage('Post content not found'),
  body('hiddenVal').trim().escape().custom((value, { req }) => {
    if (value !== '0' && value !== '1') {
      throw new Error('Bad Hidden Value')
    }
    return true;
  }),

  (req, res, next) => {
    const errors = validationResult(req);
    const postData = {
      title: req.body.title,
      content: req.body.content,
      hidden: !!Number(req.body.hiddenVal),
    }
    // replace data in fetchDetails with this var
    if (!errors.isEmpty()) {
      fetch(`http://localhost:3000/api/posts/${req.params.id}`)
        .then((response) => response.json())
        .then((post) => {
          res.render('newPost', { title: 'EDIT POST', post: postData, errors: errors.array() })
        })
    } else {
      const fetchDetails = {
        method: 'PUT',
        headers: { 'Content-Type' : 'application/json' },
        body: JSON.stringify(postData),
      };
      fetch(`http://localhost:3000/api/posts/${req.params.id}`, fetchDetails)
        .then((response) => response.json())
        .then((updatedPost) => {
          res.redirect('/admin/posts/' + updatedPost._id)
        });
    }
  }
]);

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

router.post('/status', [
  body('password').trim().escape(),

  (req, res, next) => {
    if (req.body.password === 'SuperSecretPassword') {
      res.cookie('isAdmin', true)
      res.redirect('/admin')
    } else if (req.body.revoke === 'revoke') {
      res.clearCookie('isAdmin')
      res.redirect('/')
    } else{
      res.render('adminStatus', { title: 'Change admin status', error: 'Incorrect password' })
    }
  }
]);

module.exports = router;