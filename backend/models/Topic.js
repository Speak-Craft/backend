// models/Topic.js
const mongoose = require('mongoose');

const slideSchema = new mongoose.Schema({
  title: String,
  bullets: [String],
});

const topicSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  prompt: String,
  mainTopic: String,
  suggestedSlides: [slideSchema],
  folderStructure: Object, // JSON representing suggested folder + filenames
  rawResponse: Object,
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Topic', topicSchema);
