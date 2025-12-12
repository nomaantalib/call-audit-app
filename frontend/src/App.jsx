import { useState } from "react";
import UploadForm from "./components/UploadForm";
import ResultCard from "./components/ResultCard";

export default function App() {
  const [audit, setAudit] = useState(null);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800 flex flex-col items-center pt-12">
      <UploadForm onResult={setAudit} />
      {audit && <ResultCard audit={audit} />}
    </div>
  );
}
