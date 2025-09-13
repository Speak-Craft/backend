const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();



const app = express();
app.use(express.json());
app.use(cors({
    origin: ['http://localhost:5173', 'http://localhost:3001'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// === Routes ===
const authRoutes = require("./routes/authRoutes");
const recordingRoutes = require("./routes/recordingRoutes");
const saveRecRoutes = require("./routes/saveRecRoutes");
const loudnessRoutes = require("./routes/loudnessRoutes");


const topicRoutes = require('./routes/topicRoutes');
app.use('/api/presentation', topicRoutes);

// Presentation time segmentation routes (upload, list sessions)
const presentationRoutes = require('./routes/presentationRoutes');
app.use('/api/presentation', presentationRoutes);

// Audience question generation routes
const questionRoutes = require('./routes/questionRoutes');
app.use('/api/questions', questionRoutes);


app.use("/api/auth", authRoutes);
app.use("/api/recording", recordingRoutes);
app.use("/api/rec", saveRecRoutes);
app.use("/api", loudnessRoutes);
// Pace activities (rate/pause) persistence
const paceRoutes = require('./routes/paceRoutes');
app.use('/api', paceRoutes);
// Filler word challenge routes
const fillerwordRoutes = require('./routes/fillerwordRoutes');
app.use('/api/challenge', fillerwordRoutes);


const PORT = process.env.PORT || 3001;
mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log("✅ MongoDB Connected");
        app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
    })
    .catch(err => console.error(err));
