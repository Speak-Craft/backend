const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const User = require("../models/User");

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

// Initialize challenges for new users
router.post("/init", protect, async (req, res) => {
  try {
    if (!req.user.challenges || req.user.challenges.length === 0) {
      req.user.challenges = challengeLevels.map(c => ({ ...c }));
      await req.user.save();
    }
    res.json({ message: "Challenges initialized", challenges: req.user.challenges });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Save session & track challenge progress
router.post("/session", protect, async (req, res) => {
    try {
      const { fillerCount, duration } = req.body; // duration in seconds
      if (fillerCount === undefined || duration === undefined)
        return res.status(400).json({ message: "fillerCount and duration required" });
  
      // Get next incomplete challenge
      const nextChallenge = req.user.challenges.find(c => !c.completed);
      if (!nextChallenge) return res.status(400).json({ message: "All challenges completed!" });
  
      // ✅ Convert challenge minutes → seconds
      const requiredDuration = nextChallenge.duration * 60;
  
      // Check if user meets challenge
      const success =
        duration >= requiredDuration && fillerCount <= nextChallenge.maxFillers;
  
      // Save to history
      req.user.history.push({
        date: new Date(),
        fillerCount,
        duration,
        level: nextChallenge.level,
        success,
      });
  
      let badgeUnlocked = null;
  
      if (success) {
        nextChallenge.completed = true;
        nextChallenge.completedAt = new Date();
        nextChallenge.badgeUnlocked = true;
        badgeUnlocked = `Level ${nextChallenge.level} Badge`;
      }
  
      await req.user.save();
  
      res.json({
        message: "Session saved",
        success,
        level: nextChallenge.level,
        badgeUnlocked,
        challenges: req.user.challenges,
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server error" });
    }
  });
  
// Get progress/history
router.get("/progress", protect, async (req, res) => {
    try {
      // collect unlocked badges from challenges
      const badges = req.user.challenges
        .filter(c => c.completed && c.badgeUnlocked)
        .map(c => ({
          name: `Level ${c.level} Badge`,
          completedAt: c.completedAt
        }));
  
      res.json({
        history: req.user.history,
        challenges: req.user.challenges,
        badges, // ✅ now send unlocked badges
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server error" });
    }
  });
  

module.exports = router;
