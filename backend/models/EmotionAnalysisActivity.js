const mongoose = require("mongoose");

const emotionAnalysisActivitySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    activityType: {
      type: String,
      required: true,
      enum: [
        "emotion_match",           // Match target emotion
        "emotion_consistency",     // Maintain consistent emotion
        "text_face_alignment",     // Align face with text emotion
        "emotion_control",         // Control emotion changes
        "expression_variety"       // Show variety of emotions
      ],
      default: "emotion_match"
    },
    targetEmotion: {
      type: String,
      required: true,
      enum: ["Happy", "Neutral", "Confident", "Calm", "Empathetic", "Serious", "Sad", "Angry"],
    },
    duration: {
      type: Number,
      default: 0, // in seconds
    },
    alignmentScore: {
      type: Number,
      default: 0, // 0-100
    },
    engagementScore: {
      type: Number,
      default: 0, // 0-100
    },
    consistencyScore: {
      type: Number,
      default: 0, // 0-100
    },
    finalScore: {
      type: Number,
      required: true,
      default: 0, // Overall score 0-100
    },
    // Metrics
    detectedEmotions: {
      type: Map,
      of: Number, // percentage for each emotion
      default: {}
    },
    mismatchCount: {
      type: Number,
      default: 0,
    },
    faceVisibleSeconds: {
      type: Number,
      default: 0,
    },
    faceAwaySeconds: {
      type: Number,
      default: 0,
    },
    emotionSwitches: {
      type: Number,
      default: 0,
    },
    // Challenge specific
    level: {
      type: Number,
      default: 1,
      min: 1,
      max: 5,
    },
    targetAlignment: {
      type: Number,
      default: 70, // Target alignment percentage to pass
    },
    completed: {
      type: Boolean,
      default: false,
      index: true,
    },
    // Badges earned
    badges: [{
      type: String,
      enum: [
        "first_activity",
        "emotion_master",
        "perfect_match",
        "consistency_pro",
        "alignment_expert",
        "expressiveness_king",
        "level_1_complete",
        "level_2_complete",
        "level_3_complete",
        "level_4_complete",
        "level_5_complete",
        "streak_5",
        "streak_10",
        "high_scorer"
      ]
    }],
    // Optional metadata
    scriptText: {
      type: String,
    },
    intentText: {
      type: String,
    },
    videoURL: {
      type: String,
    },
  },
  { timestamps: true }
);

// Compound indexes for efficient queries
emotionAnalysisActivitySchema.index({ user: 1, createdAt: -1 });
emotionAnalysisActivitySchema.index({ user: 1, completed: 1, createdAt: -1 });
emotionAnalysisActivitySchema.index({ user: 1, activityType: 1, createdAt: -1 });
emotionAnalysisActivitySchema.index({ user: 1, finalScore: -1 });

module.exports = mongoose.model("EmotionAnalysisActivity", emotionAnalysisActivitySchema);

