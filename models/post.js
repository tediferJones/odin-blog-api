const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const PostSchema = new Schema({
  title: { type: String, maxLength: 64, required: true },
  content: { type: String, required: true },
  date: { type: String, required: true },
  // comments: { type: Array  },
  // comments: [{ type: Schema.Types.ObjectId, ref: 'Comment' }],
  hidden: { type: Boolean, default: false },

  edited: { type: Boolean, default: false },
  dateEdited: { type: String },
  // author? seems redundant
});

// not sure if this actually works
PostSchema.virtual('url').get(function() {
  return '/posts/' + this._id
})

module.exports = mongoose.model('Post', PostSchema);