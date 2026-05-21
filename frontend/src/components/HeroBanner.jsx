import { Award, Sparkles } from "lucide-react";

export default function HeroBanner() {
  return (
    <div className="text-center max-w-xl select-none">
      <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest bg-purple-500/10 border border-purple-500/20 text-purple-300 mb-5 shadow-lg shadow-purple-500/5 glow-purple">
        <Award className="w-3 h-3 text-purple-400 animate-pulse" /> Gemini Pro Compliance Sandbox
      </div>
      <h2 className="text-3xl md:text-4xl font-black text-white tracking-tight leading-none bg-gradient-to-r from-white via-slate-200 to-slate-450 bg-clip-text text-transparent">
        Intelligent Audio Compliance Auditing
      </h2>
      <p className="text-slate-400 text-[11px] md:text-xs mt-3.5 leading-relaxed font-medium px-4">
        Deploy advanced AI to extract compliance checkmarks, identify regulatory risks, score calls objectively, and produce custom coaching templates automatically.
      </p>
    </div>
  );
}
