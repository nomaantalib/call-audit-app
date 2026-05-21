export const buildPrompt = (transcript, context) => `
You are an expert call auditor.

Context:
${context || "No additional context provided."}

Transcript:
"${transcript}"

Analyze the call based on the transcript above.
Return ONLY valid JSON with this exact structure:
{
  "insights": ["key insight 1", "key insight 2", "hidden insight"],
  "objective": "The main purpose of the call",
  "conclusion": "A summary of the outcome",
  "sentiment": "Positive, Neutral, or Negative"
}
`;
