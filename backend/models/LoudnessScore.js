const mongoose = require("mongoose");

const loudnessScoreSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    score: {
      type: Number,
      required: true,
      min: 0,
    },
    metadata: {
      type: Object,
    },
  },
  { timestamps: { createdAt: "date", updatedAt: false } }
);

loudnessScoreSchema.index({ user: 1, date: -1 });

module.exports = mongoose.model("LoudnessScore", loudnessScoreSchema);


