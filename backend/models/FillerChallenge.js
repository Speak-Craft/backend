const mongoose = require("mongoose");

const fillerChallengeSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    level: { type: Number, required: true },
    duration: { type: Number, required: true }, // minutes
    maxFillers: { type: Number, required: true },
    completed: { type: Boolean, default: false },
    completedAt: { type: Date },
    badgeUnlocked: { type: Boolean, default: false },
  },
  { timestamps: true }
);

fillerChallengeSchema.index({ user: 1, level: 1 }, { unique: true });

module.exports = mongoose.model("FillerChallenge", fillerChallengeSchema);


