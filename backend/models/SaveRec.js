const mongoose = require("mongoose");

const SaveRecSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  fillerCount: { type: Number, required: true },
  duration: { type: Number, required: true },
  date: { type: Date, default: Date.now }
});

module.exports = mongoose.model("SaveRec", SaveRecSchema);
