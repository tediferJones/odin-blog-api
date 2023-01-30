var express = require('express');
var router = express.Router();

const api = require('./api');
const view = require('./view');

module.exports = {
  api,
  view
}

// lets make two entirely seperate routes, one for API calls and one for views
//    - localhost:3000/api/posts will return JSON of all posts
//    - localhost:3000/views/posts will return view of all posts