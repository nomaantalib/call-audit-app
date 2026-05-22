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
    audioUrl: { type: String },
    createdAt: { type: Date, default: Date.now },

    // --- SaaS ENTERPRISE CORE UPGRADES ---
    mode: { type: String, default: "ai" }, // "normal" or "ai"
    isManuallyAudited: { type: Boolean, default: false },
    manualScore: { type: Number },
    manualRuleOverrides: [
      {
        ruleId: { type: String },
        passed: { type: Boolean },
        evidence: { type: String },
      }
    ],
    manualCoachingFeedback: [{ type: String }],
    agentMetrics: {
      empathyScore: { type: Number, default: 85 }, // 1-100 scale
      confidenceScore: { type: Number, default: 80 }, // 1-100 scale
      talkRatio: { type: Number, default: 50 }, // Agent talk percentage
      deadAirPct: { type: Number, default: 5 } // Dead air percentage
    },
    predictiveAnalytics: {
      churnRisk: { type: Number, default: 10 }, // 0-100 scale
      escalationRisk: { type: Number, default: 15 }, // 0-100 scale
      fraudRisk: { type: Number, default: 2 }, // 0-100 scale
      predictiveReason: { type: String }
    },
    voiceBiometrics: {
      biometricStatus: { type: String, default: "MATCHED" }, // MATCHED, SPOOFED, UNVERIFIED
      verifiedSpeaker: { type: String, default: "Alex (Agent)" },
      matchScore: { type: Number, default: 99.8 } // 0-100 percentage
    },
    topicsAndKeywords: {
      topics: [{ type: String }],
      keywords: [{ type: String }],
      hinglishSummary: { type: String }
    },
    liveAssistLogs: [
      {
        timestamp: { type: Number },
        category: { type: String }, // CRITICAL, EMOTE, PROCESS
        suggestion: { type: String }
      }
    ],
    chatHistory: [
      {
        sender: { type: String }, // "USER" or "AI"
        text: { type: String },
        timestamp: { type: Date, default: Date.now }
      }
    ]
  },
  { collection: "audits" }
);

export default mongoose.model("Audit", AuditSchema);
