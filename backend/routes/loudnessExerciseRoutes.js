const express = require("express");
const router = express.Router();
const controller = require("../controllers/loudnessExerciseController");
const authMiddleware = require("../middleware/authMiddleware");

// Protect all routes with auth
router.post("/start", authMiddleware, controller.startExercise);
router.post("/update", authMiddleware, controller.updateProgress);
router.get("/progress", authMiddleware, controller.getProgress);

module.exports = router;
