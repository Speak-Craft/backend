const mongoose = require("mongoose");

const PaceActivitySessionSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    type: { 
      type: String, 
      required: true, 
      enum: ["real_time_pace", "real_time_pause", "training", "activity"],
      default: "activity"
    },
    activityType: {
      type: String,
      required: false,
      enum: [
        // rate
        "pacing_curve",
        "rate_match",
        "speed_shift",
        "consistency_tracker",
        "ideal_pace_challenge",
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
        // real-time pause activities
        "pause_monitoring",
        "pause_improvement",
        "pause_rhythm_training",
        "confidence_pause_practice",
        "impact_pause_training",
      ],
    },
    domain: { type: String, enum: ["rate", "pause", "advanced", "pause_realtime"] },

    // Core scores/metrics
    finalScore: { type: Number, required: true },
    duration: { type: Number, default: 0 },
    averageWPM: { type: Number, default: 0 },
    consistencyScore: { type: Number, default: 0 },
    wpmStd: { type: Number, default: 0 },

    // Real-time specific fields
    consistency: { type: Number, default: 0 },
    bestStreak: { type: Number, default: 0 },
    targetWPM: { type: Number, default: 125 },
    
    // Real-time pause specific fields
    pauseRatio: { type: Number, default: 0 },
    excessivePauses: { type: Number, default: 0 },
    longPauses: { type: Number, default: 0 },
    flowScore: { type: Number, default: 0 },
    alerts: [{ type: mongoose.Schema.Types.Mixed }],
    suggestions: [{ type: mongoose.Schema.Types.Mixed }],

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


