import { GoogleGenerativeAI } from "@google/generative-ai";
import "./env.js";

if (!process.env.GEMINI_API_KEY) {
  console.warn("WARNING: GEMINI_API_KEY is not defined in the environment.");
}

export const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

// Default model
export const geminiModel = genAI.getGenerativeModel({
  model: "gemini-2.5-flash",
});
