// backend/src/models/Audit.js
import mongoose from "mongoose";

const AuditSchema = new mongoose.Schema(
  {
    filename: { type: String, required: true },
    insights: { type: [String] }, // Changed to array of strings for better handling
    objective: { type: String },
    conclusion: { type: String },
    sentiment: { type: String },
    createdAt: { type: Date, default: Date.now },
  },
  { collection: "audits" }
);

export default mongoose.model("Audit", AuditSchema);
