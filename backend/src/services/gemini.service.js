
import { geminiModel } from "../config/gemini.config.js";
import { buildPrompt } from "../utils/buildPrompt.js";

export const analyzeCall = async (transcript, context) => {
  const prompt = buildPrompt(transcript, context);

  const result = await geminiModel.generateContent(prompt);
  const responseText = result.response.text();

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
          throw new Error("Invalid JSON response from AI");
      }
  }
  return data;
};
