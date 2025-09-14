const mongoose = require("mongoose");

const fillerSessionSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    level: { type: Number, required: true },
    fillerCount: { type: Number, required: true },
    duration: { type: Number, required: true }, // seconds
    totalChunks: { type: Number, default: 0 },
    success: { type: Boolean, default: false },
  },
  { timestamps: true }
);

fillerSessionSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model("FillerSession", fillerSessionSchema);



