const express = require("express");
const router = express.Router();
const EmotionAnalysisActivity = require("../models/EmotionAnalysisActivity");
const { protect } = require("../middleware/authMiddleware");

// ========== Start a new emotion activity ==========
router.post("/emotion/activity/start", protect, async (req, res) => {
  try {
    const {
      activityType = "emotion_match",
      targetEmotion = "Confident",
      level = 1,
      targetAlignment = 70,
      scriptText,
      intentText
    } = req.body;

    const activity = new EmotionAnalysisActivity({
      user: req.user.id,
      activityType,
      targetEmotion,
      level,
      targetAlignment,
      scriptText,
      intentText,
      completed: false,
    });

    await activity.save();

    res.status(201).json({
      success: true,
      activity,
      message: "Emotion activity started successfully"
    });
  } catch (error) {
    console.error("❌ Start emotion activity error:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Failed to start emotion activity"
    });
  }
});

// ========== Complete/Update an emotion activity ==========
router.post("/emotion/activity/complete", protect, async (req, res) => {
  try {
    const {
      activityId,
      duration,
      alignmentScore,
      engagementScore,
      consistencyScore,
      finalScore,
      detectedEmotions,
      mismatchCount,
      faceVisibleSeconds,
      faceAwaySeconds,
      emotionSwitches,
      videoURL
    } = req.body;

    if (!activityId) {
      return res.status(400).json({
        success: false,
        error: "Activity ID is required"
      });
    }

    const activity = await EmotionAnalysisActivity.findOne({
      _id: activityId,
      user: req.user.id
    });

    if (!activity) {
      return res.status(404).json({
        success: false,
        error: "Activity not found"
      });
    }

    // Update activity
    activity.duration = duration || activity.duration;
    activity.alignmentScore = alignmentScore ?? activity.alignmentScore;
    activity.engagementScore = engagementScore ?? activity.engagementScore;
    activity.consistencyScore = consistencyScore ?? activity.consistencyScore;
    activity.finalScore = finalScore ?? activity.finalScore;
    activity.mismatchCount = mismatchCount ?? activity.mismatchCount;
    activity.faceVisibleSeconds = faceVisibleSeconds ?? activity.faceVisibleSeconds;
    activity.faceAwaySeconds = faceAwaySeconds ?? activity.faceAwaySeconds;
    activity.emotionSwitches = emotionSwitches ?? activity.emotionSwitches;
    activity.videoURL = videoURL || activity.videoURL;

    if (detectedEmotions) {
      activity.detectedEmotions = new Map(Object.entries(detectedEmotions));
    }

    // Check if activity is completed (alignment score meets target)
    const passed = (activity.alignmentScore >= activity.targetAlignment);
    activity.completed = passed;

    // Award badges
    const newBadges = [];
    
    // First activity badge
    const firstActivity = await EmotionAnalysisActivity.countDocuments({
      user: req.user.id
    });
    if (firstActivity === 1 && !activity.badges.includes("first_activity")) {
      newBadges.push("first_activity");
    }

    // Perfect match (95%+ alignment)
    if (activity.alignmentScore >= 95 && !activity.badges.includes("perfect_match")) {
      newBadges.push("perfect_match");
    }

    // Consistency pro (90%+ consistency)
    if (activity.consistencyScore >= 90 && !activity.badges.includes("consistency_pro")) {
      newBadges.push("consistency_pro");
    }

    // Alignment expert (85%+ alignment)
    if (activity.alignmentScore >= 85 && !activity.badges.includes("alignment_expert")) {
      newBadges.push("alignment_expert");
    }

    // High scorer (90+ final score)
    if (activity.finalScore >= 90 && !activity.badges.includes("high_scorer")) {
      newBadges.push("high_scorer");
    }

    // Level completion badges
    if (passed) {
      const levelBadge = `level_${activity.level}_complete`;
      if (!activity.badges.includes(levelBadge)) {
        newBadges.push(levelBadge);
      }
    }

    // Add new badges
    activity.badges.push(...newBadges);

    await activity.save();

    res.json({
      success: true,
      activity,
      passed,
      newBadges,
      message: passed ? "Activity completed successfully!" : "Keep practicing to improve your score!"
    });
  } catch (error) {
    console.error("❌ Complete emotion activity error:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Failed to complete emotion activity"
    });
  }
});

// ========== Get user's emotion activities ==========
router.get("/emotion/activity/history", protect, async (req, res) => {
  try {
    const { limit = 20, activityType, completed } = req.query;

    const filter = { user: req.user.id };
    if (activityType) filter.activityType = activityType;
    if (completed !== undefined) filter.completed = completed === 'true';

    const activities = await EmotionAnalysisActivity.find(filter)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));

    // Calculate stats
    const totalActivities = await EmotionAnalysisActivity.countDocuments({ user: req.user.id });
    const completedActivities = await EmotionAnalysisActivity.countDocuments({
      user: req.user.id,
      completed: true
    });

    const allBadges = await EmotionAnalysisActivity.distinct("badges", { user: req.user.id });

    const avgScore = activities.length > 0
      ? activities.reduce((sum, a) => sum + a.finalScore, 0) / activities.length
      : 0;

    const bestScore = activities.length > 0
      ? Math.max(...activities.map(a => a.finalScore))
      : 0;

    res.json({
      success: true,
      activities,
      stats: {
        totalActivities,
        completedActivities,
        averageScore: Math.round(avgScore),
        bestScore: Math.round(bestScore),
        totalBadges: allBadges.length,
        badges: allBadges
      }
    });
  } catch (error) {
    console.error("❌ Get emotion activity history error:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Failed to fetch activity history"
    });
  }
});

// ========== Get leaderboard ==========
router.get("/emotion/leaderboard", protect, async (req, res) => {
  try {
    const { activityType, limit = 10 } = req.query;

    const match = { completed: true };
    if (activityType) match.activityType = activityType;

    const leaderboard = await EmotionAnalysisActivity.aggregate([
      { $match: match },
      {
        $group: {
          _id: "$user",
          bestScore: { $max: "$finalScore" },
          totalActivities: { $sum: 1 },
          avgScore: { $avg: "$finalScore" },
          totalBadges: { $sum: { $size: "$badges" } }
        }
      },
      { $sort: { bestScore: -1, avgScore: -1 } },
      { $limit: parseInt(limit) },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "userInfo"
        }
      },
      {
        $project: {
          userId: "$_id",
          username: { $arrayElemAt: ["$userInfo.username", 0] },
          bestScore: 1,
          avgScore: { $round: ["$avgScore", 0] },
          totalActivities: 1,
          totalBadges: 1
        }
      }
    ]);

    res.json({
      success: true,
      leaderboard
    });
  } catch (error) {
    console.error("❌ Get leaderboard error:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Failed to fetch leaderboard"
    });
  }
});

// ========== Get activity details ==========
router.get("/emotion/activity/:id", protect, async (req, res) => {
  try {
    const activity = await EmotionAnalysisActivity.findOne({
      _id: req.params.id,
      user: req.user.id
    });

    if (!activity) {
      return res.status(404).json({
        success: false,
        error: "Activity not found"
      });
    }

    res.json({
      success: true,
      activity
    });
  } catch (error) {
    console.error("❌ Get activity details error:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Failed to fetch activity details"
    });
  }
});

module.exports = router;

