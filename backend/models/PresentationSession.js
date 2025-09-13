const mongoose = require("mongoose");

const topicSchema = new mongoose.Schema({
  title: String,
  allocatedTime: Number, // in seconds
});

const presentationSessionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  fileName: String,
  totalTime: Number, // in minutes
  topics: [topicSchema],
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("PresentationSession", presentationSessionSchema);
