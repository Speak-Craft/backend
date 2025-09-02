const LoudnessExercise = require("../models/loudnessExercise");

// Thresholds per level
const thresholds = {
  1: 0.05,
  2: 0.1,
  3: 0.15,
};

exports.startExercise = async (req, res) => {
    try {
      const userId = req.userId; 
  
      // Find last exercise
      const last = await LoudnessExercise.findOne({ userId }).sort({ createdAt: -1 });
      let level = 1;
  
      if (last && last.completed && last.level < 3) {
        level = last.level + 1;
      } else if (last && !last.completed) {
        return res.json({ message: "You already have an ongoing exercise", exercise: last });
      }
  
      const exercise = await LoudnessExercise.create({ userId, level });
      res.json({ message: `Started Level ${level}`, exercise });
    } catch (err) {
      console.error("❌ startExercise error:", err);
      res.status(500).json({ error: err.message });
    }
  };
  
  exports.updateProgress = async (req, res) => {
    try {
      const userId = req.userId;  
      const { rmsValues } = req.body;
  
      const exercise = await LoudnessExercise.findOne({ userId }).sort({ createdAt: -1 });
      if (!exercise || exercise.completed) {
        return res.status(400).json({ message: "No active exercise" });
      }
  
      const threshold = thresholds[exercise.level];
      const above = rmsValues.filter((r) => r >= threshold);
  
      const duration = above.length * 0.3; 
      const percentage = (above.length / rmsValues.length) * 100;
  
      exercise.durationAboveThreshold = duration;
      exercise.percentageAboveThreshold = percentage;
  
      if (duration >= 20 && percentage >= 20) {
        exercise.completed = true;
      }
  
      await exercise.save();
      res.json(exercise);
    } catch (err) {
      console.error("❌ updateProgress error:", err);
      res.status(500).json({ error: err.message });
    }
  };
  

exports.getProgress = async (req, res) => {
  try {
    const { userId } = req.query;
    const exercises = await LoudnessExercise.find({ userId }).sort({ createdAt: -1 });
    res.json(exercises);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
