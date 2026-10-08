const { GoogleGenerativeAI } = require("@google/generative-ai");
const { classifyPriority } = require("./priorityService");

const PRIORITIES = ["critical", "high", "medium", "low"];
const CATEGORIES = ["Software", "Hardware", "Network", "Access", "Security", "Payments", "Other"];

// Models tried in order. GEMINI_MODEL from .env always goes first.
function modelChain() {
  const list = [
    process.env.GEMINI_MODEL,
    "gemini-3.8-flash"
  ]
    .map((m) => (m || "").trim())
    .filter(Boolean);

  return [...new Set(list)];
}

// Created lazily so the key is read AFTER dotenv has loaded, whatever the require order.
let cachedKey = null;
let cachedClient = null;
function getClient() {
  const key = (process.env.GEMINI_API_KEY || "").trim().replace(/^["']|["']$/g, "");
  if (!key || key === "your_gemini_api_key_here") return null;
  if (key !== cachedKey) {
    cachedKey = key;
    cachedClient = new GoogleGenerativeAI(key);
  }
  return cachedClient;
}

const SYSTEM_PROMPT = `You are a senior support triage engineer for an enterprise help desk.
Read the ticket carefully and judge it on its own facts: who is affected, how many people, whether the service or business can still operate, whether money, security or data is at risk, and whether a workaround exists.

Choose exactly ONE priority:
- critical: the service or a core business function is down or unusable for all/most users or customers, an active security incident, confirmed data loss, or revenue fully stopped.
- high: a core function is broken or seriously degraded for many users, or something important (login, payments, a key system) fails without a reasonable workaround, but the business is not fully stopped.
- medium: a real functional problem with limited impact - a feature does not work correctly but the application is still usable, one user or a small group affected, or a workaround exists.
- low: cosmetic or minor non-blocking issues, questions, how-to or equipment requests, things that can wait.

Do not default to medium. Use the full range. Base the decision only on what the ticket states; do not assume the worst case.

Category must be one of: ${CATEGORIES.join(", ")}.

Then write resolution guidance specific to THIS ticket: name the actual system, page, feature or symptom described. Never give generic advice ("check the system", "contact IT", "restart the application") unless it truly fits this exact ticket.

Respond with ONLY a JSON object, no markdown:
{
  "priority": "critical" | "high" | "medium" | "low",
  "priorityReason": "1-2 sentences explaining why, referring to the ticket's impact",
  "category": "one of the categories above",
  "department": "e.g. IT Support, Network Ops, Security, Engineering, Finance, HR",
  "estimatedResolution": "e.g. '1-2 hours'",
  "likelyCause": "1-2 sentences on the most likely cause based on the described symptoms",
  Do not number the recommendedSteps items. Return each step as plain text because the UI adds the numbering.
  "recommendedSteps": ["specific step without numbering", "specific step without numbering", "specific step without numbering"],
  "nextAction": "one short, concrete action the support employee should take next"
}`;

const RESPONSE_SCHEMA = {
  type: "object",
  properties: {
    priority: { type: "string", enum: PRIORITIES },
    priorityReason: { type: "string" },
    category: { type: "string", enum: CATEGORIES },
    department: { type: "string" },
    estimatedResolution: { type: "string" },
    likelyCause: { type: "string" },
    recommendedSteps: { type: "array", items: { type: "string" } },
    nextAction: { type: "string" },
  },
  required: ["priority", "priorityReason", "category", "likelyCause", "recommendedSteps", "nextAction"],
};

const CATEGORY_RULES = [
  { re: /\b(vpn|wifi|wi-fi|internet|network|router|dns|lan|connection)\b/, category: "Network", department: "Network Ops" },
  { re: /\b(breach|hacked|phishing|malware|virus|ransomware|unauthori[sz]ed|compromised)\b/, category: "Security", department: "Security" },
  { re: /\b(payment|payments|checkout|billing|invoice|transaction)\b/, category: "Payments", department: "Engineering" },
  { re: /\b(password|login|log in|locked out|access|permission|account)\b/, category: "Access", department: "IT Support" },
  { re: /\b(printer|laptop|monitor|keyboard|mouse|screen|battery|charger|headset|hardware)\b/, category: "Hardware", department: "IT Support" },
  { re: /\b(leave|payroll|salary|policy|onboarding|hr)\b/, category: "Other", department: "HR" },
];

const ETA_BY_PRIORITY = { critical: "Under 1 hour", high: "1-4 hours", medium: "4-24 hours", low: "1-3 days" };

function normalizePriority(value) {
  if (typeof value !== "string") return null;
  const v = value.trim().toLowerCase();
  if (PRIORITIES.includes(v)) return v;
  if (/^(p0|sev ?0|sev ?1|p1|urgent|blocker|emergency)$/.test(v)) return "critical";
  if (/^(p2|sev ?2|major)$/.test(v)) return "high";
  if (/^(p3|sev ?3|normal|moderate)$/.test(v)) return "medium";
  if (/^(p4|sev ?4|minor|trivial)$/.test(v)) return "low";
  return null;
}

function normalizeCategory(value) {
  if (typeof value !== "string") return null;
  const hit = CATEGORIES.find((c) => c.toLowerCase() === value.trim().toLowerCase());
  return hit || null;
}

const cleanText = (v, max = 400) => (typeof v === "string" && v.trim() ? v.trim().slice(0, max) : null);

// Turns SDK errors into a short, readable reason (no secrets) for the UI and logs.
function describeError(err) {
  const msg = String(err?.message || err || "Unknown error");
  const status = err?.status || (msg.match(/\[(\d{3})[^\]]*\]/) || [])[1];
  if (/API key not valid|API_KEY_INVALID/i.test(msg)) return "Gemini rejected the API key (invalid key)";
  if (String(status) === "403" || /PERMISSION_DENIED/i.test(msg)) return "Gemini denied access for this API key (403)";
  if (String(status) === "429" || /quota|RESOURCE_EXHAUSTED/i.test(msg)) return "Gemini quota or rate limit reached (429)";
  if (String(status) === "404" || /not found/i.test(msg)) return "Gemini model not available for this key (404)";
  if (/fetch failed|ENOTFOUND|ECONNREFUSED|ETIMEDOUT/i.test(msg)) return "Server could not reach the Gemini API (network)";
  if (/SAFETY|blocked/i.test(msg)) return "Gemini blocked the response (safety filter)";
  return msg.replace(/key=[^&\s]+/gi, "key=***").slice(0, 200);
}

// Used only when the real Gemini request fails. No fake resolution steps.
function ruleBasedSuggestion(title, description, rule, errorNote) {
  const text = `${title} ${description}`.toLowerCase();
  const match = CATEGORY_RULES.find((r) => r.re.test(text));
  return {
    category: match ? match.category : "Software",
    priority: rule.priority,
    priorityReason: rule.reason,
    department: match ? match.department : "IT Support",
    estimatedResolution: ETA_BY_PRIORITY[rule.priority],
    likelyCause: null,
    suggestions: [],
    nextAction: null,
    generatedAt: new Date(),
    source: "rules",
    aiError: errorNote || null,
  };
}

function extractJson(text) {
  const cleaned = text.replace(/```json|```/gi, "");
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  if (start === -1 || end === -1) throw new Error("Gemini reply contained no JSON object");
  return JSON.parse(cleaned.slice(start, end + 1));
}

function buildPrompt({ title, description, category, department, similar }) {
  let prompt = `${SYSTEM_PROMPT}\n\n--- TICKET ---\nTitle: ${title}\nDescription: ${description}`;
  if (category) prompt += `\nCategory given by user: ${category}`;
  if (department) prompt += `\nDepartment: ${department}`;
  if (similar && (similar.resolution?.length || similar.title)) {
    prompt += `\n\n--- REFERENCE: a similar ticket that was already resolved ---\nTitle: ${similar.title}`;
    if (similar.resolution?.length) prompt += `\nSteps that resolved it: ${similar.resolution.join("; ")}`;
    prompt += `\nUse this only if it genuinely applies. Do NOT copy its priority; judge urgency from the new ticket.`;
  }
  return prompt;
}

// One Gemini call. First try with a strict schema; if the model/SDK rejects the
// schema (400), retry once in plain JSON mode with the same model.
async function callModel(client, modelName, prompt) {
  const attempt = async (withSchema) => {
    const model = client.getGenerativeModel({
      model: modelName,
      generationConfig: {
        responseMimeType: "application/json",
        temperature: 0.2,
      },
  });
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    if (!text || !text.trim()) throw new Error("Gemini returned an empty response");
    return extractJson(text.trim());
  };
  try {
    return await attempt(true);
  } catch (err) {
    if (String(err?.status) === "400" || /\[400|schema|Invalid JSON payload/i.test(err?.message || "")) {
      console.warn(`[triage] ${modelName}: schema mode rejected, retrying in plain JSON mode`);
      return attempt(false);
    }
    throw err;
  }
}

function validate(parsed) {
  const priority = normalizePriority(parsed?.priority);
  if (!priority) throw new Error(`Gemini returned an invalid priority "${parsed?.priority}"`);
  const steps = Array.isArray(parsed.recommendedSteps)
    ? parsed.recommendedSteps.map((s) => cleanText(s, 300)).filter(Boolean).slice(0, 6)
    : [];
  const reason = cleanText(parsed.priorityReason || parsed.reason, 400);
  if (!reason) throw new Error("Gemini response was missing the priority reasoning");
  return {
    category: normalizeCategory(parsed.category) || cleanText(parsed.category, 60) || "Other",
    priority,
    priorityReason: reason,
    department: cleanText(parsed.department, 60) || "IT Support",
    estimatedResolution: cleanText(parsed.estimatedResolution, 60) || ETA_BY_PRIORITY[priority],
    likelyCause: cleanText(parsed.likelyCause, 500),
    suggestions: steps,
    nextAction: cleanText(parsed.nextAction || parsed.suggestedNextAction, 300),
  };
}

// Analyzes a ticket with Gemini. Falls back to keyword rules ONLY if every real call fails.
async function analyzeTicket(title, description, options = {}) {
  const rule = classifyPriority(title, description);
  const client = getClient();

  if (!client) {
    console.warn("[triage] GEMINI_API_KEY is missing in backend/.env, using keyword fallback");
    return ruleBasedSuggestion(title, description, rule, "Gemini API key is not configured on the server (GEMINI_API_KEY)");
  }

  const prompt = buildPrompt({ title, description, ...options });
  let lastReason = null;

  for (const modelName of modelChain()) {
    try {
      const parsed = await callModel(client, modelName, prompt);
      const result = validate(parsed);
      console.log(`[triage] Gemini (${modelName}) -> ${result.priority} / ${result.category} for "${title.slice(0, 60)}"`);
      return { ...result, model: modelName, generatedAt: new Date(), source: "gemini", aiError: null };
    } catch (err) {
      lastReason = describeError(err);
      console.error(`[triage] Gemini call failed on ${modelName}: ${err.message}`);
      // A bad key or quota will not be fixed by trying another model.
      if (/API key|denied access|quota/i.test(lastReason)) break;
    }
  }

  return ruleBasedSuggestion(title, description, rule, `AI analysis failed: ${lastReason}. Priority set by keyword rules.`);
}

// Small live check used by GET /api/health/ai.
async function checkGemini() {
  const client = getClient();
  if (!client) return { ok: false, configured: false, reason: "GEMINI_API_KEY is not set" };
  const tried = [];
  for (const modelName of modelChain()) {
    try {
      const model = client.getGenerativeModel({ model: modelName });
      const r = await model.generateContent("Reply with the single word: ok");
      return { ok: true, configured: true, model: modelName, reply: r.response.text().trim().slice(0, 20), tried };
    } catch (err) {
      tried.push({ model: modelName, reason: describeError(err) });
    }
  }
  return { ok: false, configured: true, tried };
}

module.exports = { analyzeTicket, checkGemini, normalizePriority, PRIORITIES, CATEGORIES };
