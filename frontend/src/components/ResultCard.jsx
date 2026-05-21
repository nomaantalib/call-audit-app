import { Sparkles, Target, FileText, Smile, Meh, Frown } from "lucide-react";

export default function ResultCard({ audit }) {
  if (!audit) return null;

  const sentimentLower = audit.sentiment?.toLowerCase() || "";
  const isPositive = sentimentLower.includes("positive");
  const isNegative = sentimentLower.includes("negative");

  // Determine sentiment icon and style
  let SentimentIcon = Meh;
  let sentimentBadgeClass = "bg-blue-500/10 text-blue-300 border-blue-500/20";
  let glowColorClass = "from-blue-500/10 to-transparent";

  if (isPositive) {
    SentimentIcon = Smile;
    sentimentBadgeClass = "bg-green-500/15 text-green-300 border-green-500/30";
    glowColorClass = "from-green-500/10 to-transparent";
  } else if (isNegative) {
    SentimentIcon = Frown;
    sentimentBadgeClass = "bg-red-500/15 text-red-300 border-red-500/30";
    glowColorClass = "from-red-500/10 to-transparent";
  }

  return (
    <div className="w-full max-w-4xl mx-auto mt-12 animate-fade-in relative">
      {/* Dynamic ambient sentiment glow in the background */}
      <div className={`absolute -inset-1 rounded-2xl bg-gradient-to-tr ${glowColorClass} opacity-50 blur-xl pointer-events-none`}></div>

      <div className="glass p-8 rounded-2xl relative overflow-hidden border border-white/10 shadow-2xl bg-white/[0.03]">
        <div className="relative z-10">
          <header className="mb-8 border-b border-white/10 pb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <p className="text-xs font-bold text-purple-400 uppercase tracking-widest mb-1.5">Compliance Audit Report</p>
              <h3 className="text-3xl font-extrabold text-white tracking-tight">{audit.filename}</h3>
            </div>
            
            <div className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-bold border self-start sm:self-auto uppercase tracking-wider ${sentimentBadgeClass}`}>
              <SentimentIcon className="w-4 h-4" />
              <span>{audit.sentiment || "Neutral"}</span>
            </div>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Insights Column */}
            <div className="glass-card p-6 rounded-xl hover:bg-white/5 transition-all duration-300 hover:border-white/20">
              <h4 className="text-xl font-bold mb-5 flex items-center gap-2 text-blue-300">
                <Sparkles className="w-5 h-5 text-blue-400" />
                Key Audit Findings
              </h4>
              <ul className="space-y-4">
                {Array.isArray(audit.insights) && audit.insights.map((insight, idx) => (
                  <li key={idx} className="flex items-start gap-3.5 text-gray-200 text-sm md:text-base leading-relaxed">
                    <span className="mt-2 w-2 h-2 rounded-full bg-blue-400 shrink-0 shadow-lg shadow-blue-400/50"></span>
                    <span>{insight}</span>
                  </li>
                ))}
                {!Array.isArray(audit.insights) && (
                   <li className="text-gray-300 italic text-sm md:text-base">{audit.insights}</li>
                )}
              </ul>
            </div>

            {/* Objective & Conclusion Column */}
            <div className="flex flex-col gap-6">
              {/* Call Objective */}
              <div className="glass-card p-6 rounded-xl hover:bg-white/5 transition-all duration-300 hover:border-white/20">
                 <h4 className="text-lg font-bold mb-3 flex items-center gap-2 text-purple-300">
                  <Target className="w-5 h-5 text-purple-400" />
                  Call Objective
                 </h4>
                 <p className="text-gray-200 text-sm md:text-base leading-relaxed">{audit.objective}</p>
              </div>

              {/* Conclusion */}
              <div className="glass-card p-6 rounded-xl border-l-4 border-l-pink-500/50 hover:bg-white/5 transition-all duration-300 hover:border-white/20">
                 <h4 className="text-lg font-bold mb-3 flex items-center gap-2 text-pink-300">
                  <FileText className="w-5 h-5 text-pink-400" />
                  Conclusion
                 </h4>
                 <p className="text-gray-200 text-sm md:text-base leading-relaxed">{audit.conclusion}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
