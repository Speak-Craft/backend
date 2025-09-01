const mongoose = require("mongoose");

const presentationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  audioPath: { type: String, required: true },
  fillerCount: { type: Number, required: true },
  fillerTimestamps: [{ type: Number }], 
  duration: { type: Number },           
}, { timestamps: true }); 

module.exports = mongoose.model("Presentation", presentationSchema);
