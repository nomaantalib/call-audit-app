import { BarChart3, Clock, Headphones, ShieldAlert, TrendingUp } from "lucide-react";

export default function StatsCockpit({ totalAudited, avgScore, criticalViolations, isDarkMode }) {
  /* ── Score-based theming ── */
  let scoreColor   = isDarkMode ? "#f87171" : "#dc2626";
  let scoreBg      = isDarkMode ? "rgba(239,68,68,0.10)" : "rgba(239,68,68,0.05)";
  let scoreBorder  = isDarkMode ? "rgba(239,68,68,0.22)" : "rgba(239,68,68,0.12)";
  let scoreBar     = "linear-gradient(90deg,#ef4444,#f43f5e)";
  if (avgScore >= 80) {
    scoreColor  = isDarkMode ? "#4ade80" : "#16a34a";
    scoreBg     = isDarkMode ? "rgba(34,197,94,0.10)" : "rgba(34,197,94,0.05)";
    scoreBorder = isDarkMode ? "rgba(34,197,94,0.22)" : "rgba(34,197,94,0.12)";
    scoreBar    = "linear-gradient(90deg,#22c55e,#10b981)";
  } else if (avgScore >= 50) {
    scoreColor  = isDarkMode ? "#fbbf24" : "#d97706";
    scoreBg     = isDarkMode ? "rgba(245,158,11,0.10)" : "rgba(245,158,11,0.05)";
    scoreBorder = isDarkMode ? "rgba(245,158,11,0.22)" : "rgba(245,158,11,0.12)";
    scoreBar    = "linear-gradient(90deg,#f59e0b,#f97316)";
  }

  const hasViolations = criticalViolations > 0;

  return (
    <section style={{
      width: "100%",
      background: isDarkMode ? "rgba(9,14,33,0.55)" : "rgba(255, 255, 255, 0.65)",
      backdropFilter: "blur(24px)",
      WebkitBackdropFilter: "blur(24px)",
      border: isDarkMode ? "1px solid rgba(255,255,255,0.07)" : "1px solid rgba(139, 92, 246, 0.15)",
      borderRadius: 20,
      padding: "1.25rem 1.5rem",
      position: "relative",
      overflow: "hidden",
      boxShadow: isDarkMode ? "0 16px 48px rgba(0,0,0,0.45)" : "0 12px 40px rgba(148, 163, 184, 0.08)",
      transition: "all 0.3s ease"
    }}>
      {/* Decorative corner glow */}
      <div style={{ position: "absolute", top: -24, right: -24, width: 120, height: 120, background: "rgba(139,92,246,0.07)", borderRadius: "50%", filter: "blur(32px)", pointerEvents: "none" }} />

      {/* ── Section header ── */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.1rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <div style={{
            width: 28, height: 28, borderRadius: 8,
            background: "rgba(139,92,246,0.12)", border: "1px solid rgba(139,92,246,0.22)",
            display: "flex", alignItems: "center", justifyContent: "center"
          }}>
            <BarChart3 style={{ width: 14, height: 14, color: "#a78bfa" }} />
          </div>
          <span style={{ fontSize: 11, fontWeight: 900, color: isDarkMode ? "#e2e8f0" : "#334155", textTransform: "uppercase", letterSpacing: "0.1em" }}>
            QA Compliance Overview
          </span>
        </div>
        <div style={{
          display: "flex", alignItems: "center", gap: "0.35rem",
          padding: "4px 10px", borderRadius: 99,
          background: isDarkMode ? "rgba(255,255,255,0.04)" : "rgba(139, 92, 246, 0.05)",
          border: isDarkMode ? "1px solid rgba(255,255,255,0.08)" : "1px solid rgba(139, 92, 246, 0.12)",
          fontSize: 9, fontWeight: 800, color: isDarkMode ? "#64748b" : "#5b21b6",
          textTransform: "uppercase", letterSpacing: "0.08em"
        }}>
          <TrendingUp style={{ width: 11, height: 11, color: "#7c3aed" }} />
          Real-time Analytics
        </div>
      </div>

      {/* ── Metrics grid ── */}
      <div className="cockpit-grid">

        {/* Total Audits */}
        <div className="cockpit-card" style={{ borderColor: isDarkMode ? "rgba(59,130,246,0.15)" : "rgba(59,130,246,0.25)" }}>
          <div className="cockpit-card-icon" style={{ background: isDarkMode ? "rgba(59,130,246,0.1)" : "rgba(59,130,246,0.08)", border: isDarkMode ? "1px solid rgba(59,130,246,0.2)" : "1px solid rgba(59,130,246,0.15)" }}>
            <Clock style={{ width: 20, height: 20, color: "#60a5fa" }} />
          </div>
          <div className="cockpit-card-body">
            <span className="cockpit-card-label" style={{ color: isDarkMode ? "#64748b" : "#475569" }}>Total Audits</span>
            <div style={{ display: "flex", alignItems: "baseline", gap: "0.3rem" }}>
              <span className="cockpit-card-value" style={{ color: isDarkMode ? "#f1f5f9" : "#1e293b" }}>{totalAudited}</span>
              <span className="cockpit-card-sub" style={{ color: isDarkMode ? "#64748b" : "#475569" }}>records</span>
            </div>
          </div>
        </div>

        {/* Average QA Score */}
        <div className="cockpit-card" style={{ flexDirection: "column", alignItems: "flex-start", borderColor: scoreBorder, background: scoreBg }}>
          <div style={{ display: "flex", alignItems: "center", gap: "1rem", width: "100%" }}>
            <div className="cockpit-card-icon" style={{ background: "rgba(139,92,246,0.12)", border: "1px solid rgba(139,92,246,0.22)" }}>
              <Headphones style={{ width: 20, height: 20, color: "#a78bfa" }} />
            </div>
            <div className="cockpit-card-body">
              <span className="cockpit-card-label" style={{ color: isDarkMode ? "#64748b" : "#475569" }}>Average QA Score</span>
              <div style={{ display: "flex", alignItems: "baseline", gap: "0.3rem" }}>
                <span className="cockpit-card-value" style={{ color: scoreColor }}>{avgScore}</span>
                <span className="cockpit-card-sub" style={{ color: scoreColor, opacity: 0.7 }}>%</span>
              </div>
            </div>
          </div>
          {/* Progress bar */}
          <div className="score-bar-track" style={{ marginTop: "0.65rem", background: isDarkMode ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.06)" }}>
            <div className="score-bar-fill" style={{ width: `${avgScore}%`, background: scoreBar }} />
          </div>
        </div>

        {/* Critical Violations */}
        <div className="cockpit-card" style={{
          borderColor: hasViolations ? (isDarkMode ? "rgba(239,68,68,0.25)" : "rgba(220,38,38,0.3)") : (isDarkMode ? "rgba(255,255,255,0.06)" : "rgba(148,163,184,0.2)"),
          background: hasViolations ? (isDarkMode ? "rgba(239,68,68,0.07)" : "rgba(220,38,38,0.04)") : (isDarkMode ? "rgba(255,255,255,0.02)" : "rgba(148,163,184,0.02)")
        }}>
          <div className="cockpit-card-icon" style={{
            background: hasViolations ? "rgba(239,68,68,0.12)" : (isDarkMode ? "rgba(100,116,139,0.1)" : "rgba(148,163,184,0.08)"),
            border: hasViolations ? "1px solid rgba(239,68,68,0.28)" : (isDarkMode ? "1px solid rgba(100,116,139,0.2)" : "1px solid rgba(148,163,184,0.15)"),
            animation: hasViolations ? "pulse-slow 1.8s ease-in-out infinite" : "none"
          }}>
            <ShieldAlert style={{ width: 20, height: 20, color: hasViolations ? (isDarkMode ? "#f87171" : "#dc2626") : "#64748b" }} />
          </div>
          <div className="cockpit-card-body">
            <span className="cockpit-card-label" style={{ color: isDarkMode ? "#64748b" : "#475569" }}>Critical Violations</span>
            <div style={{ display: "flex", alignItems: "baseline", gap: "0.3rem" }}>
              <span className="cockpit-card-value" style={{ color: hasViolations ? (isDarkMode ? "#f87171" : "#dc2626") : (isDarkMode ? "#94a3b8" : "#475569") }}>
                {criticalViolations}
              </span>
              <span className="cockpit-card-sub" style={{ color: isDarkMode ? "#64748b" : "#475569" }}>alerts</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
