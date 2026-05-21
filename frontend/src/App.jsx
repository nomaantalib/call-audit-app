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
import { 
  Smile, Meh, Frown, ArrowLeft, SlidersHorizontal, Activity 
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
      />

      {/* RIGHT COCKPIT CANVAS / WORKSPACE STAGE */}
      <div className="flex-1 min-h-screen flex flex-col overflow-y-auto relative z-10">
        
        {/* MOBILE & TABLET HEADER BAR */}
        <Header 
          setSidebarOpen={setSidebarOpen} 
          audit={audit} 
          user={user} 
        />

        {/* WORKSPACE CONTENT CONSOLE */}
        <main className="flex-1 w-full mx-auto px-4 py-8 flex flex-col gap-8 xl:px-8 max-w-6xl">
          
          {/* Global Quality Stats Panel (Symmetric Top Panel inside stage) */}
          <StatsCockpit 
            totalAudited={totalAudited} 
            avgScore={avgScore} 
            criticalViolations={criticalViolations} 
          />

          {/* ACTIVE CONTENT VIEW */}
          {!audit ? (
            // DOCK STAGE VIEW 1: UPLOADER WIDGET
            <div className="w-full flex flex-col gap-8 items-center animate-fade-in">
              <HeroBanner />
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
