const express = require('express');
const router = express.Router();
const { saveExercise, getUserExercises } = require('../controllers/exerciseController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/save', authMiddleware, saveExercise);
router.get('/my-exercises', authMiddleware, getUserExercises);

module.exports = router;
