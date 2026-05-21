import { useState, useEffect } from "react";
import axios from "axios";
import ResultCard from "./components/ResultCard";
import UploadForm from "./components/UploadForm";
import { useAuth } from "./context/AuthContext";
import AuthForm from "./components/AuthForm";
import { 
  History, Headphones, Calendar, Smile, Meh, Frown, 
  Search, Award, ChevronRight, Activity, BarChart3, 
  ArrowLeft, SlidersHorizontal, ShieldAlert, Clock,
  LogOut, Menu, X
} from "lucide-react";

export default function App() {
  const { user, loading, logout } = useAuth();
  const [audit, setAudit] = useState(null);
  const [history, setHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [sentimentFilter, setSentimentFilter] = useState("ALL");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Fetch past audits on user mount/change
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
      const backendUrl = import.meta.env.VITE_BACKEND_URL || "";
      const { data } = await axios.get(`${backendUrl}/api/audit`);
      if (data.success && data.audits) {
        setHistory(data.audits);
      }
    } catch (error) {
      console.error("Failed to load audit history:", error);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleNewAudit = (newAudit) => {
    setAudit(newAudit);
    // Prepend new audit to history if it doesn't already exist
    setHistory((prev) => {
      const exists = prev.some((item) => item._id === newAudit._id);
      if (exists) return prev;
      return [newAudit, ...prev];
    });
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getSentimentIcon = (sentiment) => {
    const s = sentiment?.toLowerCase() || "";
    if (s.includes("positive")) return <Smile className="w-4 h-4 text-green-400 shrink-0" />;
    if (s.includes("negative")) return <Frown className="w-4 h-4 text-red-400 shrink-0" />;
    return <Meh className="w-4 h-4 text-blue-400 shrink-0" />;
  };

  // Filtered History
  const filteredHistory = history.filter((item) => {
    const matchesSearch = item.filename?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSentiment = 
      sentimentFilter === "ALL" || 
      item.sentiment?.toUpperCase() === sentimentFilter;
    return matchesSearch && matchesSentiment;
  });

  // Calculate dynamic analytics from history
  const totalAudited = history.length;
  
  const avgScore = history.length > 0
    ? Math.round(
        history.reduce((sum, item) => {
          const score = item.score ?? 0;
          const max = item.maxScore || 100;
          return sum + (score / max) * 100;
        }, 0) / history.length
      )
    : 0;

  const criticalViolations = history.reduce((sum, item) => {
    const highRisks = item.risks?.filter((r) => r.severity?.toUpperCase() === "HIGH").length || 0;
    return sum + highRisks;
  }, 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#060814] flex flex-col items-center justify-center text-slate-100 font-sans relative overflow-hidden">
        {/* Decorative ambient glowing orbs */}
        <div className="absolute top-[-10%] left-[10%] w-[50%] h-[50%] bg-purple-600/10 rounded-full blur-[160px] animate-pulse-slow"></div>
        <div className="absolute bottom-[-10%] right-[10%] w-[50%] h-[50%] bg-pink-600/8 rounded-full blur-[140px] animate-pulse-slow"></div>
        
        <div className="relative z-10 flex flex-col items-center gap-4 animate-pulse">
          <Activity className="w-12 h-12 text-purple-400 animate-spin" />
          <p className="text-sm font-semibold tracking-wider text-purple-300 uppercase">Configuring Secure Cockpit...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <AuthForm />;
  }

  return (
    <div className="min-h-screen bg-[#060814] text-slate-100 relative overflow-hidden selection:bg-purple-500 selection:text-white flex font-sans">
      
      {/* Premium Aurora Background Lights (Fixed behind everything) */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-purple-600/10 rounded-full blur-[160px] animate-pulse-slow"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-pink-600/8 rounded-full blur-[140px] animate-pulse-slow" style={{ animationDelay: "3s" }}></div>
        <div className="absolute top-[30%] left-[30%] w-[40%] h-[40%] bg-blue-600/6 rounded-full blur-[150px] animate-pulse-slow" style={{ animationDelay: "6s" }}></div>
      </div>

      {/* MOBILE BACKDROP OVERLAY */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 xl:hidden transition-all duration-300"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* LEFT SIDEBAR (STICKY GLASS PANEL) */}
      <aside 
        className={`fixed inset-y-0 left-0 w-80 sidebar-glass flex flex-col z-40 transform transition-transform duration-300 ease-out xl:translate-x-0 xl:static xl:h-screen xl:w-80 shrink-0
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        {/* Sidebar Header branding */}
        <div className="p-5 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => { setAudit(null); setSidebarOpen(false); }}>
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-500 via-indigo-500 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/20 border border-purple-400/20 transform hover:scale-105 transition-all">
              <Headphones className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="text-base font-black bg-gradient-to-r from-purple-400 via-pink-400 to-indigo-300 bg-clip-text text-transparent tracking-tight">
                  AI Call Auditor
                </h1>
                <span className="text-[8px] font-black uppercase px-1 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">PRO</span>
              </div>
              <p className="text-[9px] text-gray-400 uppercase tracking-widest font-bold">QA Compliance Console</p>
            </div>
          </div>

          {/* Close Sidebar Button (Only Mobile View) */}
          <button 
            onClick={() => setSidebarOpen(false)}
            className="xl:hidden p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* USER PROFILE CARD */}
        <div className="p-4 mx-4 my-3 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-300 font-black text-sm uppercase shadow-inner">
            {user?.name ? user.name[0] : "U"}
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-xs font-black text-slate-200 truncate">{user?.name}</h4>
            <p className="text-[10px] text-gray-500 font-semibold truncate">{user?.email}</p>
          </div>
        </div>

        {/* QUICK NEW AUDIT ACTION BUTTON */}
        <div className="px-4 mb-3">
          <button
            onClick={() => {
              setAudit(null);
              setSidebarOpen(false);
            }}
            className={`w-full py-2.5 px-4 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 border shadow-sm
              ${!audit 
                ? "bg-purple-500/10 text-purple-300 border-purple-500/30 shadow-purple-500/5 cursor-default" 
                : "bg-white/[0.02] hover:bg-white/[0.04] text-slate-200 border-white/5 hover:border-white/10 active:scale-[0.98]"}`}
          >
            <Award className="w-4 h-4 text-purple-400 animate-pulse" />
            <span>Start New Call Audit</span>
          </button>
        </div>

        {/* AUDIT LOG DATABASE TITLE & FILTERS */}
        <div className="px-4 pb-2 border-b border-white/5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-black uppercase tracking-wider text-purple-400 flex items-center gap-1.5">
              <History className="w-3.5 h-3.5 text-purple-400" /> Audit Log Database
            </span>
            <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-purple-500/10 text-purple-300 border border-purple-500/20">
              {filteredHistory.length}
            </span>
          </div>

          {/* Search bar inside sidebar */}
          <div className="relative mb-2">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500" />
            <input
              type="text"
              placeholder="Search call records..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-white/[0.02] border border-white/5 text-[11px] font-medium placeholder-gray-600 focus:outline-none focus:border-purple-500/40 focus:bg-white/[0.04] transition-all text-slate-200"
            />
          </div>

          {/* Filter Pills inside sidebar */}
          <div className="flex gap-1 p-0.5 bg-white/[0.01] border border-white/5 rounded-lg text-[9px] font-black justify-between">
            {["ALL", "POSITIVE", "NEUTRAL", "NEGATIVE"].map((sent) => (
              <button
                key={sent}
                onClick={() => setSentimentFilter(sent)}
                className={`px-2 py-1 rounded-md transition-all uppercase flex-1 text-center
                  ${sentimentFilter === sent 
                    ? "bg-purple-500/20 text-purple-300 border border-purple-500/20 font-bold" 
                    : "text-gray-400 hover:text-white"}`}
              >
                {sent === "ALL" ? "All" : sent === "POSITIVE" ? "Pos" : sent === "NEUTRAL" ? "Neu" : "Neg"}
              </button>
            ))}
          </div>
        </div>

        {/* SCROLLABLE PREVIOUS RECORDINGS LIST */}
        <div className="flex-1 overflow-y-auto sidebar-scroll p-4 space-y-3">
          {loadingHistory ? (
            <div className="py-12 text-center text-[10px] text-gray-500 flex flex-col items-center justify-center gap-2">
              <Activity className="w-5 h-5 text-purple-400 animate-spin" />
              <span>Querying secure ledger...</span>
            </div>
          ) : filteredHistory.length === 0 ? (
            <div className="py-12 text-center text-[10px] text-gray-500 border border-dashed border-white/5 rounded-xl bg-white/[0.005]">
              No call reports found.
            </div>
          ) : (
            filteredHistory.map((item) => {
              const itemScore = item.score ?? 0;
              const itemMax = item.maxScore || 100;
              const itemPct = Math.round((itemScore / itemMax) * 100);
              const isSelected = audit?._id === item._id;
              
              let scoreColor = "text-red-400";
              let activeGlowClass = "active-audit-glow-red";
              if (itemPct >= 80) {
                scoreColor = "text-green-400";
                activeGlowClass = "active-audit-glow-green";
              } else if (itemPct >= 50) {
                scoreColor = "text-amber-400";
                activeGlowClass = "active-audit-glow-amber";
              }

              let sentimentClass = "sentiment-badge-neutral";
              const s = item.sentiment?.toLowerCase() || "";
              if (s.includes("positive")) sentimentClass = "sentiment-badge-positive";
              if (s.includes("negative")) sentimentClass = "sentiment-badge-negative";

              return (
                <div
                  key={item._id}
                  onClick={() => {
                    setAudit(item);
                    setSidebarOpen(false);
                  }}
                  className={`p-3 rounded-xl border transition-all duration-350 cursor-pointer flex flex-col gap-2 relative overflow-hidden group hover:scale-[1.01]
                    ${isSelected 
                      ? activeGlowClass
                      : "bg-white/[0.01] border-white/5 hover:bg-white/[0.03] hover:border-purple-500/20"}`}
                >
                  <div className="flex items-start justify-between gap-2 relative z-10">
                    <span className="text-[11px] font-black text-slate-200 truncate max-w-[170px] group-hover:text-purple-300 transition-colors">
                      {item.filename}
                    </span>
                    {getSentimentIcon(item.sentiment)}
                  </div>
                  
                  <div className="flex justify-between items-center text-[9px] relative z-10">
                    <span className="text-gray-500 font-semibold">{formatDate(item.createdAt)}</span>
                    <span className="font-bold flex items-center gap-1">
                      Score: <span className={`${scoreColor} font-mono`}>{itemPct}%</span>
                    </span>
                  </div>

                  <div className="flex items-center justify-between mt-0.5 pt-1.5 border-t border-white/[0.02] relative z-10">
                    <span className={`${sentimentClass} text-[7px] px-1.5 py-0.5 rounded font-black tracking-wider uppercase`}>
                      {item.sentiment || "Neutral"}
                    </span>
                    <span className="text-[7px] text-gray-550 flex items-center gap-0.5">
                      <Clock className="w-2.5 h-2.5 text-purple-400/40" />
                      {item.duration ? `${Math.round(item.duration)}s` : "N/A"}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* SIDEBAR FOOTER (SECURE LOGOUT) */}
        <div className="p-4 border-t border-white/5 bg-[#050811]/90">
          <button 
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-bold text-red-400 bg-red-500/10 hover:bg-red-500/15 border border-red-500/20 hover:border-red-500/30 transition-all shadow-sm"
          >
            <LogOut className="w-4 h-4" />
            <span>Secure Log Out</span>
          </button>
        </div>
      </aside>

      {/* RIGHT COCKPIT CANVAS / WORKSPACE STAGE */}
      <div className="flex-1 min-h-screen flex flex-col overflow-y-auto relative z-10">
        
        {/* MOBILE & TABLET HEADER BAR */}
        <header className="border-b border-white/5 bg-[#080d1e]/80 backdrop-blur-xl sticky top-0 z-30 shadow-lg shadow-black/20 px-4 py-3 flex items-center justify-between xl:px-8 xl:py-4">
          <div className="flex items-center gap-3">
            {/* Hamburger button on mobile */}
            <button 
              onClick={() => setSidebarOpen(true)}
              className="xl:hidden p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 border border-white/5 transition-all"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2.5">
              <span className="text-xs font-black text-slate-500 uppercase tracking-widest hidden sm:inline">Active Area /</span>
              <span className="text-xs font-black text-purple-300 uppercase tracking-wider flex items-center gap-1">
                {audit ? (
                  <>
                    <Activity className="w-3.5 h-3.5 text-purple-400" /> Audit Assessment
                  </>
                ) : (
                  <>
                    <Award className="w-3.5 h-3.5 text-purple-400" /> Call Auditor Stage
                  </>
                )}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider bg-green-500/10 text-green-300 border border-green-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-ping"></span> Live Connection
            </span>
            <div className="flex flex-col text-right">
              <span className="text-[10px] font-black text-slate-200">{user?.name}</span>
              <span className="text-[8px] text-gray-500 font-semibold">{user?.email}</span>
            </div>
          </div>
        </header>

        {/* WORKSPACE CONTENT CONSOLE */}
        <main className="flex-1 w-full mx-auto px-4 py-8 flex flex-col gap-8 xl:px-8 max-w-6xl">
          
          {/* Global Quality Stats Panel (Symmetric Top Panel inside stage) */}
          <section className="w-full p-5 rounded-2xl bg-white/[0.01] border border-white/5 shadow-xl glass transition-all hover:border-white/10">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[10px] font-black text-purple-400 uppercase tracking-widest flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-purple-400" /> QA Intelligence Dashboard
              </h3>
              <span className="text-[9px] text-gray-500 font-bold uppercase tracking-wider">Metrics ledger</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              
              <div className="p-4 rounded-xl bg-white/[0.005] border border-white/[0.03] flex items-center gap-4 hover:bg-white/[0.01] transition-all duration-300">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shrink-0">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[9px] text-gray-400 font-black uppercase tracking-widest block mb-0.5">Total Audits</span>
                  <span className="text-2xl font-black text-white">{totalAudited}</span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-purple-500/5 border border-purple-500/10 flex items-center gap-4 hover:bg-purple-500/[0.08] transition-all duration-300 relative overflow-hidden group">
                <div className="w-10 h-10 rounded-xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-300 shrink-0 z-10">
                  <Headphones className="w-5 h-5" />
                </div>
                <div className="z-10">
                  <span className="text-[9px] text-purple-300 font-black uppercase tracking-widest block mb-0.5">Average QA Score</span>
                  <span className="text-2xl font-black text-purple-400">{avgScore}%</span>
                </div>
                <div className="absolute right-3 bottom-1.5 w-16 h-1 bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-purple-400 rounded-full" style={{ width: `${avgScore}%` }}></div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/10 flex items-center gap-4 hover:bg-red-500/[0.08] transition-all duration-300 relative overflow-hidden">
                <div className="w-10 h-10 rounded-xl bg-red-500/15 border border-red-500/30 flex items-center justify-center text-red-300 shrink-0">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[9px] text-red-300 font-black uppercase tracking-widest block mb-0.5">Critical Violations</span>
                  <span className="text-2xl font-black text-red-400">{criticalViolations}</span>
                </div>
              </div>

            </div>
          </section>

          {/* ACTIVE CONTENT VIEW */}
          {!audit ? (
            // DOCK STAGE VIEW 1: UPLOADER WIDGET
            <div className="w-full flex flex-col gap-8 items-center animate-fade-in">
              
              {/* Hero Banner Section */}
              <div className="text-center max-w-xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-bold bg-purple-500/10 border border-purple-500/20 text-purple-300 mb-5 shadow-sm">
                  <Award className="w-3 h-3 text-purple-400 animate-pulse" /> Gemini Pro Audit Sandbox Active
                </div>
                <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight leading-none bg-gradient-to-b from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
                  AI Compliance Auditor
                </h2>
                <p className="text-gray-400 text-[11px] md:text-xs mt-3 leading-relaxed font-semibold">
                  Evaluate call files in real-time. Detect financial risks, compliance breaches, client sentiment metrics, and generate coaching notes automatically.
                </p>
              </div>

              {/* Upload Form Box */}
              <div className="w-full max-w-xl">
                <UploadForm onResult={handleNewAudit} />
              </div>

            </div>
          ) : (
            // DOCK STAGE VIEW 2: EVALUATION DETAIL REPORT
            <div className="w-full flex flex-col gap-6 animate-fade-in items-center">
              
              {/* Breadcrumb back control */}
              <div className="flex justify-between items-center w-full gap-4 px-1">
                <button
                  onClick={() => setAudit(null)}
                  className="px-3.5 py-2 text-xs font-black text-purple-300 hover:text-white border border-purple-500/20 bg-purple-500/5 hover:bg-purple-500/10 rounded-xl transition-all flex items-center gap-2 shadow-md shadow-purple-500/5 group"
                >
                  <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
                  <span>Back to Uploader</span>
                </button>
                
                <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest bg-white/[0.02] border border-white/5 px-3 py-1.5 rounded-xl flex items-center gap-1.5 shadow-inner">
                  <SlidersHorizontal className="w-3.5 h-3.5 text-purple-400" /> Analysis Report # {audit._id?.slice(-6).toUpperCase()}
                </span>
              </div>

              {/* Comprehensive Result Assessment Card */}
              <div className="w-full">
                <ResultCard audit={audit} />
              </div>

            </div>
          )}

        </main>

        {/* STICKY FOOTER IN THE CANVAS */}
        <footer className="border-t border-white/5 py-4 text-center text-white/10 text-[10px] mt-auto bg-[#04060d]/50 tracking-wider font-semibold">
          © {new Date().getFullYear()} AI Call Auditor Pro • Premium QA Compliance Systems
        </footer>

      </div>
    </div>
  );
}
