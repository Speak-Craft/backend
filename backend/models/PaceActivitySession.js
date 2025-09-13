const mongoose = require("mongoose");

const PaceActivitySessionSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    activityType: {
      type: String,
      required: true,
      enum: [
        // rate
        "pacing_curve",
        "rate_match",
        "speed_shift",
        "consistency_tracker",
        // pause
        "pause_timing",
        "excessive_pause_elimination",
        "pause_for_impact",
        "pause_rhythm",
        "confidence_pause",
        // advanced
        "golden_ratio",
        "pause_entropy",
        "cognitive_pause",
      ],
    },
    domain: { type: String, required: true, enum: ["rate", "pause", "advanced"] },

    // Core scores/metrics
    finalScore: { type: Number, required: true },
    duration: { type: Number, default: 0 },
    averageWPM: { type: Number, default: 0 },
    consistencyScore: { type: Number, default: 0 },
    pauseRatio: { type: Number, default: 0 },
    wpmStd: { type: Number, default: 0 },

    // Optional extras
    prediction: { type: String },
    confidence: { type: Number },
    rhythmConsistency: { type: Number },
    goldenRatioScore: { type: Number },
    entropyScore: { type: Number },
    cognitiveScore: { type: Number },
    excessivePauses: { type: Number },

    // Badges earned this session (names)
    badges: [{ type: String }],

    // Compact metrics snapshot for UI (avoid huge docs)
    metrics: { type: mongoose.Schema.Types.Mixed },

    // Raw features (optional, can be large)
    rawFeatures: { type: mongoose.Schema.Types.Mixed },
  },
  { timestamps: true }
);

module.exports = mongoose.model("PaceActivitySession", PaceActivitySessionSchema);


