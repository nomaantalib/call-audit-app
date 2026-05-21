import { genAI } from "../config/gemini.config.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const MODELS = [
  "gemini-2.5-flash",
  "gemini-2.0-flash",
  "gemini-1.5-flash",
  "gemini-1.5-pro"
];

export const auditCall = async (utterances, transcriptText) => {
  // Load audit rules
  let auditRules = [];
  try {
    const rulesPath = path.join(__dirname, "../../audit.rules.json");
    if (fs.existsSync(rulesPath)) {
      auditRules = JSON.parse(fs.readFileSync(rulesPath, "utf-8"));
    }
  } catch (err) {
    console.error("Failed to load audit rules in gemini service:", err.message);
  }

  const rulesText = auditRules
    .map(
      (rule) => `- ${rule.id}: ${rule.description} (Severity: ${rule.severity})`
    )
    .join("\n");

  const prompt = `
You are an explainable Call Quality Auditor. Analyze the following call transcript and audit rules.

Transcript:
${transcriptText}

Utterances (with timestamps):
${utterances
  .map((u) => `[${u.start}s-${u.end}s] ${u.speaker}: ${u.text}`)
  .join("\n")}

Audit Rules:
${rulesText}

Instructions:
- Evaluate each rule based on the transcript.
- For each rule, determine if it passed (true/false).
- Provide evidence with timestamp and quote.
- Identify risks with severity (LOW/MEDIUM/HIGH), timestamp, and reason.
- Provide coaching feedback as an array of strings.
- Determine the overall sentiment of the call (positive, negative, neutral).
- Summarize the call objective in 1-2 sentences.
- Provide a conclusion in 1-2 sentences.
- Return ONLY valid JSON in this exact schema:
{
  "rule_results": [
    {
      "rule_id": "string",
      "passed": true,
      "evidence": "timestamp + quote"
    }
  ],
  "risks": [
    {
      "severity": "LOW | MEDIUM | HIGH",
      "timestamp": "string",
      "reason": "string"
    }
  ],
  "coaching_feedback": ["string"],
  "sentiment": "positive | negative | neutral",
  "objective": "string",
  "conclusion": "string"
}

Do not hallucinate or assume. Cite evidence from transcript.
`;

  let lastError = null;
  for (const modelName of MODELS) {
    try {
      console.log(`Attempting audit analysis with model: ${modelName}...`);
      const model = genAI.getGenerativeModel({ model: modelName });
      
      const result = await model.generateContent(prompt);
      const responseText = result.response.text();
      console.log(`Successfully completed audit using ${modelName}`);

      // Parse JSON safely
      const cleaned = responseText.replace(/```json|```/g, "").trim();
      let data;
      try {
        data = JSON.parse(cleaned);
      } catch (e) {
        // Fallback if model adds extra text
        const match = cleaned.match(/\{[\s\S]*\}/);
        if (match) {
          data = JSON.parse(match[0]);
        } else {
          throw new Error("Invalid JSON response format from AI");
        }
      }

      // Validate schema
      if (!data.rule_results || !Array.isArray(data.rule_results)) {
        throw new Error("Invalid rule_results in response");
      }
      if (!data.risks || !Array.isArray(data.risks)) {
        throw new Error("Invalid risks in response");
      }
      if (!data.coaching_feedback || !Array.isArray(data.coaching_feedback)) {
        throw new Error("Invalid coaching_feedback in response");
      }
      if (!data.sentiment || typeof data.sentiment !== "string") {
        throw new Error("Invalid sentiment in response");
      }
      if (!data.objective || typeof data.objective !== "string") {
        throw new Error("Invalid objective in response");
      }
      if (!data.conclusion || typeof data.conclusion !== "string") {
        throw new Error("Invalid conclusion in response");
      }

      return data;
    } catch (error) {
      console.error(`Error with model ${modelName} during audit:`, error.message);
      lastError = error;
      console.warn(`Model ${modelName} failed. Falling back to the next model...`);
    }
  }
  
  throw new Error(`All Gemini models failed during audit. Last error: ${lastError ? lastError.message : "Unknown error"}`);
};

// Deprecated alias
export const analyzeCall = auditCall;
