const express = require("express");
const router = express.Router();
const multer = require("multer");
const { exec } = require("child_process");
const path = require("path");
const fs = require("fs");

const upload = multer({ dest: "uploads/" });

router.post("/predict", upload.single("audio"), (req, res) => {
  const webmPath = path.resolve(req.file.path);
  const wavPath = `${webmPath}.wav`;

  // Step 1: Convert webm to wav using ffmpeg
  exec(`ffmpeg -i ${webmPath} -ar 16000 -ac 1 -t 0.5 -f wav ${wavPath}`, (ffmpegErr) => {
    if (ffmpegErr) {
      console.error("FFmpeg conversion failed:", ffmpegErr);
      fs.unlinkSync(webmPath);
      return res.status(500).json({ message: "Audio conversion failed" });
    }

    // Step 2: Run Python prediction
    exec(`python utills/predictLoudness.py "${wavPath}"`, (err, stdout, stderr) => {
      // Clean up files
      fs.unlinkSync(webmPath);
      fs.unlinkSync(wavPath);

      if (err || stderr.includes("error")) {
        console.error("Python error:", err || stderr);
        return res.status(500).json({ message: "Prediction failed", stderr });
      }

      // Use the Python output directly
      const label = stdout.trim();  

      res.json({ prediction: label });
    });
  });
});

module.exports = router;
