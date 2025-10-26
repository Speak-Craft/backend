// routes/feedbackRoutes.js
const express = require("express");
const router = express.Router();
const { generateFromGemini } = require("../utils/geminiClient");

router.post("/analyze", async (req, res) => {
  try {
    const { fillerCount, duration } = req.body;

    if (fillerCount === undefined || duration === undefined) {
      return res.status(400).json({ error: "Missing fillerCount or duration" });
    }

    // Create a natural-language prompt for Gemini
    const prompt = `
You are a friendly communication coach.
Analyze a user's speech performance based on filler word usage and duration.

User details:
- Filler words detected: ${fillerCount}
- Total speaking duration: ${duration.toFixed(2)} seconds

Provide short, personalized feedback (max 5 sentences):
1. Brief evaluation (how they did overall)
2. Mention filler usage (good / needs improvement)
3. Suggest one or two practical improvement tips
4. Encourage them positively at the end.
`;

    const { text } = await generateFromGemini({ prompt });

    res.json({
      fillerCount,
      duration,
      feedback: text || "No feedback generated.",
    });
  } catch (err) {
    console.error("Feedback generation failed:", err);
    res.status(500).json({ error: "Failed to generate feedback" });
  }
});

module.exports = router;
