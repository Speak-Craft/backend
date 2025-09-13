// utils/geminiClient.js
const { GoogleGenAI } = require('@google/genai');

console.log("Gemini API Key exists?", !!process.env.GEMINI_API_KEY);

const ai = new GoogleGenAI({
 
  apiKey: process.env.GEMINI_API_KEY
});

// generate structured response based on prompt and config
async function generateFromGemini({ prompt, model = 'gemini-2.5-flash', thinkingBudget = 0 }) {
  try {
    const response = await ai.models.generateContent({
      model,
      contents: [
        {
          parts: [
            { text: prompt },
          ],
        },
      ],
      // you can disable thinking if you want cheaper/faster responses:
      config: {
        thinkingConfig: {
          thinkingBudget, // 0 disables "thinking"
        },
        // you can add more generationConfig fields here if needed
      },
    });

    // SDK returns structure with candidates; the simplest text is:
    const text = response?.text ?? (response?.candidates?.[0]?.content?.parts?.[0]?.text) ?? null;
    return { raw: response, text };
  } catch (err) {
    console.error('❌ Gemini generate error:', err);
    throw err;
  }
}

module.exports = { generateFromGemini };
