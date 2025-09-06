const mongoose = require("mongoose");

const challengeLevelSchema = new mongoose.Schema({
  level: { type: Number, required: true },
  duration: { type: Number, required: true }, // in minutes
  maxFillers: { type: Number, required: true },
  completed: { type: Boolean, default: false },
  completedAt: Date,
  badgeUnlocked: { type: Boolean, default: false },
});

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },

  challenges: [challengeLevelSchema],

  history: [
    {
      date: { type: Date, default: Date.now },
      fillerCount: Number,
      duration: Number,
      level: Number,
      success: Boolean,
    },
  ],
});

module.exports = mongoose.model("User", userSchema);
