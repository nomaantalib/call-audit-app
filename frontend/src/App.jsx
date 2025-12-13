// frontend/src/App.jsx
import { useState } from "react";
import UploadForm from "./components/UploadForm";
import ResultCard from "./components/ResultCard";

export default function App() {
  const [audit, setAudit] = useState(null);

  return (
    <div className="min-h-screen bg-[#0f172a] text-white relative overflow-hidden selection:bg-pink-500 selection:text-white">
      {/* Dynamic Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-purple-600/30 rounded-full blur-[120px] animate-pulse-slow mix-blend-screen"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-pink-600/30 rounded-full blur-[120px] animate-pulse-slow mix-blend-screen" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-[20%] left-[30%] w-[40%] h-[40%] bg-blue-600/20 rounded-full blur-[100px] animate-pulse-slow mix-blend-screen" style={{ animationDelay: '4s' }}></div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 container mx-auto px-6 py-12 flex flex-col items-center min-h-screen">
        <header className="mb-12 text-center">
             {/* Header content if needed, currently inside UploadForm, but we can add a logo here if desired */}
        </header>
        
        <main className="w-full max-w-5xl flex flex-col items-center">
            <UploadForm onResult={setAudit} />
            <ResultCard audit={audit} />
        </main>

        <footer className="mt-auto py-8 text-center text-white/30 text-sm">
          <p>© {new Date().getFullYear()} AI Call Auditor. Powered by Gemini 1.5.</p>
        </footer>
      </div>
    </div>
  );
}
