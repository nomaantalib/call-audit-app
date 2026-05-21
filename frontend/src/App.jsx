import { useState, useEffect } from "react";
import axios from "axios";
import ResultCard from "./components/ResultCard";
import UploadForm from "./components/UploadForm";
import { 
  History, Headphones, Calendar, Smile, Meh, Frown, 
  Search, Award, ChevronRight, Activity, BarChart3, 
  ArrowLeft, SlidersHorizontal, ShieldAlert, Clock
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
    <div className="min-h-screen bg-[#060814] text-slate-100 relative overflow-x-hidden selection:bg-purple-500 selection:text-white flex flex-col font-sans">
      
      {/* Premium Aurora Background Lights */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[10%] w-[50%] h-[50%] bg-purple-600/10 rounded-full blur-[160px] animate-pulse-slow"></div>
        <div className="absolute bottom-[-10%] right-[10%] w-[50%] h-[50%] bg-pink-600/8 rounded-full blur-[140px] animate-pulse-slow" style={{ animationDelay: "3s" }}></div>
        <div className="absolute top-[30%] left-[30%] w-[40%] h-[40%] bg-blue-600/6 rounded-full blur-[150px] animate-pulse-slow" style={{ animationDelay: "6s" }}></div>
      </div>

      <div className="relative z-10 flex flex-col min-h-screen">
        
        {/* TOP NAVBAR (CENTERED CONTAINER) */}
        <header className="border-b border-white/5 bg-[#080d1e]/80 backdrop-blur-xl sticky top-0 z-50 shadow-lg shadow-black/20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => setAudit(null)}>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-500 via-indigo-500 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/20 border border-purple-400/20 transform hover:scale-105 transition-all">
                <Headphones className="w-5.5 h-5.5 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-lg md:text-xl font-black bg-gradient-to-r from-purple-400 via-pink-400 to-indigo-300 bg-clip-text text-transparent tracking-tight">
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
          </div>
        </header>

        {/* MAIN STAGE (STYLISH ALIGNED CENTERED) */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 flex flex-col gap-10 items-center justify-start z-10 relative">
          
          {/* Global Quality Stats Panel (Symmetric Top Panel) */}
          <section className="w-full max-w-4xl mx-auto p-6 rounded-2xl bg-white/[0.02] border border-white/5 shadow-xl glass transition-all hover:border-white/10">
            <h3 className="text-xs font-black text-purple-400 uppercase tracking-widest mb-4 flex items-center justify-center gap-2">
              <BarChart3 className="w-4 h-4 text-purple-400" /> Executive Compliance cockpit
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              
              <div className="text-center p-4 rounded-xl bg-white/[0.01] border border-white/[0.03] flex flex-col justify-center items-center shadow-inner hover:bg-white/[0.02] transition-colors">
                <span className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-1.5">Total Audits</span>
                <span className="text-3xl font-black text-white">{totalAudited}</span>
                <p className="text-[9px] text-gray-500 mt-1">Processed call files</p>
              </div>

              <div className="text-center p-4 rounded-xl bg-purple-500/5 border border-purple-500/10 flex flex-col justify-center items-center shadow-inner hover:bg-purple-500/[0.08] transition-colors relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-1 text-purple-500/5 font-black text-4xl pointer-events-none select-none">QA</div>
                <span className="text-[10px] text-purple-300 font-black uppercase tracking-widest mb-1.5">Average QA Score</span>
                <span className="text-3xl font-black text-purple-400">{avgScore}%</span>
                <div className="w-20 h-1 bg-white/5 rounded-full overflow-hidden mt-1.5">
                  <div className="h-full bg-purple-400 rounded-full" style={{ width: `${avgScore}%` }}></div>
                </div>
              </div>

              <div className="text-center p-4 rounded-xl bg-red-500/5 border border-red-500/10 flex flex-col justify-center items-center shadow-inner hover:bg-red-500/[0.08] transition-colors relative overflow-hidden">
                <span className="text-[10px] text-red-300 font-black uppercase tracking-widest mb-1.5">Critical Violations</span>
                <span className="text-3xl font-black text-red-400">{criticalViolations}</span>
                <p className="text-[9px] text-red-500/80 font-bold mt-1 uppercase tracking-wide">High Risk Alerts</p>
              </div>

            </div>
          </section>

          {/* ACTIVE CONTENT VIEW */}
          {!audit ? (
            // VIEW 1: UPLOADER & RECENT HISTORY GRID
            <div className="w-full flex flex-col gap-12 items-center animate-fade-in">
              
              {/* Hero Banner Section */}
              <div className="text-center max-w-2xl">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold bg-purple-500/10 border border-purple-500/20 text-purple-300 mb-6 shadow-md">
                  <Award className="w-3.5 h-3.5 text-purple-400 animate-pulse" /> Gemini AI & Speech recognition engine active
                </div>
                <h2 className="text-4xl md:text-6xl font-black text-white tracking-tight leading-none bg-gradient-to-b from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
                  AI-Powered Call Auditing
                </h2>
                <p className="text-gray-400 text-xs md:text-sm mt-4 leading-relaxed font-medium">
                  Instantly evaluate call recordings against complex compliance rules, identify critical regulatory risks, and extract micro-coaching insights in seconds.
                </p>
              </div>

              {/* Upload Form Box */}
              <div className="w-full max-w-2xl">
                <UploadForm onResult={handleNewAudit} />
              </div>

              {/* Centered Audit History Log */}
              <section className="w-full max-w-5xl mt-8">
                <div className="flex flex-col sm:flex-row items-center justify-between mb-6 pb-4 border-b border-white/5 gap-4">
                  <div className="flex items-center gap-2">
                    <History className="w-5 h-5 text-purple-400" />
                    <h3 className="text-base font-extrabold text-white uppercase tracking-wider">Audit Log Database</h3>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-purple-500/10 text-purple-300 border border-purple-500/20 shadow-md">
                      {filteredHistory.length}
                    </span>
                  </div>

                  {/* Search and Filters Strip */}
                  <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto items-center">
                    <div className="relative w-full sm:w-60">
                      <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                      <input
                        type="text"
                        placeholder="Search calls by name..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 rounded-xl bg-white/[0.03] border border-white/10 text-xs font-semibold placeholder-gray-505 focus:outline-none focus:border-purple-500/50 focus:bg-white/[0.06] transition-all"
                      />
                    </div>

                    <div className="flex gap-1 p-1 bg-white/[0.02] border border-white/5 rounded-xl text-[10px] font-bold">
                      {["ALL", "POSITIVE", "NEUTRAL", "NEGATIVE"].map((sent) => (
                        <button
                          key={sent}
                          onClick={() => setSentimentFilter(sent)}
                          className={`px-3 py-1.5 rounded-lg transition-all capitalize
                            ${sentimentFilter === sent 
                              ? "bg-purple-500/20 text-purple-300 border border-purple-500/30" 
                              : "text-gray-400 hover:text-white"}`}
                        >
                          {sent.toLowerCase()}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Database Grid */}
                {loadingHistory ? (
                  <div className="py-20 text-center text-xs text-gray-450 animate-pulse flex flex-col items-center gap-3">
                    <Activity className="w-8 h-8 text-purple-400 animate-spin" />
                    Connecting to Audit Logs Database...
                  </div>
                ) : filteredHistory.length === 0 ? (
                  <div className="py-16 text-center text-xs text-gray-500 border border-dashed border-white/10 rounded-2xl bg-white/[0.01] max-w-lg mx-auto">
                    No matching audit reports found.
                    <p className="text-[10px] text-gray-650 mt-1.5 font-medium">Try adjusting search parameters or upload new audio logs.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
                    {filteredHistory.map((item) => {
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
                          onClick={() => {
                            setAudit(item);
                            window.scrollTo({ top: 0, behavior: "smooth" });
                          }}
                          className={`p-5 rounded-2xl border bg-white/[0.02] border-white/5 hover:bg-white/[0.04] cursor-pointer transition-all duration-300 flex flex-col justify-between min-h-[180px] relative overflow-hidden group hover:-translate-y-1 shadow-md hover:shadow-xl ${glowColor}`}
                        >
                          {/* Hover dynamic background shine */}
                          <div className="absolute inset-0 bg-gradient-to-tr from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                          
                          <div className="flex items-start justify-between gap-3 relative z-10">
                            <span className="text-xs font-bold text-white truncate max-w-[200px] group-hover:text-purple-300 transition-colors">
                              {item.filename}
                            </span>
                            {getSentimentIcon(item.sentiment)}
                          </div>

                          {/* Dynamic Compliance score bar */}
                          <div className="w-full mt-4 relative z-10">
                            <div className="flex justify-between items-center text-[9px] font-black text-gray-500 mb-1">
                              <span className="uppercase tracking-wide">Compliance Weight</span>
                              <span className="text-gray-300 font-mono">{itemPct}%</span>
                            </div>
                            <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                              <div 
                                className={`h-full rounded-full bg-gradient-to-r ${barColor} transition-all duration-500`}
                                style={{ width: `${itemPct}%` }}
                              ></div>
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-between text-[10px] text-gray-500 mt-4 pt-3 border-t border-white/[0.03] relative z-10">
                            <span className="flex items-center gap-1 font-semibold">
                              <Calendar className="w-3.5 h-3.5 text-purple-400/60" />
                              {formatDate(item.createdAt)}
                            </span>
                            
                            <span className="text-[8px] uppercase tracking-widest font-black px-2 py-0.5 rounded bg-white/5 text-gray-400 border border-white/5">
                              {item.sentiment || "Neutral"}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </section>

            </div>
          ) : (
            // VIEW 2: FULL CENTERED RESULT STAGE WITH QUICK HISTORY ACCORDION
            <div className="w-full max-w-4xl flex flex-col gap-6 animate-fade-in items-center">
              
              {/* Back to Dashboard Controls */}
              <div className="flex flex-col sm:flex-row justify-between items-center w-full gap-4 px-1">
                <button
                  onClick={() => setAudit(null)}
                  className="px-4 py-2.5 text-xs font-black text-purple-300 hover:text-white border border-purple-500/20 bg-purple-500/5 hover:bg-purple-500/10 rounded-xl transition-all flex items-center gap-2 shadow-md shadow-purple-500/5 group self-start sm:self-auto hover:-translate-x-0.5"
                >
                  <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" /> Back to Dashboard
                </button>
                
                <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest bg-white/[0.02] border border-white/5 px-3.5 py-2 rounded-xl flex items-center gap-1.5 shadow-inner">
                  <Activity className="w-4 h-4 text-purple-400" /> Compliance Report Details
                </span>
              </div>

              {/* Center Main Result Card */}
              <div className="w-full">
                <ResultCard audit={audit} />
              </div>

              {/* Browse Other Audits scroller at the bottom */}
              {history.length > 1 && (
                <section className="w-full mt-8 border-t border-white/5 pt-8 text-center">
                  <h4 className="text-xs font-black uppercase text-purple-400 tracking-widest mb-4 flex items-center justify-center gap-1.5">
                    <History className="w-3.5 h-3.5 text-purple-400" /> Switch to Other Audits
                  </h4>
                  
                  <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-thin max-w-4xl mx-auto px-2 justify-start md:justify-center">
                    {history
                      .filter((h) => h._id !== audit._id)
                      .slice(0, 5)
                      .map((item) => {
                        const scorePct = Math.round(((item.score ?? 0) / (item.maxScore || 100)) * 100);
                        return (
                          <div
                            key={item._id}
                            onClick={() => {
                              setAudit(item);
                              window.scrollTo({ top: 0, behavior: "smooth" });
                            }}
                            className="p-3.5 rounded-xl border border-white/5 bg-white/[0.01] hover:bg-white/[0.03] hover:border-purple-500/20 transition-all cursor-pointer text-left shrink-0 w-60 flex flex-col justify-between"
                          >
                            <span className="text-xs font-bold text-white truncate mb-2 block">{item.filename}</span>
                            <div className="flex justify-between items-center text-[10px]">
                              <span className="font-semibold text-gray-550">Score: <span className="text-purple-400 font-mono font-bold">{scorePct}%</span></span>
                              <span className="text-[8px] font-black uppercase px-1.5 py-0.5 rounded bg-white/5 text-gray-550 border border-white/[0.03]">{item.sentiment || "Neutral"}</span>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </section>
              )}

            </div>
          )}

        </main>

        {/* BOTTOM FOOTER */}
        <footer className="border-t border-white/5 py-6 text-center text-white/20 text-xs mt-auto bg-[#04060d] tracking-wide font-medium">
          © {new Date().getFullYear()} AI Call Auditor Pro • Premium QA Compliance Systems
        </footer>

      </div>
    </div>
  );
}
