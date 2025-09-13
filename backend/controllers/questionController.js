const fs = require("fs");
const QuestionSession = require("../models/QuestionSession");
const { extractTextFromFile } = require("../utils/extractSlidesText");
const { generateFromGemini } = require("../utils/geminiClient");

function buildQuestionsPrompt(slides, audience = "general", numQuestions = 10) {
  const slidesJoined = (slides || []).map((s, i) => `Slide ${i + 1}: ${String(s).slice(0, 800)}`).join("\n");
  return `You are helping prepare audience-style questions for a talk. Read the slide content below and generate a diverse set of concise questions that a curious audience might ask during or after the presentation.

Audience: ${audience}
Questions count: ${numQuestions}

Required JSON output (and nothing else):
{
  "questions": [
    {
      "question": "<string>",
      "type": "open" | "yes_no" | "multiple_choice" | "clarifying" | "challenge",
      "difficulty": "easy" | "medium" | "hard",
      "slideIndex": <integer | null>
    }
  ]
}

Guidelines:
- Avoid fluff. Make questions specific to the content.
- Cover breadth: definitions, implications, trade-offs, limitations, examples, applications.
- If a question targets a particular slide, set slideIndex to its 0-based index; otherwise null.
- Return valid JSON only. No backticks, no commentary.

Slides:
${slidesJoined}
`;
}

exports.uploadAndGenerate = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "File is required" });
    const { audience = "general", numQuestions = 10 } = req.body;

    const slides = await extractTextFromFile(req.file.path, req.file.originalname);

    const prompt = buildQuestionsPrompt(slides, audience, Number(numQuestions) || 10);
    const { text } = await generateFromGemini({ prompt, thinkingBudget: 0 });

    let parsed = null;
    try {
      parsed = JSON.parse(text);
    } catch (e) {
      const start = text.indexOf("{");
      const end = text.lastIndexOf("}");
      if (start !== -1 && end !== -1) {
        try { parsed = JSON.parse(text.slice(start, end + 1)); } catch (_) {}
      }
    }

    const questions = Array.isArray(parsed?.questions) ? parsed.questions : [];

    const session = await QuestionSession.create({
      user: req.user._id,
      fileName: req.file.originalname,
      totalSlides: Array.isArray(slides) ? slides.length : 0,
      slidesPreview: (slides || []).slice(0, 5).map((s) => String(s).slice(0, 300)),
      questions: questions.map((q) => ({
        question: q.question || String(q || "").slice(0, 300),
        type: q.type || "open",
        difficulty: q.difficulty || "medium",
        slideIndex: typeof q.slideIndex === "number" ? q.slideIndex : null,
      })),
    });

    fs.unlink(req.file.path, () => {});

    return res.json({ session });
  } catch (err) {
    console.error("uploadAndGenerate error:", err);
    return res.status(500).json({ error: "Server error" });
  }
};

exports.listSessions = async (req, res) => {
  try {
    const sessions = await QuestionSession.find({ user: req.user._id }).sort({ createdAt: -1 });
    return res.json({ sessions });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};


