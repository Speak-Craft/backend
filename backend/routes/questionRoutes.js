const express = require("express");
const multer = require("multer");
const { protect } = require("../middleware/authMiddleware");
const controller = require("../controllers/questionController");

const router = express.Router();
const upload = multer({ dest: "temp_uploads/" });

router.post("/upload", protect, upload.single("presentation"), controller.uploadAndGenerate);
router.get("/", protect, controller.listSessions);

module.exports = router;


