import { useState, useRef, useEffect } from "react";
import axios from "axios";
import {
  UploadCloud, FileAudio, AlertCircle, CheckCircle2, Trash2,
  Activity, Sparkles, Server, Cpu, Database, Award, ArrowRight
} from "lucide-react";

const STAGES = [
  { text: "Connecting to secure upload pipeline…",      icon: Server },
  { text: "Transcribing call dialogue via AssemblyAI…", icon: Activity },
  { text: "Normalising conversation speakers & timing…", icon: Cpu },
  { text: "Running Google Gemini compliance evaluation…",icon: Sparkles },
  { text: "Extracting objective, conclusion & sentiment…",icon: Database },
  { text: "Generating coaching tips & risk summary…",   icon: Award },
];
const getBackendUrl = () => {
  if (import.meta.env.VITE_BACKEND_URL) {
    return import.meta.env.VITE_BACKEND_URL;
  }
  return "https://call-audit-app-brrj.onrender.com";
};

const backendUrl = getBackendUrl();

export default function UploadForm({ onResult, seedSampleData, seeding, hasAudits, isDarkMode }) {
  const [file, setFile]               = useState(null);
  const [loading, setLoading]         = useState(false);
  const [success, setSuccess]         = useState(false);
  const [error, setError]             = useState(null);
  const [isDragActive, setDragActive] = useState(false);
  const [activeStage, setActiveStage] = useState(0);
  const [elapsed, setElapsed]         = useState(0);
  const fileInputRef  = useRef(null);
  const timerRef      = useRef(null);
  const stageRef      = useRef(null);

  useEffect(() => {
    if (loading) {
      timerRef.current = setInterval(() => setElapsed(s => s + 1), 1000);
      stageRef.current = setInterval(() => {
        setActiveStage(s => s < STAGES.length - 1 ? s + 1 : s);
      }, 3500);
    } else {
      clearInterval(timerRef.current);
      clearInterval(stageRef.current);
      setElapsed(0);
      setActiveStage(0);
    }
    return () => { clearInterval(timerRef.current); clearInterval(stageRef.current); };
  }, [loading]);

  const fmt = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

  const handleDrag = (e) => {
    e.preventDefault(); e.stopPropagation();
    setDragActive(e.type === "dragenter" || e.type === "dragover");
  };
  const handleDrop = (e) => {
    e.preventDefault(); e.stopPropagation(); setDragActive(false);
    const f = e.dataTransfer.files?.[0];
    if (!f) return;
    if (!f.type.startsWith("audio/")) { setError("Please select a valid audio file (MP3, WAV, M4A)."); return; }
    if (f.size > 1 * 1024 * 1024) { setError("File exceeds the 1 MB limit."); return; }
    setFile(f); setError(null); setSuccess(false);
  };
  const handleFileChange = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.size > 1 * 1024 * 1024) {
      setError("File exceeds the 1 MB limit.");
      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }
    setFile(f); setError(null); setSuccess(false);
  };
  const removeFile = (e) => {
    e.stopPropagation();
    setFile(null); setSuccess(false); setError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const submit = async () => {
    if (!file) return;
    setLoading(true); setSuccess(false); setError(null);
    try {
      const form = new FormData();
      form.append("audio", file);
      const { data } = await axios.post(`${backendUrl}/api/audit`, form);
      if (data.success && data.audit) { onResult(data.audit); setSuccess(true); }
      else throw new Error(data.error || "Analysis failed.");
    } catch (err) {
      setError(err.response?.data?.error || err.message || "Failed to analyse audio file.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "100%", gap: "1rem" }}>

      {/* ── UPLOAD CARD ── */}
      <div className="upload-card">
        <div className="upload-card-bar" />

        <h2 style={{ fontSize: 18, fontWeight: 900, textAlign: "center", color: isDarkMode ? "#f1f5f9" : "#1e293b", marginBottom: "0.35rem", letterSpacing: "-0.3px" }}>
          Call Compliance Auditor
        </h2>
        <p style={{ fontSize: 11, color: isDarkMode ? "#64748b" : "#475569", textAlign: "center", marginBottom: "1.25rem", lineHeight: 1.6, fontWeight: 500 }}>
          Analyse conversational patterns, compliance weights, and performance insights
          with AssemblyAI &amp; Google Gemini.
        </p>

        {loading ? (
          /* ── AI Processing View ── */
          <div style={{ padding: "1.25rem", border: isDarkMode ? "1px solid rgba(139,92,246,0.2)" : "1px solid rgba(139,92,246,0.3)", borderRadius: 14, background: isDarkMode ? "rgba(139,92,246,0.03)" : "rgba(139,92,246,0.05)" }}>
            {/* Waveform bars */}
            <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "center", gap: 5, height: 44, marginBottom: "1.1rem" }}>
              {[18, 34, 46, 26, 40, 52, 28, 16].map((h, i) => (
                <div key={i} className="waveform-bar" style={{
                  width: 5, height: h, borderRadius: 99,
                  background: "linear-gradient(to top,#8b5cf6,#ec4899,#60a5fa)",
                  animationDuration: `${0.8 + i * 0.1}s`
                }} />
              ))}
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.85rem" }}>
              <span style={{ display: "flex", alignItems: "center", gap: "0.3rem", fontSize: 9, fontWeight: 900, color: "#a78bfa", textTransform: "uppercase", letterSpacing: "0.1em" }}>
                <Activity style={{ width: 12, height: 12 }} className="animate-pulse" /> AI Engine Processing
              </span>
              <span style={{ fontSize: 9, fontWeight: 700, color: isDarkMode ? "#475569" : "#64748b" }}>Elapsed: {fmt(elapsed)}</span>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "0.45rem" }}>
              {STAGES.map((stage, idx) => {
                const Icon = stage.icon;
                const past   = idx < activeStage;
                const active = idx === activeStage;
                return (
                  <div key={idx} style={{
                    display: "flex", alignItems: "center", gap: "0.65rem",
                    padding: "0.55rem 0.75rem", borderRadius: 10,
                    fontSize: 11, fontWeight: active ? 800 : 500,
                    border: `1px solid ${past ? (isDarkMode ? "rgba(34,197,94,0.2)" : "rgba(34,197,94,0.3)") : active ? (isDarkMode ? "rgba(139,92,246,0.35)" : "rgba(139,92,246,0.5)") : (isDarkMode ? "rgba(255,255,255,0.05)" : "rgba(148,163,184,0.15)")}`,
                    background: past ? (isDarkMode ? "rgba(34,197,94,0.03)" : "rgba(34,197,94,0.04)") : active ? (isDarkMode ? "rgba(139,92,246,0.08)" : "rgba(139,92,246,0.05)") : "transparent",
                    color: past ? (isDarkMode ? "#4ade80" : "#16a34a") : active ? (isDarkMode ? "#c084fc" : "#7c3aed") : (isDarkMode ? "#334155" : "#64748b"),
                    transform: active ? "scale(1.01)" : "scale(1)",
                    transition: "all 0.3s ease"
                  }}>
                    <div style={{
                      width: 20, height: 20, borderRadius: "50%", flexShrink: 0,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      border: `1px solid ${past ? (isDarkMode ? "rgba(34,197,94,0.3)" : "rgba(34,197,94,0.4)") : active ? (isDarkMode ? "rgba(139,92,246,0.4)" : "rgba(139,92,246,0.5)") : (isDarkMode ? "rgba(255,255,255,0.08)" : "rgba(148,163,184,0.2)")}`,
                      background: past ? (isDarkMode ? "rgba(34,197,94,0.1)" : "rgba(34,197,94,0.15)") : active ? (isDarkMode ? "rgba(139,92,246,0.15)" : "rgba(139,92,246,0.1)") : (isDarkMode ? "rgba(255,255,255,0.03)" : "rgba(148,163,184,0.05)"),
                      animation: active ? "spin 1s linear infinite" : "none"
                    }}>
                      {past ? <CheckCircle2 style={{ width: 11, height: 11 }} /> : <Icon style={{ width: 11, height: 11 }} />}
                    </div>
                    <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{stage.text}</span>
                    {active && <span style={{ fontSize: 8, fontWeight: 900, color: "#7c3aed", textTransform: "uppercase", letterSpacing: "0.1em" }}>Running</span>}
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          /* ── Drop Zone ── */
          <div
            className={`upload-dropzone ${isDragActive ? "drag-active" : ""} ${file ? "has-file" : ""}`}
            onDragEnter={handleDrag} onDragOver={handleDrag}
            onDragLeave={handleDrag} onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <input ref={fileInputRef} type="file" accept="audio/*" hidden onChange={handleFileChange} disabled={loading} />

            {file ? (
              /* File selected state */
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.5rem", width: "100%" }}>
                <div style={{
                  width: 56, height: 56, borderRadius: 16, display: "flex", alignItems: "center", justifyContent: "center",
                  background: isDarkMode ? "rgba(34,197,94,0.15)" : "rgba(34,197,94,0.12)", border: isDarkMode ? "1px solid rgba(34,197,94,0.3)" : "1px solid rgba(34,197,94,0.22)", color: isDarkMode ? "#4ade80" : "#16a34a",
                  marginBottom: "0.2rem"
                }}>
                  <FileAudio style={{ width: 24, height: 24 }} />
                </div>
                <span style={{ fontSize: 13, fontWeight: 800, color: isDarkMode ? "#f1f5f9" : "#1e293b", maxWidth: "100%", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {file.name}
                </span>
                <span style={{ fontSize: 10, color: isDarkMode ? "#64748b" : "#475569", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.07em" }}>
                  {(file.size / 1024).toFixed(1)} KB / 1 MB max
                </span>
                <button
                  onClick={removeFile}
                  style={{
                    display: "flex", alignItems: "center", gap: "0.35rem",
                    padding: "0.35rem 0.75rem", borderRadius: 9,
                    fontSize: 10, fontWeight: 800, cursor: "pointer",
                    background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", color: "#f87171",
                    transition: "all 0.2s ease", marginTop: "0.25rem", fontFamily: "inherit"
                  }}
                >
                  <Trash2 style={{ width: 12, height: 12 }} /> Remove
                </button>
              </div>
            ) : (
              /* Empty state — centred icon + copy */
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.6rem" }}>
                <div className="upload-icon-wrap">
                  <UploadCloud style={{ width: 26, height: 26, animation: "bounce-slow 2.5s ease-in-out infinite" }} />
                </div>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.25rem" }}>
                  <span style={{ fontSize: 13, fontWeight: 800, color: isDarkMode ? "#f1f5f9" : "#1e293b" }}>
                    Select call audio or drag &amp; drop
                  </span>
                  <span style={{ fontSize: 11, color: isDarkMode ? "#475569" : "#64748b", fontWeight: 500, lineHeight: 1.5, textAlign: "center" }}>
                    Supports MP3 · WAV · M4A · up to 1 MB
                  </span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Status messages */}
        <div style={{ minHeight: 28, display: "flex", alignItems: "center", justifyContent: "center", marginTop: "0.85rem" }}>
          {success && !loading && (
            <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", fontSize: 11, fontWeight: 800, color: isDarkMode ? "#4ade80" : "#16a34a", textTransform: "uppercase", letterSpacing: "0.08em" }}>
              <CheckCircle2 style={{ width: 14, height: 14 }} /> Compliance audit completed!
            </div>
          )}
          {error && !loading && (
            <div style={{
              display: "flex", alignItems: "center", gap: "0.5rem",
              fontSize: 11, fontWeight: 700, color: "#f87171",
              padding: "0.55rem 0.85rem", borderRadius: 10,
              background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)",
              width: "100%"
            }}>
              <AlertCircle style={{ width: 14, height: 14, flexShrink: 0 }} /> {error}
            </div>
          )}
        </div>

        {/* Submit button */}
        {!loading && (
          <button
            onClick={submit}
            disabled={!file}
            className="btn-primary"
            style={{
              width: "100%", marginTop: "0.5rem",
              padding: "0.8rem", fontSize: 11, letterSpacing: "0.1em",
              display: "flex", alignItems: "center", justifyContent: "center", gap: "0.4rem"
            }}
          >
            Begin QA Compliance Audit
            <ArrowRight style={{ width: 14, height: 14 }} />
          </button>
        )}
      </div>

      {/* ── SANDBOX SEEDER CARD (only when no audits exist) ── */}
      {!hasAudits && (
        <div style={{
          width: "100%", maxWidth: 520,
          display: "flex", alignItems: "center", gap: "1rem",
          padding: "1rem 1.25rem", borderRadius: 16,
          background: isDarkMode ? "linear-gradient(135deg,rgba(139,92,246,0.07),rgba(236,72,153,0.04),rgba(59,130,246,0.06))" : "linear-gradient(135deg,rgba(139,92,246,0.04),rgba(236,72,153,0.02),rgba(59,130,246,0.03))",
          border: isDarkMode ? "1px solid rgba(139,92,246,0.2)" : "1px solid rgba(139,92,246,0.12)",
          backdropFilter: "blur(16px)",
          boxShadow: isDarkMode ? "0 8px 32px rgba(0,0,0,0.3)" : "0 8px 32px rgba(148, 163, 184, 0.06)",
          transition: "border-color 0.3s ease"
        }}>
          <div style={{
            width: 40, height: 40, borderRadius: 12, flexShrink: 0,
            background: isDarkMode ? "rgba(139,92,246,0.1)" : "rgba(139,92,246,0.06)", border: isDarkMode ? "1px solid rgba(139,92,246,0.25)" : "1px solid rgba(139,92,246,0.15)",
            display: "flex", alignItems: "center", justifyContent: "center", color: "#a78bfa"
          }}>
            <Sparkles style={{ width: 18, height: 18 }} className="animate-pulse-slow" />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ margin: 0, fontSize: 11, fontWeight: 900, color: isDarkMode ? "#e2e8f0" : "#1e293b", marginBottom: "0.15rem" }}>
              Explore call audits instantly
            </p>
            <p style={{ margin: 0, fontSize: 10, color: isDarkMode ? "#64748b" : "#475569", fontWeight: 500, lineHeight: 1.5 }}>
              Load 3 pre-analysed audits — compliance scores, PCI alerts &amp; coaching tips.
            </p>
          </div>
          <button
            onClick={seedSampleData}
            disabled={seeding}
            style={{
              display: "flex", alignItems: "center", gap: "0.35rem",
              padding: "0.5rem 0.9rem", borderRadius: 10, flexShrink: 0,
              fontSize: 10, fontWeight: 900, cursor: seeding ? "not-allowed" : "pointer",
              opacity: seeding ? 0.55 : 1,
              background: isDarkMode ? "rgba(139,92,246,0.1)" : "rgba(139,92,246,0.06)", border: isDarkMode ? "1px solid rgba(139,92,246,0.28)" : "1px solid rgba(139,92,246,0.15)", color: isDarkMode ? "#c084fc" : "#6d28d9",
              transition: "all 0.2s ease", fontFamily: "inherit"
            }}
            onMouseEnter={e => { if (!seeding) { e.currentTarget.style.background = isDarkMode ? "rgba(139,92,246,0.2)" : "rgba(139,92,246,0.12)"; e.currentTarget.style.color = isDarkMode ? "#e9d5ff" : "#5b21b6"; } }}
            onMouseLeave={e => { e.currentTarget.style.background = isDarkMode ? "rgba(139,92,246,0.1)" : "rgba(139,92,246,0.06)"; e.currentTarget.style.color = isDarkMode ? "#c084fc" : "#6d28d9"; }}
          >
            {seeding ? (
              <svg style={{ width: 14, height: 14, animation: "spin 0.8s linear infinite" }} fill="none" viewBox="0 0 24 24">
                <circle style={{ opacity: 0.25 }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path style={{ opacity: 0.8 }} fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            ) : (
              <>Seed Sandbox <ArrowRight style={{ width: 12, height: 12 }} /></>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
