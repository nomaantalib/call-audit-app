import fs from "fs";
import path from "path";
import Audit from "../models/Audit.js";
import {
  chunkTranscript,
  extractUtterances,
  normalizeSpeakers,
  transcribeAudio,
} from "../services/assemblyai.service.js";
import { auditCall as auditWithGemini } from "../services/gemini.service.js";

import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load rules
const rulesPath = path.join(__dirname, "../../audit.rules.json");
const auditRules = JSON.parse(fs.readFileSync(rulesPath, "utf-8"));

export const auditCall = async (req, res) => {
  try {
    console.log("--- New Audit Request ---");
    if (!process.env.GEMINI_API_KEY || !process.env.ASSEMBLYAI_API_KEY) {
      console.error("Missing API Keys");
      return res.status(500).json({ 
        success: false, 
        error: "Server configuration error: Missing API Keys" 
      });
    }

    if (!req.file) {
      return res
        .status(400)
        .json({ success: false, error: "No audio file uploaded" });
    }

    const filePath = req.file.path;
    console.log("File received:", filePath);

    // 1. Send to AssemblyAI and get transcript
    console.log("Step 1: Transcribing audio...");
    const transcript = await transcribeAudio(filePath);

    // 2. Extract utterances
    console.log("Step 2: Extracting utterances...");
    let utterances = extractUtterances(transcript);

    // 3. Normalize speakers
    console.log("Step 3: Normalizing speakers...");
    utterances = normalizeSpeakers(utterances);

    // 4. Build full transcript text
    const transcriptText = utterances
      .map((u) => `${u.speaker}: ${u.text}`)
      .join("\n");

    if (!transcriptText) {
      console.warn("Transcript is empty");
    }

    // 5. Audit with Gemini
    console.log("Step 4: Analyzing with Gemini...");
    const auditData = await auditWithGemini(utterances, transcriptText);

    // 6. Compute score
    console.log("Step 5: Computing scores...");
    let score = 0;
    const maxScore = auditRules.reduce((sum, rule) => sum + rule.weight, 0);

    auditData.rule_results.forEach((result) => {
      const rule = auditRules.find((r) => r.id === result.rule_id);
      if (rule && result.passed) {
        score += rule.weight;
      }
    });

    // 7. Persist
    console.log("Step 6: Saving to database...");
    const audit = await Audit.create({
      user: req.user._id,
      filename: req.file.originalname,
      transcript: transcriptText,
      utterances,
      ruleResults: auditData.rule_results.map((r) => ({
        ruleId: r.rule_id,
        passed: r.passed,
        evidence: r.evidence,
      })),
      risks: (auditData.risks || []).map((risk) => ({
        severity: (risk.severity || "LOW").toUpperCase(),
        timestamp: risk.timestamp || "0:00",
        reason: risk.reason || "No reason provided",
      })),
      coachingFeedback: auditData.coaching_feedback,
      score,
      maxScore,
      sentiment: auditData.sentiment,
      objective: auditData.objective,
      conclusion: auditData.conclusion,
    });

    // 8. Cleanup
    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        console.log("Cleanup: Temp file deleted");
      }
    } catch (cleanupErr) {
      console.warn("Cleanup failed", cleanupErr.message);
    }

    console.log("Audit complete successfully.");
    res.json({
      success: true,
      audit
    });
  } catch (error) {
    console.error("Audit Controller ERROR Stack:", error.stack || error);
    if (req.file && fs.existsSync(req.file.path)) {
      try {
        fs.unlinkSync(req.file.path);
      } catch {}
    }
    res.status(500).json({ success: false, error: error.message || "Internal Server Error" });
  }
};

export const getAudits = async (req, res) => {
  try {
    const audits = await Audit.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json({ success: true, audits });
  } catch (error) {
    console.error("Get Audits Error:", error.message);
    res.status(500).json({ success: false, error: error.message });
  }
};

export const seedAudits = async (req, res) => {
  try {
    const userId = req.user._id;

    // Check if the user already has audits
    const existingCount = await Audit.countDocuments({ user: userId });
    if (existingCount > 0) {
      return res.status(400).json({
        success: false,
        error: "Audit history is not empty. Cannot seed audits."
      });
    }

    const mockAudits = [
      {
        user: userId,
        filename: "customer_support_frustrated_v4.mp3",
        duration: 92,
        transcript: "AGENT: Thank you for calling Customer Care. My name is Alex. How can I help you today?\nCUSTOMER: Yes, finally! I've been trying to get a hold of someone for twenty minutes. My billing amount is completely wrong this month. It's showing double what it should be!\nAGENT: I understand your frustration, and I am very sorry for the wait time and any confusion with your bill. Let me look into your account details right away. Could you please verify your account number?\nCUSTOMER: Sure, it is 987654321.\nAGENT: Thank you. I am pulling it up now. Ah, I see here there was a double charge on your subscription package due to a system glitch on the 15th. I am going to reverse that second charge immediately so your account balance will show the correct amount.\nCUSTOMER: Oh, okay. Thank you. That is a relief. I was really worried about it.\nAGENT: You are very welcome. I've successfully applied the credit of forty-five dollars. It will reflect on your online dashboard within the next ten minutes. Is there anything else I can assist you with today?\nCUSTOMER: No, that was it. Thanks for sorting this out so quickly.\nAGENT: It was my pleasure. Thank you for your patience, and have a wonderful day ahead!\nCUSTOMER: You too. Bye.",
        utterances: [
          { speaker: "AGENT", text: "Thank you for calling Customer Care. My name is Alex. How can I help you today?", start: 0, end: 5, sentiment: "Positive" },
          { speaker: "CUSTOMER", text: "Yes, finally! I've been trying to get a hold of someone for twenty minutes. My billing amount is completely wrong this month. It's showing double what it should be!", start: 6, end: 15, sentiment: "Negative" },
          { speaker: "AGENT", text: "I understand your frustration, and I am very sorry for the wait time and any confusion with your bill. Let me look into your account details right away. Could you please verify your account number?", start: 16, end: 26, sentiment: "Positive" },
          { speaker: "CUSTOMER", text: "Sure, it is 987654321.", start: 27, end: 29, sentiment: "Neutral" },
          { speaker: "AGENT", text: "Thank you. I am pulling it up now. Ah, I see here there was a double charge on your subscription package due to a system glitch on the 15th. I am going to reverse that second charge immediately so your account balance will show the correct amount.", start: 30, end: 45, sentiment: "Positive" },
          { speaker: "CUSTOMER", text: "Oh, okay. Thank you. That is a relief. I was really worried about it.", start: 46, end: 52, sentiment: "Positive" },
          { speaker: "AGENT", text: "You are very welcome. I've successfully applied the credit of forty-five dollars. It will reflect on your online dashboard within the next ten minutes. Is there anything else I can assist you with today?", start: 53, end: 68, sentiment: "Positive" },
          { speaker: "CUSTOMER", text: "No, that was it. Thanks for sorting this out so quickly.", start: 69, end: 73, sentiment: "Positive" },
          { speaker: "AGENT", text: "It was my pleasure. Thank you for your patience, and have a wonderful day ahead!", start: 74, end: 80, sentiment: "Positive" },
          { speaker: "CUSTOMER", text: "You too. Bye.", start: 81, end: 83, sentiment: "Positive" }
        ],
        ruleResults: [
          { ruleId: "greeting", passed: true, evidence: "Agent said: 'Thank you for calling Customer Care. My name is Alex. How can I help you today?' at the start of the call." },
          { ruleId: "listening", passed: true, evidence: "Agent acknowledged the billing issue and pulled up account details immediately." },
          { ruleId: "empathy", passed: true, evidence: "Agent expressed understanding of client distress: 'I understand your frustration, and I am very sorry for the wait time...'" },
          { ruleId: "resolution", passed: true, evidence: "Agent reversed the double charge, applying a $45 credit and stating it will reflect in 10 minutes." },
          { ruleId: "closing", passed: true, evidence: "Agent closed the call professionally: 'It was my pleasure. Thank you for your patience, and have a wonderful day ahead!'" },
          { ruleId: "compliance", passed: true, evidence: "Agent verified account details and did not ask for or repeat any sensitive unencrypted information." },
          { ruleId: "tone", passed: true, evidence: "Agent maintained an exceptionally helpful, professional, and calm tone throughout the escalation." }
        ],
        risks: [],
        coachingFeedback: [
          "Excellent handling of a frustrated billing customer.",
          "Clear explanation of the bill adjustment timeline (~10 minutes).",
          "Maintained strong active listening and empathy throughout."
        ],
        score: 100,
        maxScore: 100,
        sentiment: "Positive",
        objective: "Billing discrepancy resolution and credit reversal.",
        conclusion: "Excellent resolution of a double-billing complaint with strong compliance and positive customer tone."
      },
      {
        user: userId,
        filename: "billing_escalation_refusal.mp3",
        duration: 115,
        transcript: "AGENT: Hello? Who's this?\nCUSTOMER: Hi, I'm calling because I received a bill for $120, but my contract says it should be $60. Can someone fix this?\nAGENT: Look, the price went up. Everybody's bill went up. I can't change it.\nCUSTOMER: But I have a locked-in 1-year contract! You can't just change it mid-contract without notifying me. This is unfair.\nAGENT: Listen, there's nothing I can do. If you don't like it, you can cancel. But there's a cancellation fee of $200.\nCUSTOMER: That is ridiculous! You are charging me double, refusing to honor the contract, and threatening me with a cancellation fee? I want to speak to your supervisor right now.\nAGENT: They are busy. Look, I don't have time for this argument. Bye.",
        utterances: [
          { speaker: "AGENT", text: "Hello? Who's this?", start: 0, end: 3, sentiment: "Negative" },
          { speaker: "CUSTOMER", text: "Hi, I'm calling because I received a bill for $120, but my contract says it should be $60. Can someone fix this?", start: 4, end: 11, sentiment: "Neutral" },
          { speaker: "AGENT", text: "Look, the price went up. Everybody's bill went up. I can't change it.", start: 12, end: 18, sentiment: "Negative" },
          { speaker: "CUSTOMER", text: "But I have a locked-in 1-year contract! You can't just change it mid-contract without notifying me. This is unfair.", start: 19, end: 27, sentiment: "Negative" },
          { speaker: "AGENT", text: "Listen, there's nothing I can do. If you don't like it, you can cancel. But there's a cancellation fee of $200.", start: 28, end: 35, sentiment: "Negative" },
          { speaker: "CUSTOMER", text: "That is ridiculous! You are charging me double, refusing to honor the contract, and threatening me with a cancellation fee? I want to speak to your supervisor right now.", start: 36, end: 48, sentiment: "Negative" },
          { speaker: "AGENT", text: "They are busy. Look, I don't have time for this argument. Bye.", start: 49, end: 54, sentiment: "Negative" }
        ],
        ruleResults: [
          { ruleId: "greeting", passed: false, evidence: "Agent said: 'Hello? Who's this?' which is unprofessional." },
          { ruleId: "listening", passed: false, evidence: "Agent did not actively listen or investigate the contract discrepancy." },
          { ruleId: "empathy", passed: false, evidence: "Agent showed no empathy towards the billing issue, stating: 'Look, the price went up. Everybody's bill went up.'" },
          { ruleId: "resolution", passed: false, evidence: "Agent refused to help resolve the contract rate discrepancy." },
          { ruleId: "closing", passed: false, evidence: "Agent hung up abruptly on customer saying: 'I don't have time for this argument. Bye.'" },
          { ruleId: "compliance", passed: true, evidence: "Agent did not read out sensitive information, although they violated customer service policy." },
          { ruleId: "tone", passed: false, evidence: "Agent was argumentative, dismissive, and maintained an unprofessional tone." }
        ],
        risks: [
          { severity: "HIGH", timestamp: "0:49", reason: "Agent hung up on a customer asking for supervisor escalation." },
          { severity: "MEDIUM", timestamp: "0:28", reason: "Agent threatened customer with cancellation fees without checking contract records." }
        ],
        coachingFeedback: [
          "Urgent: Representative needs training on handling customer escalations.",
          "Never hang up on a customer, especially when they request a supervisor.",
          "Greeting and closing must follow standard polite scripting."
        ],
        score: 25, // compliance (25), tone (0 - failed), greeting (0), listening (0), empathy (0), resolution (0), closing (0). Total = 25.
        maxScore: 100,
        sentiment: "Negative",
        objective: "Billing dispute and contract escalation.",
        conclusion: "Critical compliance failure. Agent was highly unprofessional, refused escalation, and hung up on customer."
      },
      {
        user: userId,
        filename: "pci_compliance_violation.mp3",
        duration: 78,
        transcript: "AGENT: Thank you for calling Payment Support. My name is Sarah. How may I assist you?\nCUSTOMER: Hi, I'd like to pay my outstanding invoice. I have my credit card ready.\nAGENT: Excellent. I can process that for you. What is the card number, expiration, and CVV code?\nCUSTOMER: Okay, the card number is 4111 2222 3333 4444, expiration is December 2028.\nAGENT: Got it, and what is the 3-digit security code on the back?\nCUSTOMER: It's 123.\nAGENT: Okay, I have verified the security code as 123. Let me key that into the billing terminal.\nCUSTOMER: Great, did the payment go through?\nAGENT: Yes, it did. The transaction is complete and your invoice is marked paid. Can I help you with anything else?\nCUSTOMER: No, that is all. Thank you!\nAGENT: You are welcome. Thank you for your payment, have a nice day!",
        utterances: [
          { speaker: "AGENT", text: "Thank you for calling Payment Support. My name is Sarah. How may I assist you?", start: 0, end: 5, sentiment: "Positive" },
          { speaker: "CUSTOMER", text: "Hi, I'd like to pay my outstanding invoice. I have my credit card ready.", start: 6, end: 10, sentiment: "Neutral" },
          { speaker: "AGENT", text: "Excellent. I can process that for you. What is the card number, expiration, and CVV code?", start: 11, end: 17, sentiment: "Positive" },
          { speaker: "CUSTOMER", text: "Okay, the card number is 4111 2222 3333 4444, expiration is December 2028.", start: 18, end: 24, sentiment: "Neutral" },
          { speaker: "AGENT", text: "Got it, and what is the 3-digit security code on the back?", start: 25, end: 29, sentiment: "Neutral" },
          { speaker: "CUSTOMER", text: "It's 123.", start: 30, end: 32, sentiment: "Neutral" },
          { speaker: "AGENT", text: "Okay, I have verified the security code as 123. Let me key that into the billing terminal.", start: 33, end: 39, sentiment: "Neutral" },
          { speaker: "CUSTOMER", text: "Great, did the payment go through?", start: 40, end: 42, sentiment: "Positive" },
          { speaker: "AGENT", text: "Yes, it did. The transaction is complete and your invoice is marked paid. Can I help you with anything else?", start: 43, end: 49, sentiment: "Positive" },
          { speaker: "CUSTOMER", text: "No, that is all. Thank you!", start: 50, end: 52, sentiment: "Positive" },
          { speaker: "AGENT", text: "You are welcome. Thank you for your payment, have a nice day!", start: 53, end: 57, sentiment: "Positive" }
        ],
        ruleResults: [
          { ruleId: "greeting", passed: true, evidence: "Agent greeted the customer politely: 'Thank you for calling Payment Support. My name is Sarah. How may I assist you?'" },
          { ruleId: "listening", passed: true, evidence: "Agent actively listened and processed the payment request." },
          { ruleId: "empathy", passed: true, evidence: "Agent was polite and helpful." },
          { ruleId: "resolution", passed: true, evidence: "Agent successfully processed the invoice payment." },
          { ruleId: "closing", passed: true, evidence: "Agent closed the call professionally: 'You are welcome. Thank you for your payment, have a nice day!'" },
          { ruleId: "compliance", passed: false, evidence: "Agent explicitly repeated the credit card security CVV code (123) aloud on the recorded line, violating PCI-DSS policies." },
          { ruleId: "tone", passed: true, evidence: "Agent maintained a professional, clear tone." }
        ],
        risks: [
          { severity: "HIGH", timestamp: "0:33", reason: "Agent repeated the card CVV code aloud on the call recording (PCI violation)." }
        ],
        coachingFeedback: [
          "Critical PCI Compliance violation: Never repeat CVV codes back to customers or read them aloud on recordings.",
          "Utilize secure pay IVR or mute the call recording during credit card entry."
        ],
        score: 75, // compliance failed (-25). 100 - 25 = 75.
        maxScore: 100,
        sentiment: "Positive",
        objective: "Invoice payment processing.",
        conclusion: "The agent processed the transaction politely, but committed a high-risk PCI compliance violation by reading the CVV aloud."
      }
    ];

    const seeded = await Audit.insertMany(mockAudits);
    res.json({
      success: true,
      message: "Successfully seeded sample compliance audits",
      audits: seeded
    });
  } catch (error) {
    console.error("Seeding Error:", error.message);
    res.status(500).json({ success: false, error: error.message });
  }
};
