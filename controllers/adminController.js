const fetch = require('node-fetch');
const { body, validationResult } = require('express-validator');

exports.allPosts_GET = (req, res, next) => {
  // if user is not admin, redirect to a similar user page
  if (!req.cookies.isAdmin) { res.redirect('/'); }

  fetch('http://localhost:3000/api/posts')
    .then((response) => response.json()) // apparently its important this remains as one line
    .then((posts) => {
      res.render('index', { posts });
    });
};

exports.hiddenPosts_GET = (req, res, next) => {
  if (!req.cookies.isAdmin) { res.redirect('/'); }
  fetch('http://localhost:3000/api/posts')
    .then((response) => response.json())
    .then((posts) => {
      hiddenPosts = posts.filter(post => post.hidden === true)
      res.render('index', { posts: hiddenPosts })
    });
};

exports.publicPosts_GET = (req, res, next) => {
  if (!req.cookies.isAdmin) { res.redirect('/'); }
  fetch('http://localhost:3000/api/posts')
    .then((response) => response.json())
    .then((posts) => {
      publicPosts = posts.filter(post => post.hidden === false)
      res.render('index', { posts: publicPosts })
    })
};

exports.newPost_GET = (req, res, next) => {
  if (!req.cookies.isAdmin) { res.redirect('/'); }
  res.render('newPost', { title: 'NEW POST' })
};

exports.newPost_POST = [
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
];

exports.post_GET = (req, res, next) => {
  if (!req.cookies.isAdmin) { res.redirect(`/posts/${req.params.id}`); }

  fetch(`http://localhost:3000/api/posts/${req.params.id}`)
    .then((response) => response.json())
    .then((post) => {
      res.render('post', { post });
    });
};

exports.post_DELETE = (req, res, next) => {
  fetch(`http://localhost:3000/api/posts/${req.params.id}`, { method: 'DELETE' })
    .then((response) => response.json())
    .then((post) => {
      res.redirect('/admin')
    }) 
};

exports.updatePost_GET = (req, res, next) => {
  if (!req.cookies.isAdmin) { res.redirect(`/posts/${req.params.id}`); }

  fetch(`http://localhost:3000/api/posts/${req.params.id}`)
    .then((response) => response.json())
    .then((post) => {
      res.render('newPost', { title: 'EDIT POST', post, });
    });
};

exports.updatePost_POST = [
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
];

exports.comment_DELETE = (req, res, next) => {
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
};

exports.adminStatus_GET = (req, res, next) => {
  res.render('adminStatus', { title: 'Change admin status' })
};

exports.adminStatus_POST = [
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
];