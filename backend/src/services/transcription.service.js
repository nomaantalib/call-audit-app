
import { aaiClient } from "../config/assembly.config.js";

export const transcribeAudio = async (filePath) => {
  try {
    console.log("Uploading audio to AssemblyAI...");
    const uploadUrl = await aaiClient.files.upload(filePath);

    console.log("Starting transcription...");
    const transcript = await aaiClient.transcripts.transcribe({
      audio: uploadUrl,
    });

    if (transcript.status === 'error') {
      throw new Error(transcript.error);
    }

    console.log("Transcription complete.");
    return transcript.text;
  } catch (error) {
    console.error("AssemblyAI Service Error:", error);
    if (error.message.includes("fetch failed")) {
        throw new Error("AssemblyAI Connection Failed: Check your API Key in .env and internet connection.");
    }
    throw new Error("Transcription failed: " + error.message);
  }
};
