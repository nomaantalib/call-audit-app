import { Menu, Activity, Award, Zap } from "lucide-react";

export default function Header({ setSidebarOpen, audit, user }) {
  return (
    <header style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "0 1.5rem",
      height: 56,
      flexShrink: 0,
      background: "rgba(6,9,20,0.85)",
      backdropFilter: "blur(20px)",
      WebkitBackdropFilter: "blur(20px)",
      borderBottom: "1px solid rgba(255,255,255,0.05)",
      boxShadow: "0 2px 20px rgba(0,0,0,0.3)",
      position: "sticky",
      top: 0,
      zIndex: 30
    }}>
      {/* LEFT: hamburger + breadcrumb */}
      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
        {/* Hamburger — visible on mobile only via CSS */}
        <button
          onClick={() => setSidebarOpen(true)}
          className="xl:hidden"
          style={{
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 10, padding: "6px 8px",
            cursor: "pointer", color: "#94a3b8",
            display: "flex", alignItems: "center", justifyContent: "center"
          }}
        >
          <Menu size={18} />
        </button>

        {/* Breadcrumb */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <span style={{ fontSize: 11, color: "#334155", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em" }}>
            Dashboard /
          </span>
          <span style={{
            display: "flex", alignItems: "center", gap: "0.3rem",
            fontSize: 11, fontWeight: 800, color: "#a78bfa",
            textTransform: "uppercase", letterSpacing: "0.07em"
          }}>
            {audit
              ? <><Activity size={13} style={{ color: "#a78bfa" }} /> Audit Assessment</>
              : <><Award size={13} style={{ color: "#a78bfa" }} /> Call Auditor Stage</>
            }
          </span>
        </div>
      </div>

      {/* RIGHT: status + user */}
      <div style={{ display: "flex", alignItems: "center", gap: "0.85rem" }}>
        {/* Live indicator */}
        <div style={{
          display: "flex", alignItems: "center", gap: "0.4rem",
          padding: "4px 10px", borderRadius: 99,
          background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.18)",
          fontSize: 9, fontWeight: 900, color: "#4ade80",
          textTransform: "uppercase", letterSpacing: "0.08em"
        }}>
          <span style={{
            width: 6, height: 6, borderRadius: "50%",
            background: "#4ade80",
            boxShadow: "0 0 6px #4ade80",
            animation: "pulse-slow 2s ease infinite"
          }} />
          Live
        </div>

        {/* Gemini badge */}
        <div style={{
          display: "flex", alignItems: "center", gap: "0.35rem",
          padding: "4px 10px", borderRadius: 99,
          background: "rgba(139,92,246,0.08)", border: "1px solid rgba(139,92,246,0.18)",
          fontSize: 9, fontWeight: 900, color: "#c084fc",
          textTransform: "uppercase", letterSpacing: "0.08em"
        }}>
          <Zap size={10} />
          Advanced
        </div>

        {/* User info */}
        <div style={{ textAlign: "right", lineHeight: 1.3 }}>
          <p style={{ margin: 0, fontSize: 11, fontWeight: 800, color: "#e2e8f0" }}>{user?.name}</p>
          <p style={{ margin: 0, fontSize: 9, color: "#475569", fontWeight: 600 }}>{user?.email}</p>
        </div>
      </div>
    </header>
  );
}
