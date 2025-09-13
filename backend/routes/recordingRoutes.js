const express = require("express");
const router = express.Router();
const multer = require("multer");
const axios = require("axios");
const fs = require("fs");
const FormData = require("form-data");
const { protect } = require("../middleware/authMiddleware");
const Presentation = require("../models/Presentation");

// Allow overriding the filler model service URL via env
const FILLER_MODEL_URL = process.env.FILLER_MODEL_URL || "http://127.0.0.1:8000/predict-filler-words";

// Save uploaded audio temporarily
const upload = multer({ dest: "uploads/" });

router.post("/upload", protect, upload.single("audio"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No audio file uploaded" });
    }

    // ✅ Prepare file to send to Flask
    const formData = new FormData();
    formData.append("audio", fs.createReadStream(req.file.path));

    // ✅ Send audio to model service (FastAPI on port 8000 by default)
    const flaskResponse = await axios.post(FILLER_MODEL_URL, formData, {
      headers: formData.getHeaders(),
    });

    // ✅ Get filler prediction
    const fillerPrediction = flaskResponse.data.filler_prediction;

    // ✅ Build audio path for DB
    const audioPath = `uploads/${req.file.filename}`;

    // ✅ Save to DB
    const presentation = new Presentation({
      userId: req.user._id,         // ✅ correct field
      audioPath: audioPath,         // ✅ required field
      fillerCount: fillerPrediction,
      fillerTimestamps: flaskResponse.data.timestamps || [], // optional if Flask sends it
    });

    await presentation.save();

    // ✅ Clean up temporary file
    fs.unlinkSync(req.file.path);

    res.json({
      message: "Audio analyzed successfully",
      fillerCount: fillerPrediction,
      timestamps: flaskResponse.data.timestamps || []
    });

  } catch (err) {
    console.error("Error uploading audio:", err.message);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

module.exports = router;
