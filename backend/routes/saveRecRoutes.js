const express = require("express");
const SaveRec = require("../models/SaveRec");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

// Save a recording
router.post("/save", protect, async (req, res) => {
  try {
    const { fillerCount, duration, date } = req.body;

    if (fillerCount === undefined || duration === undefined) {
      return res.status(400).json({ message: "Filler count and duration are required" });
    }

    const rec = new SaveRec({
      user: req.user._id,
      fillerCount,
      duration,
      date: date || new Date(),
    });

    await rec.save();
    res.status(201).json({ message: "Recording saved successfully", rec });
  } catch (err) {
    console.error("Error saving recording:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Get all saved recordings for the logged-in user
router.get("/save", protect, async (req, res) => {
  try {
    const recs = await SaveRec.find({ user: req.user._id }).sort({ date: -1 });
    res.json(recs);
  } catch (err) {
    console.error("Error fetching recordings:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
