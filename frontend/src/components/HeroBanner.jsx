import { Award } from "lucide-react";

export default function HeroBanner() {
  return (
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
  );
}
