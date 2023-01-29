const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserSchema = new Schema({
  username: { type: String, maxLength: 32, required: true },
  password: { type: String, maxLength: 32, required: true }
})