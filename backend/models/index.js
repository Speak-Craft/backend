// Export all models for easy importing
const User = require('./User');
const Role = require('./Role');
const Permission = require('./Permission');
const FillerWordsPractice = require('./FillerWordsPractice');
const PaceManagementPractice = require('./PaceManagementPractice');
const LoudnessPractice = require('./LoudnessPractice');
const EmotionAnalysisPractice = require('./EmotionAnalysisPractice');
const FillerWordsActivity = require('./FillerWordsActivity');
const PaceManagementActivity = require('./PaceManagementActivity');
const LoudnessActivity = require('./LoudnessActivity');
const EmotionAnalysisActivity = require('./EmotionAnalysisActivity');
const LoudnessExercise = require('./LoudnessExercise');
const LoudnessScore = require('./LoudnessScore');
const FillerChallenge = require('./FillerChallenge');
const FillerSession = require('./FillerSession');

module.exports = {
    User,
    Role,
    Permission,
    FillerWordsPractice,
    PaceManagementPractice,
    LoudnessPractice,
    EmotionAnalysisPractice,
    FillerWordsActivity,
    PaceManagementActivity,
    LoudnessActivity,
    EmotionAnalysisActivity
    ,LoudnessExercise
    ,LoudnessScore
    ,FillerChallenge
    ,FillerSession
};
