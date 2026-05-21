import { useState, useRef, useEffect } from "react";
import axios from "axios";
import { 
  UploadCloud, FileAudio, AlertCircle, CheckCircle2, Trash2,
  Activity, Sparkles, Server, Cpu, Database, Award
} from "lucide-react";

const STAGES = [
  { text: "Connecting to secure upload pipeline...", icon: Server },
  { text: "Transcribing call dialogue via AssemblyAI...", icon: Activity },
  { text: "Normalizing conversation speakers & timing...", icon: Cpu },
  { text: "Running Google Gemini compliance evaluation...", icon: Sparkles },
  { text: "Extracting objective, conclusion, & sentiment...", icon: Database },
  { text: "Generating custom representative coaching tips...", icon: Award }
];

export default function UploadForm({ onResult }) {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);
  const [isDragActive, setIsDragActive] = useState(false);
  const [activeStage, setActiveStage] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);
  const fileInputRef = useRef(null);
  const timerRef = useRef(null);
  const stageIntervalRef = useRef(null);

  useEffect(() => {
    if (loading) {
      // Elapsed timer
      timerRef.current = setInterval(() => {
        setElapsedTime((prev) => prev + 1);
      }, 1000);

      // Processing stage increments
      stageIntervalRef.current = setInterval(() => {
        setActiveStage((prev) => {
          if (prev < STAGES.length - 1) return prev + 1;
          return prev; // hold at last stage until response arrives
        });
      }, 3500);
    } else {
      clearInterval(timerRef.current);
      clearInterval(stageIntervalRef.current);
      setElapsedTime(0);
      setActiveStage(0);
    }

    return () => {
      clearInterval(timerRef.current);
      clearInterval(stageIntervalRef.current);
    };
  }, [loading]);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragActive(true);
    } else if (e.type === "dragleave") {
      setIsDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile.type.startsWith("audio/")) {
        if (droppedFile.size > 500 * 1024) {
          setError("File exceeds the maximum size limit of 500 KB.");
          setFile(null);
          return;
        }
        setFile(droppedFile);
        setError(null);
        setSuccess(false);
      } else {
        setError("Please select a valid audio file (MP3, WAV, M4A, etc.)");
      }
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (selectedFile.size > 500 * 1024) {
        setError("File exceeds the maximum size limit of 500 KB.");
        setFile(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
        return;
      }
      setFile(selectedFile);
      setError(null);
      setSuccess(false);
    }
  };

  const removeFile = (e) => {
    e.stopPropagation();
    setFile(null);
    setSuccess(false);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const submit = async () => {
    if (!file) return;
    setLoading(true);
    setSuccess(false);
    setError(null);

    try {
      const form = new FormData();
      form.append("audio", file);

      const backendUrl = import.meta.env.VITE_BACKEND_URL || "";
      const { data } = await axios.post(
        `${backendUrl}/api/audit`,
        form
      );

      if (data.success && data.audit) {
        onResult(data.audit);
        setSuccess(true);
      } else {
        throw new Error(data.error || "Analysis completed but failed to return audit data.");
      }
    } catch (err) {
      console.error(err);
      const errorMessage = err.response?.data?.error || err.message || "Failed to analyze audio file.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const formatElapsedTime = (secs) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = secs % 60;
    return `${mins}:${remainingSecs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="w-full max-w-xl mx-auto bg-white/5 backdrop-blur-xl p-6 md:p-8 rounded-2xl border border-white/10 shadow-2xl relative overflow-hidden transition-all duration-300 hover:border-white/20 select-none">
      {/* Decorative top gradient bar */}
      <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500"></div>

      <h2 className="text-2xl md:text-3xl font-extrabold text-center text-white mb-2 tracking-tight">
        Call Compliance Auditor
      </h2>
      <p className="text-xs md:text-sm text-gray-400 text-center mb-6">
        Analyze conversational patterns, compliance weights, and performance insights with AssemblyAI & Google Gemini.
      </p>

      {/* Main Drag-Drop or Processing Stage */}
      {loading ? (
        // ACTIVE LOADING & AI INTERACTION VIEW
        <div className="p-6 border border-purple-500/20 bg-purple-500/[0.02] rounded-xl flex flex-col items-center animate-fade-in">
          
          {/* Animated 3D Waveform rods */}
          <div className="flex items-end justify-center gap-1.5 h-16 mb-6">
            {[24, 40, 56, 32, 48, 64, 36, 20].map((height, i) => (
              <div
                key={i}
                className="w-1.5 bg-gradient-to-t from-purple-500 to-pink-500 rounded-full waveform-bar"
                style={{ height: `${height}px`, animationDuration: `${0.8 + i * 0.1}s` }}
              ></div>
            ))}
          </div>

          <div className="w-full flex items-center justify-between text-[11px] font-bold text-gray-400 mb-3 px-1">
            <span className="uppercase tracking-widest text-purple-400 flex items-center gap-1">
              <Activity className="w-3.5 h-3.5 animate-pulse" /> AI Engine Active
            </span>
            <span>Elapsed: {formatElapsedTime(elapsedTime)}</span>
          </div>

          {/* Interactive Steps Checklist */}
          <div className="w-full space-y-2.5 mb-2">
            {STAGES.map((stage, idx) => {
              const StageIcon = stage.icon;
              const isPast = idx < activeStage;
              const isActive = idx === activeStage;
              return (
                <div 
                  key={idx}
                  className={`flex items-center gap-3 p-2.5 rounded-lg border text-xs transition-all duration-300
                    ${isPast 
                      ? "bg-green-500/[0.02] border-green-500/20 text-green-300 font-semibold" 
                      : isActive 
                        ? "bg-purple-500/10 border-purple-500/40 text-purple-200 font-bold scale-[1.01] glow-purple" 
                        : "bg-white/[0.01] border-white/5 text-gray-500"}`}
                >
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 border
                    ${isPast 
                      ? "bg-green-500/15 border-green-500/30 text-green-400" 
                      : isActive 
                        ? "bg-purple-500/20 border-purple-500/40 text-purple-300 animate-spin" 
                        : "bg-white/5 border-white/10 text-gray-500"}`}
                  >
                    {isPast ? <CheckCircle2 className="w-3.5 h-3.5" /> : <StageIcon className="w-3.5 h-3.5" />}
                  </div>
                  <span className="flex-1 truncate">{stage.text}</span>
                  {isActive && (
                    <span className="text-[10px] uppercase font-bold text-purple-400 tracking-wider animate-pulse">Running</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        // DEFAULT FILE UPLOAD AREA
        <div
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-xl cursor-pointer transition-all duration-300 relative group
            ${isDragActive 
              ? "border-purple-400 bg-purple-500/10 scale-[0.98]" 
              : file 
                ? "border-green-500/40 bg-green-500/5 glow-green" 
                : "border-white/15 bg-white/5 hover:border-purple-500/50 hover:bg-white/[0.08]"}`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="audio/*"
            hidden
            onChange={handleFileChange}
            disabled={loading}
          />

          {file ? (
            <div className="flex flex-col items-center text-center animate-fade-in w-full">
              <div className="w-16 h-16 rounded-2xl bg-green-500/20 flex items-center justify-center mb-3 text-green-400 group-hover:scale-110 transition-transform shadow-lg shadow-green-500/10 border border-green-500/30">
                <FileAudio className="w-8 h-8" />
              </div>
              <span className="text-base font-semibold text-white max-w-xs truncate mb-1">
                {file.name}
              </span>
              <span className="text-xs text-gray-400 mb-4">
                {(file.size / 1024).toFixed(1)} KB
              </span>
              <button
                onClick={removeFile}
                disabled={loading}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-red-500/15 border border-red-500/30 text-xs font-bold text-red-300 hover:bg-red-500/35 transition-colors disabled:opacity-50"
              >
                <Trash2 className="w-3.5 h-3.5" /> Remove File
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mb-4 text-purple-300 group-hover:bg-purple-500/20 group-hover:text-purple-400 group-hover:scale-110 transition-all duration-300 border border-white/10 shadow-lg">
                <UploadCloud className="w-8 h-8 animate-bounce" style={{ animationDuration: "3s" }} />
              </div>
              <span className="text-base font-bold text-white mb-1 group-hover:text-purple-300 transition-colors">
                Select call audio or drag & drop here
              </span>
              <span className="text-xs text-gray-400 max-w-sm px-4 leading-normal mt-0.5">
                Supports MP3, WAV, M4A, FLAC format call logs up to 500 KB.
              </span>
            </div>
          )}
        </div>
      )}

      {/* ERROR & STATUS MESSAGES */}
      <div className="mt-4 min-h-[28px] flex items-center justify-center text-center">
        {success && !loading && (
          <div className="flex items-center gap-1.5 text-green-400 text-sm font-semibold animate-fade-in">
            <CheckCircle2 className="w-4 h-4" /> Compliance audit completed!
          </div>
        )}
        {error && !loading && (
          <div className="flex items-center gap-1.5 text-red-400 text-sm font-semibold p-2.5 rounded-lg bg-red-500/10 border border-red-500/20 w-full justify-center animate-fade-in glow-red">
            <AlertCircle className="w-4 h-4 shrink-0" /> {error}
          </div>
        )}
      </div>

      {/* SUBMIT BUTTON */}
      {!loading && (
        <button
          onClick={submit}
          disabled={!file || loading}
          className="mt-2 w-full py-3.5 rounded-xl font-bold tracking-wide transition-all duration-300 select-none btn-primary disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Begin QA Compliance Audit
        </button>
      )}
    </div>
  );
}
