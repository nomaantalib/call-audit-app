import { BarChart3, Clock, Headphones, ShieldAlert, TrendingUp } from "lucide-react";

export default function StatsCockpit({ totalAudited, avgScore, criticalViolations }) {
  /* ── Score-based theming ── */
  let scoreColor   = "#f87171";
  let scoreBg      = "rgba(239,68,68,0.10)";
  let scoreBorder  = "rgba(239,68,68,0.22)";
  let scoreBar     = "linear-gradient(90deg,#ef4444,#f43f5e)";
  if (avgScore >= 80) {
    scoreColor  = "#4ade80";
    scoreBg     = "rgba(34,197,94,0.10)";
    scoreBorder = "rgba(34,197,94,0.22)";
    scoreBar    = "linear-gradient(90deg,#22c55e,#10b981)";
  } else if (avgScore >= 50) {
    scoreColor  = "#fbbf24";
    scoreBg     = "rgba(245,158,11,0.10)";
    scoreBorder = "rgba(245,158,11,0.22)";
    scoreBar    = "linear-gradient(90deg,#f59e0b,#f97316)";
  }

  const hasViolations = criticalViolations > 0;

  return (
    <section style={{
      width: "100%",
      background: "rgba(9,14,33,0.55)",
      backdropFilter: "blur(24px)",
      WebkitBackdropFilter: "blur(24px)",
      border: "1px solid rgba(255,255,255,0.07)",
      borderRadius: 20,
      padding: "1.25rem 1.5rem",
      position: "relative",
      overflow: "hidden",
      boxShadow: "0 16px 48px rgba(0,0,0,0.45)"
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
          <span style={{ fontSize: 11, fontWeight: 900, color: "#e2e8f0", textTransform: "uppercase", letterSpacing: "0.1em" }}>
            QA Compliance Overview
          </span>
        </div>
        <div style={{
          display: "flex", alignItems: "center", gap: "0.35rem",
          padding: "4px 10px", borderRadius: 99,
          background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
          fontSize: 9, fontWeight: 800, color: "#64748b",
          textTransform: "uppercase", letterSpacing: "0.08em"
        }}>
          <TrendingUp style={{ width: 11, height: 11, color: "#7c3aed" }} />
          Real-time Analytics
        </div>
      </div>

      {/* ── Metrics grid ── */}
      <div className="cockpit-grid">

        {/* Total Audits */}
        <div className="cockpit-card" style={{ borderColor: "rgba(59,130,246,0.15)" }}>
          <div className="cockpit-card-icon" style={{ background: "rgba(59,130,246,0.1)", border: "1px solid rgba(59,130,246,0.2)" }}>
            <Clock style={{ width: 20, height: 20, color: "#60a5fa" }} />
          </div>
          <div className="cockpit-card-body">
            <span className="cockpit-card-label">Total Audits</span>
            <div style={{ display: "flex", alignItems: "baseline", gap: "0.3rem" }}>
              <span className="cockpit-card-value" style={{ color: "#f1f5f9" }}>{totalAudited}</span>
              <span className="cockpit-card-sub">records</span>
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
              <span className="cockpit-card-label">Average QA Score</span>
              <div style={{ display: "flex", alignItems: "baseline", gap: "0.3rem" }}>
                <span className="cockpit-card-value" style={{ color: scoreColor }}>{avgScore}</span>
                <span className="cockpit-card-sub" style={{ color: scoreColor, opacity: 0.7 }}>%</span>
              </div>
            </div>
          </div>
          {/* Progress bar */}
          <div className="score-bar-track" style={{ marginTop: "0.65rem" }}>
            <div className="score-bar-fill" style={{ width: `${avgScore}%`, background: scoreBar }} />
          </div>
        </div>

        {/* Critical Violations */}
        <div className="cockpit-card" style={{
          borderColor: hasViolations ? "rgba(239,68,68,0.25)" : "rgba(255,255,255,0.06)",
          background: hasViolations ? "rgba(239,68,68,0.07)" : "rgba(255,255,255,0.02)"
        }}>
          <div className="cockpit-card-icon" style={{
            background: hasViolations ? "rgba(239,68,68,0.12)" : "rgba(100,116,139,0.1)",
            border: hasViolations ? "1px solid rgba(239,68,68,0.28)" : "1px solid rgba(100,116,139,0.2)",
            animation: hasViolations ? "pulse-slow 1.8s ease-in-out infinite" : "none"
          }}>
            <ShieldAlert style={{ width: 20, height: 20, color: hasViolations ? "#f87171" : "#64748b" }} />
          </div>
          <div className="cockpit-card-body">
            <span className="cockpit-card-label">Critical Violations</span>
            <div style={{ display: "flex", alignItems: "baseline", gap: "0.3rem" }}>
              <span className="cockpit-card-value" style={{ color: hasViolations ? "#f87171" : "#94a3b8" }}>
                {criticalViolations}
              </span>
              <span className="cockpit-card-sub">alerts</span>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
