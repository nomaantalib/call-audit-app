import fs from "fs";
import path from "path";
import { geminiModel } from "../config/gemini.config.js";

import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load audit rules
const rulesPath = path.join(__dirname, "../../audit.rules.json");
const auditRules = JSON.parse(fs.readFileSync(rulesPath, "utf-8"));

// Audit call using Gemini
export const auditCall = async (utterances, transcriptText) => {
  // Build prompt for Gemini
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

  try {
    console.log("Sending to Gemini for audit...");
    const result = await geminiModel.generateContent(prompt);
    const responseText = result.response.text();

    // Log the call
    console.log("Gemini Response:", responseText);

    // Parse JSON
    let data;
    try {
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error("No JSON block found");
      data = JSON.parse(jsonMatch[0]);
    } catch (parseError) {
      console.error("Failed to parse Gemini response:", responseText);
      throw new Error("Invalid format from AI auditor");
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
    console.error("Gemini Service Error:", error);
    throw new Error("Audit analysis failed: " + error.message);
  }
};
