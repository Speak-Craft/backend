const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const loudnessRoutes = require("./routes/loudnessRoutes");
const exerciseRoutes = require('./routes/exerciseRoutes');


dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));


// MongoDB Atlas Connection
mongoose.connect(process.env.MONGO_URI, {
})
.then(() => console.log("✅ Connected to MongoDB Atlas"))
.catch((err) => console.error("❌ MongoDB connection failed:", err));

const scoreRoutes = require("./routes/scoreRoutes");
app.use("/api/scores", scoreRoutes);

const loudnessExerciseRoutes = require("./routes/loudnessExerciseRoutes");
app.use("/api/exercises/loudness", loudnessExerciseRoutes);


// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/audio', require('./routes/loudnessRoutes'));
app.use('/api/exercises', require('./routes/exerciseRoutes'));
app.use("/api/loudness", loudnessRoutes);
app.use('/api/exercises', exerciseRoutes);

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
