const axios = require("axios");
const FormData = require("form-data");
const fs = require("fs");

async function analyzeAudio(audioPath) {
    try {
        const formData = new FormData();
        formData.append("audio", fs.createReadStream(audioPath));

        const response = await axios.post("http://localhost:5001/predict", formData, {
            headers: formData.getHeaders()
        });

        return response.data;
    } catch (error) {
        console.error("❌ Error sending audio to ML service:", error.message);
        throw error;
    }
}

module.exports = analyzeAudio;
