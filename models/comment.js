const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CommentSchema = new Schema({
  owner: { type: String, required: true },
  comment: { type: String, maxLength: 500, required: true },
  author: { type: String, maxLength: 32, required: true },
  date: { type: String, required: true },
  // subcomments are optional
  subcomments: [{ type: Schema.Types.ObjectId, ref: 'Comment' }],
  // edited prop?  would be nice to know when a comment has been editted
})

module.exports = mongoose.model('Comment', CommentSchema);