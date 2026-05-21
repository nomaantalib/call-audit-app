// backend/src/models/Audit.js
import mongoose from "mongoose";

const AuditSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    filename: { type: String, required: true },
    transcript: { type: String }, // Full transcript
    utterances: [
      {
        // Array of utterances with timestamps, speakers
        speaker: { type: String }, // AGENT or CUSTOMER
        text: { type: String },
        start: { type: Number },
        end: { type: Number },
        sentiment: { type: String },
      },
    ],
    ruleResults: [
      {
        // From Gemini
        ruleId: { type: String },
        passed: { type: Boolean },
        evidence: { type: String },
      },
    ],
    risks: [
      {
        // From Gemini
        severity: { type: String, enum: ["LOW", "MEDIUM", "HIGH"] },
        timestamp: { type: String },
        reason: { type: String },
      },
    ],
    coachingFeedback: [{ type: String }],
    score: { type: Number }, // Computed in backend
    maxScore: { type: Number }, // Sum of weights
    sentiment: { type: String },
    objective: { type: String },
    conclusion: { type: String },
    createdAt: { type: Date, default: Date.now },
  },
  { collection: "audits" }
);

export default mongoose.model("Audit", AuditSchema);
