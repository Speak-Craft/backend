// controllers/topicController.js
const Topic = require('../models/Topic');
const { generateFromGemini } = require('../utils/geminiClient');

/**
 * Build the system prompt instructing Gemini to return JSON with:
 * - mainTopic
 * - slides: [{title, bullets: []}]
 * - folderStructure: { slidesFolder: [...], assetsFolder: [...] }
 */
function buildPrompt({ topic, slideCount = 8, audience = 'general', style = 'concise' }) {
  return `
You are a presentation assistant. The user will give a presentation topic.
Return a JSON object only (no extra commentary) with the following keys:

1) "mainTopic": the cleaned title string.
2) "slides": an array of ${slideCount} slide objects with:
   - "title": short slide title (5 words max)
   - "bullets": array of 3-6 concise bullet points for the slide (each < 20 words)
3) "shortSummary": 2-3 sentence summary of the whole talk.

Constraints:
- Output must be valid JSON only. Do not include extra text, backticks, or explanations.
- Keep bullet points short and actionable.
- Use a neutral, ${audience}-friendly style and ${style} tone.

User request:
{
  "topic": "${topic.replace(/\n/g, ' ')}",
  "slideCount": ${slideCount}
}
`;
}

exports.generateTopic = async (req, res) => {
  try {
    const userId = req.userId; // from auth middleware
    const { topic, slideCount = 8, audience = 'general', style = 'concise' } = req.body;

    if (!topic || topic.trim().length < 3) {
      return res.status(400).json({ error: 'Topic is required' });
    }

    const prompt = buildPrompt({ topic, slideCount, audience, style });

    // Call Gemini
    const { text, raw } = await generateFromGemini({ prompt, thinkingBudget: 0 }); // thinkingBudget optional

    // The model returns text — we expect JSON. Try to parse.
    let parsed;
    try {
      parsed = JSON.parse(text);
    } catch (err) {
      // If parsing fails, attempt to extract JSON-like substring
      const jsonStart = text.indexOf('{');
      const jsonEnd = text.lastIndexOf('}');
      if (jsonStart !== -1 && jsonEnd !== -1) {
        const candidate = text.slice(jsonStart, jsonEnd + 1);
        try {
          parsed = JSON.parse(candidate);
        } catch (e) {
          console.error('JSON parse failed for candidate:', candidate);
          parsed = null;
        }
      }
    }

    // Fallback: if parsed is null, return raw text as fallback
    if (!parsed) {
      return res.status(200).json({
        warning: 'Could not parse model response as JSON. See rawText for content.',
        rawText: text,
        rawResponse: raw,
      });
    }

    // Save to DB (optional)
    const topicDoc = await Topic.create({
      userId,
      prompt: topic,
      mainTopic: parsed.mainTopic || topic,
      suggestedSlides: parsed.slides || [],
      folderStructure: parsed.folderStructure || {},
      rawResponse: parsed,
    });

    return res.json({ topic: topicDoc, parsed });
  } catch (err) {
    console.error('❌ generateTopic error:', err);
    res.status(500).json({ error: err.message });
  }
};

exports.getTopics = async (req, res) => {
  try {
    const userId = req.userId;
    const topics = await Topic.find({ userId }).sort({ createdAt: -1 }).limit(50);
    res.json(topics);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
