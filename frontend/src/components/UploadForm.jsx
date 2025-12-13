import { useState } from "react";
import axios from "axios";

export default function UploadPage({ onResult }) {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const submit = async () => {
    if (!file) return;
    setLoading(true);
    setSuccess(false);

    try {
      const form = new FormData();
      form.append("audio", file);

      const { data } = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/audit`,
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

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-black via-slate-900 to-black text-white">

      {/* HEADER */}
      <header className="p-6 text-center border-b border-white/10">
        <h1 className="text-2xl font-bold tracking-wide">
          🎧 AI Call Auditor
        </h1>
        <p className="text-sm text-gray-400">
          Smart insights from customer calls
        </p>
      </header>

      {/* MAIN */}
      <main className="flex flex-1 items-center justify-center px-4">
        <div className="w-full max-w-lg bg-white/5 backdrop-blur-xl p-8 rounded-2xl border border-white/10 shadow-xl animate-fadeIn">

          <h2 className="text-xl font-semibold text-center mb-2">
            Upload Call Recording
          </h2>
          <p className="text-sm text-gray-400 text-center mb-6">
            Supported formats: MP3, WAV, M4A
          </p>

          {/* UPLOAD */}
          <label className="flex flex-col items-center justify-center h-36 border-2 border-dashed rounded-xl cursor-pointer transition
            hover:border-purple-400 hover:bg-white/5">
            <input
              type="file"
              accept="audio/*"
              hidden
              onChange={(e) => setFile(e.target.files[0])}
            />
            <span className="text-sm">
              {file ? file.name : "Click to select audio file"}
            </span>
          </label>

          {/* STATUS */}
          <div className="h-6 mt-4 text-center text-sm">
            {loading && <span className="text-purple-400 animate-pulse">Analyzing call...</span>}
            {success && <span className="text-green-400">✔ Analysis completed</span>}
          </div>

          {/* BUTTON */}
          <button
            onClick={submit}
            disabled={!file || loading}
            className="mt-6 w-full py-3 rounded-xl font-semibold transition
              bg-gradient-to-r from-purple-500 to-pink-500
              hover:opacity-90 disabled:opacity-50"
          >
            {loading ? "Processing..." : "Analyze Call"}
          </button>
        </div>
      </main>

      {/* FOOTER */}
      <footer className="text-center text-xs text-gray-500 py-4 border-t border-white/10">
        © 2025 AI Call Audit System • Built with ❤️ & AI
      </footer>
    </div>
  );
}
