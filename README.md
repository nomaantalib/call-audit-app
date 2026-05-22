# call-audit-app

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Build Status](https://img.shields.io/badge/build-passing-brightgreen.svg)]()

The **Call Audit App** is a streamlined AI-powered Quality Assurance (QA) and Compliance Monitoring platform designed to help supervisors, QA teams, and managers evaluate customer-agent interactions. This tool ensures compliance, tracks script adherence, performs speech analytics, detects risk indicators, and provides actionable insights to improve customer service standards.

The platform intelligently analyzes uploaded customer support call recordings using Artificial Intelligence, Natural Language Processing (NLP), speech analytics, sentiment analysis, and compliance rule engines.

---

## 🌐 Live Demo

- **Live Deployed App:** https://call-audit-app-brrj.onrender.com

---

# 🚀 Complete Platform Overview

The application takes a customer-agent audio recording and automatically performs:

- Audio transcription
- Speaker identification
- Quality assurance scoring
- Compliance monitoring
- PCI violation detection
- Sentiment analysis
- Speech analytics
- Predictive risk analysis
- Coaching recommendation generation
- Executive summary generation
- Timeline-based conversation analysis
- Manual scoring and audit customization

This system is suitable for:

- BPOs
- Banking support systems
- Insurance customer support
- Telecom support centers
- Payment processing companies
- Customer service QA teams
- Enterprise call monitoring systems

---

# 🧠 How the System Works

## 1. Audio Upload & Processing

The user uploads a customer support call recording. The system processes the audio using Speech-to-Text AI models and converts the entire conversation into structured text.

### Features:
- Multi-speaker audio processing
- Real-time transcription support
- Dialogue segmentation
- Timestamp mapping

---

## 2. Speaker Diarization

The platform automatically identifies:

- Agent voice
- Customer voice

This allows the system to calculate:

- Agent talk ratio
- Customer talk ratio
- Number of conversation turns
- Speaking pace (WPM)
- Interaction flow

---

## 3. AI-Powered QA Audit Engine

The system evaluates conversations against predefined QA rules and scorecards.

### Example Audit Rules:

- Greeting quality
- Active listening
- Empathy
- Resolution handling
- Call closing professionalism
- PCI compliance
- Script adherence
- Escalation handling

Each rule contains:

- Weight score
- Severity level
- Pass/Fail state
- AI-generated explanation

---

## 4. PCI Compliance Violation Detection

The platform automatically detects sensitive compliance violations.

### Example:
If an agent reads a customer CVV number aloud during a payment call, the system flags it as:

- High-risk PCI violation
- Security compliance breach
- Critical audit failure

The app can generate warnings and coaching feedback for such violations.

---

## 5. Sentiment Analysis

The AI analyzes emotional tone and customer satisfaction throughout the call.

### Outputs:

- Positive sentiment
- Neutral sentiment
- Negative sentiment
- Emotional trend timeline

This helps QA teams understand customer experience quality.

---

## 6. Speech Analytics

The application extracts advanced speech metrics including:

- Empathy score
- Confidence score
- Dead air percentage
- Talk ratio
- Speaking pace
- Conversation engagement

These analytics help evaluate communication effectiveness.

---

## 7. Predictive Risk Analysis

AI models estimate operational and customer-service risks such as:

- Customer churn risk
- Escalation probability
- Fraud risk
- Security risk

This enables proactive decision-making.

---

## 8. Voice Biometrics & Verification

The system supports voiceprint verification features.

### Capabilities:

- Agent voice verification
- Voice signature matching
- Fraud prevention support
- Identity validation

---

## 9. Executive Summary Generation

The platform uses Large Language Models (LLMs) to generate concise summaries of each call audit.

### Example:

> "The agent processed the transaction politely but committed a PCI compliance violation by reading the CVV aloud."

This helps managers quickly understand audit outcomes.

---

## 10. AI Coaching Recommendations

The system automatically generates coaching feedback and training recommendations for agents.

### Example:

- Never repeat CVV codes aloud
- Use secure IVR payment flow
- Improve empathy statements
- Reduce dead air during calls

---

## 11. Timeline-Based Conversation Analysis

The platform provides a detailed dialogue timeline including:

- Speaker labels
- Timestamps
- Searchable conversation text
- Customer-only or agent-only filtering

This improves audit transparency and review speed.

---

## 12. Manual Scoring Workspace

Auditors can manually:

- Toggle audit rules
- Recalculate scores dynamically
- Add coaching notes
- Customize evaluation logic

This allows both AI-assisted and human-assisted auditing.

---

# 📊 Dashboard Features

The dashboard provides:

- Total audit reports
- Average QA score
- Critical violation count
- Real-time analytics
- Audit report management
- Team performance tracking
- Compliance monitoring insights

---

## ✨ Key Features

- **AI-Powered Call Auditing**
- **Speech-to-Text Transcription**
- **Speaker Diarization**
- **Compliance Monitoring**
- **PCI Violation Detection**
- **Sentiment Analysis**
- **Speech Analytics**
- **Voice Biometrics**
- **Predictive Risk Detection**
- **Executive Summary Generation**
- **AI Coaching Recommendations**
- **Dynamic QA Scorecards**
- **Timeline-Based Conversation Viewer**
- **Manual Scoring Workspace**
- **Real-Time Analytics Dashboard**
- **Customizable Audit Rules**

---

## 🛠 Tech Stack

### Frontend
- React.js
- Tailwind CSS
- Responsive UI Components
- Real-time Dashboard Interfaces

### Backend
- Node.js
- Express.js
- REST APIs

### Database
- MongoDB / PostgreSQL

### AI & ML Components
- OpenAI / Gemini APIs
- Whisper / Speech-to-Text Models
- NLP Pipelines
- Sentiment Analysis Models
- Rule-Based Compliance Engine

### Authentication
- Firebase / JWT

---

# ⚙️ System Workflow

```text```
Audio Upload
      ↓
Speech-to-Text Processing
      ↓
Speaker Identification
      ↓
Conversation Analysis
      ↓
Compliance Rule Engine
      ↓
Sentiment & Speech Analytics
      ↓
Risk Prediction
      ↓
AI Summary & Coaching
      ↓
QA Dashboard Report

---

##  Installation & Setup

Follow these steps to get your local development environment running:

1. **Clone the repository**
   ```bash```
   git clone [https://github.com/nomaantalib/call-audit-app.git](https://github.com/nomaantalib/call-audit-app.git)
   cd call-audit-app
 2. **Install dependency**
   # If using npm
   npm install

   # If using yarn
   yarn install

3. **Run it locally**
    npm start
   
