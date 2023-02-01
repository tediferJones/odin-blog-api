const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const PostSchema = new Schema({
  title: { type: String, maxLength: 64, required: true },
  content: { type: String, required: true },
  date: { type: String, required: true },
  // comments: { type: Array  },
  // comments property is depracted, now we have a seperate collection for comments, and we use the post's id to lookup it's comments, comments.owner should equal post id
  comments: [{ type: Schema.Types.ObjectId, ref: 'Comment' }],
  hidden: { type: Boolean, default: false },

  edited: { type: Boolean, default: false },
  dateEdited: { type: String },
  // author? seems redundant
});

module.exports = mongoose.model('Post', PostSchema);