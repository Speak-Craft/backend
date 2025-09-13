const express = require("express");
const PaceActivitySession = require("../models/PaceActivitySession");
const router = express.Router();

// Create a session
router.post("/pace/session", async (req, res) => {
  try {
    const session = await PaceActivitySession.create(req.body);
    return res.json({ status: "success", id: session._id });
  } catch (err) {
    return res.status(400).json({ status: "error", error: err.message });
  }
});

// List sessions for a user
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


