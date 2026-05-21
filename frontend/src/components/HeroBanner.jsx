import { Award, Sparkles } from "lucide-react";

export default function HeroBanner() {
  return (
    <div className="hero-banner">
      {/* Badge */}
      <div style={{
        display: "inline-flex", alignItems: "center", gap: "0.4rem",
        padding: "0.35rem 0.9rem", borderRadius: 99,
        background: "rgba(139,92,246,0.1)", border: "1px solid rgba(139,92,246,0.22)",
        fontSize: 9, fontWeight: 900, color: "#c084fc",
        textTransform: "uppercase", letterSpacing: "0.1em",
        marginBottom: "0.9rem",
        boxShadow: "0 4px 16px rgba(139,92,246,0.1)"
      }}>
        <Award style={{ width: 12, height: 12 }} className="animate-pulse-slow" />
        Gemini Pro Compliance Sandbox
        <Sparkles style={{ width: 11, height: 11, color: "#ec4899" }} />
      </div>

      {/* Headline */}
      <h2 style={{
        fontSize: "clamp(22px, 3vw, 32px)",
        fontWeight: 900,
        letterSpacing: "-0.5px",
        lineHeight: 1.15,
        margin: "0 0 0.75rem",
        background: "linear-gradient(135deg, #ffffff 30%, #a78bfa 70%, #60a5fa 100%)",
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
        textAlign: "center"
      }}>
        Intelligent Audio<br />Compliance Auditing
      </h2>

      {/* Subtitle */}
      <p style={{
        fontSize: 12,
        color: "#475569",
        lineHeight: 1.7,
        fontWeight: 500,
        maxWidth: 420,
        textAlign: "center",
        marginBottom: 0
      }}>
        Deploy advanced AI to extract compliance checkmarks, identify regulatory risks,
        score calls objectively, and produce custom coaching templates automatically.
      </p>
    </div>
  );
}
