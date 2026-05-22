import { useState, useRef, useEffect } from "react";
import { 
  Sparkles, Target, FileText, Smile, Meh, Frown, 
  CheckCircle2, XCircle, AlertTriangle, MessageSquare, 
  Award, ChevronDown, ChevronUp, Clock, User, ClipboardList, 
  Info, Search, Mic, ArrowRight, Activity, Zap, Play, Pause, Volume2, Music
} from "lucide-react";

export default function ResultCard({ 
  audit, 
  playingAudioUrl, 
  setPlayingAudioUrl, 
  isPlaying, 
  setIsPlaying, 
  backendUrl 
}) {
  const [activeTab, setActiveTab] = useState("checklist");
  const [expandedRule, setExpandedRule] = useState(null);
  
  // Rules Filtering States
  const [ruleFilter, setRuleFilter] = useState("ALL");
  const [ruleSearch, setRuleSearch] = useState("");

  // Risks Filtering States
  const [riskSeverityFilter, setRiskSeverityFilter] = useState("ALL");
  const [riskSearch, setRiskSearch] = useState("");

  // Transcript Search and Filtration States
  const [transcriptSearchTerm, setTranscriptSearchTerm] = useState("");
  const [transcriptSpeakerFilter, setTranscriptSpeakerFilter] = useState("ALL");
  const [highlightedUtteranceIndex, setHighlightedUtteranceIndex] = useState(null);

  // Audio Playback Elements
  const audioRef = useRef(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const toggleRule = (ruleId) => {
    setExpandedRule(expandedRule === ruleId ? null : ruleId);
  };

  const getFullAudioUrl = () => {
    if (!audit || !audit.audioUrl) return "";
    if (audit.audioUrl.startsWith("http")) return audit.audioUrl;
    return `${backendUrl || ""}${audit.audioUrl}`;
  };

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (playingAudioUrl === audit?.audioUrl && isPlaying) {
      audio.play().catch((err) => {
        console.error("Local audio play failed:", err);
        setIsPlaying(false);
      });
    } else {
      audio.pause();
    }
  }, [playingAudioUrl, isPlaying, audit?.audioUrl, setIsPlaying]);

  const handlePlayPause = () => {
    if (!audit?.audioUrl) return;
    if (playingAudioUrl === audit.audioUrl) {
      setIsPlaying(!isPlaying);
    } else {
      setPlayingAudioUrl(audit.audioUrl);
      setIsPlaying(true);
    }
  };

  const onTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const onLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration || 0);
    }
  };

  const handleScrub = (e) => {
    const time = parseFloat(e.target.value);
    setCurrentTime(time);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
    }
  };

  if (!audit) return null;

  const sentimentLower = audit.sentiment?.toLowerCase() || "";
  const isPositive = sentimentLower.includes("positive");
  const isNegative = sentimentLower.includes("negative");

  // Determine sentiment style
  let SentimentIcon = Meh;
  let sentimentBadgeClass = "bg-blue-500/10 text-blue-300 border-blue-500/20 shadow-[0_0_12px_rgba(59,130,246,0.1)]";
  let glowColorClass = "from-blue-600/10 via-indigo-600/5 to-transparent";

  if (isPositive) {
    SentimentIcon = Smile;
    sentimentBadgeClass = "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-[0_0_12px_rgba(16,185,129,0.1)]";
    glowColorClass = "from-emerald-600/10 via-teal-600/5 to-transparent";
  } else if (isNegative) {
    SentimentIcon = Frown;
    sentimentBadgeClass = "bg-rose-500/10 text-rose-400 border-rose-500/20 shadow-[0_0_12px_rgba(244,63,94,0.1)]";
    glowColorClass = "from-rose-600/10 via-pink-600/5 to-transparent";
  }

  const score = audit.score ?? 0;
  const maxScore = audit.maxScore || 100;
  const percentage = Math.round((score / maxScore) * 100);

  // Score color coding
  let scoreColorClass = "text-rose-400";
  let scoreStrokeClass = "stroke-rose-500";
  let scoreBgClass = "bg-rose-500/[0.02] border-rose-500/10 shadow-[0_0_20px_rgba(244,63,94,0.02)]";
  
  if (percentage >= 80) {
    scoreColorClass = "text-emerald-400";
    scoreStrokeClass = "stroke-emerald-500";
    scoreBgClass = "bg-emerald-500/[0.02] border-emerald-500/10 shadow-[0_0_20px_rgba(16,185,129,0.02)]";
  } else if (percentage >= 50) {
    scoreColorClass = "text-amber-400";
    scoreStrokeClass = "stroke-amber-500";
    scoreBgClass = "bg-amber-500/[0.02] border-amber-500/10 shadow-[0_0_20px_rgba(245,158,11,0.02)]";
  }

  // Circular progress math
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  const ruleResults = audit.ruleResults || audit.rule_results || [];
  const risks = audit.risks || [];
  const coachingFeedback = audit.coachingFeedback || audit.coaching_feedback || [];
  const utterances = audit.utterances || [];

  // ----------------------------------------------------
  // Dynamic Speech Metrics Calculations
  // ----------------------------------------------------
  const totalCallDuration = utterances.length > 0 ? utterances[utterances.length - 1].end : 0;
  const totalDialogueTurns = utterances.length;

  let agentSpeechTime = 0;
  let customerSpeechTime = 0;
  let agentWordCount = 0;
  let customerWordCount = 0;

  utterances.forEach((u) => {
    const isAgent = u.speaker?.toUpperCase().includes("AGENT") || u.speaker?.toUpperCase().includes("A");
    const durationSec = (u.end ?? 0) - (u.start ?? 0);
    const words = u.text ? u.text.trim().split(/\s+/).length : 0;

    if (isAgent) {
      agentSpeechTime += durationSec;
      agentWordCount += words;
    } else {
      customerSpeechTime += durationSec;
      customerWordCount += words;
    }
  });

  const totalSpeechTime = agentSpeechTime + customerSpeechTime;
  const agentSpeechPct = totalSpeechTime > 0 ? Math.round((agentSpeechTime / totalSpeechTime) * 100) : 50;
  const customerSpeechPct = totalSpeechTime > 0 ? 100 - agentSpeechPct : 50;

  const agentWpm = agentSpeechTime > 0 ? Math.round(agentWordCount / (agentSpeechTime / 60)) : 0;
  const customerWpm = customerSpeechTime > 0 ? Math.round(customerWordCount / (customerSpeechTime / 60)) : 0;

  // ----------------------------------------------------
  // Interactive Risk Navigation ("Jump to Transcript")
  // ----------------------------------------------------
  const parseTimestampToSeconds = (ts) => {
    if (!ts) return 0;
    const parts = ts.trim().split(":");
    if (parts.length === 2) {
      return parseInt(parts[0], 10) * 60 + parseInt(parts[1], 10);
    }
    return parseFloat(ts) || 0;
  };

  const handleJumpToTranscript = (timestampStr) => {
    const targetSeconds = parseTimestampToSeconds(timestampStr);
    
    // Find closest utterance matching timestamp
    let closestIndex = 0;
    let minDifference = Infinity;

    utterances.forEach((u, index) => {
      const diff = Math.abs(u.start - targetSeconds);
      if (diff < minDifference) {
        minDifference = diff;
        closestIndex = index;
      }
    });

    // Navigate to transcript tab
    setActiveTab("transcript");
    // Highlight utterance
    setHighlightedUtteranceIndex(closestIndex);
    // Reset filters that could hide our destination target
    setTranscriptSpeakerFilter("ALL");
    setTranscriptSearchTerm("");

    // Timeout to let DOM load state then smooth scroll
    setTimeout(() => {
      const element = document.getElementById(`utterance-bubble-${closestIndex}`);
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }, 200);
  };

  // Helper to format timestamps nicely
  const formatTime = (seconds) => {
    if (seconds == null || isNaN(seconds)) return "00:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Helper to highlight matching words in transcript
  const getHighlightedText = (text, highlight) => {
    if (!highlight || !highlight.trim()) return text;
    try {
      const regex = new RegExp(`(${highlight.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')})`, "gi");
      const parts = text.split(regex);
      return (
        <span>
          {parts.map((part, i) => 
            regex.test(part) ? (
              <mark key={i} className="bg-yellow-400/25 text-yellow-100 border-b-2 border-yellow-400/80 font-bold px-0.5 rounded-sm">{part}</mark>
            ) : (
              part
            )
          )}
        </span>
      );
    } catch {
      return text;
    }
  };

  // ----------------------------------------------------
  // Dynamic Tab Filters
  // ----------------------------------------------------
  const filteredRuleResults = ruleResults.filter((rule) => {
    const matchesSearch = rule.ruleId?.toLowerCase().includes(ruleSearch.toLowerCase()) || 
                          rule.description?.toLowerCase().includes(ruleSearch.toLowerCase());
    const matchesStatus = ruleFilter === "ALL" || 
                          (ruleFilter === "PASSED" && rule.passed) || 
                          (ruleFilter === "FAILED" && !rule.passed);
    return matchesSearch && matchesStatus;
  });

  const filteredRisks = risks.filter((risk) => {
    const matchesSearch = risk.reason?.toLowerCase().includes(riskSearch.toLowerCase());
    const matchesSeverity = riskSeverityFilter === "ALL" || 
                            risk.severity?.toUpperCase() === riskSeverityFilter;
    return matchesSearch && matchesSeverity;
  });

  const filteredUtterances = utterances.filter((utt) => {
    const isAgent = utt.speaker?.toUpperCase().includes("AGENT") || utt.speaker?.toUpperCase().includes("A");
    
    const matchesSpeaker = transcriptSpeakerFilter === "ALL" || 
                           (transcriptSpeakerFilter === "AGENT" && isAgent) || 
                           (transcriptSpeakerFilter === "CUSTOMER" && !isAgent);
                           
    const matchesText = !transcriptSearchTerm || 
                        utt.text?.toLowerCase().includes(transcriptSearchTerm.toLowerCase());
                        
    return matchesSpeaker && matchesText;
  });

  const totalRules = ruleResults.length;
  const passedCount = ruleResults.filter(r => r.passed).length;
  const failedCount = totalRules - passedCount;

  const isCurrentAudioPlaying = playingAudioUrl === audit.audioUrl && isPlaying;

  return (
    <div className="w-full max-w-4xl mx-auto mt-2 animate-fade-in relative select-none">
      {/* Ambient Sentiment Glow Backdrop */}
      <div className={`absolute -inset-1 rounded-[2.5rem] bg-gradient-to-tr ${glowColorClass} opacity-40 blur-3xl pointer-events-none`}></div>

      {/* Hidden local audio element */}
      {audit.audioUrl && (
        <audio 
          ref={audioRef}
          src={getFullAudioUrl()}
          onTimeUpdate={onTimeUpdate}
          onLoadedMetadata={onLoadedMetadata}
        />
      )}

      <div className="glass p-6 md:p-8 rounded-[2rem] relative overflow-hidden border border-white/10 shadow-[0_24px_80px_rgba(0,0,0,0.7)] bg-[#0d1326]/40 backdrop-blur-3xl">
        
        {/* Header Row */}
        <header className="mb-6 border-b border-white/5 pb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-black text-purple-400 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
              <ClipboardList className="w-3.5 h-3.5 text-purple-400" /> Call Quality Audit Report
            </p>
            <h3 className="text-xl md:text-2xl font-black text-white tracking-tight leading-tight truncate">
              {audit.filename}
            </h3>
          </div>
          
          <div className="flex flex-wrap items-center gap-3 shrink-0 self-start md:self-auto">
            <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-black border uppercase tracking-wider shadow-inner ${sentimentBadgeClass}`}>
              <SentimentIcon className="w-4 h-4 shrink-0" />
              <span>{audit.sentiment || "Neutral"} Sentiment</span>
            </div>
          </div>
        </header>

        {/* Dynamic Premium Audio Player Cockpit */}
        {audit.audioUrl && (
          <div className="mb-6 p-4 rounded-2xl bg-white/[0.02] border border-white/5 backdrop-blur-md flex flex-col sm:flex-row items-center gap-4 transition-all hover:bg-white/[0.03] hover:border-purple-500/20 shadow-inner">
            
            {/* Play Button Wrapper */}
            <div className="relative shrink-0">
              <button
                onClick={handlePlayPause}
                className={`w-12 h-12 rounded-xl flex items-center justify-center border transition-all duration-300 outline-none
                  ${isCurrentAudioPlaying 
                    ? "bg-purple-600 border-purple-500 text-white shadow-[0_0_20px_rgba(168,85,247,0.4)]" 
                    : "bg-white/5 border-white/10 text-purple-300 hover:bg-purple-500/10 hover:border-purple-500/30 hover:text-white"
                  }`}
              >
                {isCurrentAudioPlaying ? (
                  <Pause className="w-5 h-5 fill-current" />
                ) : (
                  <Play className="w-5 h-5 fill-current ml-0.5" />
                )}
              </button>

              {/* Animated pulse waves */}
              {isCurrentAudioPlaying && (
                <span className="absolute -inset-1 rounded-xl bg-purple-500/20 animate-ping pointer-events-none -z-10" style={{ animationDuration: "1.5s" }}></span>
              )}
            </div>

            {/* Scrubber and timings */}
            <div className="flex-1 w-full flex flex-col gap-1.5">
              <div className="flex items-center justify-between text-[10px] font-bold text-gray-400">
                <span className="flex items-center gap-1.5 text-purple-300">
                  <Volume2 className="w-3.5 h-3.5" />
                  {isCurrentAudioPlaying ? "Streaming secure session..." : "Audio session paused"}
                </span>
                <span className="font-mono text-gray-300 bg-white/[0.03] px-2 py-0.5 rounded border border-white/5">
                  {formatTime(currentTime)} / {formatTime(duration)}
                </span>
              </div>

              {/* Slider scrubber */}
              <div className="relative w-full flex items-center">
                <input
                  type="range"
                  min="0"
                  max={duration || 100}
                  value={currentTime}
                  onChange={handleScrub}
                  className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-purple-500 focus:outline-none"
                  style={{
                    background: `linear-gradient(to right, #8b5cf6 0%, #8b5cf6 ${(currentTime / (duration || 100)) * 100}%, rgba(255,255,255,0.1) ${(currentTime / (duration || 100)) * 100}%, rgba(255,255,255,0.1) 100%)`
                  }}
                />
              </div>
            </div>

            {/* Equalizer animation visualizer */}
            <div className="hidden md:flex items-end gap-[3px] h-8 w-14 px-2 shrink-0">
              {[0.5, 1.2, 0.8, 1.5, 0.4, 0.9, 1.3].map((delay, i) => (
                <span
                  key={i}
                  className={`w-[3px] rounded-full bg-gradient-to-t from-purple-500 to-indigo-400 transition-all duration-300
                    ${isCurrentAudioPlaying ? "waveform-bar" : "h-1.5 opacity-30"}`}
                  style={{ 
                    animationDelay: `${delay}s`,
                    height: isCurrentAudioPlaying ? undefined : "6px"
                  }}
                />
              ))}
            </div>

          </div>
        )}

        {/* OVERVIEW PANEL: Score + Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">
          
          {/* Circular Score Circle */}
          <div className={`flex flex-col items-center justify-center p-5 rounded-2xl border ${scoreBgClass} backdrop-blur-sm relative overflow-hidden`}>
            <div className="absolute -top-1 -right-2 text-white/5 font-black text-6xl pointer-events-none uppercase select-none tracking-tighter">QA</div>
            
            <div className="relative w-24 h-24 mb-3">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle
                  className="text-white/5 stroke-current"
                  strokeWidth="7"
                  cx="50"
                  cy="50"
                  r={radius}
                  fill="transparent"
                />
                <circle
                  className={`${scoreStrokeClass} stroke-current transition-all duration-1000 ease-out`}
                  strokeWidth="7"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  cx="50"
                  cy="50"
                  r={radius}
                  fill="transparent"
                  style={{
                    filter: `drop-shadow(0 0 6px ${percentage >= 80 ? '#10b981' : percentage >= 50 ? '#f59e0b' : '#f43f5e'})`
                  }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className={`text-2xl font-black leading-none tracking-tighter ${scoreColorClass}`}>{percentage}%</span>
                <span className="text-[7.5px] text-gray-400 font-extrabold uppercase tracking-widest mt-1">Score</span>
              </div>
            </div>

            <div className="text-center">
              <span className="text-xs font-bold text-slate-200 block">Compliance Audit</span>
              <span className="text-[10px] text-slate-400 font-bold">{score} / {maxScore} points weight</span>
            </div>
          </div>

          {/* Dialogue Metrics widget */}
          <div className="md:col-span-2 p-5 rounded-2xl bg-white/[0.02] border border-white/5 flex flex-col justify-between backdrop-blur-sm">
            <div className="flex items-center justify-between mb-3.5">
              <h4 className="text-[10px] font-black uppercase text-purple-400 tracking-widest flex items-center gap-1.5">
                <Mic className="w-3.5 h-3.5 text-purple-400" /> Dialogue Metrics
              </h4>
              <span className="text-[10px] text-gray-300 font-bold flex items-center gap-1 bg-white/[0.03] px-2.5 py-0.5 rounded-full border border-white/5">
                <Clock className="w-3 h-3 text-purple-400" /> {formatTime(totalCallDuration)} duration
              </span>
            </div>

            {/* Talk Time Balance Gauge Bar */}
            <div className="w-full bg-white/[0.01] rounded-xl p-3 border border-white/[0.03]">
              <div className="flex justify-between text-[10px] font-black text-gray-300 mb-2">
                <span className="text-purple-300">Agent Talk Time ({agentSpeechPct}%)</span>
                <span className="text-blue-300">Customer Talk Time ({customerSpeechPct}%)</span>
              </div>

              {/* Glowing Dual horizontal Progress capsule */}
              <div className="w-full h-3.5 bg-white/[0.06] rounded-full flex overflow-hidden border border-white/5 shadow-inner">
                <div 
                  className="h-full bg-gradient-to-r from-purple-600 to-indigo-500 transition-all duration-700 shadow-md relative"
                  style={{ width: `${agentSpeechPct}%` }}
                >
                  <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(255,255,255,0.05)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.05)_50%,rgba(255,255,255,0.05)_75%,transparent_75%,transparent)] bg-[length:12px_12px] opacity-40"></div>
                </div>
                <div 
                  className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 transition-all duration-700 shadow-md relative"
                  style={{ width: `${customerSpeechPct}%` }}
                >
                  <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(255,255,255,0.05)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.05)_50%,rgba(255,255,255,0.05)_75%,transparent_75%,transparent)] bg-[length:12px_12px] opacity-40"></div>
                </div>
              </div>

              <div className="flex justify-between text-[9px] text-slate-400 mt-2 font-bold uppercase tracking-wider">
                <span>Turns: {utterances.filter(u => u.speaker?.toUpperCase().includes("AGENT") || u.speaker?.toUpperCase().includes("A")).length}</span>
                <span>Turns: {utterances.filter(u => !(u.speaker?.toUpperCase().includes("AGENT") || u.speaker?.toUpperCase().includes("A"))).length}</span>
              </div>
            </div>

            {/* Talk Speeds WPM */}
            <div className="grid grid-cols-2 gap-4 mt-2.5 pt-2 border-t border-white/[0.04]">
              <div className="text-left">
                <span className="text-[9px] text-gray-500 block font-bold uppercase tracking-widest">Agent Pace</span>
                <span className="text-xs font-black text-purple-300">{agentWpm} WPM <span className="text-[9px] font-bold text-gray-500">Avg</span></span>
              </div>
              <div className="text-right">
                <span className="text-[9px] text-gray-550 block font-bold uppercase tracking-widest">Customer Pace</span>
                <span className="text-xs font-black text-blue-300">{customerWpm} WPM <span className="text-[9px] font-bold text-gray-500">Avg</span></span>
              </div>
            </div>
          </div>
        </div>

        {/* Objective & Executive Summary details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="p-4 rounded-2xl bg-white/[0.01] border border-white/5 hover:bg-white/[0.02] hover:border-purple-500/20 transition-all shadow-sm">
            <h4 className="text-[10px] font-black uppercase text-purple-400 tracking-wider mb-2 flex items-center gap-1.5">
              <Target className="w-3.5 h-3.5 text-purple-400" /> Call Objective
            </h4>
            <p className="text-slate-350 text-xs leading-relaxed font-medium">
              {audit.objective || "No explicit objective extracted."}
            </p>
          </div>
          <div className="p-4 rounded-2xl bg-white/[0.01] border border-white/5 hover:bg-white/[0.02] hover:border-pink-500/20 transition-all shadow-sm">
            <h4 className="text-[10px] font-black uppercase text-pink-400 tracking-wider mb-2 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-pink-400" /> Executive Summary
            </h4>
            <p className="text-slate-350 text-xs leading-relaxed font-medium">
              {audit.conclusion || "No conclusion provided."}
            </p>
          </div>
        </div>

        {/* TAB SYSTEM NAVIGATION */}
        <div className="flex border-b border-white/10 mb-5 overflow-x-auto gap-2 scrollbar-none select-none">
          <button
            onClick={() => setActiveTab("checklist")}
            className={`pb-3 px-3 text-xs font-bold tracking-wider uppercase border-b-2 transition-all shrink-0 flex items-center gap-1.5
              ${activeTab === "checklist"
                ? "border-purple-500 text-purple-400 font-extrabold"
                : "border-transparent text-gray-400 hover:text-white"}`}
          >
            <ClipboardList className="w-4 h-4" />
            Rules ({passedCount}/{totalRules})
          </button>
          
          <button
            onClick={() => setActiveTab("risks")}
            className={`pb-3 px-3 text-xs font-bold tracking-wider uppercase border-b-2 transition-all shrink-0 flex items-center gap-1.5
              ${activeTab === "risks"
                ? "border-purple-500 text-purple-400 font-extrabold"
                : "border-transparent text-gray-400 hover:text-white"}`}
          >
            <AlertTriangle className="w-4 h-4" />
            Compliance Risks ({risks.length})
          </button>

          <button
            onClick={() => setActiveTab("coaching")}
            className={`pb-3 px-3 text-xs font-bold tracking-wider uppercase border-b-2 transition-all shrink-0 flex items-center gap-1.5
              ${activeTab === "coaching"
                ? "border-purple-500 text-purple-400 font-extrabold"
                : "border-transparent text-gray-400 hover:text-white"}`}
          >
            <Sparkles className="w-4 h-4" />
            Representative Coaching ({coachingFeedback.length})
          </button>

          <button
            onClick={() => setActiveTab("transcript")}
            className={`pb-3 px-3 text-xs font-bold tracking-wider uppercase border-b-2 transition-all shrink-0 flex items-center gap-1.5
              ${activeTab === "transcript"
                ? "border-purple-500 text-purple-400 font-extrabold"
                : "border-transparent text-gray-400 hover:text-white"}`}
          >
            <MessageSquare className="w-4 h-4" />
            Interactive Timeline ({utterances.length})
          </button>
        </div>

        {/* TAB CONTENTS */}
        <div className="min-h-[280px]">
          
          {/* TAB: RULES CHECKLIST */}
          {activeTab === "checklist" && (
            <div className="space-y-3.5 animate-fade-in">
              
              {/* Rules Search and filters */}
              <div className="flex flex-col sm:flex-row gap-3 items-center justify-between mb-4">
                <div className="relative w-full sm:max-w-xs">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500" />
                  <input
                    type="text"
                    placeholder="Search audit rules..."
                    value={ruleSearch}
                    onChange={(e) => setRuleSearch(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 rounded-xl bg-white/[0.02] border border-white/5 text-xs text-white focus:outline-none focus:border-purple-500/50 transition-all placeholder-gray-500"
                  />
                </div>

                <div className="flex gap-1 bg-white/[0.01] border border-white/5 rounded-lg p-0.5 text-[10px] font-bold">
                  {["ALL", "PASSED", "FAILED"].map((status) => (
                    <button
                      key={status}
                      onClick={() => setRuleFilter(status)}
                      className={`px-3.5 py-1 rounded transition-all
                        ${ruleFilter === status 
                          ? "bg-purple-500/20 text-purple-300 border border-purple-500/30" 
                          : "text-gray-400 hover:text-white"}`}
                    >
                      {status === "ALL" ? "All" : status === "PASSED" ? "Passed" : "Failed"}
                    </button>
                  ))}
                </div>
              </div>

              {filteredRuleResults.length === 0 ? (
                <div className="text-center py-12 text-gray-500 border border-dashed border-white/5 rounded-xl bg-white/[0.01]">
                  No rules match your filters.
                </div>
              ) : (
                filteredRuleResults.map((rule) => {
                  const isExpanded = expandedRule === rule.ruleId;
                  
                  // Dynamic classification by weight
                  const weight = rule.weight ?? 10;
                  let classificationLabel = "Standard Criteria";
                  let classBadgeClass = "bg-purple-500/10 text-purple-300 border-purple-500/20";
                  
                  if (weight >= 20) {
                    classificationLabel = "CRITICAL COMPLIANCE";
                    classBadgeClass = "bg-rose-500/10 text-rose-350 border-rose-500/20 animate-pulse";
                  } else if (weight < 10) {
                    classificationLabel = "Supporting Guideline";
                    classBadgeClass = "bg-blue-500/10 text-blue-300 border-blue-500/20";
                  }

                  return (
                    <div 
                      key={rule.ruleId} 
                      className={`rounded-xl border transition-all duration-300 overflow-hidden
                        ${rule.passed 
                          ? "bg-emerald-500/[0.005] border-emerald-500/10 hover:border-emerald-500/25" 
                          : "bg-rose-500/[0.005] border-rose-500/10 hover:border-rose-500/25"}`}
                    >
                      {/* Rule Item Header */}
                      <div 
                        onClick={() => toggleRule(rule.ruleId)}
                        className="p-4 flex items-center justify-between gap-4 cursor-pointer select-none"
                      >
                        <div className="flex items-center gap-3">
                          {rule.passed ? (
                            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 shadow-lg shadow-emerald-400/10" />
                          ) : (
                            <XCircle className="w-5 h-5 text-rose-400 shrink-0 shadow-lg shadow-rose-400/10" />
                          )}
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-extrabold text-xs text-white uppercase tracking-wider">{rule.ruleId}</span>
                              <span className={`text-[8px] uppercase tracking-widest font-black px-1.5 py-0.5 rounded border ${classBadgeClass}`}>
                                {classificationLabel} (W: {weight})
                              </span>
                            </div>
                            <p className="text-[11px] text-gray-400 mt-1 font-medium line-clamp-1 sm:line-clamp-none">
                              {rule.description || `Criteria mapping for ${rule.ruleId}.`}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <span className={`text-[9px] uppercase font-black px-2 py-0.5 rounded-full border hidden sm:inline-block
                            ${rule.passed 
                              ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" 
                              : "bg-rose-500/10 border-rose-500/20 text-rose-400"}`}
                          >
                            {rule.passed ? "Passed" : "Failed"}
                          </span>
                          {isExpanded ? (
                            <ChevronUp className="w-4 h-4 text-gray-500" />
                          ) : (
                            <ChevronDown className="w-4 h-4 text-gray-500" />
                          )}
                        </div>
                      </div>

                      {/* Evidence details */}
                      {isExpanded && (
                        <div className="px-4 pb-4 pt-1.5 border-t border-white/[0.04] bg-[#070c18]/40 animate-fade-in">
                          <div className="text-[10px] text-purple-400 font-black uppercase tracking-wider mb-2 flex items-center gap-1.5">
                            <Info className="w-3.5 h-3.5 text-purple-400" /> Extracted Conversational Evidence
                          </div>
                          <div className="p-3.5 rounded-xl bg-black/40 border border-white/5 text-[11px] text-slate-300 leading-relaxed italic relative">
                            <span className="text-purple-500 text-3xl font-serif absolute -top-2 left-1.5 select-none pointer-events-none opacity-30">“</span>
                            <p className="pl-5 pr-2 whitespace-pre-wrap font-medium">
                              {rule.evidence || "No transcript quotes or explicit evidence found in this call."}
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
              
              {/* Risks Filter row */}
              <div className="flex flex-col sm:flex-row gap-3 items-center justify-between mb-3">
                <div className="relative w-full sm:max-w-xs">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500" />
                  <input
                    type="text"
                    placeholder="Search detected risks..."
                    value={riskSearch}
                    onChange={(e) => setRiskSearch(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 rounded-xl bg-white/[0.02] border border-white/5 text-xs text-white focus:outline-none focus:border-purple-500/50 placeholder-gray-500"
                  />
                </div>

                <div className="flex gap-1 bg-white/[0.01] border border-white/5 rounded-lg p-0.5 text-[10px] font-bold">
                  {["ALL", "HIGH", "MEDIUM", "LOW"].map((sev) => (
                    <button
                      key={sev}
                      onClick={() => setRiskSeverityFilter(sev)}
                      className={`px-3.5 py-1 rounded transition-all
                        ${riskSeverityFilter === sev 
                          ? "bg-purple-500/20 text-purple-300 border border-purple-500/30" 
                          : "text-gray-400 hover:text-white"}`}
                    >
                      {sev === "ALL" ? "All" : sev}
                    </button>
                  ))}
                </div>
              </div>

              {filteredRisks.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center border border-dashed border-white/5 rounded-xl bg-white/[0.01]">
                  <CheckCircle2 className="w-12 h-12 text-emerald-400 mb-2 animate-bounce" style={{ animationDuration: "4s" }} />
                  <span className="text-sm font-bold text-white">Full Regulatory Clearance</span>
                  <p className="text-xs text-gray-500 mt-1 max-w-sm">No regulatory, compliance, or customer service risks were detected in this audit.</p>
                </div>
              ) : (
                filteredRisks.map((risk, index) => {
                  const severity = risk.severity?.toUpperCase() || "LOW";
                  
                  let borderLeftClass = "border-l-blue-500";
                  let severityBadgeColor = "bg-blue-500/10 text-blue-300 border-blue-500/20";
                  let riskIconColor = "text-blue-400";
                  
                  if (severity === "HIGH") {
                    borderLeftClass = "border-l-rose-500";
                    severityBadgeColor = "bg-rose-500/10 text-rose-350 border-rose-500/20";
                    riskIconColor = "text-rose-450";
                  } else if (severity === "MEDIUM") {
                    borderLeftClass = "border-l-amber-500";
                    severityBadgeColor = "bg-amber-500/10 text-amber-350 border-amber-500/20";
                    riskIconColor = "text-amber-450";
                  }

                  return (
                    <div 
                      key={index}
                      className={`p-4 rounded-xl border border-white/5 border-l-4 ${borderLeftClass} flex gap-4 transition-all bg-white/[0.005] hover:bg-white/[0.015] shadow-sm`}
                    >
                      <AlertTriangle className={`w-5 h-5 shrink-0 mt-0.5 ${riskIconColor}`} />
                      
                      <div className="flex-1 flex flex-col justify-between sm:flex-row sm:items-start gap-3">
                        <div>
                          <div className="flex items-center gap-2 flex-wrap mb-2">
                            <span className={`text-[8px] uppercase tracking-widest font-black px-2 py-0.5 rounded border ${severityBadgeColor}`}>
                              {severity} SEVERITY
                            </span>
                            <span className="text-[10px] text-gray-400 flex items-center gap-1 font-bold bg-white/[0.02] px-2 py-0.5 rounded border border-white/5">
                              <Clock className="w-3 h-3 text-purple-400" />
                              Timestamp: {risk.timestamp || "0:00"}
                            </span>
                          </div>
                          <p className="text-xs text-slate-200 leading-relaxed font-medium">
                            {risk.reason || "Detail not specified."}
                          </p>
                        </div>

                        {/* Interactive Jump Trigger */}
                        <button
                          onClick={() => handleJumpToTranscript(risk.timestamp)}
                          className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-500/10 border border-purple-500/25 text-[10px] font-black text-purple-300 hover:bg-purple-500/20 hover:text-white transition-all self-start shadow-sm"
                        >
                          Focus Speech <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          )}

          {/* TAB: COACHING FEEDBACK */}
          {activeTab === "coaching" && (
            <div className="space-y-4 animate-fade-in">
              <div className="p-4 rounded-xl bg-purple-500/5 border border-purple-500/10 flex items-center gap-3.5 shadow-md">
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 shrink-0">
                  <Award className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">Representative Alignment Plan</h4>
                  <p className="text-[11px] text-gray-400 mt-0.5">Custom action items extracted by Google Gemini to elevate call quality scores.</p>
                </div>
              </div>

              {coachingFeedback.length === 0 ? (
                <div className="text-center py-12 text-gray-500 italic">No specific coaching points extracted.</div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {coachingFeedback.map((point, idx) => (
                    <div 
                      key={idx} 
                      className="p-4 rounded-xl bg-white/[0.005] border border-white/5 flex gap-3 hover:border-purple-500/20 hover:bg-white/[0.015] transition-all shadow-sm"
                    >
                      <span className="w-6 h-6 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-xs font-black text-purple-300 shrink-0">{idx + 1}</span>
                      <p className="text-slate-200 text-xs leading-relaxed font-medium">
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
            <div className="space-y-4 animate-fade-in">
              
              {/* Timeline search filter controls */}
              <div className="flex flex-col sm:flex-row gap-3 items-center justify-between mb-4 p-1.5 bg-white/[0.01] border border-white/5 rounded-xl backdrop-blur-sm">
                <div className="relative w-full sm:max-w-xs pl-1">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500" />
                  <input
                    type="text"
                    placeholder="Search dialogue words..."
                    value={transcriptSearchTerm}
                    onChange={(e) => setTranscriptSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 bg-transparent text-xs text-white placeholder-gray-505 focus:outline-none"
                  />
                </div>

                <div className="flex gap-1 text-[10px] font-bold pr-1">
                  {["ALL", "AGENT", "CUSTOMER"].map((spk) => (
                    <button
                      key={spk}
                      onClick={() => setTranscriptSpeakerFilter(spk)}
                      className={`px-3.5 py-1.5 rounded-lg transition-all
                        ${transcriptSpeakerFilter === spk 
                          ? "bg-purple-500/20 text-purple-300 border border-purple-500/30" 
                          : "text-gray-400 hover:text-white"}`}
                    >
                      {spk === "ALL" ? "All Speakers" : spk === "AGENT" ? "Agent Only" : "Customer Only"}
                    </button>
                  ))}
                </div>
              </div>

              {/* Scrollable Timeline */}
              <div className="space-y-4 max-h-[480px] overflow-y-auto pr-2 scrollbar-thin scroll-smooth pb-6">
                {filteredUtterances.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-center border border-dashed border-white/5 rounded-xl bg-white/[0.01]">
                    <MessageSquare className="w-12 h-12 text-purple-500/20 mb-2" />
                    <span className="text-sm font-bold text-white">Dialogue Speech Matches Not Found</span>
                    <p className="text-xs text-gray-500 mt-1 max-w-sm">No speech bubbles fit your query parameters.</p>
                  </div>
                ) : (
                  filteredUtterances.map((utt, index) => {
                    const isAgent = utt.speaker?.toUpperCase().includes("AGENT") || utt.speaker?.toUpperCase().includes("A");
                    const originalIndex = utterances.findIndex(u => u.start === utt.start && u.text === utt.text);
                    const isHighlighted = highlightedUtteranceIndex === originalIndex;

                    const wordsCount = utt.text ? utt.text.trim().split(/\s+/).length : 0;
                    const durationSec = (utt.end ?? 0) - (utt.start ?? 0);

                    return (
                      <div 
                        key={originalIndex}
                        id={`utterance-bubble-${originalIndex}`}
                        className={`flex gap-3 max-w-[85%] transition-all duration-500 rounded-2xl relative
                          ${isAgent ? "mr-auto flex-row" : "ml-auto flex-row-reverse"}
                          ${isHighlighted 
                            ? "ring-2 ring-purple-500/60 bg-purple-500/[0.04] scale-[1.01] p-2.5 -m-2.5 shadow-[0_8px_30px_rgba(168,85,247,0.15)] rounded-2xl animate-pulse" 
                            : ""}`}
                      >
                        {/* Avatar */}
                        <div className={`w-9 h-9 rounded-xl shrink-0 flex items-center justify-center text-xs font-black shadow-md border
                          ${isAgent 
                            ? "bg-purple-500/10 text-purple-300 border-purple-500/25 shadow-purple-500/5" 
                            : "bg-blue-500/10 text-blue-300 border-blue-500/25 shadow-blue-500/5"}`}
                        >
                          {isAgent ? "AG" : "CU"}
                        </div>

                        {/* Dialogue bubble details */}
                        <div className="flex flex-col gap-1 w-full">
                          <div className={`flex items-center gap-2 text-[9px] font-black text-gray-400
                            ${isAgent ? "flex-row" : "flex-row-reverse"}`}
                          >
                            <span className={`uppercase tracking-widest ${isAgent ? "text-purple-300" : "text-blue-300"}`}>
                              {isAgent ? "AGENT" : "CUSTOMER"}
                            </span>
                            <span>•</span>
                            <span className="flex items-center gap-0.5 bg-white/[0.02] border border-white/5 px-2 py-0.5 rounded font-mono text-[9px]">
                              <Clock className="w-2.5 h-2.5 text-purple-400" />
                              {formatTime(utt.start)} - {formatTime(utt.end)}
                            </span>
                            <span>•</span>
                            <span className="font-mono text-gray-550">
                              {wordsCount} words ({durationSec.toFixed(1)}s)
                            </span>
                          </div>

                          <div className={`p-4 rounded-2xl text-[12px] md:text-[13px] leading-relaxed border shadow-md font-medium relative group/bubble
                            ${isAgent 
                              ? "bg-[#0b0c16]/95 border-purple-500/10 rounded-tl-none text-purple-50/95" 
                              : "bg-[#090b14]/95 border-blue-500/10 rounded-tr-none text-blue-50/95"}`}
                          >
                            {getHighlightedText(utt.text, transcriptSearchTerm)}

                            {/* Mini hover performance cue */}
                            <div className="absolute right-3.5 bottom-1 opacity-0 group-hover/bubble:opacity-100 transition-opacity pointer-events-none text-[8.5px] font-bold text-gray-500">
                              Pace: {Math.round(wordsCount / (durationSec / 60) || 0)} WPM
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
