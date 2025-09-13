const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const { LoudnessExercise, LoudnessScore } = require("../models");

// Start a new loudness exercise
router.post("/exercises/loudness/start", protect, async (req, res) => {
  try {
    const level = Number(req.body?.level || 1);
    const exercise = await LoudnessExercise.create({
      user: req.user._id,
      level: level >= 1 && level <= 3 ? level : 1,
      duration: 0,
      rms: 0,
      steadiness: 0,
      completed: false,
    });
    res.json({ exercise });
  } catch (err) {
    res.status(500).json({ message: "Failed to start exercise", error: err.message });
  }
});

// Update progress for current exercise (frontend sends rms samples)
router.post("/exercises/loudness/update", protect, async (req, res) => {
  try {
    const { rmsValues = [], exerciseId } = req.body || {};
    let exercise;
    if (exerciseId) {
      exercise = await LoudnessExercise.findOne({ _id: exerciseId, user: req.user._id });
    } else {
      exercise = await LoudnessExercise.findOne({ user: req.user._id, completed: false }).sort({ createdAt: -1 });
    }
    if (!exercise) {
      return res.status(404).json({ message: "No active exercise found" });
    }

    const sampleCount = rmsValues.length;
    const sum = rmsValues.reduce((s, v) => s + (Number(v) || 0), 0);
    const avg = sampleCount > 0 ? sum / sampleCount : exercise.rms;

    // Steadiness: inverse of variance (simple proxy). Higher is steadier.
    let steadiness = exercise.steadiness;
    if (sampleCount > 1) {
      const variance = rmsValues.reduce((s, v) => s + Math.pow((Number(v) || 0) - avg, 2), 0) / (sampleCount - 1);
      steadiness = Number.isFinite(variance) ? Math.max(0, 1 / (1 + variance)) : exercise.steadiness;
    }

    exercise.rms = avg;
    exercise.steadiness = steadiness;
    exercise.duration = Number(req.body?.duration || exercise.duration);
    if (typeof req.body?.completed === "boolean") {
      exercise.completed = req.body.completed;
    }
    exercise.rmsSampleCount += sampleCount;

    await exercise.save();
    res.json(exercise);
  } catch (err) {
    res.status(500).json({ message: "Failed to update exercise", error: err.message });
  }
});

// Get my past exercises
router.get("/exercises/my-exercises", protect, async (req, res) => {
  try {
    const exercises = await LoudnessExercise.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json({ exercises });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch exercises", error: err.message });
  }
});

// Get my game scores
router.get("/scores", protect, async (req, res) => {
  try {
    const scores = await LoudnessScore.find({ user: req.user._id }).sort({ date: -1 });
    res.json(scores);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch scores", error: err.message });
  }
});

// Save a new game score
router.post("/scores", protect, async (req, res) => {
  try {
    const { score, metadata } = req.body || {};
    if (typeof score !== "number") {
      return res.status(400).json({ message: "score must be a number" });
    }
    const created = await LoudnessScore.create({ user: req.user._id, score, metadata });
    res.status(201).json(created);
  } catch (err) {
    res.status(500).json({ message: "Failed to save score", error: err.message });
  }
});

module.exports = router;


