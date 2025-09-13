const mongoose = require("mongoose");

const loudnessExerciseSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    level: {
      type: Number,
      default: 1,
      min: 1,
      max: 3,
    },
    duration: {
      type: Number,
      default: 0,
    },
    rms: {
      type: Number,
      default: 0,
    },
    steadiness: {
      type: Number,
      default: 0,
    },
    audioURL: {
      type: String,
    },
    completed: {
      type: Boolean,
      default: false,
      index: true,
    },
    rmsSampleCount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

// Helpful compound indexes for queries
loudnessExerciseSchema.index({ user: 1, createdAt: -1 });
loudnessExerciseSchema.index({ user: 1, completed: 1, createdAt: -1 });

module.exports = mongoose.model("LoudnessExercise", loudnessExerciseSchema);


