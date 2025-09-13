const mongoose = require("mongoose");

const generatedQuestionSchema = new mongoose.Schema({
  question: { type: String, required: true },
  type: { type: String, enum: ["open", "yes_no", "multiple_choice", "clarifying", "challenge"], default: "open" },
  difficulty: { type: String, enum: ["easy", "medium", "hard"], default: "medium" },
  slideIndex: { type: Number },
});

const questionSessionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  fileName: { type: String },
  totalSlides: { type: Number },
  slidesPreview: [{ type: String }],
  questions: [generatedQuestionSchema],
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("QuestionSession", questionSessionSchema);


