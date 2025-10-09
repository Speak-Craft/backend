// Export all models for easy importing
const User = require('./User');
const Role = require('./Role');
const Permission = require('./Permission');
const LoudnessPractice = require('./LoudnessPractice');
const EmotionAnalysisActivity = require('./EmotionAnalysisActivity');
const LoudnessExercise = require('./LoudnessExercise');
const LoudnessScore = require('./LoudnessScore');
const FillerChallenge = require('./FillerChallenge');
const FillerSession = require('./FillerSession');

module.exports = {
    User,
    Role,
    Permission,
    LoudnessPractice,
    EmotionAnalysisActivity
    ,LoudnessExercise
    ,LoudnessScore
    ,FillerChallenge
    ,FillerSession
};
