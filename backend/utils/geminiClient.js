// utils/geminiClient.js
const { GoogleGenAI } = require('@google/genai');
const axios = require('axios');

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

// =============================
// Presentation Time Breakdown
// =============================

// Helper to safely parse Gemini JSON
function parseGeminiJSON(text) {
  if (!text) return null;
  const cleaned = String(text).replace(/```json/g, '').replace(/```/g, '').trim();
  try {
    return JSON.parse(cleaned);
  } catch (err) {
    console.error('Failed to parse Gemini batch:', err.message);
    return null;
  }
}

async function generateBreakdown(slides, totalTime) {
  const topics = [];

  const prompt = `
You are an AI assistant for presentation planning.

TASK:
Distribute a total of ${totalTime} minutes across ${Array.isArray(slides) ? slides.length : 0} slides.
- Each slide must have: 
  1. A short, human-friendly title.
  2. A one-sentence summary.
  3. An "allocatedTimeSeconds" field (integer, in seconds).
- Times should NOT be equal for all slides. 
- Make it natural: Introductions shorter, technical/detailed parts longer, Q&A longer at end if present.
- The sum of all "allocatedTimeSeconds" MUST equal ${totalTime * 60}.

Return ONLY a valid JSON array, e.g.:
[
  {
    "title": "Introduction to Big Data",
    "summary": "Overview of big data and its significance.",
    "allocatedTimeSeconds": 180
  }
]
Slides:
${(Array.isArray(slides) ? slides : []).map((s, idx) => `Slide ${idx + 1}: ${s}`).join("\n")}
`;

  let batchData = null;

  try {
    const response = await axios.post(
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent',
      { contents: [{ parts: [{ text: prompt }] }] },
      {
        headers: {
          'x-goog-api-key': process.env.GEMINI_API_KEY,
          'Content-Type': 'application/json',
        },
      }
    );

    let textResp = '';
    const candidate = response.data?.candidates?.[0];
    if (candidate) {
      if (Array.isArray(candidate.content?.parts)) {
        textResp = candidate.content.parts.map((p) => p.text || '').join('');
      } else if (candidate.content?.text) {
        textResp = candidate.content.text;
      }
    }

    batchData = parseGeminiJSON(textResp);
    if (!batchData) throw new Error('Invalid Gemini JSON');
    console.log('✅ Gemini allocation applied');

    (batchData || []).forEach((data, idx) => {
      topics.push({
        title: data.title || (Array.isArray(slides) && slides[idx] ? String(slides[idx]).slice(0, 50) : `Slide ${idx + 1}`),
        allocatedTime: data.allocatedTimeSeconds || 60,
        summary: data.summary || (Array.isArray(slides) && slides[idx] ? String(slides[idx]).slice(0, 100) : ''),
      });
    });
  } catch (err) {
    console.error('Gemini API error:', err.message);
    console.log('⚠️ Fallback: proportional allocation applied');

    const safeSlides = Array.isArray(slides) ? slides : [];
    const totalTextLength = safeSlides.reduce((acc, s) => acc + String(s).length, 0) || 1;
    safeSlides.forEach((slide) => {
      const proportion = String(slide).length / totalTextLength;
      const baseTime = Math.max(10, Math.round(proportion * totalTime * 60));
      topics.push({
        title: String(slide).slice(0, 50),
        allocatedTime: baseTime,
        summary: String(slide).slice(0, 100),
      });
    });
  }

  // Adjust to match totalTime exactly
  const totalAllocated = topics.reduce((a, t) => a + (t.allocatedTime || 0), 0);
  const diff = totalTime * 60 - totalAllocated;
  if (diff !== 0 && topics.length > 0) {
    topics[0].allocatedTime = (topics[0].allocatedTime || 0) + diff;
  }

  return topics;
}

module.exports.generateBreakdown = generateBreakdown;
