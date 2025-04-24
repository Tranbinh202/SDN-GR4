const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const postSchema = new Schema({
  author_id: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  content: {
    type: String,
    required: true
  },
  images: {
    type: [String],
    default: []
  }
}, {
  timestamps: true // Tự động tạo createdAt và updatedAt
});

module.exports = mongoose.model('Post', postSchema); 