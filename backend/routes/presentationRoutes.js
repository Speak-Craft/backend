const express = require("express");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const { protect } = require("../middleware/authMiddleware");
const PresentationSession = require("../models/PresentationSession");
const { XMLParser } = require("fast-xml-parser");
const AdmZip = require("adm-zip");
const { generateBreakdown } = require("../utils/geminiClient");

const router = express.Router();
const upload = multer({ dest: "temp_uploads/" });

// Extract text from PDF or PPTX
const extractTextFromFile = async (filePath, originalName) => {
  const ext = path.extname(originalName).toLowerCase();

  if (ext === ".pdf") {
    // Basic placeholder: treat entire PDF as one slide of text
    return [fs.readFileSync(filePath).toString("utf-8")];
  } else if (ext === ".pptx") {
    const zip = new AdmZip(filePath);
    const slides = zip.getEntries().filter(
      (e) => e.entryName.includes("ppt/slides/slide") && e.entryName.endsWith(".xml")
    );
    const parser = new XMLParser({ ignoreAttributes: true });
    const slideTexts = [];

    slides.forEach((slide) => {
      const xmlData = slide.getData().toString("utf-8");
      const jsonObj = parser.parse(xmlData);
      const texts = [];

      const traverse = (obj) => {
        if (typeof obj === "object") {
          for (let key in obj) {
            if (key === "a:t") {
              if (Array.isArray(obj[key])) {
                obj[key].forEach((t) => texts.push(t));
              } else {
                texts.push(obj[key]);
              }
            } else traverse(obj[key]);
          }
        }
      };
      traverse(jsonObj);
      slideTexts.push(texts.join(" "));
    });

    return slideTexts; // Return array of slides
  } else {
    throw new Error("Unsupported file type");
  }
};

// === Upload & create session
router.post("/upload", protect, upload.single("presentation"), async (req, res) => {
  try {
    const { totalTime } = req.body;
    if (!req.file || !totalTime)
      return res.status(400).json({ message: "File & totalTime required" });

    // Extract text (array of slides)
    const slides = await extractTextFromFile(req.file.path, req.file.originalname);

    // Call Gemini AI to get titles and time allocation
    const topics = await generateBreakdown(slides, parseInt(totalTime));

    // Save session
    const session = new PresentationSession({
      user: req.user._id,
      fileName: req.file.originalname,
      totalTime,
      topics,
    });
    await session.save();

    // Remove temp file
    fs.unlinkSync(req.file.path);

    res.json({ message: "Session created", session });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// === Get all sessions
router.get("/", protect, async (req, res) => {
  try {
    const sessions = await PresentationSession.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json({ sessions });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
