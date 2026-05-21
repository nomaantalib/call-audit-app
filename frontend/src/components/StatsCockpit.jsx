import { BarChart3, Clock, Headphones, ShieldAlert } from "lucide-react";

export default function StatsCockpit({ totalAudited, avgScore, criticalViolations }) {
  return (
    <section className="w-full p-5 rounded-2xl bg-white/[0.01] border border-white/5 shadow-xl glass transition-all hover:border-white/10">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-[10px] font-black text-purple-400 uppercase tracking-widest flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-purple-400" /> QA Intelligence Dashboard
        </h3>
        <span className="text-[9px] text-gray-500 font-bold uppercase tracking-wider">Metrics ledger</span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        
        {/* Total Audits Card */}
        <div className="p-4 rounded-xl bg-white/[0.005] border border-white/[0.03] flex items-center gap-4 hover:bg-white/[0.01] transition-all duration-300">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[9px] text-gray-400 font-black uppercase tracking-widest block mb-0.5">Total Audits</span>
            <span className="text-2xl font-black text-white">{totalAudited}</span>
          </div>
        </div>

        {/* Average QA Score Card */}
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

        {/* Critical Violations Card */}
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
  );
}
