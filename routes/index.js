const view = require('./view');
const admin = require('./admin');
const api = require('./api');

module.exports = {
  view,
  admin,
  api,
}

// consider moving the routes into this file instead of requiring from other files
