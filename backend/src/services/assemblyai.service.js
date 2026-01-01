import { aaiClient } from "../config/assembly.config.js";

// Transcribe audio with diarization, sentiment, PII redaction
export const transcribeAudio = async (filePath) => {
  try {
    if (!process.env.ASSEMBLYAI_API_KEY) {
      throw new Error("ASSEMBLYAI_API_KEY is missing");
    }
    console.log(`Step 1.1: Uploading audio from ${filePath} to AssemblyAI...`);
    const uploadUrl = await aaiClient.files.upload(filePath);
    console.log("Step 1.2: File uploaded successfully, URL:", uploadUrl);

    console.log(
      "Step 1.3: Starting transcription with diarization, sentiment, and PII redaction..."
    );
    const transcript = await aaiClient.transcripts.transcribe({
      audio: uploadUrl,
      speaker_labels: true, // Diarization
      sentiment_analysis: true, // Sentiment
      redact_pii: true, // PII detection and redaction
      redact_pii_policies: [
        "person_name",
        "phone_number",
        "email_address",
        "account_number",
        "credit_card_number",
      ],
      redact_pii_sub: "entity_name", // Replace with entity name
    });

    // Poll for completion
    let currentTranscript = transcript;
    let status = transcript.status;
    let attempts = 0;
    const maxAttempts = 60; // 5 minutes max
    while (status !== "completed" && attempts < maxAttempts) {
      await new Promise((resolve) => setTimeout(resolve, 5000)); // Wait 5 seconds
      currentTranscript = await aaiClient.transcripts.get(transcript.id);
      status = currentTranscript.status;
      attempts++;
      console.log(`Polling attempt ${attempts}, status: ${status}`);
    }

    if (status !== "completed") {
      throw new Error("Transcription timed out");
    }

    console.log("Transcription complete.");
    return currentTranscript;
  } catch (error) {
    console.error("AssemblyAI Service Error:", error);
    throw new Error("Transcription failed: " + error.message);
  }
};

// Extract structured utterances
export const extractUtterances = (transcript) => {
  const utterances = [];
  if (transcript.utterances) {
    transcript.utterances.forEach((utterance) => {
      utterances.push({
        speaker: utterance.speaker, // Will be normalized later
        text: utterance.text,
        start: utterance.start,
        end: utterance.end,
        sentiment: utterance.sentiment || "neutral",
      });
    });
  }
  return utterances;
};

// Normalize speakers to AGENT / CUSTOMER
export const normalizeSpeakers = (utterances) => {
  // Simple heuristic: first speaker is AGENT, second is CUSTOMER
  const speakerMap = {};
  let agentSpeaker = null;
  let customerSpeaker = null;

  utterances.forEach((utt) => {
    if (!speakerMap[utt.speaker]) {
      speakerMap[utt.speaker] = utt.speaker;
      if (!agentSpeaker) {
        agentSpeaker = utt.speaker;
      } else if (!customerSpeaker) {
        customerSpeaker = utt.speaker;
      }
    }
  });

  return utterances.map((utt) => ({
    ...utt,
    speaker: utt.speaker === agentSpeaker ? "AGENT" : "CUSTOMER",
  }));
};

// Chunk transcript for LLM input (safe token limits)
export const chunkTranscript = (utterances, maxTokens = 4000) => {
  const chunks = [];
  let currentChunk = [];
  let currentTokens = 0;

  utterances.forEach((utt) => {
    const uttTokens = Math.ceil(utt.text.length / 4); // Rough estimate
    if (currentTokens + uttTokens > maxTokens) {
      chunks.push(currentChunk);
      currentChunk = [utt];
      currentTokens = uttTokens;
    } else {
      currentChunk.push(utt);
      currentTokens += uttTokens;
    }
  });

  if (currentChunk.length > 0) {
    chunks.push(currentChunk);
  }

  return chunks;
};
