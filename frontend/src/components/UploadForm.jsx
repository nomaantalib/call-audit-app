import axios from "axios";
import { useRef, useState } from "react";

export default function UploadForm({ onResult }) {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      // Basic validation
      const maxSize = 50 * 1024 * 1024; // 50MB
      if (selectedFile.size > maxSize) {
        alert("File size must be less than 50MB");
        return;
      }
      if (!selectedFile.type.startsWith("audio/")) {
        alert("Please select an audio file");
        return;
      }
      setFile(selectedFile);
    }
  };

  const submit = async () => {
    if (!file) return;
    setLoading(true);
    setSuccess(false);

    try {
      const form = new FormData();
      form.append("audio", file);

      const backendUrl = import.meta.env.VITE_BACKEND_URL || "";
      const { data } = await axios.post(
        `${backendUrl}/api/audit`,
        form
      );

      onResult(data.audit);
      setSuccess(true);
    } catch (error) {
      console.error(error);
      const errorMessage = error.response?.data?.error || "Upload failed";
      alert(`Error: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="w-full max-w-lg bg-white/5 backdrop-blur-xl p-8 rounded-2xl border border-white/10 shadow-xl animate-fadeIn mb-8">
      <h2 className="text-xl font-semibold text-center mb-2">
        Upload Call Recording
      </h2>
      <p className="text-sm text-gray-400 text-center mb-6">
        Supported formats: MP3, WAV, M4A (Max 50MB)
      </p>

      {/* FILE SELECTION */}
      <div className="mb-4">
        <input
          type="file"
          accept="audio/*"
          onChange={handleFileSelect}
          ref={fileInputRef}
          className="hidden"
        />
        <button
          onClick={() => fileInputRef.current.click()}
          className="w-full py-3 px-4 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors mb-2"
        >
          Choose Audio File
        </button>
        {file && (
          <div className="bg-gray-800 p-3 rounded-lg">
            <p className="text-sm font-medium">{file.name}</p>
            <p className="text-xs text-gray-400">{formatFileSize(file.size)}</p>
          </div>
        )}
      </div>

      {/* STATUS */}
      <div className="mb-4 text-center text-sm">
        {loading && (
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-400 mb-2"></div>
            <span className="text-purple-400 animate-pulse">Analyzing call...</span>
          </div>
        )}
        {success && (
          <div className="flex flex-col items-center">
            <span className="text-green-400 mb-2">✔ Analysis completed</span>
            <button
              onClick={() => {
                setFile(null);
                setSuccess(false);
                if (fileInputRef.current) fileInputRef.current.value = '';
              }}
              className="px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded-lg transition-colors text-sm"
            >
              Upload Another
            </button>
          </div>
        )}
      </div>

      {/* ANALYZE BUTTON */}
      <button
        onClick={submit}
        disabled={!file || loading}
        className="w-full py-3 rounded-xl font-semibold transition bg-gradient-to-r from-purple-500 to-pink-500 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? "Processing..." : "Analyze Call"}
      </button>
    </div>
  );
}
