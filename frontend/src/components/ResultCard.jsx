import { useState, useRef, useEffect } from "react";
import axios from "axios";
import { 
  Sparkles, Target, FileText, Smile, Meh, Frown, 
  CheckCircle2, XCircle, AlertTriangle, MessageSquare, 
  Award, ChevronDown, ChevronUp, Clock, User, ClipboardList, 
  Info, Search, Mic, ArrowRight, Activity, Zap, Play, Pause, Volume2, Music,
  Send, RefreshCw, Cpu, Database, ShieldCheck, UserCheck, Eye, EyeOff,
  Edit2, Trash2, Check, X, BarChart3, PieChart, TrendingUp
} from "lucide-react";

export default function ResultCard({ 
  audit, 
  playingAudioUrl, 
  setPlayingAudioUrl, 
  isPlaying, 
  setIsPlaying, 
  backendUrl,
  handleRenameAudit,
  handleDeleteAudit
}) {
  const [mode, setMode] = useState(audit?.mode || "ai");
  const [activeTab, setActiveTab] = useState("checklist");
  const [expandedRule, setExpandedRule] = useState(null);
  
  // Rename States
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState(audit?.filename || "");

  useEffect(() => {
    setEditedName(audit?.filename || "");
    setIsEditingName(false);
  }, [audit]);

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

  // SaaS Manual Override states
  const [localRules, setLocalRules] = useState([]);
  const [manualCoaching, setManualCoaching] = useState("");
  const [savingOverride, setSavingOverride] = useState(false);
  const [activeRules, setActiveRules] = useState([]);

  // AuditGPT States
  const [chatInput, setChatInput] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  const [sendingChat, setSendingChat] = useState(false);

  // CRM Sync States
  const [crmSyncing, setCrmSyncing] = useState({ salesforce: false, zoho: false, hubspot: false });
  const [crmSynced, setCrmSynced] = useState({ salesforce: false, zoho: false, hubspot: false });

  // Initialize and synchronise state whenever audit changes
  useEffect(() => {
    if (audit) {
      setMode(audit.mode || "ai");
      
      const initialRules = audit.isManuallyAudited && audit.manualRuleOverrides?.length > 0
        ? audit.manualRuleOverrides
        : (audit.ruleResults || audit.rule_results || []);
      
      setLocalRules(initialRules.map(r => ({
        ruleId: r.ruleId || r.rule_id,
        passed: r.passed,
        evidence: r.evidence || ""
      })));

      const initialCoaching = audit.isManuallyAudited && audit.manualCoachingFeedback?.length > 0
        ? audit.manualCoachingFeedback.join("\n")
        : (audit.coachingFeedback || audit.coaching_feedback || []).join("\n");
      
      setManualCoaching(initialCoaching);
      setChatHistory(audit.chatHistory || []);
    }
  }, [audit]);

  // Load master active rules from backend
  useEffect(() => {
    const fetchRules = async () => {
      try {
        const { data } = await axios.get(`${backendUrl || ""}/api/audit/rules`);
        if (data.success && data.rules) {
          setActiveRules(data.rules);
        }
      } catch (err) {
        console.error("Failed to load active rules from backend:", err);
        // Clean fallback rules
        setActiveRules([
          { id: "greeting", description: "Agent must greet the customer politely", weight: 10, severity: "HIGH" },
          { id: "listening", description: "Agent must actively listen and acknowledge customer concerns", weight: 15, severity: "HIGH" },
          { id: "empathy", description: "Agent must show empathy towards customer issues", weight: 10, severity: "MEDIUM" },
          { id: "resolution", description: "Agent must attempt to resolve the issue", weight: 20, severity: "HIGH" },
          { id: "closing", description: "Agent must close the call professionally", weight: 10, severity: "MEDIUM" },
          { id: "compliance", description: "Agent must comply with company policies", weight: 25, severity: "HIGH" },
          { id: "tone", description: "Agent must maintain professional tone", weight: 10, severity: "LOW" }
        ]);
      }
    };
    fetchRules();
  }, [backendUrl]);

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

  // Toggle checklist checkbox
  const handleToggleLocalRule = (ruleId) => {
    setLocalRules(prev => 
      prev.map(r => r.ruleId === ruleId ? { ...r, passed: !r.passed } : r)
    );
  };

  // Handle evidence text input
  const handleEvidenceChange = (ruleId, text) => {
    setLocalRules(prev => 
      prev.map(r => r.ruleId === ruleId ? { ...r, evidence: text } : r)
    );
  };

  // Save manual audit overrides to the backend
  const handleSaveOverride = async () => {
    setSavingOverride(true);
    try {
      const parsedCoaching = manualCoaching
        .split("\n")
        .map(line => line.trim())
        .filter(line => line.length > 0);

      const { data } = await axios.post(`${backendUrl || ""}/api/audit/${audit._id}/override`, {
        manualRuleOverrides: localRules,
        manualCoachingFeedback: parsedCoaching
      });

      if (data.success && data.audit) {
        alert("Manual compliance override saved successfully!");
        audit.isManuallyAudited = true;
        audit.manualRuleOverrides = data.audit.manualRuleOverrides;
        audit.manualScore = data.audit.manualScore;
        audit.manualCoachingFeedback = data.audit.manualCoachingFeedback;
        audit.score = data.audit.manualScore;
      }
    } catch (err) {
      console.error("Override Save Error:", err);
      alert(err.response?.data?.error || "Failed to save manual overrides.");
    } finally {
      setSavingOverride(false);
    }
  };

  // Send message to AuditGPT
  const handleSendChatMessage = async (e) => {
    if (e) e.preventDefault();
    if (!chatInput.trim() || sendingChat) return;

    const userMessage = chatInput.trim();
    setChatInput("");
    setSendingChat(true);

    // Immediate optimistic update
    setChatHistory(prev => [...prev, { sender: "USER", text: userMessage, timestamp: new Date() }]);

    try {
      const { data } = await axios.post(`${backendUrl || ""}/api/audit/${audit._id}/chat`, {
        message: userMessage
      });
      if (data.success && data.chatHistory) {
        setChatHistory(data.chatHistory);
        audit.chatHistory = data.chatHistory;
      }
    } catch (err) {
      console.error("Chat Completion Error:", err);
      setChatHistory(prev => [...prev, { sender: "AI", text: "Failed to connect to AuditGPT. Verify that GEMINI_API_KEY is configured in your server.", timestamp: new Date() }]);
    } finally {
      setSendingChat(false);
    }
  };

  // Sync to CRM Integration mock
  const handleCrmSync = (platform) => {
    setCrmSyncing(prev => ({ ...prev, [platform]: true }));
    setTimeout(() => {
      setCrmSyncing(prev => ({ ...prev, [platform]: false }));
      setCrmSynced(prev => ({ ...prev, [platform]: true }));
    }, 1500);
  };

  if (!audit) return null;

  const sentimentLower = audit.sentiment?.toLowerCase() || "";
  const isPositive = sentimentLower.includes("positive");
  const isNegative = sentimentLower.includes("negative");

  // Sentiment Styles
  let SentimentIcon = Meh;
  let sentimentBadgeClass = "bg-blue-500/10 text-blue-300 border-blue-500/20 shadow-[0_0_12px_rgba(59,130,246,0.1)]";
  let glowColorClass = "from-blue-600/60 via-purple-600/30 to-transparent";

  if (isPositive) {
    SentimentIcon = Smile;
    sentimentBadgeClass = "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-[0_0_12px_rgba(16,185,129,0.1)]";
  } else if (isNegative) {
    SentimentIcon = Frown;
    sentimentBadgeClass = "bg-rose-500/10 text-rose-400 border-rose-500/20 shadow-[0_0_12px_rgba(244,63,94,0.1)]";
  }
  
  if (audit.score >= 85) {
    glowColorClass = "from-emerald-500/60 via-teal-500/30 to-transparent";
  } else if (audit.score < 70) {
    glowColorClass = "from-rose-600/60 via-red-500/30 to-transparent";
  }

  const score = audit.score ?? 0;
  const maxScore = audit.maxScore || 100;
  const percentage = Math.round((score / maxScore) * 100);

  // Score Colors
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

  // Circular score progress math
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  const ruleResults = audit.ruleResults || audit.rule_results || [];
  const risks = audit.risks || [];
  const coachingFeedback = audit.isManuallyAudited ? (audit.manualCoachingFeedback || []) : (audit.coachingFeedback || audit.coaching_feedback || []);
  const utterances = audit.utterances || [];

  // SaaS Intelligence field overrides and fail-safe defaults
  const agentMetrics = audit.agentMetrics || { empathyScore: 85, confidenceScore: 80, talkRatio: 50, deadAirPct: 5 };
  const predictiveAnalytics = audit.predictiveAnalytics || { churnRisk: 10, escalationRisk: 15, fraudRisk: 2, predictiveReason: "Standard interaction pacing without abnormal risk indicators." };
  const voiceBiometrics = audit.voiceBiometrics || { biometricStatus: "MATCHED", verifiedSpeaker: "Alex (Agent)", matchScore: 99.8 };
  const topicsAndKeywords = audit.topicsAndKeywords || { topics: ["Billing Dispute", "Customer Satisfaction"], keywords: ["bill", "double charge"], hinglishSummary: "Call ka objective billing problems ko resolve karna tha jisme agent ne double charges reverse kiye." };
  const liveAssistLogs = audit.liveAssistLogs || [];

  // Dynamic Speech Metrics
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

  // Real-time speech assist coaching check based on current playhead time
  const activeSuggestion = isPlaying && playingAudioUrl === audit.audioUrl
    ? liveAssistLogs.find(log => currentTime >= log.timestamp && currentTime <= log.timestamp + 5)
    : null;

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
    let closestIndex = 0;
    let minDifference = Infinity;

    utterances.forEach((u, index) => {
      const diff = Math.abs(u.start - targetSeconds);
      if (diff < minDifference) {
        minDifference = diff;
        closestIndex = index;
      }
    });

    setActiveTab("transcript");
    setHighlightedUtteranceIndex(closestIndex);
    setTranscriptSpeakerFilter("ALL");
    setTranscriptSearchTerm("");

    setTimeout(() => {
      const element = document.getElementById(`utterance-bubble-${closestIndex}`);
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }, 200);
  };

  const formatTime = (seconds) => {
    if (seconds == null || isNaN(seconds)) return "00:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

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

  // Tab Filtering logic
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

  // Sentiment Analytics Calculations
  const posTurns = utterances.filter(u => u.sentiment?.toLowerCase().includes("pos")).length;
  const negTurns = utterances.filter(u => u.sentiment?.toLowerCase().includes("neg")).length;
  const neuTurns = utterances.length - posTurns - negTurns;
  const totalTurns = utterances.length || 1;
  const posPct = Math.round((posTurns / totalTurns) * 100);
  const negPct = Math.round((negTurns / totalTurns) * 100);
  const neuPct = 100 - posPct - negPct;

  return (
    <div className="w-full max-w-4xl mx-auto mt-2 animate-fade-in relative select-none">
      {/* Ambient Sentiment Glow Backdrop */}
      <div className={`absolute -inset-2 rounded-[2.5rem] bg-gradient-to-tr ${glowColorClass} blur-3xl pointer-events-none opacity-80`}></div>

      {/* Hidden local audio element */}
      {audit.audioUrl && (
        <audio 
          ref={audioRef}
          src={getFullAudioUrl()}
          onTimeUpdate={onTimeUpdate}
          onLoadedMetadata={onLoadedMetadata}
        />
      )}

      {/* Main Glassmorphic Wrapper */}
      <div className="p-6 md:p-8 rounded-[2rem] relative overflow-hidden bg-[#0d1326]/60 backdrop-blur-2xl border-t border-l border-white/20 border-b border-r border-white/5 shadow-[0_24px_80px_rgba(0,0,0,0.8),inset_0_1px_1px_rgba(255,255,255,0.15)] ring-1 ring-white/10 z-10">
        
        {/* Header Row */}
        <header className="mb-6 border-b border-white/5 pb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-black text-purple-400 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
              <ClipboardList className="w-3.5 h-3.5 text-purple-400" /> Call Quality Audit Report
            </p>
            {isEditingName ? (
              <div className="flex items-center gap-2 max-w-full">
                <input
                  type="text"
                  value={editedName}
                  onChange={(e) => setEditedName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      if (editedName.trim() !== "" && editedName.trim() !== audit.filename) {
                        handleRenameAudit(audit._id, editedName.trim());
                      }
                      setIsEditingName(false);
                    }
                    if (e.key === "Escape") {
                      setEditedName(audit.filename);
                      setIsEditingName(false);
                    }
                  }}
                  autoFocus
                  className="bg-black/60 border border-purple-500/50 rounded-xl px-3 py-1.5 text-sm font-bold text-white outline-none focus:ring-1 focus:ring-purple-500/50 flex-1 min-w-[200px]"
                />
                <button
                  onClick={() => {
                    if (editedName.trim() !== "" && editedName.trim() !== audit.filename) {
                      handleRenameAudit(audit._id, editedName.trim());
                    }
                    setIsEditingName(false);
                  }}
                  className="p-2 bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/30 rounded-xl text-emerald-400 cursor-pointer transition-all"
                  title="Save new filename"
                >
                  <Check size={14} />
                </button>
                <button
                  onClick={() => {
                    setEditedName(audit.filename);
                    setIsEditingName(false);
                  }}
                  className="p-2 bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/30 rounded-xl text-rose-400 cursor-pointer transition-all"
                  title="Cancel rename"
                >
                  <X size={14} />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3 group/report-title">
                <h3 className="text-xl md:text-2xl font-black text-white tracking-tight leading-tight truncate">
                  {audit.filename}
                </h3>
                <div className="flex items-center gap-1.5 opacity-0 group-hover/report-title:opacity-100 transition-opacity duration-200">
                  <button
                    onClick={() => {
                      setEditedName(audit.filename);
                      setIsEditingName(true);
                    }}
                    className="p-1.5 bg-white/5 hover:bg-purple-600 border border-white/5 hover:border-purple-500/40 rounded-lg text-slate-400 hover:text-white cursor-pointer transition-all"
                    title="Rename call file"
                  >
                    <Edit2 size={12} />
                  </button>
                  <button
                    onClick={() => {
                      handleDeleteAudit(audit._id);
                    }}
                    className="p-1.5 bg-white/5 hover:bg-rose-900/30 border border-white/5 hover:border-rose-500/40 rounded-lg text-slate-400 hover:text-rose-400 cursor-pointer transition-all"
                    title="Delete audit record"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
            )}
          </div>
          
          <div className="flex flex-wrap items-center gap-3 shrink-0 self-start md:self-auto">
            {/* Mode toggler switcher */}
            <div className="flex bg-white/5 border border-white/10 rounded-full p-0.5 text-[10px] select-none shadow-inner">
              <button
                onClick={() => {
                  setMode("normal");
                  setActiveTab("checklist");
                }}
                className={`px-3.5 py-1.5 rounded-full font-black uppercase tracking-wider transition-all duration-300 cursor-pointer ${
                  mode === "normal"
                    ? "bg-purple-600 border border-purple-500 text-white shadow-[0_0_12px_rgba(168,85,247,0.3)]"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                Auditor
              </button>
              <button
                onClick={() => {
                  setMode("ai");
                  setActiveTab("checklist");
                }}
                className={`px-3.5 py-1.5 rounded-full font-black uppercase tracking-wider transition-all duration-300 flex items-center gap-1 cursor-pointer ${
                  mode === "ai"
                    ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-[0_0_15px_rgba(168,85,247,0.4)]"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                <Sparkles className="w-3 h-3 text-yellow-300 animate-pulse" />
                AI Intel
              </button>
            </div>

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
                className={`w-12 h-12 rounded-xl flex items-center justify-center border transition-all duration-300 outline-none cursor-pointer
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

              {isCurrentAudioPlaying && (
                <span className="absolute -inset-1 rounded-xl bg-purple-500/20 animate-ping pointer-events-none -z-10" style={{ animationDuration: "1.5s" }}></span>
              )}
            </div>

            {/* Scrubber & timelines */}
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

        {/* Real-time assist warning alert overlay */}
        {activeSuggestion && (
          <div className="mb-4 p-3 rounded-xl bg-purple-950/70 border border-purple-500/30 text-white flex items-center gap-3 animate-fade-in shadow-[0_0_20px_rgba(168,85,247,0.25)] relative overflow-hidden backdrop-blur-md">
            <span className="absolute -inset-1 bg-gradient-to-r from-purple-500/10 via-indigo-500/10 to-transparent pointer-events-none" />
            <div className="w-7 h-7 rounded-lg bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-300 shrink-0">
              <Zap className="w-4 h-4 text-purple-300 animate-bounce" />
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-[8.5px] font-black text-purple-400 uppercase tracking-widest block">
                Live Assist Simulator ({formatTime(activeSuggestion.timestamp)})
              </span>
              <p className="text-[11px] font-extrabold text-purple-100 truncate">
                {activeSuggestion.suggestion}
              </p>
            </div>
            <span className="text-[7.5px] font-black text-purple-400 bg-purple-900/40 px-2 py-0.5 rounded border border-purple-500/20 uppercase tracking-wider shrink-0 select-none animate-pulse">
              {activeSuggestion.category}
            </span>
          </div>
        )}

        {/* OVERVIEW PANEL: Score + Quick Stats or AI Intelligence Cockpit */}
        {mode === "normal" ? (
          /* Normal Mode Overview Panel */
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">
            
            {/* Score Ring Widget */}
            <div className={`flex flex-col items-center justify-center p-5 rounded-2xl border ${scoreBgClass} backdrop-blur-sm relative overflow-hidden`}>
              <div className="absolute -top-1 -right-2 text-white/5 font-black text-6xl pointer-events-none uppercase select-none tracking-tighter">QA</div>
              
              <div className="relative w-24 h-24 mb-3">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  <circle className="text-white/5 stroke-current" strokeWidth="7" cx="50" cy="50" r={radius} fill="transparent" />
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

            {/* Speech Metrics turn balance details */}
            <div className="md:col-span-2 p-5 rounded-2xl bg-white/[0.02] border border-white/5 flex flex-col justify-between backdrop-blur-sm">
              <div className="flex items-center justify-between mb-3.5">
                <h4 className="text-[10px] font-black uppercase text-purple-400 tracking-widest flex items-center gap-1.5">
                  <Mic className="w-3.5 h-3.5 text-purple-400" /> Dialogue Metrics
                </h4>
                <span className="text-[10px] text-gray-300 font-bold flex items-center gap-1 bg-white/[0.03] px-2.5 py-0.5 rounded-full border border-white/5">
                  <Clock className="w-3 h-3 text-purple-400" /> {formatTime(totalCallDuration)} duration
                </span>
              </div>

              <div className="w-full bg-white/[0.01] rounded-xl p-3 border border-white/[0.03]">
                <div className="flex justify-between text-[10px] font-black text-gray-300 mb-2">
                  <span className="text-purple-300">Agent Talk Time ({agentSpeechPct}%)</span>
                  <span className="text-blue-300">Customer Talk Time ({customerSpeechPct}%)</span>
                </div>

                <div className="w-full h-3.5 bg-white/[0.06] rounded-full flex overflow-hidden border border-white/5 shadow-inner">
                  <div className="h-full bg-gradient-to-r from-purple-600 to-indigo-500 transition-all duration-700 shadow-md relative" style={{ width: `${agentSpeechPct}%` }}>
                    <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(255,255,255,0.05)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.05)_50%,rgba(255,255,255,0.05)_75%,transparent_75%,transparent)] bg-[length:12px_12px] opacity-40"></div>
                  </div>
                  <div className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 transition-all duration-700 shadow-md relative" style={{ width: `${customerSpeechPct}%` }}>
                    <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(255,255,255,0.05)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.05)_50%,rgba(255,255,255,0.05)_75%,transparent_75%,transparent)] bg-[length:12px_12px] opacity-40"></div>
                  </div>
                </div>

                <div className="flex justify-between text-[9px] text-slate-400 mt-2 font-bold uppercase tracking-wider">
                  <span>Turns: {utterances.filter(u => u.speaker?.toUpperCase().includes("AGENT") || u.speaker?.toUpperCase().includes("A")).length}</span>
                  <span>Turns: {utterances.filter(u => !(u.speaker?.toUpperCase().includes("AGENT") || u.speaker?.toUpperCase().includes("A"))).length}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-2.5 pt-2 border-t border-white/[0.04]">
                <div className="text-left">
                  <span className="text-[9px] text-gray-500 block font-bold uppercase tracking-widest">Agent Pace</span>
                  <span className="text-xs font-black text-purple-300">{agentWpm} WPM <span className="text-[9px] font-bold text-gray-500">Avg</span></span>
                </div>
                <div className="text-right">
                  <span className="text-[9px] text-gray-500 block font-bold uppercase tracking-widest">Customer Pace</span>
                  <span className="text-xs font-black text-blue-300">{customerWpm} WPM <span className="text-[9px] font-bold text-gray-500">Avg</span></span>
                </div>
              </div>
            </div>

          </div>
        ) : (
          /* AI Mode Cockpit */
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">
            
            {/* Column 1: Speech & Performance Metrics (Empathy, Confidence, Talk ratio, Dead air) */}
            <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 flex flex-col justify-between backdrop-blur-sm relative overflow-hidden">
              <div className="absolute -top-1 -right-2 text-white/5 font-black text-5xl pointer-events-none select-none tracking-tighter uppercase">AGENT</div>
              
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-[10px] font-black uppercase text-purple-400 tracking-widest flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-purple-400" /> Speech Analytics
                </h4>
                <span className="text-[8px] uppercase tracking-widest font-black px-1.5 py-0.5 rounded border border-purple-500/20 bg-purple-500/10 text-purple-300">
                  REAL-TIME
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Empathy */}
                <div className="flex flex-col items-center">
                  <div className="relative w-16 h-16 mb-1">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                      <circle className="text-white/5 stroke-current" strokeWidth="8" cx="50" cy="50" r="38" fill="transparent" />
                      <circle className="text-emerald-500 stroke-current" strokeWidth="8" strokeDasharray={2 * Math.PI * 38} strokeDashoffset={2 * Math.PI * 38 - (agentMetrics.empathyScore / 100) * 2 * Math.PI * 38} cx="50" cy="50" r="38" fill="transparent" strokeLinecap="round" />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center text-xs font-black text-emerald-400">{agentMetrics.empathyScore}%</div>
                  </div>
                  <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Empathy</span>
                </div>

                {/* Confidence */}
                <div className="flex flex-col items-center">
                  <div className="relative w-16 h-16 mb-1">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                      <circle className="text-white/5 stroke-current" strokeWidth="8" cx="50" cy="50" r="38" fill="transparent" />
                      <circle className="text-blue-500 stroke-current" strokeWidth="8" strokeDasharray={2 * Math.PI * 38} strokeDashoffset={2 * Math.PI * 38 - (agentMetrics.confidenceScore / 100) * 2 * Math.PI * 38} cx="50" cy="50" r="38" fill="transparent" strokeLinecap="round" />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center text-xs font-black text-blue-400">{agentMetrics.confidenceScore}%</div>
                  </div>
                  <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Confidence</span>
                </div>

                {/* Talk Ratio */}
                <div className="flex flex-col items-center">
                  <div className="relative w-16 h-16 mb-1">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                      <circle className="text-white/5 stroke-current" strokeWidth="8" cx="50" cy="50" r="38" fill="transparent" />
                      <circle className="text-purple-500 stroke-current" strokeWidth="8" strokeDasharray={2 * Math.PI * 38} strokeDashoffset={2 * Math.PI * 38 - (agentMetrics.talkRatio / 100) * 2 * Math.PI * 38} cx="50" cy="50" r="38" fill="transparent" strokeLinecap="round" />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center text-xs font-black text-purple-400">{agentMetrics.talkRatio}%</div>
                  </div>
                  <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Talk Ratio</span>
                </div>

                {/* Dead Air */}
                <div className="flex flex-col items-center">
                  <div className="relative w-16 h-16 mb-1">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                      <circle className="text-white/5 stroke-current" strokeWidth="8" cx="50" cy="50" r="38" fill="transparent" />
                      <circle className="text-rose-500 stroke-current" strokeWidth="8" strokeDasharray={2 * Math.PI * 38} strokeDashoffset={2 * Math.PI * 38 - (agentMetrics.deadAirPct / 100) * 2 * Math.PI * 38} cx="50" cy="50" r="38" fill="transparent" strokeLinecap="round" />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center text-xs font-black text-rose-400">{agentMetrics.deadAirPct}%</div>
                  </div>
                  <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Dead Air</span>
                </div>
              </div>
            </div>

            {/* Column 2: Predictive Risks Gauge list */}
            <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 flex flex-col justify-between backdrop-blur-sm relative overflow-hidden">
              <div className="absolute -top-1 -right-2 text-white/5 font-black text-5xl pointer-events-none select-none tracking-tighter uppercase">RISK</div>
              
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-[10px] font-black uppercase text-rose-400 tracking-widest flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-400" /> Predictive Risk
                </h4>
                <span className="text-[8px] uppercase tracking-widest font-black px-1.5 py-0.5 rounded border border-rose-500/20 bg-rose-500/10 text-rose-300 animate-pulse">
                  ALERTS
                </span>
              </div>

              <div className="space-y-3">
                {/* Churn Risk */}
                <div>
                  <div className="flex justify-between text-[9px] font-bold uppercase tracking-wider mb-1">
                    <span className="text-slate-300">Customer Churn Risk</span>
                    <span className={predictiveAnalytics.churnRisk > 40 ? "text-rose-400 font-extrabold" : "text-gray-400"}>{predictiveAnalytics.churnRisk}%</span>
                  </div>
                  <div className="h-2 bg-white/5 rounded-full overflow-hidden border border-white/5">
                    <div 
                      className={`h-full transition-all duration-500 ${predictiveAnalytics.churnRisk > 40 ? "bg-gradient-to-r from-rose-600 to-rose-400 shadow-[0_0_8px_rgba(244,63,94,0.3)]" : "bg-gradient-to-r from-emerald-500 to-emerald-400"}`}
                      style={{ width: `${predictiveAnalytics.churnRisk}%` }}
                    />
                  </div>
                </div>

                {/* Escalation Risk */}
                <div>
                  <div className="flex justify-between text-[9px] font-bold uppercase tracking-wider mb-1">
                    <span className="text-slate-300">Escalation Risk</span>
                    <span className={predictiveAnalytics.escalationRisk > 40 ? "text-rose-400 font-extrabold" : "text-gray-400"}>{predictiveAnalytics.escalationRisk}%</span>
                  </div>
                  <div className="h-2 bg-white/5 rounded-full overflow-hidden border border-white/5">
                    <div 
                      className={`h-full transition-all duration-500 ${predictiveAnalytics.escalationRisk > 40 ? "bg-gradient-to-r from-rose-600 to-rose-400 shadow-[0_0_8px_rgba(244,63,94,0.3)]" : "bg-gradient-to-r from-amber-500 to-amber-400"}`}
                      style={{ width: `${predictiveAnalytics.escalationRisk}%` }}
                    />
                  </div>
                </div>

                {/* Fraud Risk */}
                <div>
                  <div className="flex justify-between text-[9px] font-bold uppercase tracking-wider mb-1">
                    <span className="text-slate-300">Fraud & Security Risk</span>
                    <span className={predictiveAnalytics.fraudRisk > 40 ? "text-rose-400 font-extrabold animate-pulse" : "text-gray-400"}>{predictiveAnalytics.fraudRisk}%</span>
                  </div>
                  <div className="h-2 bg-white/5 rounded-full overflow-hidden border border-white/5">
                    <div 
                      className={`h-full transition-all duration-500 ${predictiveAnalytics.fraudRisk > 40 ? "bg-gradient-to-r from-rose-600 to-rose-400 shadow-[0_0_12px_rgba(244,63,94,0.5)] animate-pulse" : "bg-gradient-to-r from-blue-500 to-blue-400"}`}
                      style={{ width: `${predictiveAnalytics.fraudRisk}%` }}
                    />
                  </div>
                </div>
              </div>

              <p className="text-[8px] text-gray-500 italic mt-3 font-semibold border-t border-white/5 pt-2 truncate" title={predictiveAnalytics.predictiveReason}>
                AI Reason: {predictiveAnalytics.predictiveReason}
              </p>
            </div>

            {/* Column 3: Voice Biometrics details + Salesforce sync hub */}
            <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 flex flex-col justify-between backdrop-blur-sm relative overflow-hidden">
              <div className="absolute -top-1 -right-2 text-white/5 font-black text-5xl pointer-events-none select-none tracking-tighter uppercase">BIO</div>
              
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-[10px] font-black uppercase text-blue-400 tracking-widest flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-blue-400" /> Voice Biometrics
                </h4>
                <span className="text-[8px] uppercase tracking-widest font-black px-1.5 py-0.5 rounded border border-blue-500/20 bg-blue-500/10 text-blue-300">
                  {voiceBiometrics.biometricStatus}
                </span>
              </div>

              {/* Verified speaker details */}
              <div className="p-2.5 rounded-xl bg-black/40 border border-white/5 mb-3 flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-blue-500/10 border border-blue-500/25 flex items-center justify-center text-blue-400 shrink-0">
                  <UserCheck className="w-5 h-5 text-blue-400 animate-pulse" />
                </div>
                <div className="min-w-0">
                  <span className="text-[9px] text-gray-500 block uppercase font-bold tracking-wider">Verified Agent Signature</span>
                  <span className="text-xs font-black text-slate-200 truncate block">{voiceBiometrics.verifiedSpeaker}</span>
                  <span className="text-[8px] font-mono text-blue-400">Accuracy: {voiceBiometrics.matchScore}%</span>
                </div>
              </div>

              {/* CRM Integration sync button hub */}
              <div className="border-t border-white/5 pt-2">
                <span className="text-[8px] font-black text-gray-500 block uppercase tracking-widest mb-1.5">CRM Integrations Sync Hub</span>
                <div className="grid grid-cols-3 gap-1">
                  {["salesforce", "zoho", "hubspot"].map((crm) => {
                    const isSynced = crmSynced[crm];
                    const isSyncing = crmSyncing[crm];
                    
                    return (
                      <button
                        key={crm}
                        onClick={() => handleCrmSync(crm)}
                        disabled={isSynced || isSyncing}
                        className={`py-1 rounded text-[8.5px] font-black uppercase tracking-wider border transition-all text-center flex flex-col items-center justify-center gap-0.5 cursor-pointer select-none
                          ${isSynced 
                            ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400 shadow-inner" 
                            : isSyncing 
                              ? "bg-purple-500/10 border-purple-500/20 text-purple-300 animate-pulse cursor-wait" 
                              : "bg-white/5 border-white/10 text-gray-300 hover:bg-white/10 hover:text-white"
                          }`}
                      >
                        <span className="truncate">{crm}</span>
                        <span className="text-[6.5px] text-gray-500 font-bold block uppercase tracking-widest">
                          {isSynced ? "Synced" : isSyncing ? "Wait" : "Sync"}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

          </div>
        )}

        {/* SENTIMENT TRAJECTORY BEZIER GRAPH */}
        {mode === "ai" && utterances.length > 1 && (
          <div className="mb-6 p-4 rounded-2xl bg-white/[0.01] border border-white/5 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-[10px] font-black uppercase text-indigo-400 tracking-widest flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-indigo-400" /> Emotional Sentiment Bezier Trajectory
              </h4>
              <span className="text-[8px] text-gray-500 font-bold uppercase tracking-wider">
                Turn-by-Turn Sentiment Wave
              </span>
            </div>

            <div className="relative w-full h-24 bg-black/45 rounded-xl border border-white/5 overflow-hidden flex items-center justify-center p-2 shadow-inner">
              <svg className="w-full h-full" viewBox="0 0 500 100" preserveAspectRatio="none">
                {/* Horizontal baseline guides */}
                <line x1="0" y1="20" x2="500" y2="20" stroke="rgba(255,255,255,0.03)" strokeWidth="1" strokeDasharray="3 3" />
                <line x1="0" y1="50" x2="500" y2="50" stroke="rgba(255,255,255,0.03)" strokeWidth="1" strokeDasharray="3 3" />
                <line x1="0" y1="80" x2="500" y2="80" stroke="rgba(255,255,255,0.03)" strokeWidth="1" strokeDasharray="3 3" />

                {/* Level baseline labels */}
                <text x="5" y="16" fill="rgba(16,185,129,0.3)" fontSize="6" fontWeight="bold">POS</text>
                <text x="5" y="46" fill="rgba(59,130,246,0.3)" fontSize="6" fontWeight="bold">NEU</text>
                <text x="5" y="76" fill="rgba(244,63,94,0.3)" fontSize="6" fontWeight="bold">NEG</text>

                {/* Plot calculations */}
                {(() => {
                  const points = utterances.map((u, i) => {
                    const sentimentStr = u.sentiment?.toLowerCase() || "neutral";
                    let y = 50;
                    if (sentimentStr.includes("pos")) y = 20;
                    else if (sentimentStr.includes("neg")) y = 80;

                    const x = i === 0 ? 30 : 30 + (i / (utterances.length - 1)) * 440;
                    return { x, y };
                  });

                  let pathD = "";
                  if (points.length > 0) {
                    pathD = `M ${points[0].x} ${points[0].y}`;
                    for (let i = 0; i < points.length - 1; i++) {
                      const p0 = points[i];
                      const p1 = points[i + 1];
                      const cpX1 = p0.x + (p1.x - p0.x) / 2;
                      const cpY1 = p0.y;
                      const cpX2 = p0.x + (p1.x - p0.x) / 2;
                      const cpY2 = p1.y;

                      pathD += ` C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${p1.x} ${p1.y}`;
                    }
                  }

                  return (
                    <>
                      {pathD && (
                        <path
                          d={`${pathD} L 470 95 L 30 95 Z`}
                          fill="url(#sentiment-gradient)"
                          opacity="0.08"
                        />
                      )}

                      {pathD && (
                        <path
                          d={pathD}
                          fill="none"
                          stroke="url(#line-gradient)"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          style={{ filter: "drop-shadow(0 0 4px rgba(139,92,246,0.3))" }}
                        />
                      )}

                      {points.map((p, idx) => {
                        const sentimentStr = utterances[idx].sentiment?.toLowerCase() || "neutral";
                        let dotColor = "fill-blue-500 stroke-blue-300";
                        if (sentimentStr.includes("pos")) dotColor = "fill-emerald-500 stroke-emerald-300";
                        else if (sentimentStr.includes("neg")) dotColor = "fill-rose-500 stroke-rose-300";

                        return (
                          <g key={idx} className="cursor-pointer group">
                            <circle
                              cx={p.x}
                              cy={p.y}
                              r="3.5"
                              className={`${dotColor} stroke-[1.5] transition-all hover:r-5`}
                              onClick={() => handleJumpToTranscript(utterances[idx].start)}
                            />
                            <title>
                              {utterances[idx].speaker}: {utterances[idx].text.slice(0, 40)}... ({utterances[idx].sentiment})
                            </title>
                          </g>
                        );
                      })}

                      <defs>
                        <linearGradient id="line-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor="#a78bfa" />
                          <stop offset="50%" stopColor="#3b82f6" />
                          <stop offset="100%" stopColor="#ec4899" />
                        </linearGradient>
                        <linearGradient id="sentiment-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                          <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.4" />
                          <stop offset="100%" stopColor="#000000" stopOpacity="0.0" />
                        </linearGradient>
                      </defs>
                    </>
                  );
                })()}
              </svg>
            </div>
          </div>
        )}

        {/* Objective and Executive Summary details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="p-4 rounded-2xl bg-white/[0.01] border border-white/5 hover:bg-white/[0.02] hover:border-purple-500/20 transition-all shadow-sm">
            <h4 className="text-[10px] font-black uppercase text-purple-400 tracking-wider mb-2 flex items-center gap-1.5">
              <Target className="w-3.5 h-3.5 text-purple-400" /> Call Objective
            </h4>
            <p className="text-slate-300 text-xs leading-relaxed font-medium">
              {audit.objective || "No explicit objective extracted."}
            </p>
          </div>
          <div className="p-4 rounded-2xl bg-white/[0.01] border border-white/5 hover:bg-white/[0.02] hover:border-pink-500/20 transition-all shadow-sm">
            <h4 className="text-[10px] font-black uppercase text-pink-400 tracking-wider mb-2 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-pink-400" /> Executive Summary
            </h4>
            <p className="text-slate-300 text-xs leading-relaxed font-medium">
              {audit.conclusion || "No conclusion provided."}
            </p>
          </div>
        </div>

        {/* TAB SYSTEM NAVIGATION */}
        <div className="flex flex-wrap gap-2 p-1.5 rounded-2xl bg-[#060916]/80 border border-white/5 mb-6 backdrop-blur-md">
          <button
            onClick={() => setActiveTab("checklist")}
            className={`px-4 py-2 text-[11px] font-black uppercase tracking-wider rounded-xl transition-all duration-300 flex items-center gap-2 cursor-pointer
              ${activeTab === "checklist"
                ? "bg-purple-600/20 text-purple-400 border border-purple-500/35 shadow-[0_0_12px_rgba(139,92,246,0.25)]"
                : "border border-transparent text-slate-400 hover:text-slate-200 hover:bg-white/[0.03]"}`}
          >
            <ClipboardList className="w-3.5 h-3.5" />
            <span>Rules</span>
            <span className={`px-1.5 py-0.5 rounded-full text-[9px] font-black ${activeTab === "checklist" ? "bg-purple-500/35 text-purple-200" : "bg-white/5 text-slate-400"}`}>
              {passedCount}/{totalRules}
            </span>
          </button>
          
          {mode === "ai" && (
            <button
              onClick={() => setActiveTab("analytics")}
              className={`px-4 py-2 text-[11px] font-black uppercase tracking-wider rounded-xl transition-all duration-300 flex items-center gap-2 cursor-pointer
                ${activeTab === "analytics"
                  ? "bg-purple-600/20 text-purple-400 border border-purple-500/35 shadow-[0_0_12px_rgba(139,92,246,0.25)]"
                  : "border border-transparent text-slate-400 hover:text-slate-200 hover:bg-white/[0.03]"}`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Analytics</span>
              <span className={`px-1.5 py-0.5 rounded-full text-[9px] font-black ${activeTab === "analytics" ? "bg-purple-500/35 text-purple-200" : "bg-white/5 text-slate-400"}`}>
                <TrendingUp className="w-2 h-2" />
              </span>
            </button>
          )}
          
          {mode === "ai" && (
            <button
              onClick={() => setActiveTab("risks")}
              className={`px-4 py-2 text-[11px] font-black uppercase tracking-wider rounded-xl transition-all duration-300 flex items-center gap-2 cursor-pointer
                ${activeTab === "risks"
                  ? "bg-purple-600/20 text-purple-400 border border-purple-500/35 shadow-[0_0_12px_rgba(139,92,246,0.25)]"
                  : "border border-transparent text-slate-400 hover:text-slate-200 hover:bg-white/[0.03]"}`}
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Compliance Risks</span>
              <span className={`px-1.5 py-0.5 rounded-full text-[9px] font-black ${activeTab === "risks" ? "bg-purple-500/35 text-purple-200" : "bg-white/5 text-slate-400"}`}>
                {risks.length}
              </span>
            </button>
          )}

          <button
            onClick={() => setActiveTab("coaching")}
            className={`px-4 py-2 text-[11px] font-black uppercase tracking-wider rounded-xl transition-all duration-300 flex items-center gap-2 cursor-pointer
              ${activeTab === "coaching"
                ? "bg-purple-600/20 text-purple-400 border border-purple-500/35 shadow-[0_0_12px_rgba(139,92,246,0.25)]"
                : "border border-transparent text-slate-400 hover:text-slate-200 hover:bg-white/[0.03]"}`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Coaching</span>
            <span className={`px-1.5 py-0.5 rounded-full text-[9px] font-black ${activeTab === "coaching" ? "bg-purple-500/35 text-purple-200" : "bg-white/5 text-slate-400"}`}>
              {coachingFeedback.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("transcript")}
            className={`px-4 py-2 text-[11px] font-black uppercase tracking-wider rounded-xl transition-all duration-300 flex items-center gap-2 cursor-pointer
              ${activeTab === "transcript"
                ? "bg-purple-600/20 text-purple-400 border border-purple-500/35 shadow-[0_0_12px_rgba(139,92,246,0.25)]"
                : "border border-transparent text-slate-400 hover:text-slate-200 hover:bg-white/[0.03]"}`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Timeline</span>
            <span className={`px-1.5 py-0.5 rounded-full text-[9px] font-black ${activeTab === "transcript" ? "bg-purple-500/35 text-purple-200" : "bg-white/5 text-slate-400"}`}>
              {utterances.length}
            </span>
          </button>

          {mode === "ai" && (
            <>
              <button
                onClick={() => setActiveTab("assist")}
                className={`px-4 py-2 text-[11px] font-black uppercase tracking-wider rounded-xl transition-all duration-300 flex items-center gap-2 cursor-pointer
                  ${activeTab === "assist"
                    ? "bg-purple-600/20 text-purple-400 border border-purple-500/35 shadow-[0_0_12px_rgba(139,92,246,0.25)]"
                    : "border border-transparent text-slate-400 hover:text-slate-200 hover:bg-white/[0.03]"}`}
              >
                <Zap className="w-3.5 h-3.5 text-purple-400" />
                <span>Agent Assist</span>
                <span className={`px-1.5 py-0.5 rounded-full text-[9px] font-black ${activeTab === "assist" ? "bg-purple-500/35 text-purple-200" : "bg-white/5 text-slate-400"}`}>
                  Live
                </span>
              </button>

              <button
                onClick={() => setActiveTab("auditgpt")}
                className={`px-4 py-2 text-[11px] font-black uppercase tracking-wider rounded-xl transition-all duration-300 flex items-center gap-2 cursor-pointer
                  ${activeTab === "auditgpt"
                    ? "bg-purple-600/20 text-purple-400 border border-purple-500/35 shadow-[0_0_12px_rgba(139,92,246,0.25)]"
                    : "border border-transparent text-slate-400 hover:text-slate-200 hover:bg-white/[0.03]"}`}
              >
                <Sparkles className="w-3.5 h-3.5 text-yellow-400 animate-pulse" />
                <span>AuditGPT Chat</span>
                <span className="px-1.5 py-0.5 rounded-full text-[9px] font-black bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 animate-pulse">
                  Ask
                </span>
              </button>
            </>
          )}
        </div>

        {/* TAB CONTENTS */}
        <div className="min-h-[280px]">
          
          {/* TAB: GRAPHS & ANALYTICS */}
          {activeTab === "analytics" && mode === "ai" && (
            <div className="space-y-6 animate-fade-in">
              {/* Row 1: Tone/Sentiment Segment Bar */}
              <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 backdrop-blur-sm relative overflow-hidden shadow-inner">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-[10px] font-black uppercase text-pink-400 tracking-widest flex items-center gap-1.5">
                    <PieChart className="w-3.5 h-3.5 text-pink-400" /> Utterance Sentiment Distribution
                  </h4>
                  <span className="text-[8px] uppercase tracking-widest font-black text-gray-500">
                    {totalTurns} Total Turns
                  </span>
                </div>
                <div className="w-full h-3 bg-white/5 rounded-full overflow-hidden flex shadow-inner">
                  <div className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400 border-r border-emerald-800" style={{ width: `${posPct}%` }} title={`Positive: ${posPct}%`} />
                  <div className="h-full bg-gradient-to-r from-blue-600 to-blue-400 border-r border-blue-800" style={{ width: `${neuPct}%` }} title={`Neutral: ${neuPct}%`} />
                  <div className="h-full bg-gradient-to-r from-rose-600 to-rose-400" style={{ width: `${negPct}%` }} title={`Negative: ${negPct}%`} />
                </div>
                <div className="flex items-center justify-between mt-3 px-1">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]"></div>
                    <span className="text-[10px] font-black text-slate-300">Positive: <span className="text-emerald-400">{posPct}%</span></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)]"></div>
                    <span className="text-[10px] font-black text-slate-300">Neutral: <span className="text-blue-400">{neuPct}%</span></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.8)]"></div>
                    <span className="text-[10px] font-black text-slate-300">Negative: <span className="text-rose-400">{negPct}%</span></span>
                  </div>
                </div>
              </div>

              {/* Row 2: Topics and Keywords Cloud */}
              <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 backdrop-blur-sm relative shadow-inner">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-[10px] font-black uppercase text-indigo-400 tracking-widest flex items-center gap-1.5">
                    <Info className="w-3.5 h-3.5 text-indigo-400" /> Topics & Keywords Cloud
                  </h4>
                </div>
                <div className="mb-4">
                  <h5 className="text-[9px] font-bold text-gray-500 uppercase tracking-widest mb-2">Key Topics</h5>
                  <div className="flex flex-wrap gap-2">
                    {(topicsAndKeywords.topics || []).map((topic, i) => (
                      <span key={`t-${i}`} className="px-2.5 py-1 rounded-lg text-xs font-black bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 shadow-sm">
                        {topic}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <h5 className="text-[9px] font-bold text-gray-500 uppercase tracking-widest mb-2">Detected Keywords</h5>
                  <div className="flex flex-wrap gap-2">
                    {(topicsAndKeywords.keywords || []).map((kw, i) => (
                      <span key={`k-${i}`} className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-white/5 border border-white/10 text-gray-400 hover:text-white transition-colors cursor-default">
                        {kw}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* TAB: RULES CHECKLIST */}
          {activeTab === "checklist" && (
            <div className="space-y-3.5 animate-fade-in">
              {mode === "normal" ? (
                /* NORMAL AUDITOR WORKSPACE checklist form */
                <div className="space-y-4">
                  <div className="p-3.5 rounded-xl bg-purple-500/5 border border-purple-500/10 flex items-center justify-between gap-4 mb-2 shadow-md">
                    <div>
                      <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1">
                        <ClipboardList className="w-4 h-4 text-purple-400" /> Manual Scoring Workspace
                      </h4>
                      <p className="text-[10px] text-slate-400 mt-0.5">Toggle rules to recalculate scores dynamically. Gemini's extractions serve as baseline suggestions.</p>
                    </div>
                    {/* Live Recalculated score */}
                    <div className="bg-purple-500/10 border border-purple-500/30 px-3 py-1.5 rounded-xl text-center shrink-0">
                      <span className="text-[8px] font-black text-purple-300 block uppercase tracking-widest">Manual Score</span>
                      <span className="text-sm font-black text-purple-100 font-mono">
                        {(() => {
                          let runningScore = 0;
                          localRules.forEach(lr => {
                            const matchingRule = activeRules.find(r => r.id === lr.ruleId);
                            if (matchingRule && lr.passed) {
                              runningScore += matchingRule.weight;
                            }
                          });
                          const totalMax = activeRules.length > 0 ? activeRules.reduce((sum, r) => sum + r.weight, 0) : 100;
                          return `${Math.round(runningScore / totalMax * 100)}% (${runningScore}/${totalMax})`;
                        })()}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {activeRules.map((rule) => {
                      const ruleState = localRules.find(lr => lr.ruleId === rule.id) || { passed: false, evidence: "" };
                      
                      return (
                        <div 
                          key={rule.id}
                          className={`p-5 rounded-2xl border transition-all duration-300 flex flex-col gap-3 backdrop-blur-md shadow-inner ${
                            ruleState.passed 
                              ? "bg-emerald-500/[0.02] border-emerald-500/15 hover:border-emerald-500/30 hover:bg-emerald-500/[0.04]" 
                              : "bg-white/[0.02] border-white/10 hover:border-purple-500/30 hover:bg-white/[0.04]"
                          }`}
                        >
                          <div className="flex items-start gap-4 w-full">
                            <div className="shrink-0 mt-0.5">
                              <input
                                type="checkbox"
                                checked={ruleState.passed}
                                onChange={() => handleToggleLocalRule(rule.id)}
                                className="w-5 h-5 rounded-md border-white/20 bg-black/40 text-purple-500 focus:ring-purple-500/50 focus:ring-2 focus:ring-offset-0 cursor-pointer accent-purple-500 transition-all shadow-inner"
                              />
                            </div>
                            
                            <div className="flex-1 min-w-0 flex flex-col gap-1.5">
                              <div className="flex flex-wrap items-center justify-between gap-2">
                                <div className="flex items-center gap-2.5 flex-wrap">
                                  <h5 className="font-black text-sm text-white uppercase tracking-wider">{rule.id}</h5>
                                  <span className="text-[9px] uppercase tracking-widest font-black px-2 py-0.5 rounded-md border border-purple-500/20 bg-purple-500/10 text-purple-300 shadow-sm">
                                    Weight: {rule.weight}
                                  </span>
                                  <span className={`text-[8px] uppercase tracking-widest font-black px-2 py-0.5 rounded-md border shadow-sm ${rule.severity === "HIGH" ? "bg-rose-500/10 border-rose-500/20 text-rose-300" : "bg-blue-500/10 border-blue-500/20 text-blue-300"}`}>
                                    Severity: {rule.severity}
                                  </span>
                                </div>
                                <span className={`text-[10px] font-black uppercase tracking-widest ${ruleState.passed ? "text-emerald-400" : "text-gray-500"}`}>
                                  {ruleState.passed ? "Passed" : "Pending"}
                                </span>
                              </div>
                              
                              <p className="text-xs text-gray-400 font-medium leading-relaxed mb-1 pr-4">{rule.description}</p>
                              
                              <div className="relative mt-1">
                                <div className="absolute top-2.5 left-3">
                                  <MessageSquare className="w-3.5 h-3.5 text-gray-500" />
                                </div>
                                <input
                                  type="text"
                                  placeholder="Add audit justification or transcript citations..."
                                  value={ruleState.evidence}
                                  onChange={(e) => handleEvidenceChange(rule.id, e.target.value)}
                                  className="w-full pl-9 pr-4 py-2 rounded-xl bg-black/40 border border-white/10 text-xs text-slate-300 focus:outline-none focus:border-purple-500/50 transition-all font-mono shadow-inner placeholder-gray-600"
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="flex justify-end gap-3 mt-4">
                    <button
                      onClick={handleSaveOverride}
                      disabled={savingOverride}
                      className="px-6 py-2.5 rounded-xl bg-purple-600 border border-purple-500 text-xs font-black text-white hover:bg-purple-700 hover:shadow-[0_0_20px_rgba(168,85,247,0.4)] disabled:opacity-50 transition-all shadow-md shrink-0 uppercase tracking-widest cursor-pointer select-none"
                    >
                      {savingOverride ? "Saving manual audit..." : "Save Manual Override"}
                    </button>
                  </div>
                </div>
              ) : (
                /* AI MODE rules view */
                <>
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
                      const weight = rule.weight ?? 10;
                      let classificationLabel = "Standard Criteria";
                      let classBadgeClass = "bg-purple-500/10 text-purple-300 border-purple-500/20";
                      
                      if (weight >= 20) {
                        classificationLabel = "CRITICAL COMPLIANCE";
                        classBadgeClass = "bg-rose-500/10 text-rose-300 border-rose-500/20 animate-pulse";
                      } else if (weight < 10) {
                        classificationLabel = "Supporting Guideline";
                        classBadgeClass = "bg-blue-500/10 text-blue-300 border-blue-500/20";
                      }

                      return (
                        <div 
                          key={rule.ruleId} 
                          className={`rounded-2xl border transition-all duration-300 overflow-hidden backdrop-blur-md shadow-inner mb-3
                            ${rule.passed 
                              ? "bg-emerald-500/[0.02] border-emerald-500/15 hover:border-emerald-500/30 hover:shadow-[0_4px_24px_rgba(16,185,129,0.08)]" 
                              : "bg-rose-500/[0.02] border-rose-500/15 hover:border-rose-500/30 hover:shadow-[0_4px_24px_rgba(244,63,94,0.08)]"}`}
                        >
                          <div 
                            onClick={() => toggleRule(rule.ruleId)}
                            className="p-5 flex items-start gap-4 cursor-pointer select-none"
                          >
                            <div className="shrink-0 mt-0.5">
                              {rule.passed ? (
                                <CheckCircle2 className="w-5 h-5 text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.6)]" />
                              ) : (
                                <XCircle className="w-5 h-5 text-rose-400 drop-shadow-[0_0_8px_rgba(248,113,113,0.6)]" />
                              )}
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
                                <div className="flex items-center gap-2.5 flex-wrap">
                                  <h5 className="font-black text-sm text-white uppercase tracking-wider">{rule.ruleId}</h5>
                                  <span className={`text-[8px] uppercase tracking-widest font-black px-2 py-0.5 rounded-md border shadow-sm ${classBadgeClass}`}>
                                    {classificationLabel} (W: {weight})
                                  </span>
                                </div>
                                <div className="flex items-center gap-3">
                                  <span className={`text-[9px] uppercase font-black px-2.5 py-0.5 rounded-md border shadow-sm tracking-widest hidden sm:inline-block
                                    ${rule.passed 
                                      ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" 
                                      : "bg-rose-500/10 border-rose-500/20 text-rose-400"}`}
                                  >
                                    {rule.passed ? "Passed" : "Failed"}
                                  </span>
                                  <div className="w-6 h-6 rounded-full bg-white/5 flex items-center justify-center border border-white/5 group-hover:bg-white/10 transition-colors">
                                    {isExpanded ? (
                                      <ChevronUp className="w-3.5 h-3.5 text-gray-400" />
                                    ) : (
                                      <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
                                    )}
                                  </div>
                                </div>
                              </div>
                              <p className="text-xs text-gray-400 font-medium leading-relaxed pr-8 line-clamp-1 sm:line-clamp-none">
                                {rule.description || `Criteria mapping for ${rule.ruleId}.`}
                              </p>
                            </div>
                          </div>

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
                </>
              )}
            </div>
          )}

          {/* TAB: COMPLIANCE RISKS */}
          {activeTab === "risks" && mode === "ai" && (
            <div className="space-y-4 animate-fade-in">
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
                  <p className="text-xs text-gray-500 mt-1 max-w-sm">No regulatory or security compliance violations detected.</p>
                </div>
              ) : (
                filteredRisks.map((risk, index) => {
                  const severity = risk.severity?.toUpperCase() || "LOW";
                  let borderLeftClass = "border-l-blue-500";
                  let severityBadgeColor = "bg-blue-500/10 text-blue-300 border-blue-500/20";
                  let riskIconColor = "text-blue-400";
                  
                  if (severity === "HIGH") {
                    borderLeftClass = "border-l-rose-500";
                    severityBadgeColor = "bg-rose-500/10 text-rose-300 border-rose-500/20";
                    riskIconColor = "text-rose-400";
                  } else if (severity === "MEDIUM") {
                    borderLeftClass = "border-l-amber-500";
                    severityBadgeColor = "bg-amber-500/10 text-amber-300 border-amber-500/20";
                    riskIconColor = "text-amber-400";
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
                          <p className="text-xs text-slate-205 leading-relaxed font-medium">
                            {risk.reason || "Detail not specified."}
                          </p>
                        </div>
                        <button
                          onClick={() => handleJumpToTranscript(risk.timestamp)}
                          className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-500/10 border border-purple-500/25 text-[10px] font-black text-purple-300 hover:bg-purple-500/20 hover:text-white transition-all self-start shadow-sm cursor-pointer"
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
              {mode === "normal" ? (
                /* NORMAL AUDITOR EDITOR manual coaching feedback */
                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-purple-500/5 border border-purple-500/10 flex items-center gap-3.5 shadow-md">
                    <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 shrink-0">
                      <Award className="w-5 h-5 text-purple-400 animate-pulse" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white uppercase tracking-wider">Manual Coaching Alignment</h4>
                      <p className="text-[11px] text-gray-400 mt-0.5">Custom training recommendations. Write feedback points (one per line) below.</p>
                    </div>
                  </div>

                  <textarea
                    rows={6}
                    placeholder="Enter professional coaching notes, one per line..."
                    value={manualCoaching}
                    onChange={(e) => setManualCoaching(e.target.value)}
                    className="w-full p-4 rounded-2xl bg-black/45 border border-white/5 text-xs text-white focus:outline-none focus:border-purple-500/50 transition-all placeholder-gray-500 leading-relaxed font-sans font-medium"
                  />

                  <div className="flex justify-end">
                    <button
                      onClick={handleSaveOverride}
                      disabled={savingOverride}
                      className="px-6 py-2.5 rounded-xl bg-purple-600 border border-purple-500 text-xs font-black text-white hover:bg-purple-700 hover:shadow-[0_0_20px_rgba(168,85,247,0.4)] disabled:opacity-50 transition-all shadow-md shrink-0 uppercase tracking-widest cursor-pointer select-none"
                    >
                      {savingOverride ? "Saving coaching..." : "Save Coaching Notes"}
                    </button>
                  </div>
                </div>
              ) : (
                /* AI MODE coaching timeline logs */
                <>
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
                </>
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
                    className="w-full pl-9 pr-4 py-2 bg-transparent text-xs text-white placeholder-gray-500 focus:outline-none"
                  />
                </div>

                <div className="flex gap-1 text-[10px] font-bold pr-1">
                  {["ALL", "AGENT", "CUSTOMER"].map((spk) => (
                    <button
                      key={spk}
                      onClick={() => setTranscriptSpeakerFilter(spk)}
                      className={`px-3.5 py-1.5 rounded-lg transition-all cursor-pointer
                        ${transcriptSpeakerFilter === spk 
                          ? "bg-purple-500/20 text-purple-300 border border-purple-500/30" 
                          : "text-gray-400 hover:text-white"}`}
                    >
                      {spk === "ALL" ? "All Speakers" : spk === "AGENT" ? "Agent Only" : "Customer Only"}
                    </button>
                  ))}
                </div>
              </div>

              {/* Scrollable Timeline list */}
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

                        {/* Speech Bubble Details */}
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
                            <span className="font-mono text-gray-500">
                              {wordsCount} words ({durationSec.toFixed(1)}s)
                            </span>
                          </div>

                          <div className={`p-4 rounded-2xl text-[12px] md:text-[13px] leading-relaxed border shadow-md font-medium relative group/bubble
                            ${isAgent 
                              ? "bg-[#0b0c16]/95 border-purple-500/10 rounded-tl-none text-purple-50/95" 
                              : "bg-[#090b14]/95 border-blue-500/10 rounded-tr-none text-blue-50/95"}`}
                          >
                            {getHighlightedText(utt.text, transcriptSearchTerm)}
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

          {/* TAB: REAL-TIME COOPERATIVE ASSIST LOGS */}
          {activeTab === "assist" && mode === "ai" && (
            <div className="space-y-4 animate-fade-in">
              <div className="p-4 rounded-xl bg-purple-500/5 border border-purple-500/10 flex items-center gap-3.5 shadow-md">
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 shrink-0">
                  <Zap className="w-5 h-5 text-purple-400 animate-pulse" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">Live Agent Assist Log Timeline</h4>
                  <p className="text-[11px] text-gray-400 mt-0.5">Chronologically indexed assist recommendations triggered during the conversation flow.</p>
                </div>
              </div>

              {liveAssistLogs.length === 0 ? (
                <div className="text-center py-12 text-gray-500 italic">No real-time assist recommendations seeded.</div>
              ) : (
                <div className="space-y-3">
                  {liveAssistLogs.map((log, index) => {
                    let catColor = "bg-purple-500/10 border-purple-500/20 text-purple-300";
                    if (log.category === "CRITICAL") catColor = "bg-rose-500/10 border-rose-500/20 text-rose-300";
                    else if (log.category === "EMOTE") catColor = "bg-blue-500/10 border-blue-500/20 text-blue-300";
                    
                    return (
                      <div 
                        key={index} 
                        className="p-4 rounded-xl bg-white/[0.005] border border-white/5 flex gap-4 hover:border-purple-500/20 hover:bg-white/[0.015] transition-all shadow-sm items-center justify-between"
                      >
                        <div className="flex gap-3 items-center min-w-0">
                          <span className="w-6 h-6 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-[10px] font-black text-purple-300 shrink-0 font-mono">
                            {formatTime(log.timestamp)}
                          </span>
                          <div className="min-w-0">
                            <p className="text-slate-200 text-xs leading-relaxed font-semibold truncate sm:whitespace-normal">
                              {log.suggestion}
                            </p>
                          </div>
                        </div>

                        <div className="flex gap-2 items-center shrink-0">
                          <span className={`text-[8px] uppercase tracking-widest font-black px-2 py-0.5 rounded border ${catColor}`}>
                            {log.category}
                          </span>
                          <button
                            onClick={() => handleJumpToTranscript(log.timestamp)}
                            className="px-2.5 py-1 rounded bg-white/5 border border-white/10 text-[8.5px] font-black text-gray-300 hover:bg-white/10 hover:text-white transition-all select-none cursor-pointer"
                          >
                            Jump
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB: AUDITGPT CONVERSATIONAL CHATBOT */}
          {activeTab === "auditgpt" && mode === "ai" && (
            <div className="space-y-4 animate-fade-in flex flex-col h-full min-h-[360px]">
              <div className="p-4 rounded-xl bg-indigo-500/5 border border-indigo-500/10 flex items-center gap-3.5 shadow-md shrink-0">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0">
                  <Sparkles className="w-5 h-5 text-indigo-400 animate-pulse" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">AuditGPT Interactive Session</h4>
                  <p className="text-[11px] text-gray-400 mt-0.5">Search or analyze this call, regulatory compliance points, or speaker biometrics in natural language.</p>
                </div>
              </div>

              {/* Chat bubbles area */}
              <div className="flex-1 overflow-y-auto max-h-[240px] p-3 rounded-2xl bg-black/45 border border-white/5 space-y-3.5 timeline-chat scrollbar-thin shadow-inner">
                {chatHistory.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full py-10 text-center">
                    <MessageSquare className="w-10 h-10 text-gray-600 mb-2 animate-bounce" style={{ animationDuration: "3s" }} />
                    <span className="text-xs font-black text-slate-400">Secure AuditGPT Session Initialised</span>
                    <p className="text-[10px] text-gray-500 mt-1 max-w-xs">Ask specific queries like: "Did the agent explain contract cancellation fees?" or "Summarize the customer complaints."</p>
                  </div>
                ) : (
                  chatHistory.map((msg, index) => {
                    const isUser = msg.sender === "USER";
                    return (
                      <div 
                        key={index}
                        className={`flex gap-3 max-w-[85%] ${isUser ? "ml-auto flex-row-reverse" : "mr-auto"}`}
                      >
                        <div className={`w-7 h-7 rounded-lg shrink-0 flex items-center justify-center text-[10px] font-black shadow-md border
                          ${isUser 
                            ? "bg-purple-500/10 text-purple-300 border-purple-500/25" 
                            : "bg-indigo-500/10 text-indigo-300 border-indigo-500/25"}`}
                        >
                          {isUser ? "US" : "AI"}
                        </div>
                        <div className="flex flex-col gap-0.5">
                          <span className={`text-[8px] font-bold text-gray-500 uppercase tracking-widest ${isUser ? "text-right" : ""}`}>
                            {isUser ? "Manager" : "AuditGPT Compliance Intelligence"}
                          </span>
                          <div className={`p-3 rounded-xl text-[11px] leading-relaxed border shadow-md font-medium select-text
                            ${isUser 
                              ? "bg-purple-600/10 border-purple-500/20 text-purple-100 rounded-tr-none" 
                              : "bg-indigo-950/30 border-indigo-500/15 text-indigo-100 rounded-tl-none"}`}
                          >
                            <p className="whitespace-pre-wrap">{msg.text}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
                
                {sendingChat && (
                  <div className="flex gap-3 max-w-[80%] mr-auto items-center">
                    <div className="w-7 h-7 rounded-lg shrink-0 flex items-center justify-center text-[10px] font-black border bg-indigo-500/10 text-indigo-300 border-indigo-500/25 animate-pulse">
                      AI
                    </div>
                    <div className="flex items-center gap-1.5 bg-white/5 border border-white/10 px-3.5 py-2 rounded-xl text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                      <RefreshCw className="w-3.5 h-3.5 animate-spin text-purple-400" />
                      AuditGPT is analyzing transcript...
                    </div>
                  </div>
                )}
              </div>

              {/* Chat Input form */}
              <form onSubmit={handleSendChatMessage} className="flex gap-2 shrink-0">
                <input
                  type="text"
                  placeholder="Ask AuditGPT a question about this call..."
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  disabled={sendingChat}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-white/[0.02] border border-white/5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500/50 transition-all font-medium"
                />
                <button
                  type="submit"
                  disabled={sendingChat || !chatInput.trim()}
                  className="px-4 py-2.5 rounded-xl bg-indigo-600 border border-indigo-500 hover:bg-indigo-700 text-white font-black text-xs hover:shadow-[0_0_15px_rgba(99,102,241,0.4)] disabled:opacity-40 transition-all shrink-0 flex items-center justify-center gap-1 cursor-pointer select-none"
                >
                  <Send className="w-3.5 h-3.5" />
                  Send
                </button>
              </form>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
