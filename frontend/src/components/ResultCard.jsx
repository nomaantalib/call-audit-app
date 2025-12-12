// frontend/src/components/ResultCard.jsx
export default function ResultCard({ audit }) {
  return (
    <div className="glass mt-6 p-6 rounded-xl shadow-lg max-w-2xl">
      <h3 className="text-xl font-bold mb-3">{audit.filename}</h3>
      <section className="mb-2">
        <strong>Insights:</strong>
        <p>{audit.insights}</p>
      </section>
      <section className="mb-2">
        <strong>Objective:</strong>
        <p>{audit.objective}</p>
      </section>
      <section>
        <strong>Conclusion:</strong>
        <p>{audit.conclusion}</p>
      </section>
    </div>
  );
}
