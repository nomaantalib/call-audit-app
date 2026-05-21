import { useState, useEffect } from "react";
import axios from "axios";
import ResultCard from "./components/ResultCard";
import UploadForm from "./components/UploadForm";
import { 
  History, Headphones, Calendar, Smile, Meh, Frown, 
  Search, ShieldAlert, Award, ChevronRight, Activity, BarChart3
} from "lucide-react";

export default function App() {
  const [audit, setAudit] = useState(null);
  const [history, setHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [sentimentFilter, setSentimentFilter] = useState("ALL");

  // Fetch past audits on mount
  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
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

  return (
    <div className="min-h-screen bg-[#060814] text-slate-100 relative overflow-x-hidden selection:bg-purple-500 selection:text-white">
      {/* Premium Aurora Background Lights */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] bg-purple-600/10 rounded-full blur-[160px] animate-pulse-slow"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-pink-600/8 rounded-full blur-[140px] animate-pulse-slow" style={{ animationDelay: "3s" }}></div>
        <div className="absolute top-[25%] left-[20%] w-[50%] h-[50%] bg-blue-600/8 rounded-full blur-[150px] animate-pulse-slow" style={{ animationDelay: "6s" }}></div>
      </div>

      <div className="relative z-10 flex flex-col min-h-screen">
        {/* TOP NAVBAR */}
        <header className="border-b border-white/5 bg-[#080d1e]/80 backdrop-blur-xl sticky top-0 z-50 px-6 py-4 flex items-center justify-between shadow-lg shadow-black/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-500 via-indigo-500 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/20 border border-purple-400/20">
              <Headphones className="w-5.5 h-5.5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg md:text-xl font-extrabold bg-gradient-to-r from-purple-400 via-pink-400 to-indigo-300 bg-clip-text text-transparent tracking-tight">
                  AI Call Auditor
                </h1>
                <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">PRO</span>
              </div>
              <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">QA & compliance analysis platform</p>
            </div>
          </div>
          <div className="text-xs text-white/50 flex items-center gap-1.5 font-semibold bg-white/[0.03] px-3.5 py-1.5 rounded-full border border-white/5 shadow-inner">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-ping"></span>
            System Live
          </div>
        </header>

        {/* DASHBOARD BODY */}
        <div className="flex-1 flex flex-col lg:flex-row">
          
          {/* LEFT SIDEBAR: ANALYTICS & AUDIT HISTORY */}
          <aside className="w-full lg:w-[360px] border-b lg:border-b-0 lg:border-r border-white/5 bg-[#070b18]/70 backdrop-blur-xl p-5 flex flex-col shrink-0">
            
            {/* Global Quality Stats Panel */}
            <div className="mb-6 p-4 rounded-xl bg-white/[0.02] border border-white/5 shadow-md">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3.5 flex items-center gap-1.5">
                <BarChart3 className="w-4 h-4 text-purple-400" /> Executive Summary
              </h3>
              <div className="grid grid-cols-3 gap-2">
                <div className="text-center p-2 rounded-lg bg-white/[0.01] border border-white/[0.03]">
                  <span className="text-[10px] text-gray-400 font-bold block uppercase tracking-wider">Total</span>
                  <span className="text-lg font-black text-white">{totalAudited}</span>
                </div>
                <div className="text-center p-2 rounded-lg bg-purple-500/5 border border-purple-500/10">
                  <span className="text-[10px] text-purple-300 font-bold block uppercase tracking-wider">Avg QA</span>
                  <span className="text-lg font-black text-purple-400">{avgScore}%</span>
                </div>
                <div className="text-center p-2 rounded-lg bg-red-500/5 border border-red-500/10">
                  <span className="text-[10px] text-red-300 font-bold block uppercase tracking-wider">Alerts</span>
                  <span className="text-lg font-black text-red-400">{criticalViolations}</span>
                </div>
              </div>
            </div>

            {/* Filter and Search controls */}
            <div className="space-y-3 mb-5">
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  type="text"
                  placeholder="Search calls by name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/10 text-xs font-medium placeholder-gray-500 focus:outline-none focus:border-purple-500/50 focus:bg-white/[0.06] transition-all"
                />
              </div>

              {/* Sentiment filters */}
              <div className="flex gap-1 p-1 bg-white/[0.02] border border-white/5 rounded-lg text-[10px] font-bold">
                {["ALL", "POSITIVE", "NEUTRAL", "NEGATIVE"].map((sent) => (
                  <button
                    key={sent}
                    onClick={() => setSentimentFilter(sent)}
                    className={`flex-1 py-1 rounded transition-all capitalize
                      ${sentimentFilter === sent 
                        ? "bg-purple-500/20 text-purple-300 border border-purple-500/30" 
                        : "text-gray-400 hover:text-white"}`}
                  >
                    {sent.toLowerCase()}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between mb-3.5 px-1">
              <div className="flex items-center gap-1.5">
                <History className="w-4 h-4 text-purple-400" />
                <h3 className="text-xs font-extrabold text-gray-300 uppercase tracking-wider">Audit History</h3>
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-purple-500/10 text-purple-300 border border-purple-500/20">
                {filteredHistory.length}
              </span>
            </div>

            {/* Scrollable list of past audits */}
            <div className="flex-1 lg:max-h-[calc(100vh-360px)] overflow-y-auto pr-1 space-y-2.5 scrollbar-thin">
              {loadingHistory ? (
                <div className="py-12 text-center text-xs text-gray-400 animate-pulse flex flex-col items-center gap-2">
                  <Activity className="w-5 h-5 text-purple-400 animate-spin" />
                  Loading audit logs...
                </div>
              ) : filteredHistory.length === 0 ? (
                <div className="py-12 text-center text-xs text-gray-500 border border-dashed border-white/5 rounded-xl bg-white/[0.01]">
                  No matching audits found.
                  <p className="text-[10px] text-gray-600 mt-1">Try resetting filters or uploading files.</p>
                </div>
              ) : (
                filteredHistory.map((item) => {
                  const itemScore = item.score ?? 0;
                  const itemMax = item.maxScore || 100;
                  const itemPct = Math.round((itemScore / itemMax) * 100);
                  
                  let barColor = "from-red-500 to-pink-500";
                  let glowColor = "border-red-500/10 hover:border-red-500/30";
                  if (itemPct >= 80) {
                    barColor = "from-green-500 to-emerald-400";
                    glowColor = "border-green-500/10 hover:border-green-500/30";
                  } else if (itemPct >= 50) {
                    barColor = "from-amber-500 to-orange-400";
                    glowColor = "border-amber-500/10 hover:border-amber-500/30";
                  }

                  return (
                    <div
                      key={item._id}
                      onClick={() => setAudit(item)}
                      className={`p-3.5 rounded-xl border transition-all duration-300 cursor-pointer flex flex-col gap-2 relative overflow-hidden group
                        ${audit?._id === item._id
                          ? "bg-purple-500/10 border-purple-500/40 shadow-lg shadow-purple-500/5 glow-purple"
                          : `bg-white/[0.02] border-white/5 hover:bg-white/[0.04] ${glowColor}`}`}
                    >
                      {/* Active indicator bar */}
                      {audit?._id === item._id && (
                        <div className="absolute top-0 bottom-0 left-0 w-[3px] bg-gradient-to-b from-purple-500 to-pink-500"></div>
                      )}

                      <div className="flex items-start justify-between gap-3">
                        <span className="text-xs font-bold text-white truncate max-w-[210px] group-hover:text-purple-300 transition-colors">
                          {item.filename}
                        </span>
                        {getSentimentIcon(item.sentiment)}
                      </div>

                      {/* Compliance dynamic bar */}
                      <div className="w-full mt-1.5">
                        <div className="flex justify-between items-center text-[9px] font-bold text-gray-500 mb-1">
                          <span>Compliance Score</span>
                          <span className="text-gray-300">{itemPct}%</span>
                        </div>
                        <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full bg-gradient-to-r ${barColor} transition-all duration-500`}
                            style={{ width: `${itemPct}%` }}
                          ></div>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between text-[10px] text-gray-500 mt-1">
                        <span className="flex items-center gap-1 font-medium">
                          <Calendar className="w-3 h-3 text-purple-400/60" />
                          {formatDate(item.createdAt)}
                        </span>
                        
                        <span className="text-[8px] uppercase tracking-widest font-black px-1.5 py-0.5 rounded-md bg-white/5 text-gray-400">
                          {item.sentiment || "Neutral"}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </aside>
 
          {/* MAIN STAGE: UPLOADER & RESULTS */}
          <main className="flex-1 p-6 lg:p-10 flex flex-col items-center overflow-y-auto">
            <div className="w-full max-w-4xl flex flex-col items-center">
              
              {!audit ? (
                <div className="w-full py-6 md:py-16 animate-fade-in">
                  <div className="text-center mb-8">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-purple-500/10 border border-purple-500/20 text-purple-300 mb-4">
                      <Award className="w-3.5 h-3.5 animate-pulse" /> Free Tier Shield & Speech Recognition Active
                    </div>
                    <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight leading-none bg-gradient-to-b from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
                      AI-Powered Call Auditing
                    </h2>
                    <p className="text-gray-400 text-xs md:text-sm mt-3.5 max-w-xl mx-auto leading-relaxed font-medium">
                      Instantly evaluate call recordings against complex company rules, identify regulatory risks, and extract micro-coaching evidence using Google Gemini.
                    </p>
                  </div>
                  <UploadForm onResult={handleNewAudit} />
                </div>
              ) : (
                <div className="w-full animate-fade-in">
                  {/* UPLOADER DRAWER BUTTON */}
                  <div className="flex justify-between items-center w-full max-w-4xl mx-auto mb-5 px-1">
                    <button
                      onClick={() => setAudit(null)}
                      className="px-3.5 py-2 text-xs font-bold text-purple-300 hover:text-white border border-purple-500/20 bg-purple-500/5 hover:bg-purple-500/10 rounded-xl transition-all flex items-center gap-1.5 shadow-md shadow-black/10 group"
                    >
                      <ChevronRight className="w-3.5 h-3.5 rotate-180 group-hover:-translate-x-0.5 transition-transform" /> Audit Another File
                    </button>
                    
                    <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest bg-white/[0.02] border border-white/5 px-3 py-1.5 rounded-lg flex items-center gap-1">
                      <Activity className="w-3.5 h-3.5 text-purple-400" /> Active Session Details
                    </span>
                  </div>

                  <ResultCard audit={audit} />
                </div>
              )}
            </div>
          </main>
        </div>

        {/* BOTTOM FOOTER */}
        <footer className="border-t border-white/5 py-4 text-center text-white/20 text-xs mt-auto bg-[#04060d]">
          © {new Date().getFullYear()} AI Call Auditor Pro • Premium QA Compliance Systems
        </footer>
      </div>
    </div>
  );
}

