const { spawn } = require('child_process');
const History = require('../models/History');

exports.uploadAndPredict = async (req, res) => {
  const filePath = req.file.path;

  const process = spawn('python', ['utils/predictLoudness.py', filePath]);

  process.stdout.on('data', async (data) => {
    const [rms, label] = data.toString().trim().split(',').map(Number);

    await History.create({
      userId: req.userId,
      filename: req.file.filename,
      rms,
      label,
    });

    res.json({ filename: req.file.filename, rms, label });
  });

  process.stderr.on('data', (err) => {
    console.error("Prediction error:", err.toString());
    res.status(500).json({ error: "Prediction failed" });
  });
};

exports.getHistory = async (req, res) => {
  const records = await History.find({ userId: req.userId }).sort({ date: -1 });
  res.json(records);
};
