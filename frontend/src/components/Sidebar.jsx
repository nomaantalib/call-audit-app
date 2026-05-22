import { 
  Headphones, X, Award, History, Search, Clock, LogOut, Sparkles, ArrowRight, Play, Pause
} from "lucide-react";

export default function Sidebar({
  user, logout, audit, setAudit,
  filteredHistory, loadingHistory,
  searchQuery, setSearchQuery,
  sentimentFilter, setSentimentFilter,
  sidebarOpen, setSidebarOpen,
  formatDate, getSentimentIcon,
  seedSampleData, seeding,
  playingAudioUrl, setPlayingAudioUrl,
  isPlaying, setIsPlaying, backendUrl
}) {
  return (
    <aside className={`sidebar ${sidebarOpen ? "open" : ""}`}>
      <div className="sidebar-inner">

        {/* ── HEADER ─────────────────────────────── */}
        <div style={{
          padding: "1.1rem 1.25rem",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexShrink: 0
        }}>
          <div
            style={{ display: "flex", alignItems: "center", gap: "0.65rem", cursor: "pointer" }}
            onClick={() => { setAudit(null); setSidebarOpen(false); }}
          >
            <div style={{
              width: 36, height: 36, borderRadius: 12, flexShrink: 0,
              background: "linear-gradient(135deg, #8b5cf6, #ec4899)",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 4px 16px rgba(139,92,246,0.35)"
            }}>
              <Headphones size={18} color="white" />
            </div>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
                <span style={{
                  fontSize: 14, fontWeight: 900,
                  background: "linear-gradient(90deg, #a78bfa, #f472b6, #818cf8)",
                  WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent"
                }}>AI Call Auditor</span>
                <span style={{
                  fontSize: 8, fontWeight: 900, padding: "1px 5px", borderRadius: 4,
                  background: "rgba(139,92,246,0.15)", color: "#c084fc",
                  border: "1px solid rgba(139,92,246,0.3)", textTransform: "uppercase", letterSpacing: "0.05em"
                }}>PRO</span>
              </div>
              <p style={{ fontSize: 9, color: "#64748b", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", margin: 0 }}>
                QA Compliance Console
              </p>
            </div>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="xl:hidden"
            style={{
              background: "none", border: "none", cursor: "pointer",
              color: "#64748b", padding: 4, borderRadius: 8,
              display: "flex", alignItems: "center", justifyContent: "center"
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* ── USER PROFILE CARD ──────────────────── */}
        <div style={{
          margin: "0.75rem 0.9rem",
          padding: "0.7rem 0.85rem",
          borderRadius: 14,
          background: "rgba(255,255,255,0.025)",
          border: "1px solid rgba(255,255,255,0.06)",
          display: "flex", alignItems: "center", gap: "0.65rem",
          flexShrink: 0
        }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10, flexShrink: 0,
            background: "rgba(139,92,246,0.12)", border: "1px solid rgba(139,92,246,0.25)",
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "#a78bfa", fontWeight: 900, fontSize: 15, textTransform: "uppercase"
          }}>
            {user?.name?.[0] || "U"}
          </div>
          <div style={{ minWidth: 0, flex: 1 }}>
            <p style={{ margin: 0, fontSize: 12, fontWeight: 800, color: "#e2e8f0", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {user?.name}
            </p>
            <p style={{ margin: 0, fontSize: 10, color: "#475569", fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {user?.email}
            </p>
          </div>
        </div>

        {/* ── NEW AUDIT BUTTON ────────────────────── */}
        <div style={{ padding: "0 0.9rem 0.75rem", flexShrink: 0 }}>
          <button
            onClick={() => { setAudit(null); setSidebarOpen(false); }}
            style={{
              width: "100%", padding: "0.55rem 1rem",
              borderRadius: 12, fontSize: 12, fontWeight: 800,
              display: "flex", alignItems: "center", justifyContent: "center", gap: "0.45rem",
              cursor: !audit ? "default" : "pointer",
              border: !audit ? "1px solid rgba(139,92,246,0.4)" : "1px solid rgba(255,255,255,0.08)",
              background: !audit ? "rgba(139,92,246,0.12)" : "rgba(255,255,255,0.03)",
              color: !audit ? "#c084fc" : "#94a3b8",
              transition: "all 0.2s ease"
            }}
          >
            <Award size={14} style={{ color: "#a78bfa" }} />
            Start New Call Audit
          </button>
        </div>

        {/* ── FILTERS SECTION ─────────────────────── */}
        <div style={{
          padding: "0 0.9rem 0.75rem",
          borderBottom: "1px solid rgba(255,255,255,0.05)",
          flexShrink: 0
        }}>
          {/* Title row */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.5rem" }}>
            <span style={{ display: "flex", alignItems: "center", gap: "0.35rem", fontSize: 10, fontWeight: 900, color: "#a78bfa", textTransform: "uppercase", letterSpacing: "0.08em" }}>
              <History size={12} /> Audit Log
            </span>
            <span style={{
              fontSize: 9, fontWeight: 900, padding: "1px 7px", borderRadius: 99,
              background: "rgba(139,92,246,0.12)", color: "#c084fc", border: "1px solid rgba(139,92,246,0.2)"
            }}>
              {filteredHistory.length}
            </span>
          </div>

          {/* Search */}
          <div style={{ position: "relative", marginBottom: "0.5rem" }}>
            <Search size={13} style={{ position: "absolute", left: 9, top: "50%", transform: "translateY(-50%)", color: "#475569" }} />
            <input
              type="text"
              placeholder="Search records..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: "100%", paddingLeft: 28, paddingRight: 10, paddingTop: 7, paddingBottom: 7,
                borderRadius: 10, fontSize: 11, fontWeight: 500,
                background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)",
                color: "#e2e8f0", outline: "none", fontFamily: "inherit", boxSizing: "border-box"
              }}
            />
          </div>

          {/* Filter pills */}
          <div style={{ display: "flex", gap: 3, background: "rgba(255,255,255,0.015)", borderRadius: 9, padding: 3, border: "1px solid rgba(255,255,255,0.05)" }}>
            {["ALL", "POSITIVE", "NEUTRAL", "NEGATIVE"].map((s) => (
              <button
                key={s}
                onClick={() => setSentimentFilter(s)}
                style={{
                  flex: 1, padding: "5px 0", borderRadius: 7,
                  fontSize: 9, fontWeight: 800, textTransform: "uppercase",
                  letterSpacing: "0.05em", cursor: "pointer", border: "none",
                  background: sentimentFilter === s ? "rgba(139,92,246,0.22)" : "transparent",
                  color: sentimentFilter === s ? "#c084fc" : "#475569",
                  boxShadow: sentimentFilter === s ? "0 0 8px rgba(139,92,246,0.15)" : "none",
                  transition: "all 0.2s ease"
                }}
              >
                {s === "ALL" ? "All" : s === "POSITIVE" ? "Pos" : s === "NEUTRAL" ? "Neu" : "Neg"}
              </button>
            ))}
          </div>
        </div>

        {/* ── AUDIT HISTORY LIST ──────────────────── */}
        <div className="sidebar-list">
          {loadingHistory ? (
            <div style={{ textAlign: "center", padding: "3rem 0", color: "#475569", fontSize: 11 }}>
              <svg style={{ width: 20, height: 20, animation: "spin 0.8s linear infinite", margin: "0 auto 8px" }} fill="none" viewBox="0 0 24 24">
                <circle style={{ opacity: 0.25 }} cx="12" cy="12" r="10" stroke="#a78bfa" strokeWidth="4" />
                <path style={{ opacity: 0.8 }} fill="#a78bfa" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Querying secure ledger...
            </div>
          ) : filteredHistory.length === 0 ? (
            <div style={{
              display: "flex", flexDirection: "column", alignItems: "center",
              padding: "1.5rem 0.75rem", gap: "0.75rem",
              border: "1px dashed rgba(139,92,246,0.15)", borderRadius: 12,
              margin: "0.25rem 0"
            }}>
              <div style={{
                width: 40, height: 40, borderRadius: 12,
                background: "rgba(139,92,246,0.08)", border: "1px solid rgba(139,92,246,0.2)",
                display: "flex", alignItems: "center", justifyContent: "center",
                color: "#a78bfa"
              }}>
                <Sparkles size={18} />
              </div>
              <div style={{ textAlign: "center" }}>
                <p style={{ margin: 0, fontSize: 11, fontWeight: 800, color: "#94a3b8" }}>
                  No audit records yet
                </p>
                <p style={{ margin: "0.25rem 0 0", fontSize: 9, color: "#334155", lineHeight: 1.5, fontWeight: 600 }}>
                  Upload audio or load sample data to get started
                </p>
              </div>
              {seedSampleData && (
                <button
                  onClick={seedSampleData}
                  disabled={seeding}
                  style={{
                    display: "flex", alignItems: "center", gap: "0.35rem",
                    padding: "0.45rem 0.85rem", borderRadius: 10,
                    fontSize: 10, fontWeight: 800, cursor: seeding ? "not-allowed" : "pointer",
                    opacity: seeding ? 0.5 : 1,
                    background: "rgba(139,92,246,0.1)", border: "1px solid rgba(139,92,246,0.25)",
                    color: "#c084fc", transition: "all 0.2s ease", fontFamily: "inherit"
                  }}
                  onMouseEnter={e => { if (!seeding) e.currentTarget.style.background = "rgba(139,92,246,0.18)"; }}
                  onMouseLeave={e => { if (!seeding) e.currentTarget.style.background = "rgba(139,92,246,0.1)"; }}
                >
                  {seeding ? (
                    <>
                      <svg style={{ width: 12, height: 12, animation: "spin 0.8s linear infinite" }} fill="none" viewBox="0 0 24 24">
                        <circle style={{ opacity: 0.25 }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path style={{ opacity: 0.8 }} fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Seeding...
                    </>
                  ) : (
                    <>
                      <Sparkles size={11} />
                      Load Sandbox Samples
                      <ArrowRight size={10} />
                    </>
                  )}
                </button>
              )}
            </div>
          ) : (
            filteredHistory.map((item) => {
              const pct = Math.round(((item.score ?? 0) / (item.maxScore || 100)) * 100);
              const isSelected = audit?._id === item._id;
              const isCurrentItemPlaying = playingAudioUrl === item.audioUrl && isPlaying;

              let glowClass = "active-audit-glow-red";
              let scoreColor = "#f87171";
              if (pct >= 80) { glowClass = "active-audit-glow-green"; scoreColor = "#4ade80"; }
              else if (pct >= 50) { glowClass = "active-audit-glow-amber"; scoreColor = "#fbbf24"; }

              const s = item.sentiment?.toLowerCase() || "";
              let badgeClass = "sentiment-badge sentiment-badge-neutral";
              if (s.includes("positive")) badgeClass = "sentiment-badge sentiment-badge-positive";
              if (s.includes("negative")) badgeClass = "sentiment-badge sentiment-badge-negative";

              const handlePlaybackToggle = (e) => {
                e.stopPropagation();
                if (!item.audioUrl) return;
                
                if (audit?._id === item._id) {
                  setIsPlaying(!isPlaying);
                } else {
                  setAudit(item);
                  setPlayingAudioUrl(item.audioUrl);
                  setIsPlaying(true);
                }
              };

              return (
                <div
                  key={item._id}
                  onClick={() => { setAudit(item); setSidebarOpen(false); }}
                  className={isSelected ? glowClass : ""}
                  style={{
                    padding: "0.65rem 0.75rem",
                    borderRadius: 12,
                    border: `1px solid ${isSelected ? "transparent" : "rgba(255,255,255,0.06)"}`,
                    background: isSelected ? undefined : "rgba(255,255,255,0.015)",
                    cursor: "pointer",
                    display: "flex", flexDirection: "column", gap: "0.35rem",
                    transition: "all 0.2s ease",
                    flexShrink: 0
                  }}
                  onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = "rgba(255,255,255,0.04)"; }}
                  onMouseLeave={e => { if (!isSelected) e.currentTarget.style.background = "rgba(255,255,255,0.015)"; }}
                >
                  {/* Filename + sentiment icon */}
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 6 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, minWidth: 0, flex: 1 }}>
                      {isCurrentItemPlaying && (
                        <div style={{ display: "flex", alignItems: "end", gap: "2px", height: "12px", width: "12px", shrink: 0, paddingBottom: "2px" }}>
                          {[1, 2, 3].map((_, i) => (
                            <span
                              key={i}
                              className="waveform-bar"
                              style={{
                                width: "2px",
                                height: "100%",
                                background: "#c084fc",
                                borderRadius: "99px",
                              }}
                            />
                          ))}
                        </div>
                      )}
                      <span style={{
                        fontSize: 11,
                        fontWeight: 800,
                        color: isCurrentItemPlaying ? "#c084fc" : "#cbd5e1",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        flex: 1
                      }}>
                        {item.filename}
                      </span>
                    </div>
                    {getSentimentIcon(item.sentiment)}
                  </div>

                  {/* Date + Score */}
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 9, color: "#475569" }}>
                    <span>{formatDate(item.createdAt)}</span>
                    <span style={{ fontWeight: 700, color: scoreColor }}>{pct}%</span>
                  </div>

                  {/* Score bar */}
                  <div style={{ height: 2, borderRadius: 99, background: "rgba(255,255,255,0.06)", overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${pct}%`, background: scoreColor, borderRadius: 99, transition: "width 0.5s ease" }} />
                  </div>

                  {/* Sentiment badge + duration */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span className={badgeClass}>{item.sentiment || "Neutral"}</span>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <span style={{ display: "flex", alignItems: "center", gap: 3, fontSize: 9, color: "#334155" }}>
                        <Clock size={9} style={{ color: "#6d28d9" }} />
                        {(() => {
                          const dur = item.duration || (item.utterances && item.utterances.length > 0 ? item.utterances[item.utterances.length - 1].end : 0);
                          return dur ? `${Math.round(dur)}s` : "N/A";
                        })()}
                      </span>
                      {item.audioUrl && (
                        <button
                          onClick={handlePlaybackToggle}
                          style={{
                            background: isCurrentItemPlaying ? "rgba(139,92,246,0.2)" : "rgba(255,255,255,0.05)",
                            border: isCurrentItemPlaying ? "1px solid rgba(139,92,246,0.4)" : "1px solid rgba(255,255,255,0.1)",
                            borderRadius: "50%",
                            width: "18px",
                            height: "18px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            cursor: "pointer",
                            color: isCurrentItemPlaying ? "#c084fc" : "#94a3b8",
                            transition: "all 0.2s ease"
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = "rgba(139,92,246,0.3)";
                            e.currentTarget.style.color = "#ffffff";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = isCurrentItemPlaying ? "rgba(139,92,246,0.2)" : "rgba(255,255,255,0.05)";
                            e.currentTarget.style.color = isCurrentItemPlaying ? "#c084fc" : "#94a3b8";
                          }}
                        >
                          {isCurrentItemPlaying ? (
                            <Pause size={8} style={{ fill: "currentColor" }} />
                          ) : (
                            <Play size={8} style={{ fill: "currentColor", marginLeft: "1px" }} />
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* ── LOGOUT FOOTER ───────────────────────── */}
        <div style={{
          padding: "0.75rem 0.9rem",
          borderTop: "1px solid rgba(255,255,255,0.05)",
          background: "rgba(4,6,13,0.7)",
          flexShrink: 0
        }}>
          <button
            onClick={logout}
            style={{
              width: "100%", padding: "0.55rem",
              borderRadius: 12, fontSize: 12, fontWeight: 800,
              display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem",
              cursor: "pointer",
              background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)",
              color: "#f87171", transition: "all 0.2s ease", fontFamily: "inherit"
            }}
            onMouseEnter={e => { e.currentTarget.style.background = "rgba(239,68,68,0.15)"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "rgba(239,68,68,0.08)"; }}
          >
            <LogOut size={14} />
            Secure Log Out
          </button>
        </div>

      </div>
    </aside>
  );
}
