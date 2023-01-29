const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const PostSchema = new Schema({
  title: { type: String, maxLength: 64, required: true },
  content: { type: String, required: true },
  date: { type: String, required: true },
  comments: { type: Array  }
  // author? seems redundant
});

module.exports = mongoose.model('Post', PostSchema);