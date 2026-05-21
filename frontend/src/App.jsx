import { useState, useEffect } from "react";
import axios from "axios";
import ResultCard from "./components/ResultCard";
import UploadForm from "./components/UploadForm";
import { History, Headphones, Calendar, Smile, Meh, Frown } from "lucide-react";

export default function App() {
  const [audit, setAudit] = useState(null);
  const [history, setHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(true);

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
    if (s.includes("positive")) return <Smile className="w-3.5 h-3.5 text-green-400" />;
    if (s.includes("negative")) return <Frown className="w-3.5 h-3.5 text-red-400" />;
    return <Meh className="w-3.5 h-3.5 text-blue-400" />;
  };

  return (
    <div className="min-h-screen bg-[#0b0f19] text-white relative overflow-hidden selection:bg-pink-500 selection:text-white">
      {/* Dynamic Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-purple-600/10 rounded-full blur-[150px] animate-pulse-slow"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-pink-600/10 rounded-full blur-[150px] animate-pulse-slow" style={{ animationDelay: "3s" }}></div>
        <div className="absolute top-[30%] left-[30%] w-[40%] h-[40%] bg-blue-600/10 rounded-full blur-[130px] animate-pulse-slow" style={{ animationDelay: "6s" }}></div>
      </div>

      <div className="relative z-10 flex flex-col min-h-screen">
        {/* TOP NAVBAR */}
        <header className="border-b border-white/5 bg-[#0b0f19]/85 backdrop-blur-md sticky top-0 z-50 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/20 animate-pulse-slow">
              <Headphones className="w-5.5 h-5.5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-black bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent tracking-tight">
                AI Call Auditor
              </h1>
              <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Quality & Compliance Hub</p>
            </div>
          </div>
          <div className="text-xs text-white/40 flex items-center gap-1.5 font-medium">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-ping"></span>
            System Live
          </div>
        </header>

        {/* DASHBOARD BODY */}
        <div className="flex-1 flex flex-col lg:flex-row">
          
          {/* LEFT SIDEBAR: AUDIT HISTORY */}
          <aside className="w-full lg:w-80 border-b lg:border-b-0 lg:border-r border-white/5 bg-[#0b0f19]/40 backdrop-blur-sm p-6 flex flex-col shrink-0 select-none">
            <div className="flex items-center gap-2 mb-4">
              <History className="w-4 h-4 text-purple-400" />
              <h3 className="text-sm font-bold text-gray-300 uppercase tracking-wider">Audit History</h3>
              <span className="ml-auto px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/5 text-purple-300">
                {history.length}
              </span>
            </div>

            {/* Scrollable list of past audits */}
            <div className="flex-1 lg:max-h-[calc(100vh-180px)] overflow-y-auto pr-1 space-y-2.5">
              {loadingHistory ? (
                <div className="py-8 text-center text-sm text-gray-400 animate-pulse">
                  Loading audits...
                </div>
              ) : history.length === 0 ? (
                <div className="py-8 text-center text-sm text-gray-505 border border-dashed border-white/5 rounded-xl bg-white/[0.01]">
                  No past audits found.
                  <p className="text-[11px] text-gray-600 mt-1">Upload a call recording to begin.</p>
                </div>
              ) : (
                history.map((item) => (
                  <div
                    key={item._id}
                    onClick={() => setAudit(item)}
                    className={`p-3.5 rounded-xl border transition-all duration-200 cursor-pointer flex flex-col gap-2 relative overflow-hidden group
                      ${audit?._id === item._id
                        ? "bg-purple-500/10 border-purple-500/40 shadow-lg shadow-purple-500/5"
                        : "bg-white/[0.02] border-white/5 hover:bg-white/[0.05] hover:border-white/10"}`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-sm font-semibold text-white truncate max-w-[180px] group-hover:text-purple-300 transition-colors">
                        {item.filename}
                      </span>
                      <div className="shrink-0">
                        {getSentimentIcon(item.sentiment)}
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between text-[11px] text-gray-400 mt-1">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-gray-555" />
                        {formatDate(item.createdAt)}
                      </span>
                      
                      <span className="text-[9px] uppercase tracking-wider font-bold px-1.5 py-0.5 rounded bg-white/5 text-gray-300">
                        {item.sentiment || "Neutral"}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </aside>

          {/* MAIN STAGE: UPLOADER & RESULTS */}
          <main className="flex-1 p-6 lg:p-10 flex flex-col items-center overflow-y-auto">
            <div className="w-full max-w-4xl flex flex-col items-center">
              
              {/* If no audit is active, show the form in the center */}
              {!audit ? (
                <div className="w-full py-10 md:py-20 animate-fade-in">
                  <div className="text-center mb-8">
                    <h2 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight leading-tight">
                      Instant Call Quality & Compliance Auditing
                    </h2>
                    <p className="text-gray-400 text-sm md:text-base mt-3 max-w-xl mx-auto leading-relaxed">
                      Evaluate transcripts instantly against your business guidelines, compliance rules, and professional standards using Google Gemini.
                    </p>
                  </div>
                  <UploadForm onResult={handleNewAudit} />
                </div>
              ) : (
                <div className="w-full animate-fade-in">
                  {/* UPLOADER DRAWER BUTTON */}
                  <div className="flex justify-between items-center w-full max-w-4xl mx-auto mb-6">
                    <button
                      onClick={() => setAudit(null)}
                      className="px-4 py-2 text-xs font-bold text-purple-300 hover:text-white border border-purple-500/20 bg-purple-500/5 hover:bg-purple-500/10 rounded-lg transition-colors flex items-center gap-1.5"
                    >
                      ← Audit Another File
                    </button>
                    
                    <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">
                      Viewing Active Audit
                    </span>
                  </div>

                  <ResultCard audit={audit} />
                </div>
              )}
            </div>
          </main>
        </div>

        {/* BOTTOM FOOTER */}
        <footer className="border-t border-white/5 py-5 text-center text-white/30 text-xs mt-auto">
          © {new Date().getFullYear()} AI Call Auditor • Free Tier Multi-Model Shield Active
        </footer>
      </div>
    </div>
  );
}
