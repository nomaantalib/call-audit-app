// frontend/src/components/ResultCard.jsx
export default function ResultCard({ audit }) {
  if (!audit) return null;

  return (
    <div className="w-full max-w-4xl mx-auto mt-12 animate-fade-in perspective-1000">
      <div className="glass p-8 rounded-2xl relative overflow-hidden border border-white/10 shadow-2xl">
        <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
           <svg className="w-64 h-64" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/></svg>
        </div>

        <div className="relative z-10">
          <header className="mb-8 border-b border-white/10 pb-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-300 uppercase tracking-wider mb-1">Audit Report</p>
              <h3 className="text-3xl font-bold text-white tracking-tight">{audit.filename}</h3>
            </div>
            <div className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wide border 
              ${audit.sentiment?.toLowerCase().includes('positive') ? 'bg-green-500/20 text-green-300 border-green-500/30' : 
                audit.sentiment?.toLowerCase().includes('negative') ? 'bg-red-500/20 text-red-300 border-red-500/30' : 
                'bg-blue-500/20 text-blue-300 border-blue-500/30'}`}>
              {audit.sentiment || "Analyzed"}
            </div>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Insights Column */}
            <div className="glass-card p-6 rounded-xl hover:bg-white/5 transition-colors">
              <h4 className="text-xl font-semibold mb-4 flex items-center gap-2 text-blue-300">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                Key Insights
              </h4>
              <ul className="space-y-3">
                {Array.isArray(audit.insights) && audit.insights.map((insight, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-gray-200">
                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-blue-400 shrink-0"></span>
                    <span className="leading-relaxed">{insight}</span>
                  </li>
                ))}
                {!Array.isArray(audit.insights) && (
                   <li className="text-gray-300 italic">{audit.insights}</li>
                )}
              </ul>
            </div>

            {/* Objective & Conclusion Column */}
            <div className="space-y-6">
              <div className="glass-card p-6 rounded-xl">
                 <h4 className="text-lg font-semibold mb-3 flex items-center gap-2 text-purple-300">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path></svg>
                  Call Objective
                 </h4>
                 <p className="text-gray-200 leading-relaxed">{audit.objective}</p>
              </div>

              <div className="glass-card p-6 rounded-xl border-l-4 border-l-pink-500/50">
                 <h4 className="text-lg font-semibold mb-3 flex items-center gap-2 text-pink-300">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                  Conclusion
                 </h4>
                 <p className="text-gray-200 leading-relaxed">{audit.conclusion}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
