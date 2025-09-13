// routes/topicRoutes.js
const express = require('express');
const router = express.Router();
const topicController = require('../controllers/topicController');
const { protect } = require('../middleware/authMiddleware');

router.post('/generate', protect, topicController.generateTopic);
router.get('/history', protect, topicController.getTopics);

module.exports = router;
