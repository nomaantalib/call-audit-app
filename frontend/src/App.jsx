import { useState, useEffect } from "react";
import axios from "axios";
import ResultCard from "./components/ResultCard";
import UploadForm from "./components/UploadForm";
import AuthForm from "./components/AuthForm";
import Sidebar from "./components/Sidebar";
import StatsCockpit from "./components/StatsCockpit";
import Header from "./components/Header";
import HeroBanner from "./components/HeroBanner";
import { useAuth } from "./context/AuthContext";
import { Smile, Meh, Frown, ArrowLeft, SlidersHorizontal, Activity } from "lucide-react";
const getBackendUrl = () => {
  if (import.meta.env.VITE_BACKEND_URL) {
    return import.meta.env.VITE_BACKEND_URL;
  }
  return "https://call-audit-app-brrj.onrender.com";
};

const backendUrl = getBackendUrl();

export default function App() {
  const { user, loading, logout } = useAuth();
  const [audit, setAudit] = useState(null);
  const [history, setHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [sentimentFilter, setSentimentFilter] = useState("ALL");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [seeding, setSeeding] = useState(false);

  useEffect(() => {
    if (user) {
      fetchHistory();
    } else {
      setHistory([]);
      setAudit(null);
    }
  }, [user]);

  const fetchHistory = async () => {
    setLoadingHistory(true);
    try {
      const { data } = await axios.get(`${backendUrl}/api/audit`);
      if (data.success && data.audits) setHistory(data.audits);
    } catch (err) {
      console.error("Failed to load audit history:", err);
    } finally {
      setLoadingHistory(false);
    }
  };

  const seedSampleData = async () => {
    setSeeding(true);
    try {
      const { data } = await axios.post(`${backendUrl}/api/audit/seed`);
      if (data.success && data.audits?.length > 0) {
        await fetchHistory();
        setAudit(data.audits[0]);
      }
    } catch (err) {
      console.error("Failed to seed:", err);
      alert(err.response?.data?.error || "Failed to seed sample audits.");
    } finally {
      setSeeding(false);
    }
  };

  const handleNewAudit = (newAudit) => {
    setAudit(newAudit);
    setHistory((prev) => {
      const exists = prev.some((i) => i._id === newAudit._id);
      return exists ? prev : [newAudit, ...prev];
    });
  };

  const formatDate = (d) => {
    if (!d) return "";
    return new Date(d).toLocaleDateString("en-US", {
      month: "short", day: "numeric",
      hour: "2-digit", minute: "2-digit",
    });
  };

  const getSentimentIcon = (sentiment) => {
    const s = sentiment?.toLowerCase() || "";
    if (s.includes("positive")) return <Smile className="w-4 h-4 text-green-400 shrink-0" />;
    if (s.includes("negative")) return <Frown className="w-4 h-4 text-red-400 shrink-0" />;
    return <Meh className="w-4 h-4 text-blue-400 shrink-0" />;
  };

  const filteredHistory = history.filter((item) => {
    const matchSearch = item.filename?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchSentiment = sentimentFilter === "ALL" || item.sentiment?.toUpperCase() === sentimentFilter;
    return matchSearch && matchSentiment;
  });

  // Analytics
  const totalAudited = history.length;
  const avgScore = history.length > 0
    ? Math.round(history.reduce((sum, i) => sum + ((i.score ?? 0) / (i.maxScore || 100)) * 100, 0) / history.length)
    : 0;
  const criticalViolations = history.reduce(
    (sum, i) => sum + (i.risks?.filter((r) => r.severity?.toUpperCase() === "HIGH").length || 0), 0
  );

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", background: "#060814", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: "1rem" }}>
        <div style={{ position: "absolute", top: "-10%", left: "10%", width: "50%", height: "50%", background: "rgba(139,92,246,0.08)", borderRadius: "50%", filter: "blur(160px)" }} />
        <Activity style={{ width: 40, height: 40, color: "#a78bfa", animation: "spin 1s linear infinite" }} />
        <p style={{ fontSize: 12, fontWeight: 700, color: "#7c3aed", textTransform: "uppercase", letterSpacing: "0.1em" }}>
          Initialising Secure Cockpit…
        </p>
      </div>
    );
  }

  if (!user) return <AuthForm />;

  return (
    <div className="dashboard-shell">
      {/* Aurora background orbs */}
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0, overflow: "hidden" }}>
        <div className="animate-pulse-slow" style={{ position: "absolute", top: "-15%", left: "-10%", width: "55%", height: "55%", background: "rgba(139,92,246,0.07)", borderRadius: "50%", filter: "blur(160px)" }} />
        <div className="animate-pulse-slow" style={{ position: "absolute", bottom: "-15%", right: "-10%", width: "55%", height: "55%", background: "rgba(236,72,153,0.05)", borderRadius: "50%", filter: "blur(140px)", animationDelay: "3s" }} />
        <div className="animate-pulse-slow" style={{ position: "absolute", top: "35%", left: "35%", width: "40%", height: "40%", background: "rgba(59,130,246,0.04)", borderRadius: "50%", filter: "blur(150px)", animationDelay: "6s" }} />
      </div>

      {/* Mobile backdrop */}
      <div className={`mobile-overlay ${sidebarOpen ? "visible" : ""}`} onClick={() => setSidebarOpen(false)} />

      {/* ── SIDEBAR ── */}
      <Sidebar
        user={user}
        logout={logout}
        audit={audit}
        setAudit={setAudit}
        filteredHistory={filteredHistory}
        loadingHistory={loadingHistory}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        sentimentFilter={sentimentFilter}
        setSentimentFilter={setSentimentFilter}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        formatDate={formatDate}
        getSentimentIcon={getSentimentIcon}
        seedSampleData={seedSampleData}
        seeding={seeding}
      />

      {/* ── STAGE (right panel) ── */}
      <div className="stage">

        {/* Sticky top header bar */}
        <div className="stage-header">
          <Header setSidebarOpen={setSidebarOpen} audit={audit} user={user} />
        </div>

        {/* Scrollable content body */}
        <div className="stage-body">
          <div className="stage-main">

            {/* ── ANALYTICS COCKPIT ── */}
            <StatsCockpit
              totalAudited={totalAudited}
              avgScore={avgScore}
              criticalViolations={criticalViolations}
            />

            {/* ── MAIN WORKSPACE ── */}
            {!audit ? (
              /* No audit selected → show upload + hero */
              <div className="upload-wrapper animate-fade-in">
                <HeroBanner />
                <UploadForm
                  onResult={handleNewAudit}
                  seedSampleData={seedSampleData}
                  seeding={seeding}
                  hasAudits={history.length > 0}
                />
              </div>
            ) : (
              /* Audit selected → show result card */
              <div className="w-full animate-fade-in" style={{ display: "flex", flexDirection: "column", gap: "1rem", width: "100%" }}>
                {/* Breadcrumb row */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "1rem" }}>
                  <button
                    onClick={() => setAudit(null)}
                    style={{
                      display: "flex", alignItems: "center", gap: "0.4rem",
                      padding: "0.45rem 0.9rem", borderRadius: 12,
                      fontSize: 11, fontWeight: 900, color: "#a78bfa",
                      background: "rgba(139,92,246,0.06)", border: "1px solid rgba(139,92,246,0.2)",
                      cursor: "pointer", transition: "all 0.2s ease", fontFamily: "inherit"
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = "rgba(139,92,246,0.12)"; }}
                    onMouseLeave={e => { e.currentTarget.style.background = "rgba(139,92,246,0.06)"; }}
                  >
                    <ArrowLeft style={{ width: 14, height: 14 }} />
                    Back to Uploader
                  </button>

                  <span style={{
                    display: "flex", alignItems: "center", gap: "0.35rem",
                    fontSize: 9, fontWeight: 900, color: "#475569",
                    textTransform: "uppercase", letterSpacing: "0.1em",
                    padding: "0.35rem 0.75rem", borderRadius: 10,
                    background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)"
                  }}>
                    <SlidersHorizontal style={{ width: 12, height: 12, color: "#7c3aed" }} />
                    Report #{audit._id?.slice(-6).toUpperCase()}
                  </span>
                </div>

                <ResultCard audit={audit} />
              </div>
            )}

            {/* Stage footer */}
            <footer style={{
              width: "100%", textAlign: "center",
              padding: "1.25rem 0 1rem",
              borderTop: "1px solid rgba(255,255,255,0.04)",
              fontSize: 10, fontWeight: 700,
              color: "rgba(255,255,255,0.08)",
              letterSpacing: "0.08em", marginTop: "auto"
            }}>
              © {new Date().getFullYear()} AI Call Auditor Pro • Premium QA Compliance Systems
            </footer>
          </div>
        </div>
      </div>
    </div>
  );
}
