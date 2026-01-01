import "./env.js";
import { AssemblyAI } from "assemblyai";

export const aaiClient = new AssemblyAI({
  apiKey: process.env.ASSEMBLYAI_API_KEY,
});
