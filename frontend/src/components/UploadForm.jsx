// frontend/src/components/UploadForm.jsx
import { useState } from "react";
import axios from "axios";

export default function UploadForm({ onResult }) {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
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
      alert("Upload failed – see console");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="glass p-8 rounded-xl shadow-xl flex flex-col items-center gap-4"
    >
      <h2 className="text-2xl font-semibold mb-2">Upload Call Recording</h2>
      <input
        type="file"
        accept="audio/*"
        onChange={(e) => setFile(e.target.files[0])}
        required
        className="file-input"
      />
      <button type="submit" disabled={loading} className="btn-primary">
        {loading ? "Processing…" : "Analyze"}
      </button>
    </form>
  );
}
