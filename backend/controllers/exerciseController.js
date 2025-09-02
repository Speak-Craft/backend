const Exercise = require('../models/Exercise');

exports.saveExercise = async (req, res) => {
  try {
    const userId = req.userId; // from auth middleware
    const { audioURL, duration, rms, steadiness } = req.body;

    const exercise = await Exercise.create({
      user: userId,
      audioURL,
      duration,
      rms,
      steadiness,
    });

    res.json({ message: 'Exercise saved', exercise });
  } catch (err) {
    res.status(500).json({ error: 'Failed to save exercise', details: err.message });
  }
};

exports.getUserExercises = async (req, res) => {
  try {
    const userId = req.userId; // from auth middleware
    const exercises = await Exercise.find({ user: userId }).sort({ createdAt: -1 });
    res.json({ exercises });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch exercises', details: err.message });
  }
};
