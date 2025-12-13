
import { transcribeAudio } from "../services/transcription.service.js";
import { analyzeCall } from "../services/gemini.service.js";
import Audit from "../models/Audit.js";
import fs from "fs";

export const auditCall = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: "No audio file uploaded" });
    }

    // 1. Transcribe
    const transcript = await transcribeAudio(req.file.path);
    
    // 2. Analyze
    const auditData = await analyzeCall(transcript);

    // 3. Save to DB
    const audit = await Audit.create({
      filename: req.file.originalname,
      insights: auditData.insights,
      objective: auditData.objective,
      conclusion: auditData.conclusion,
      sentiment: auditData.sentiment,
    });

    // 4. Cleanup
    try {
        fs.unlinkSync(req.file.path);
    } catch (cleanupErr) {
        console.warn("Clean up failed", cleanupErr);
    }

    res.json({ success: true, audit });
  } catch (error) {
    console.error("Audit Controller Error:", error.message);
    if (req.file && fs.existsSync(req.file.path)) {
       try { fs.unlinkSync(req.file.path); } catch {}
    }
    res.status(500).json({ success: false, error: error.message });
  }
};
