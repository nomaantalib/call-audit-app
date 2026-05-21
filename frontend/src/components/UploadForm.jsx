import { useState, useRef } from "react";
import axios from "axios";
import { UploadCloud, FileAudio, AlertCircle, CheckCircle2, Trash2 } from "lucide-react";

export default function UploadForm({ onResult }) {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);
  const [isDragActive, setIsDragActive] = useState(false);
  const fileInputRef = useRef(null);

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
      setFile(e.target.files[0]);
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

      // Support dynamic backend URL from env or fallback to empty string (which uses origin)
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

  return (
    <div className="w-full max-w-xl mx-auto bg-white/5 backdrop-blur-xl p-8 rounded-2xl border border-white/10 shadow-2xl relative overflow-hidden transition-all duration-300 hover:border-white/20">
      {/* Decorative top gradient bar */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500"></div>

      <h2 className="text-2xl font-bold text-center text-white mb-2 tracking-tight">
        Upload Call Recording
      </h2>
      <p className="text-sm text-gray-400 text-center mb-6">
        Drop your call audio file below to start auditing compliance and performance.
      </p>

      {/* Drag & Drop Area */}
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
              ? "border-green-500/40 bg-green-500/5" 
              : "border-white/15 bg-white/5 hover:border-purple-400/50 hover:bg-white/8"}`}
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
            <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mb-3 text-green-400 group-hover:scale-110 transition-transform">
              <FileAudio className="w-8 h-8" />
            </div>
            <span className="text-base font-semibold text-white max-w-xs truncate mb-1">
              {file.name}
            </span>
            <span className="text-xs text-gray-400 mb-4">
              {(file.size / (1024 * 1024)).toFixed(2)} MB
            </span>
            <button
              onClick={removeFile}
              disabled={loading}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/15 border border-red-500/30 text-xs font-semibold text-red-300 hover:bg-red-500/35 transition-colors disabled:opacity-50"
            >
              <Trash2 className="w-3.5 h-3.5" /> Remove File
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4 text-purple-300 group-hover:bg-purple-500/20 group-hover:text-purple-400 group-hover:scale-115 transition-all duration-300">
              <UploadCloud className="w-8 h-8" />
            </div>
            <span className="text-base font-semibold text-white mb-1 group-hover:text-purple-300 transition-colors">
              Click to select or drag & drop audio
            </span>
            <span className="text-xs text-gray-400">
              Supported formats: MP3, WAV, M4A, FLAC (Max 25MB)
            </span>
          </div>
        )}
      </div>

      {/* ERROR & STATUS MESSAGES */}
      <div className="mt-4 min-h-[28px] flex items-center justify-center text-center">
        {loading && (
          <div className="flex items-center gap-2 text-purple-400 text-sm font-medium animate-pulse">
            <span className="w-2.5 h-2.5 rounded-full bg-purple-400 animate-ping"></span>
            Analyzing call and auditing compliance...
          </div>
        )}
        {success && !loading && (
          <div className="flex items-center gap-1.5 text-green-400 text-sm font-semibold animate-fade-in">
            <CheckCircle2 className="w-4 h-4" /> Compliance audit completed!
          </div>
        )}
        {error && !loading && (
          <div className="flex items-center gap-1.5 text-red-400 text-sm font-semibold p-2.5 rounded-lg bg-red-500/10 border border-red-500/20 w-full justify-center animate-fade-in">
            <AlertCircle className="w-4 h-4 shrink-0" /> {error}
          </div>
        )}
      </div>

      {/* SUBMIT BUTTON */}
      <button
        onClick={submit}
        disabled={!file || loading}
        className="mt-4 w-full py-3.5 rounded-xl font-bold tracking-wide transition-all duration-300 select-none
          bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 text-white
          hover:brightness-110 active:scale-[0.99]
          disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:brightness-100 shadow-lg shadow-purple-500/20"
      >
        {loading ? "Transcribing & Auditing..." : "Audit Call Recording"}
      </button>
    </div>
  );
}
