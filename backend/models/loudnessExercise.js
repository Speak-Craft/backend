const mongoose = require("mongoose");

const exerciseSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  level: { type: Number, default: 1 }, // 1 → 3
  durationAboveThreshold: { type: Number, default: 0 }, // seconds
  percentageAboveThreshold: { type: Number, default: 0 },
  completed: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("LoudnessExercise", exerciseSchema);
