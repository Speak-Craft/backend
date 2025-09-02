const Score = require("../models/Score");

// Save score
exports.saveScore = async (req, res) => {
  try {
    const { score } = req.body;
    const userId = req.user.id; // from auth middleware

    const newScore = new Score({ userId, score });
    await newScore.save();

    res.status(201).json({ message: "Score saved", score: newScore });
  } catch (err) {
    res.status(500).json({ error: "Server Error" });
  }
};

// Get user's previous scores
exports.getScores = async (req, res) => {
  try {
    const userId = req.user.id;

    const scores = await Score.find({ userId }).sort({ date: -1 });

    res.status(200).json(scores);
  } catch (err) {
    res.status(500).json({ error: "Server Error" });
  }
};
