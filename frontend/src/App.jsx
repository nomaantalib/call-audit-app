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
  const [playingAudioUrl, setPlayingAudioUrl] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);

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

  const handleRenameAudit = async (id, newName) => {
    try {
      const { data } = await axios.patch(`${backendUrl}/api/audit/${id}/rename`, { filename: newName });
      if (data.success && data.audit) {
        setHistory((prev) => prev.map((item) => (item._id === id ? { ...item, filename: data.audit.filename } : item)));
        if (audit?._id === id) {
          setAudit((prev) => ({ ...prev, filename: data.audit.filename }));
        }
      }
    } catch (err) {
      console.error("Failed to rename audit:", err);
      alert(err.response?.data?.error || "Failed to rename audit.");
    }
  };

  const handleDeleteAudit = async (id) => {
    if (!window.confirm("Are you sure you want to permanently delete this audit record?")) return;
    try {
      const { data } = await axios.delete(`${backendUrl}/api/audit/${id}`);
      if (data.success) {
        setHistory((prev) => prev.filter((item) => item._id !== id));
        if (audit?._id === id) {
          setAudit(null);
        }
      }
    } catch (err) {
      console.error("Failed to delete audit:", err);
      alert(err.response?.data?.error || "Failed to delete audit.");
    }
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
        playingAudioUrl={playingAudioUrl}
        setPlayingAudioUrl={setPlayingAudioUrl}
        isPlaying={isPlaying}
        setIsPlaying={setIsPlaying}
        backendUrl={backendUrl}
        handleRenameAudit={handleRenameAudit}
        handleDeleteAudit={handleDeleteAudit}
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
                <div style={{
                  display: "flex", 
                  alignItems: "center", 
                  justifyContent: "space-between", 
                  gap: "1rem",
                  padding: "0.6rem 1rem",
                  borderRadius: "16px",
                  background: "rgba(255, 255, 255, 0.01)",
                  border: "1px solid rgba(255, 255, 255, 0.04)",
                  backdropFilter: "blur(12px)",
                  boxShadow: "inset 0 1px 0 rgba(255,255,255,0.03)"
                }}>
                  <button
                    onClick={() => {
                      setAudit(null);
                      setIsPlaying(false);
                      setPlayingAudioUrl(null);
                    }}
                    style={{
                      display: "flex", 
                      alignItems: "center", 
                      gap: "0.5rem",
                      padding: "0.5rem 1rem", 
                      borderRadius: "12px",
                      fontSize: "12px", 
                      fontWeight: 800, 
                      color: "#a78bfa",
                      background: "rgba(139, 92, 246, 0.08)", 
                      border: "1px solid rgba(139, 92, 246, 0.25)",
                      cursor: "pointer", 
                      transition: "all 0.3s cubic-bezier(0.16, 1, 0.3, 1)", 
                      fontFamily: "inherit",
                      boxShadow: "0 4px 12px rgba(139, 92, 246, 0.05)"
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.background = "rgba(139, 92, 246, 0.15)";
                      e.currentTarget.style.borderColor = "rgba(139, 92, 246, 0.4)";
                      e.currentTarget.style.transform = "translateX(-2px)";
                      e.currentTarget.style.boxShadow = "0 4px 16px rgba(139, 92, 246, 0.15), 0 0 8px rgba(167, 139, 250, 0.2)";
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.background = "rgba(139, 92, 246, 0.08)";
                      e.currentTarget.style.borderColor = "rgba(139, 92, 246, 0.25)";
                      e.currentTarget.style.transform = "translateX(0)";
                      e.currentTarget.style.boxShadow = "0 4px 12px rgba(139, 92, 246, 0.05)";
                    }}
                  >
                    <ArrowLeft style={{ width: 14, height: 14 }} />
                    Back to Uploader
                  </button>

                  <span style={{
                    display: "flex", 
                    alignItems: "center", 
                    gap: "0.4rem",
                    fontSize: "10px", 
                    fontWeight: 900, 
                    color: "#cbd5e1",
                    textTransform: "uppercase", 
                    letterSpacing: "0.12em",
                    padding: "0.4rem 0.85rem", 
                    borderRadius: "10px",
                    background: "rgba(139, 92, 246, 0.04)", 
                    border: "1px solid rgba(139, 92, 246, 0.15)",
                    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.02)"
                  }}>
                    <SlidersHorizontal style={{ width: 12, height: 12, color: "#a78bfa" }} />
                    Report #{audit._id?.slice(-6).toUpperCase()}
                  </span>
                </div>

                <ResultCard 
                  audit={audit} 
                  playingAudioUrl={playingAudioUrl}
                  setPlayingAudioUrl={setPlayingAudioUrl}
                  isPlaying={isPlaying}
                  setIsPlaying={setIsPlaying}
                  backendUrl={backendUrl}
                  handleRenameAudit={handleRenameAudit}
                  handleDeleteAudit={handleDeleteAudit}
                />
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
