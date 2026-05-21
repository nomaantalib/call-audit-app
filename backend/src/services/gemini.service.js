import { genAI } from "../config/gemini.config.js";
import { buildPrompt } from "../utils/buildPrompt.js";
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

export const analyzeCall = async (transcript, context) => {
  // Read audit rules if available
  let rulesText = "";
  try {
    const rulesPath = path.join(__dirname, "../../audit.rules.json");
    if (fs.existsSync(rulesPath)) {
      const auditRules = JSON.parse(fs.readFileSync(rulesPath, "utf-8"));
      rulesText = auditRules
        .map((rule) => `- ${rule.description} (Severity: ${rule.severity})`)
        .join("\n");
    }
  } catch (err) {
    console.warn("Failed to load audit rules, using default analysis.", err);
  }

  // Enhance context with audit rules
  const enhancedContext = context 
    ? `${context}\n\nPlease evaluate the call against these compliance rules:\n${rulesText}`
    : `Please evaluate the call against these compliance rules:\n${rulesText}`;

  const prompt = buildPrompt(transcript, enhancedContext);

  let lastError = null;
  for (const modelName of MODELS) {
    try {
      console.log(`Attempting analysis with model: ${modelName}...`);
      const model = genAI.getGenerativeModel({ model: modelName });
      
      const result = await model.generateContent(prompt);
      const responseText = result.response.text();
      console.log(`Successfully completed analysis using ${modelName}`);

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
      return data;
    } catch (error) {
      console.error(`Error with model ${modelName}:`, error.message);
      lastError = error;
      console.warn(`Model ${modelName} failed. Falling back to the next model...`);
    }
  }
  
  throw new Error(`All Gemini models failed. Last error: ${lastError ? lastError.message : "Unknown error"}`);
};
