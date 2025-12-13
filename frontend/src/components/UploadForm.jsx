// frontend/src/components/UploadForm.jsx
import { useState } from "react";
import axios from "axios";

export default function UploadForm({ onResult }) {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!file) return;

    setLoading(true);
    const form = new FormData();
    form.append("audio", file);

    try {
      const resp = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/audit/`,
        form,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      onResult(resp.data.audit);
    } catch (err) {
      console.error(err);
      alert("Upload failed – check console for details.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto z-10">
      <div className={`glass p-1 rounded-2xl transition-all duration-300 ${dragActive ? 'scale-105 ring-2 ring-purple-400' : ''}`}>
        <form
          onSubmit={handleSubmit}
          className="bg-black/20 backdrop-blur-sm rounded-xl p-8 flex flex-col items-center gap-6 border border-white/5"
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <div className="text-center space-y-2">
            <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-400">
              AI Call Auditor
            </h2>
            <p className="text-gray-300 text-sm">Upload a call recording to extract insights.</p>
          </div>

          <div className="w-full relative group">
            <input
              type="file"
              accept="audio/*"
              id="file-upload"
              onChange={(e) => setFile(e.target.files[0])}
              className="hidden"
            />
            <label
              htmlFor="file-upload"
              className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-xl cursor-pointer transition-all duration-300
                ${file ? 'border-green-500 bg-green-500/10' : 'border-gray-500 hover:border-purple-400 hover:bg-white/5'}
              `}
            >
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                {file ? (
                  <div className="flex items-center gap-2 text-green-400">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                    <span className="font-medium text-sm truncate max-w-[200px]">{file.name}</span>
                  </div>
                ) : (
                  <>
                    <svg aria-hidden="true" className="w-10 h-10 mb-3 text-gray-400 group-hover:text-purple-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path></svg>
                    <p className="mb-2 text-sm text-gray-400"><span className="font-semibold text-white">Click to upload</span> or drag and drop</p>
                    <p className="text-xs text-gray-500">MP3, WAV, M4A (Max 20MB)</p>
                  </>
                )}
              </div>
            </label>
          </div>

          <button
            type="submit"
            disabled={loading || !file}
            className={`btn-primary w-full flex justify-center items-center gap-2 ${loading ? 'opacity-80 cursor-wait' : ''}`}
          >
            {loading ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing Analysis...
              </>
            ) : (
              "Analyze Call"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
