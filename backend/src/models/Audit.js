// backend/src/models/Audit.js
import mongoose from "mongoose";

const AuditSchema = new mongoose.Schema(
  {
    filename: { type: String, required: true },
    insights: { type: String },
    objective: { type: String },
    conclusion: { type: String },
    createdAt: { type: Date, default: Date.now },
  },
  { collection: "audits" }
);

export default mongoose.model("Audit", AuditSchema);
