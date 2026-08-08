const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const SYSTEM_PROMPT = `You are an IT support triage assistant. Given a ticket's title and description, respond with ONLY valid JSON (no markdown fences, no preamble) in this exact shape:
{
  "category": "string, e.g. Software, Hardware, Network, Access, Other",
  "priority": "low" | "medium" | "high",
  "department": "string, e.g. IT Support, Network Ops, Security, HR",
  "estimatedResolution": "string, e.g. '30-45 minutes'",
  "suggestions": ["short actionable step", "short actionable step", "short actionable step"]
}`;

// Calls Gemini to analyze a new ticket and suggest triage fields.
async function analyzeTicket(title, description) {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const prompt = `${SYSTEM_PROMPT}\n\nTicket Title: ${title}\nTicket Description: ${description}`;

  const result = await model.generateContent(prompt);
  const text = result.response.text().trim();

  const cleaned = text.replace(/```json|```/g, "").trim();

  try {
    const parsed = JSON.parse(cleaned);
    return {
      category: parsed.category || "Other",
      priority: ["low", "medium", "high"].includes(parsed.priority)
        ? parsed.priority
        : "medium",
      department: parsed.department || "IT Support",
      estimatedResolution: parsed.estimatedResolution || "Unknown",
      suggestions: Array.isArray(parsed.suggestions) ? parsed.suggestions.slice(0, 5) : [],
      generatedAt: new Date(),
      source: "gemini",
    };
  } catch (err) {
    // Fail soft: AI is an enhancement, not a hard dependency for ticket creation.
    return {
      category: "Other",
      priority: "medium",
      department: "IT Support",
      estimatedResolution: "Unknown",
      suggestions: [],
      generatedAt: new Date(),
      source: "gemini",
      error: "AI analysis failed to parse; defaults applied",
    };
  }
}

module.exports = { analyzeTicket };
