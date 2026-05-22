import { Menu, Activity, Award, Zap, Sun, Moon } from "lucide-react";

export default function Header({ setSidebarOpen, audit, user, isDarkMode, setIsDarkMode }) {
  return (
    <header style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "0 1.5rem",
      height: 56,
      flexShrink: 0,
      background: isDarkMode ? "rgba(6,9,20,0.85)" : "rgba(255,255,255,0.85)",
      backdropFilter: "blur(20px)",
      WebkitBackdropFilter: "blur(20px)",
      borderBottom: isDarkMode ? "1px solid rgba(255,255,255,0.05)" : "1px solid rgba(139,92,246,0.12)",
      boxShadow: isDarkMode ? "0 2px 20px rgba(0,0,0,0.3)" : "0 2px 20px rgba(148,163,184,0.06)",
      position: "sticky",
      top: 0,
      zIndex: 30,
      transition: "background-color 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease"
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
          <span style={{ fontSize: 11, color: isDarkMode ? "#334155" : "#64748b", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em" }}>
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

        {/* Theme Toggle Button */}
        <button
          onClick={() => setIsDarkMode(!isDarkMode)}
          style={{
            background: isDarkMode ? "rgba(255, 255, 255, 0.03)" : "rgba(139, 92, 246, 0.06)",
            border: isDarkMode ? "1px solid rgba(255, 255, 255, 0.08)" : "1px solid rgba(139, 92, 246, 0.18)",
            borderRadius: "10px",
            width: "28px",
            height: "28px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            color: isDarkMode ? "#f1f5f9" : "#8b5cf6",
            transition: "all 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
            boxShadow: isDarkMode ? "none" : "0 2px 8px rgba(139, 92, 246, 0.08)"
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = isDarkMode ? "rgba(255, 255, 255, 0.08)" : "rgba(139, 92, 246, 0.12)";
            e.currentTarget.style.borderColor = isDarkMode ? "rgba(255, 255, 255, 0.15)" : "rgba(139, 92, 246, 0.3)";
            e.currentTarget.style.transform = "scale(1.05)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = isDarkMode ? "rgba(255, 255, 255, 0.03)" : "rgba(139, 92, 246, 0.06)";
            e.currentTarget.style.borderColor = isDarkMode ? "rgba(255, 255, 255, 0.08)" : "rgba(139, 92, 246, 0.18)";
            e.currentTarget.style.transform = "scale(1)";
          }}
          title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
        >
          {isDarkMode ? (
            <Sun className="w-[14px] h-[14px] text-amber-400 animate-pulse-slow" />
          ) : (
            <Moon className="w-[14px] h-[14px] text-purple-600" />
          )}
        </button>

        {/* User info */}
        <div style={{ textAlign: "right", lineHeight: 1.3 }}>
          <p style={{ margin: 0, fontSize: 11, fontWeight: 800, color: isDarkMode ? "#e2e8f0" : "#0f172a" }}>{user?.name}</p>
          <p style={{ margin: 0, fontSize: 9, color: isDarkMode ? "#475569" : "#64748b", fontWeight: 600 }}>{user?.email}</p>
        </div>
      </div>
    </header>
  );
}
