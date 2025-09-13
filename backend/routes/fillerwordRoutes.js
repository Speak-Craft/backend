const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const User = require("../models/User");
const FillerChallenge = require("../models/FillerChallenge");
const FillerSession = require("../models/FillerSession");

const router = express.Router();

// Predefined 10 challenges
const challengeLevels = [
  { level: 1, duration: 1, maxFillers: 15 },
  { level: 2, duration: 1, maxFillers: 10 },
  { level: 3, duration: 1, maxFillers: 5 },
  { level: 4, duration: 2, maxFillers: 15 },
  { level: 5, duration: 2, maxFillers: 10 },
  { level: 6, duration: 2, maxFillers: 5 },
  { level: 7, duration: 3, maxFillers: 15 },
  { level: 8, duration: 3, maxFillers: 10 },
  { level: 9, duration: 3, maxFillers: 5 },
  { level: 10, duration: 5, maxFillers: 5 },
];

// Initialize challenges for new users (per user in dedicated collection)
router.post("/init", protect, async (req, res) => {
  try {
    const existing = await FillerChallenge.find({ user: req.user._id });
    if (!existing || existing.length === 0) {
      await FillerChallenge.insertMany(
        challengeLevels.map((c) => ({ ...c, user: req.user._id }))
      );
    }

    const challenges = await FillerChallenge.find({ user: req.user._id }).sort({ level: 1 });
    res.json({ message: "Challenges initialized", challenges });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Save session & track challenge progress
router.post("/session", protect, async (req, res) => {
  try {
    const { fillerCount, duration, totalChunks = 0, levelId } = req.body; // duration in seconds
    if (fillerCount === undefined || duration === undefined)
      return res.status(400).json({ message: "fillerCount and duration required" });

    // Find next incomplete or specific level
    let challenge;
    if (levelId) {
      challenge = await FillerChallenge.findOne({ user: req.user._id, level: levelId });
    } else {
      challenge = await FillerChallenge.findOne({ user: req.user._id, completed: false }).sort({ level: 1 });
    }
    if (!challenge) return res.status(400).json({ message: "All challenges completed!" });

    const requiredDuration = challenge.duration * 60; // min -> sec
    const success = duration >= requiredDuration && fillerCount <= challenge.maxFillers;

    // Save session
    await FillerSession.create({
      user: req.user._id,
      level: challenge.level,
      fillerCount,
      duration,
      totalChunks,
      success,
    });

    let badgeUnlocked = null;
    if (success && !challenge.completed) {
      challenge.completed = true;
      challenge.completedAt = new Date();
      challenge.badgeUnlocked = true;
      await challenge.save();
      badgeUnlocked = `Level ${challenge.level} Badge`;
    } else if (!success) {
      await challenge.save();
    }

    const updatedChallenges = await FillerChallenge.find({ user: req.user._id }).sort({ level: 1 });

    res.json({
      message: "Session saved",
      success,
      level: challenge.level,
      badgeUnlocked,
      challenges: updatedChallenges,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});
  
// Get progress/history
router.get("/progress", protect, async (req, res) => {
  try {
    const [challenges, sessions] = await Promise.all([
      FillerChallenge.find({ user: req.user._id }).sort({ level: 1 }),
      FillerSession.find({ user: req.user._id }).sort({ createdAt: -1 }),
    ]);

    const badges = challenges
      .filter((c) => c.completed && c.badgeUnlocked)
      .map((c) => ({ name: `Level ${c.level} Badge`, completedAt: c.completedAt }));

    res.json({
      history: sessions.map((s) => ({
        date: s.createdAt,
        fillerCount: s.fillerCount,
        duration: s.duration,
        level: s.level,
        success: s.success,
      })),
      challenges,
      badges,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});
  

module.exports = router;