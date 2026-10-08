// Rule-based priority classifier.
//
// Why this exists: priority used to come only from Gemini, and whenever the AI
// call failed (bad key, retired model, quota, unparseable reply) the ticket
// silently stayed on the schema default of "medium". This module scores the
// ticket text locally so priority is always meaningful, and it also acts as a
// safety net on top of whatever the AI says.
//
// How it works: every matching phrase adds to a "high" score or a "low" score.
// A clear high signal wins, a clear low signal wins, anything else is medium.

const HIGH_SIGNALS = [
  // Outages and things being unavailable
  { re: /\b(outage|is down|are down|went down|completely down|not accessible|unavailable)\b/, weight: 3, why: "reports an outage" },
  { re: /\b(production|prod server|live site|main server|database server)\b/, weight: 2, why: "affects production systems" },

  // Security
  { re: /\b(breach|breached|hacked|compromised|ransomware|malware|virus|phishing|unauthori[sz]ed|data leak|leaked)\b/, weight: 4, why: "looks like a security incident" },

  // Data loss
  { re: /\b(data loss|lost (all )?(my |our )?(data|files)|deleted (the )?(database|data|files)|corrupt(ed|ion)?)\b/, weight: 4, why: "involves data loss" },

  // Many people affected
  { re: /\b(everyone|everybody|all users|all employees|all staff|whole (office|team|company|department)|entire (office|team|company|department)|company[- ]wide|multiple users|many users|several users|all customers|customers? (are|is|cannot|can't))\b/, weight: 3, why: "affects many users" },

  // Money
  { re: /\b(payment|payments|transaction|transactions|checkout|billing)\b.*\b(fail|failing|failed|failure|not working|error|down)\b/, weight: 3, why: "payments are failing" },

  // Work completely blocked
  { re: /\b(cannot work|can't work|unable to work|blocked|blocker|blocking|stopped working completely|total(ly)? (down|broken))\b/, weight: 2, why: "blocks work completely" },

  // Explicit urgency words
  { re: /\b(urgent|urgently|critical|emergency|asap|immediately|right now|deadline today|sev ?1|p1)\b/, weight: 2, why: "marked urgent" },
];

const LOW_SIGNALS = [
  // Questions and how-tos
  { re: /\b(how (do|can|to)|how would|is it possible|wondering|question about|just curious|any idea (how|if))\b/, weight: 2, why: "is a question" },

  // Requests rather than problems
  { re: /\b(request|requesting|would like|would love|please (add|install|give|setup|set up)|need access to|new (mouse|keyboard|monitor|laptop bag|headset|charger)|software install|install (a |an )?(new )?(app|software|plugin|extension))\b/, weight: 2, why: "is a routine request" },
  { re: /\b(feature request|suggestion|nice to have|would be nice|improvement)\b/, weight: 3, why: "is a suggestion" },

  // Cosmetic or minor
  { re: /\b(minor|cosmetic|typo|spelling|spacing|padding|margin|alignment|colou?r|theme|wallpaper|font|icon|logo|dark mode|small (issue|bug|glitch))\b/, weight: 2, why: "is cosmetic or minor" },

  // The user says it can wait
  { re: /\b(not urgent|no rush|low priority|whenever you can|when you get a chance|when you have time|can wait|no hurry|at your convenience)\b/, weight: 4, why: "user says it can wait" },

  // Has a workaround
  { re: /\b(workaround|work around|for now i (use|am using)|temporarily using)\b/, weight: 2, why: "has a workaround" },
];

function scoreSignals(text, signals) {
  let score = 0;
  const reasons = [];
  for (const s of signals) {
    if (s.re.test(text)) {
      score += s.weight;
      reasons.push(s.why);
    }
  }
  return { score, reasons };
}

// Returns { priority: "low" | "medium" | "high" | "critical", reason: string }
function classifyPriority(title = "", description = "") {
  // Title counts twice: people put the real problem there.
  const text = `${title} ${title} ${description}`.toLowerCase();

  // "not urgent" must not count as the word "urgent"
  const highText = text.replace(/\b(not|isn't|is not|non)[- ](very )?(urgent|critical)\b/g, " ");

  const high = scoreSignals(highText, HIGH_SIGNALS);
  const low = scoreSignals(text, LOW_SIGNALS);

  if (high.score >= 6 && high.score > low.score) {
    return { priority: "critical", reason: `Critical: ticket ${high.reasons.join(", ")}.` };
  }

  if (high.score >= 3 && high.score > low.score) {
    return { priority: "high", reason: `High: ticket ${high.reasons.join(", ")}.` };
  }

  // A "can wait" style ticket should only drop to low if nothing serious is in it
  if (low.score >= 2 && high.score === 0) {
    return { priority: "low", reason: `Low: ${low.reasons.join(", ")}` };
  }

  if (high.score > 0 || low.score > 0) {
    return {
      priority: "medium",
      reason: "Medium: some urgency signals but not enough to call it high or low",
    };
  }

  return {
    priority: "medium",
    reason: "Medium: a normal issue affecting one user, no urgency signals found",
  };
}

module.exports = { classifyPriority };
