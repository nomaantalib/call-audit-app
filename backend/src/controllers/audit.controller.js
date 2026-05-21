import fs from "fs";
import path from "path";
import Audit from "../models/Audit.js";
import {
  chunkTranscript,
  extractUtterances,
  normalizeSpeakers,
  transcribeAudio,
} from "../services/assemblyai.service.js";
import { auditCall as auditWithGemini } from "../services/gemini.service.js";

import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load rules
const rulesPath = path.join(__dirname, "../../audit.rules.json");
const auditRules = JSON.parse(fs.readFileSync(rulesPath, "utf-8"));

export const auditCall = async (req, res) => {
  try {
    console.log("--- New Audit Request ---");
    if (!process.env.GEMINI_API_KEY || !process.env.ASSEMBLYAI_API_KEY) {
      console.error("Missing API Keys");
      return res.status(500).json({ 
        success: false, 
        error: "Server configuration error: Missing API Keys" 
      });
    }

    if (!req.file) {
      return res
        .status(400)
        .json({ success: false, error: "No audio file uploaded" });
    }

    const filePath = req.file.path;
    console.log("File received:", filePath);

    // 1. Send to AssemblyAI and get transcript
    console.log("Step 1: Transcribing audio...");
    const transcript = await transcribeAudio(filePath);

    // 2. Extract utterances
    console.log("Step 2: Extracting utterances...");
    let utterances = extractUtterances(transcript);

    // 3. Normalize speakers
    console.log("Step 3: Normalizing speakers...");
    utterances = normalizeSpeakers(utterances);

    // 4. Build full transcript text
    const transcriptText = utterances
      .map((u) => `${u.speaker}: ${u.text}`)
      .join("\n");

    if (!transcriptText) {
      console.warn("Transcript is empty");
    }

    // 5. Audit with Gemini
    console.log("Step 4: Analyzing with Gemini...");
    const auditData = await auditWithGemini(utterances, transcriptText);

    // 6. Compute score
    console.log("Step 5: Computing scores...");
    let score = 0;
    const maxScore = auditRules.reduce((sum, rule) => sum + rule.weight, 0);

    auditData.rule_results.forEach((result) => {
      const rule = auditRules.find((r) => r.id === result.rule_id);
      if (rule && result.passed) {
        score += rule.weight;
      }
    });

    // 7. Persist
    console.log("Step 6: Saving to database...");
    const audit = await Audit.create({
      filename: req.file.originalname,
      transcript: transcriptText,
      utterances,
      ruleResults: auditData.rule_results.map((r) => ({
        ruleId: r.rule_id,
        passed: r.passed,
        evidence: r.evidence,
      })),
      risks: (auditData.risks || []).map((risk) => ({
        severity: (risk.severity || "LOW").toUpperCase(),
        timestamp: risk.timestamp || "0:00",
        reason: risk.reason || "No reason provided",
      })),
      coachingFeedback: auditData.coaching_feedback,
      score,
      maxScore,
      sentiment: auditData.sentiment,
      objective: auditData.objective,
      conclusion: auditData.conclusion,
    });

    // 8. Cleanup
    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        console.log("Cleanup: Temp file deleted");
      }
    } catch (cleanupErr) {
      console.warn("Cleanup failed", cleanupErr.message);
    }

    console.log("Audit complete successfully.");
    res.json({
      success: true,
      audit: {
        id: audit._id,
        filename: audit.filename,
        score: audit.score,
        maxScore: audit.maxScore,
        ruleResults: audit.ruleResults,
        risks: audit.risks,
        coachingFeedback: audit.coachingFeedback,
        insights: audit.coachingFeedback,
        sentiment: audit.sentiment,
        objective: audit.objective,
        conclusion: audit.conclusion,
      },
    });
  } catch (error) {
    console.error("Audit Controller ERROR Stack:", error.stack || error);
    if (req.file && fs.existsSync(req.file.path)) {
      try {
        fs.unlinkSync(req.file.path);
      } catch {}
    }
    res.status(500).json({ success: false, error: error.message || "Internal Server Error" });
  }
};

export const getAudits = async (req, res) => {
  try {
    const audits = await Audit.find().sort({ createdAt: -1 });
    res.json({ success: true, audits });
  } catch (error) {
    console.error("Get Audits Error:", error.message);
    res.status(500).json({ success: false, error: error.message });
  }
};
