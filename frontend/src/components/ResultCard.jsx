import { useState } from "react";
import { 
  Sparkles, Target, FileText, Smile, Meh, Frown, 
  CheckCircle2, XCircle, AlertTriangle, MessageSquare, 
  Award, ChevronDown, ChevronUp, Clock, User, ClipboardList, Info
} from "lucide-react";

export default function ResultCard({ audit }) {
  const [activeTab, setActiveTab] = useState("checklist");
  const [expandedRule, setExpandedRule] = useState(null);

  if (!audit) return null;

  const sentimentLower = audit.sentiment?.toLowerCase() || "";
  const isPositive = sentimentLower.includes("positive");
  const isNegative = sentimentLower.includes("negative");

  // Determine sentiment icon and style
  let SentimentIcon = Meh;
  let sentimentBadgeClass = "bg-blue-500/15 text-blue-300 border-blue-500/30";
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

  const score = audit.score ?? 0;
  const maxScore = audit.maxScore || 100;
  const percentage = Math.round((score / maxScore) * 100);

  // Score color coding
  let scoreColorClass = "text-red-400";
  let scoreStrokeClass = "stroke-red-500";
  let scoreBgClass = "bg-red-500/10 border-red-500/20";
  
  if (percentage >= 80) {
    scoreColorClass = "text-green-400";
    scoreStrokeClass = "stroke-green-500";
    scoreBgClass = "bg-green-500/10 border-green-500/20";
  } else if (percentage >= 50) {
    scoreColorClass = "text-amber-400";
    scoreStrokeClass = "stroke-amber-500";
    scoreBgClass = "bg-amber-500/10 border-amber-500/20";
  }

  // Circular progress math
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  const ruleResults = audit.ruleResults || audit.rule_results || [];
  const risks = audit.risks || [];
  const coachingFeedback = audit.coachingFeedback || audit.coaching_feedback || [];
  const utterances = audit.utterances || [];

  const passedCount = ruleResults.filter(r => r.passed).length;
  const failedCount = ruleResults.length - passedCount;

  const toggleRule = (ruleId) => {
    if (expandedRule === ruleId) {
      setExpandedRule(null);
    } else {
      setExpandedRule(ruleId);
    }
  };

  const getSeverityClass = (severity) => {
    const s = severity?.toLowerCase() || "";
    if (s.includes("high")) return "bg-red-500/20 text-red-300 border-red-500/30";
    if (s.includes("medium")) return "bg-amber-500/20 text-amber-300 border-amber-500/30";
    return "bg-blue-500/20 text-blue-300 border-blue-500/30";
  };

  const formatTime = (seconds) => {
    if (seconds == null || isNaN(seconds)) return "00:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="w-full max-w-4xl mx-auto mt-6 animate-fade-in relative select-none">
      {/* Ambient Sentiment Glow in the Background */}
      <div className={`absolute -inset-1 rounded-2xl bg-gradient-to-tr ${glowColorClass} opacity-40 blur-xl pointer-events-none`}></div>

      <div className="glass p-6 md:p-8 rounded-2xl relative overflow-hidden border border-white/10 shadow-2xl bg-white/[0.03]">
        <div className="relative z-10">
          
          {/* Header Row */}
          <header className="mb-8 border-b border-white/10 pb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <p className="text-xs font-bold text-purple-400 uppercase tracking-widest mb-1.5 flex items-center gap-1">
                <ClipboardList className="w-3.5 h-3.5" /> Compliance Audit Report
              </p>
              <h3 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight leading-tight">
                {audit.filename}
              </h3>
            </div>
            
            <div className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-bold border self-start sm:self-auto uppercase tracking-wider ${sentimentBadgeClass}`}>
              <SentimentIcon className="w-4 h-4" />
              <span>{audit.sentiment || "Neutral"} Sentiment</span>
            </div>
          </header>

          {/* OVERVIEW PANEL: Score + Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            
            {/* Visual Circular Score Card */}
            <div className={`flex flex-col items-center justify-center p-6 rounded-2xl border ${scoreBgClass} backdrop-blur-sm relative overflow-hidden`}>
              <div className="absolute top-0 right-0 p-2.5 text-white/5 font-black text-6xl pointer-events-none uppercase">Score</div>
              
              <div className="relative w-24 h-24 mb-3">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  {/* Track circle */}
                  <circle
                    className="text-white/5 stroke-current"
                    strokeWidth="8"
                    cx="50"
                    cy="50"
                    r={radius}
                    fill="transparent"
                  />
                  {/* Progress circle */}
                  <circle
                    className={`${scoreStrokeClass} stroke-current transition-all duration-1000 ease-out`}
                    strokeWidth="8"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    cx="50"
                    cy="50"
                    r={radius}
                    fill="transparent"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className={`text-2xl font-black ${scoreColorClass}`}>{percentage}%</span>
                  <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Passed</span>
                </div>
              </div>

              <div className="text-center">
                <span className="text-xs font-bold text-gray-300 block">Compliance Score</span>
                <span className="text-[11px] text-gray-400 font-semibold">{score} / {maxScore} total weight</span>
              </div>
            </div>

            {/* Quick Summary Block: Objective and Conclusion */}
            <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="glass-card p-5 rounded-2xl hover:bg-white/5 border border-white/5 flex flex-col justify-between">
                <div>
                  <h4 className="text-xs font-black uppercase text-purple-400 tracking-wider mb-2 flex items-center gap-1.5">
                    <Target className="w-3.5 h-3.5" /> Call Objective
                  </h4>
                  <p className="text-gray-200 text-xs md:text-sm leading-relaxed line-clamp-3">
                    {audit.objective || "No objective extracted."}
                  </p>
                </div>
                <div className="text-[10px] text-purple-300/60 font-semibold mt-3">Verified by AI Quality Auditor</div>
              </div>

              <div className="glass-card p-5 rounded-2xl hover:bg-white/5 border border-white/5 flex flex-col justify-between">
                <div>
                  <h4 className="text-xs font-black uppercase text-pink-400 tracking-wider mb-2 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5" /> Conclusion
                  </h4>
                  <p className="text-gray-200 text-xs md:text-sm leading-relaxed line-clamp-3">
                    {audit.conclusion || "No conclusion provided."}
                  </p>
                </div>
                <div className="text-[10px] text-pink-300/60 font-semibold mt-3">Executive Summary</div>
              </div>
            </div>

          </div>

          {/* TAB SYSTEM NAVIGATION */}
          <div className="flex border-b border-white/10 mb-6 overflow-x-auto gap-2 scrollbar-none">
            <button
              onClick={() => setActiveTab("checklist")}
              className={`pb-3 px-4 text-xs font-bold tracking-wider uppercase border-b-2 transition-all shrink-0 flex items-center gap-1.5
                ${activeTab === "checklist"
                  ? "border-purple-500 text-purple-400 font-extrabold"
                  : "border-transparent text-gray-400 hover:text-white"}`}
            >
              <ClipboardList className="w-4 h-4" />
              Rules Compliance ({passedCount}/{ruleResults.length})
            </button>
            
            <button
              onClick={() => setActiveTab("risks")}
              className={`pb-3 px-4 text-xs font-bold tracking-wider uppercase border-b-2 transition-all shrink-0 flex items-center gap-1.5
                ${activeTab === "risks"
                  ? "border-purple-500 text-purple-400 font-extrabold"
                  : "border-transparent text-gray-400 hover:text-white"}`}
            >
              <AlertTriangle className="w-4 h-4" />
              Flagged Risks ({risks.length})
            </button>

            <button
              onClick={() => setActiveTab("coaching")}
              className={`pb-3 px-4 text-xs font-bold tracking-wider uppercase border-b-2 transition-all shrink-0 flex items-center gap-1.5
                ${activeTab === "coaching"
                  ? "border-purple-500 text-purple-400 font-extrabold"
                  : "border-transparent text-gray-400 hover:text-white"}`}
            >
              <Sparkles className="w-4 h-4" />
              Coaching ({coachingFeedback.length})
            </button>

            <button
              onClick={() => setActiveTab("transcript")}
              className={`pb-3 px-4 text-xs font-bold tracking-wider uppercase border-b-2 transition-all shrink-0 flex items-center gap-1.5
                ${activeTab === "transcript"
                  ? "border-purple-500 text-purple-400 font-extrabold"
                  : "border-transparent text-gray-400 hover:text-white"}`}
            >
              <MessageSquare className="w-4 h-4" />
              Call Transcript ({utterances.length})
            </button>
          </div>

          {/* TAB CONTENTS */}
          <div className="min-h-[250px]">
            
            {/* TAB: RULES CHECKLIST */}
            {activeTab === "checklist" && (
              <div className="space-y-3.5 animate-fade-in">
                {ruleResults.length === 0 ? (
                  <div className="text-center py-10 text-gray-400 italic">No rules results recorded.</div>
                ) : (
                  ruleResults.map((rule) => {
                    const isExpanded = expandedRule === rule.ruleId;
                    return (
                      <div 
                        key={rule.ruleId} 
                        className={`rounded-xl border transition-all duration-300 overflow-hidden
                          ${rule.passed 
                            ? "bg-green-500/[0.01] border-green-500/10 hover:border-green-500/20" 
                            : "bg-red-500/[0.01] border-red-500/10 hover:border-red-500/20"}`}
                      >
                        {/* Header bar of the rule */}
                        <div 
                          onClick={() => toggleRule(rule.ruleId)}
                          className="p-4 flex items-center justify-between gap-4 cursor-pointer select-none"
                        >
                          <div className="flex items-center gap-3">
                            {rule.passed ? (
                              <CheckCircle2 className="w-5 h-5 text-green-400 shrink-0 shadow-lg shadow-green-400/20" />
                            ) : (
                              <XCircle className="w-5 h-5 text-red-400 shrink-0 shadow-lg shadow-red-400/20" />
                            )}
                            <div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-extrabold text-sm text-white capitalize">{rule.ruleId}</span>
                                <span className="text-[9px] uppercase tracking-wider font-extrabold bg-white/5 text-gray-400 px-1.5 py-0.5 rounded">
                                  Weight: {rule.weight ?? 10}
                                </span>
                              </div>
                              <p className="text-xs text-gray-400 mt-0.5 line-clamp-1 sm:line-clamp-none">
                                {rule.description || `Evaluation criteria for ${rule.ruleId}.`}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full border hidden sm:inline-block
                              ${rule.passed 
                                ? "bg-green-500/10 border-green-500/20 text-green-300" 
                                : "bg-red-500/10 border-red-500/20 text-red-300"}`}
                            >
                              {rule.passed ? "Passed" : "Failed"}
                            </span>
                            {isExpanded ? (
                              <ChevronUp className="w-4 h-4 text-gray-400" />
                            ) : (
                              <ChevronDown className="w-4 h-4 text-gray-400" />
                            )}
                          </div>
                        </div>

                        {/* Expandable Quote/Evidence details */}
                        {isExpanded && (
                          <div className="px-4 pb-4 pt-1 border-t border-white/[0.04] bg-white/[0.01] animate-fade-in">
                            <div className="text-xs text-purple-300 font-bold uppercase tracking-wider mb-2 flex items-center gap-1.5">
                              <Info className="w-3.5 h-3.5" /> Supporting Evidence & Analysis
                            </div>
                            <div className="p-3.5 rounded-lg bg-[#0b0f19]/80 border border-white/5 text-xs text-gray-200 leading-relaxed italic relative">
                              <span className="text-purple-500 text-3xl font-serif absolute -top-2 left-1.5 select-none pointer-events-none opacity-40">“</span>
                              <p className="pl-5 pr-2">
                                {rule.evidence || "No transcript quotes or explicit evidence cited by the auditing model."}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            )}

            {/* TAB: COMPLIANCE RISKS */}
            {activeTab === "risks" && (
              <div className="space-y-4 animate-fade-in">
                {risks.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center border border-dashed border-white/5 rounded-xl bg-white/[0.01]">
                    <CheckCircle2 className="w-10 h-10 text-green-400 mb-2" />
                    <span className="text-sm font-bold text-white">No Compliance Risks Detected</span>
                    <p className="text-xs text-gray-500 mt-1 max-w-sm">This call is fully compliant. No specific regulatory, technical, or customer risks were flagged.</p>
                  </div>
                ) : (
                  risks.map((risk, index) => (
                    <div 
                      key={index}
                      className={`p-4 rounded-xl border border-l-4 flex gap-3.5 transition-all
                        ${risk.severity?.toLowerCase() === "high"
                          ? "bg-red-500/[0.02] border-white/5 border-l-red-500"
                          : risk.severity?.toLowerCase() === "medium"
                            ? "bg-amber-500/[0.02] border-white/5 border-l-amber-500"
                            : "bg-blue-500/[0.02] border-white/5 border-l-blue-500"}`}
                    >
                      <AlertTriangle className={`w-5 h-5 shrink-0 mt-0.5
                        ${risk.severity?.toLowerCase() === "high"
                          ? "text-red-400"
                          : risk.severity?.toLowerCase() === "medium"
                            ? "text-amber-400"
                            : "text-blue-400"}`} 
                      />
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`text-[9px] uppercase tracking-widest font-black px-2 py-0.5 rounded border ${getSeverityClass(risk.severity)}`}>
                            {risk.severity || "LOW"} Risk
                          </span>
                          <span className="text-[10px] text-gray-400 flex items-center gap-1 font-bold">
                            <Clock className="w-3 h-3 text-purple-400" />
                            Timestamp: {risk.timestamp || "0:00"}
                          </span>
                        </div>
                        <p className="text-xs md:text-sm text-gray-200 mt-2 leading-relaxed">
                          {risk.reason || "Detail not specified."}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* TAB: COACHING FEEDBACK */}
            {activeTab === "coaching" && (
              <div className="space-y-4 animate-fade-in">
                <div className="p-4 rounded-xl bg-purple-500/5 border border-purple-500/10 flex items-center gap-3.5 mb-2">
                  <Award className="w-8 h-8 text-purple-400 shrink-0" />
                  <div>
                    <h4 className="text-sm font-bold text-white">Representative Training & Alignment</h4>
                    <p className="text-xs text-gray-400 mt-0.5">Use the following micro-coaching advice to align agent performance with company standards.</p>
                  </div>
                </div>

                {coachingFeedback.length === 0 ? (
                  <div className="text-center py-10 text-gray-400 italic">No micro-coaching points suggested.</div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {coachingFeedback.map((point, idx) => (
                      <div key={idx} className="glass-card p-4 rounded-xl border border-white/5 flex gap-3 hover:border-purple-500/20 transition-all">
                        <span className="w-6 h-6 rounded-lg bg-purple-500/15 flex items-center justify-center text-xs font-black text-purple-400 shrink-0">{idx + 1}</span>
                        <p className="text-gray-200 text-xs md:text-sm leading-relaxed font-medium">
                          {point}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB: FULL TRANSCRIPT TIMELINE */}
            {activeTab === "transcript" && (
              <div className="space-y-4 max-h-[450px] overflow-y-auto pr-2 animate-fade-in">
                {utterances.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center border border-dashed border-white/5 rounded-xl bg-white/[0.01]">
                    <MessageSquare className="w-10 h-10 text-purple-400 mb-2 animate-pulse" />
                    <span className="text-sm font-bold text-white">Transcript Unavailable</span>
                    <p className="text-xs text-gray-500 mt-1 max-w-sm">No audio utterances were parsed. Check that AssemblyAI is set up correctly.</p>
                  </div>
                ) : (
                  utterances.map((utt, index) => {
                    const isAgent = utt.speaker?.toUpperCase().includes("AGENT") || utt.speaker?.toUpperCase().includes("A");
                    return (
                      <div 
                        key={index}
                        className={`flex gap-3 max-w-[85%]
                          ${isAgent ? "mr-auto flex-row" : "ml-auto flex-row-reverse"}`}
                      >
                        <div className={`w-8 h-8 rounded-full shrink-0 flex items-center justify-center text-xs font-bold shadow-md
                          ${isAgent 
                            ? "bg-purple-500/20 text-purple-300 border border-purple-500/30" 
                            : "bg-blue-500/20 text-blue-300 border border-blue-500/30"}`}
                        >
                          {isAgent ? "AG" : "CU"}
                        </div>

                        <div className="flex flex-col gap-1">
                          <div className={`flex items-center gap-2 text-[10px] font-bold text-gray-500
                            ${isAgent ? "flex-row" : "flex-row-reverse"}`}
                          >
                            <span className="text-gray-300 uppercase tracking-wider">{isAgent ? "AGENT" : "CUSTOMER"}</span>
                            <span>•</span>
                            <span className="flex items-center gap-0.5">
                              <Clock className="w-2.5 h-2.5" />
                              {formatTime(utt.start)} - {formatTime(utt.end)}
                            </span>
                          </div>

                          <div className={`p-3.5 rounded-2xl text-xs md:text-sm leading-relaxed border shadow-sm
                            ${isAgent 
                              ? "bg-purple-500/5 border-purple-500/10 rounded-tl-none text-purple-50" 
                              : "bg-white/[0.02] border-white/5 rounded-tr-none text-blue-50"}`}
                          >
                            {utt.text}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}

          </div>

        </div>
      </div>
    </div>
  );
}
