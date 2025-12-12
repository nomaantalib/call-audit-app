// backend/src/routes/audit.js
import express from "express";
import multer from "multer";
import axios from "axios";
import Audit from "../models/Audit.js";
import fs from "fs";

const router = express.Router();

// 5 MB upload limit
const upload = multer({
  dest: "uploads/",
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
});

router.post("/", upload.single("audio"), async (req, res) => {
  try {
    const filePath = req.file.path;
    const fileStream = fs.createReadStream(filePath);

    // ---- Call Gemini API (audio) ----
    const geminiResp = await axios.post(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro-audio:generateContent",
      fileStream,
      {
        headers: { "Content-Type": "application/octet-stream" },
        params: { key: process.env.GEMINI_API_KEY },
        maxContentLength: Infinity,
        maxBodyLength: Infinity,
      }
    );

    // Expected response shape: { insights, objective, conclusion }
    const { insights, objective, conclusion } = geminiResp.data;

    // Persist audit record
    const audit = await Audit.create({
      filename: req.file.originalname,
      insights,
      objective,
      conclusion,
    });

    // Clean up uploaded file
    fs.unlinkSync(filePath);

    res.json({ success: true, audit });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
