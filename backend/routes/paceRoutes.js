const express = require("express");
const PaceActivitySession = require("../models/PaceActivitySession");
const { protect } = require("../middleware/authMiddleware");
const router = express.Router();

// Create a session
router.post("/pace/session", protect, async (req, res) => {
  try {
    const sessionData = {
      ...req.body,
      userId: req.user.id
    };
    const session = await PaceActivitySession.create(sessionData);
    return res.json({ status: "success", id: session._id });
  } catch (err) {
    return res.status(400).json({ status: "error", error: err.message });
  }
});

// List sessions for the authenticated user
router.get("/pace/sessions", protect, async (req, res) => {
  try {
    const sessions = await PaceActivitySession.find({ userId: req.user.id }).sort({ createdAt: -1 }).limit(100);
    return res.json({ status: "success", sessions });
  } catch (err) {
    return res.status(400).json({ status: "error", error: err.message });
  }
});

// List training sessions for the authenticated user
router.get("/pace/training-sessions", protect, async (req, res) => {
  try {
    const sessions = await PaceActivitySession.find({ 
      userId: req.user.id,
      type: { $in: ["real_time_pace", "real_time_pause", "training"] }
    }).sort({ createdAt: -1 }).limit(100);
    return res.json({ status: "success", sessions });
  } catch (err) {
    return res.status(400).json({ status: "error", error: err.message });
  }
});

// List sessions for a user (admin endpoint)
router.get("/pace/sessions/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const sessions = await PaceActivitySession.find({ userId }).sort({ createdAt: -1 }).limit(100);
    return res.json({ status: "success", sessions });
  } catch (err) {
    return res.status(400).json({ status: "error", error: err.message });
  }
});

// Aggregate streaks and stats
router.get("/pace/summary/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const sessions = await PaceActivitySession.find({ userId }).sort({ createdAt: -1 }).limit(365);
    const totalSessions = sessions.length;
    const totalTime = sessions.reduce((acc, s) => acc + (s.duration || 0), 0);
    const avgWPM = sessions.length ? (sessions.reduce((a, s) => a + (s.averageWPM || 0), 0) / sessions.length) : 0;
    const avgConsistency = sessions.length ? (sessions.reduce((a, s) => a + (s.consistencyScore || 0), 0) / sessions.length) : 0;
    return res.json({ status: "success", totalSessions, totalTime, avgWPM, avgConsistency });
  } catch (err) {
    return res.status(400).json({ status: "error", error: err.message });
  }
});

module.exports = router;


