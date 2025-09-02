const express = require("express");
const router = express.Router();
const { saveScore, getScores } = require("../controllers/scoreController");
const authMiddleware = require("../middleware/authMiddleware");

router.post("/", authMiddleware, saveScore);
router.get("/", authMiddleware, getScores);

module.exports = router;
