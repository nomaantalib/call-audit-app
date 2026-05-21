import { BarChart3, Clock, Headphones, ShieldAlert, TrendingUp } from "lucide-react";

export default function StatsCockpit({ totalAudited, avgScore, criticalViolations }) {
  // Score-based coloring for average QA score
  let scoreColor = "text-red-400";
  let scoreGlow = "shadow-red-500/10";
  let scoreProgressColor = "bg-gradient-to-r from-red-500 to-pink-500";
  if (avgScore >= 80) {
    scoreColor = "text-emerald-400";
    scoreGlow = "shadow-emerald-500/10";
    scoreProgressColor = "bg-gradient-to-r from-emerald-500 to-teal-500";
  } else if (avgScore >= 50) {
    scoreColor = "text-amber-400";
    scoreGlow = "shadow-amber-500/10";
    scoreProgressColor = "bg-gradient-to-r from-amber-500 to-orange-500";
  }

  // Violations-based coloring
  const violationColor = criticalViolations > 0 ? "text-red-400" : "text-slate-400";
  const violationBg = criticalViolations > 0 ? "bg-red-500/10 border-red-500/20" : "bg-white/[0.02] border-white/5";

  return (
    <section className="w-full p-6 rounded-2xl bg-slate-950/40 border border-white/10 backdrop-blur-xl shadow-2xl transition-all duration-300 hover:border-white/15 relative overflow-hidden">
      {/* Decorative backdrop glow */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 rounded-full blur-2xl pointer-events-none" />
      
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
            <BarChart3 className="w-3.5 h-3.5 text-purple-400" />
          </div>
          <h3 className="text-xs font-black text-slate-200 uppercase tracking-widest">
            QA Compliance Overview
          </h3>
        </div>
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-[9px] text-slate-400 font-bold uppercase tracking-wider">
          <TrendingUp className="w-3 h-3 text-purple-400" /> Real-time Analytics
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        
        {/* Total Audits Card */}
        <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 flex items-center gap-4 hover:bg-white/[0.04] hover:scale-[1.02] hover:border-blue-500/20 transition-all duration-300 shadow-lg shadow-black/25">
          <div className="w-11 h-11 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shrink-0 shadow-lg shadow-blue-500/5">
            <Clock className="w-5 h-5 animate-pulse" style={{ animationDuration: '4s' }} />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-black uppercase tracking-wider block mb-0.5">Total Audits</span>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-black text-white tracking-tight">{totalAudited}</span>
              <span className="text-[10px] font-bold text-slate-500">records</span>
            </div>
          </div>
        </div>

        {/* Average QA Score Card */}
        <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 flex flex-col justify-between hover:bg-white/[0.04] hover:scale-[1.02] hover:border-purple-500/20 transition-all duration-300 shadow-lg shadow-black/25 relative overflow-hidden group">
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 shrink-0 shadow-lg shadow-purple-500/5">
              <Headphones className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 font-black uppercase tracking-wider block mb-0.5">Average QA Score</span>
              <span className={`text-2xl font-black tracking-tight ${scoreColor}`}>{avgScore}%</span>
            </div>
          </div>
          {/* Custom micro-progress bar embedded nicely at the bottom */}
          <div className="mt-3 w-full">
            <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden border border-white/[0.03]">
              <div 
                className={`h-full rounded-full transition-all duration-500 ${scoreProgressColor}`} 
                style={{ width: `${avgScore}%` }} 
              />
            </div>
          </div>
        </div>

        {/* Critical Violations Card */}
        <div className={`p-4 rounded-xl ${violationBg} flex items-center gap-4 hover:scale-[1.02] transition-all duration-300 shadow-lg shadow-black/25`}>
          <div className={`w-11 h-11 rounded-xl ${criticalViolations > 0 ? 'bg-red-500/15 border-red-500/35 text-red-400 shadow-red-500/10 animate-bounce' : 'bg-slate-500/10 border-slate-500/20 text-slate-400'} border flex items-center justify-center shrink-0 shadow-lg`}>
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-black uppercase tracking-wider block mb-0.5">Critical Violations</span>
            <div className="flex items-baseline gap-1">
              <span className={`text-2xl font-black tracking-tight ${violationColor}`}>{criticalViolations}</span>
              <span className="text-[10px] font-bold text-slate-500">alerts</span>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
