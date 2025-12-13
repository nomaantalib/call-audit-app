
import { AssemblyAI } from "assemblyai";
import dotenv from "dotenv";
dotenv.config();

export const aaiClient = new AssemblyAI({
  apiKey: process.env.ASSEMBLYAI_API_KEY,
});
