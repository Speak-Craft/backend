const express = require("express");
const router = express.Router();
const multer = require("multer");
const axios = require("axios");
const fs = require("fs");
const FormData = require("form-data");
const { protect } = require("../middleware/authMiddleware");
const Presentation = require("../models/Presentation");

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

    // ✅ Send audio to Flask model server
    const flaskResponse = await axios.post("http://127.0.0.1:5001/predict", formData, {
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
