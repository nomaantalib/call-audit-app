// backend/src/routes/audit.js
import express from "express";
import multer from "multer";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { AssemblyAI } from "assemblyai";
import Audit from "../models/Audit.js";
import fs from "fs";
import dotenv from "dotenv";
dotenv.config();

const router = express.Router();

// 20 MB upload limit
const upload = multer({
  dest: "uploads/",
  limits: { fileSize: 20 * 1024 * 1024 },
});

// Initialize Clients
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const aaiClient = new AssemblyAI({
  apiKey: process.env.ASSEMBLYAI_API_KEY, 
});

// Transcribe using AssemblyAI
async function transcribeAudio(filePath) {
  try {
    console.log("Uploading audio to AssemblyAI...");
    const uploadUrl = await aaiClient.files.upload(filePath);

    console.log("Starting transcription...");
    const transcript = await aaiClient.transcripts.transcribe({
      audio: uploadUrl,
      // speaker_labels: true, // Optional: useful for separating agent/customer
    });

    if (transcript.status === 'error') {
      throw new Error(transcript.error);
    }

    console.log("Transcription complete.");
    return transcript.text;
  } catch (error) {
    console.error("AssemblyAI Error:", error);
    throw new Error("Transcription failed: " + error.message);
  }
}

router.post("/", upload.single("audio"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: "No audio file uploaded" });
    }

    if (!process.env.ASSEMBLYAI_API_KEY) {
        return res.status(500).json({ success: false, error: "Server missing AssemblyAI API Key" });
    }

    // STEP 1: Transcription (AssemblyAI)
    const transcript = await transcribeAudio(req.file.path);
    console.log("Transcript Preview:", transcript.slice(0, 100) + "...");

    // STEP 2: Gemini (Analyze Text)
    // Using gemini-1.5-flash for speed
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash", 
    });

    const prompt = `
You are an expert call auditor.

Transcript:
"${transcript}"

Analyze the call based on the transcript above.
Return ONLY valid JSON with this exact structure:
{
  "insights": ["key insight 1", "key insight 2", "hidden insight"],
  "objective": "The main purpose of the call",
  "conclusion": "A summary of the outcome"
}
`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    console.log("Gemini Response:", responseText);

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

    // STEP 3: Save to MongoDB
    const audit = await Audit.create({
      filename: req.file.originalname,
      insights: data.insights,
      objective: data.objective,
      conclusion: data.conclusion,
    });

    // Cleanup file
    try {
        fs.unlinkSync(req.file.path);
    } catch (cleanupErr) {
        console.warn("Failed to delete local file:", cleanupErr);
    }

    res.json({ success: true, audit });
  } catch (err) {
    console.error("Error processing audit:", err);

    if (req.file && fs.existsSync(req.file.path)) {
      try { fs.unlinkSync(req.file.path); } catch {}
    }

    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
