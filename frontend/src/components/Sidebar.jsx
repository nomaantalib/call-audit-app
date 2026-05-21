import { 
  Headphones, X, Award, History, Search, Clock, LogOut 
} from "lucide-react";

export default function Sidebar({
  user,
  logout,
  audit,
  setAudit,
  filteredHistory,
  loadingHistory,
  searchQuery,
  setSearchQuery,
  sentimentFilter,
  setSentimentFilter,
  sidebarOpen,
  setSidebarOpen,
  formatDate,
  getSentimentIcon
}) {
  return (
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
          <p className="text-[10px] text-gray-550 font-semibold truncate">{user?.email}</p>
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
          <div className="py-12 text-center text-[10px] text-gray-505 flex flex-col items-center justify-center gap-2">
            <svg className="w-5 h-5 text-purple-400 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
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
  );
}
