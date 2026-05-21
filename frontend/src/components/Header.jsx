import { Menu, Activity, Award } from "lucide-react";

export default function Header({ setSidebarOpen, audit, user }) {
  return (
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
  );
}
