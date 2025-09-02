const mongoose = require('mongoose');

const historySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  filename: String,
  rms: Number,
  label: Number, 
  date: { type: Date, default: Date.now }
});

module.exports = mongoose.model('History', historySchema);
