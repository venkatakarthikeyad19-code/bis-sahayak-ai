<div align="center">

# 🛡️ BIS Sahayak AI

### **Intelligent Assistant for Indian Standards & BIS Compliance**
*Smart India Hackathon Prototype*

[![Live Website](https://img.shields.io/badge/Live_Website-bis--sahayak--ai.netlify.app-00C7B7?style=for-the-badge&logo=netlify&logoColor=white)](https://bis-sahayak-ai.netlify.app)
[![Backend API](https://img.shields.io/badge/Backend_API-Render-46E3B7?style=for-the-badge&logo=render&logoColor=white)](https://bis-sahayak-ai.onrender.com)
[![License](https://img.shields.io/badge/Status-Live-success?style=for-the-badge)](#)

<br/>

**[🌐 Launch Live Application](https://bis-sahayak-ai.netlify.app)** &nbsp;•&nbsp; **[📡 API Health Check](https://bis-sahayak-ai.onrender.com)**

---

</div>

## 📌 Overview

**BIS Sahayak AI** is an AI-powered decision-support platform designed to help manufacturers, MSMEs, compliance officers, and consumers seamlessly navigate Bureau of Indian Standards (BIS) compliances. It bridges the gap between complex regulatory documents and everyday users through semantic intelligence, automated label verification, and actionable roadmaps.

---

## 🚀 Live Demo Links

| Service | Platform | URL |
| :--- | :--- | :--- |
| **Frontend Web App** | Netlify | **[https://bis-sahayak-ai.netlify.app](https://bis-sahayak-ai.netlify.app)** |
| **Backend REST API** | Render | **[https://bis-sahayak-ai.onrender.com](https://bis-sahayak-ai.onrender.com)** |
| **API Documentation** | Swagger / OpenAPI | **[https://bis-sahayak-ai.onrender.com/docs](https://bis-sahayak-ai.onrender.com/docs)** |

> 💡 **Tip:** Free tier backend servers may take ~30–40 seconds to spin up on the initial request if idle.

---

## ✨ Key Features

- **🔍 Intelligent Standards Discovery:** Semantic search mapping plain-language product descriptions to official Indian Standards (IS codes).
- **📸 Smart OCR Label Verification:** Upload product label photos to automatically verify ISI Marks, Standard Markings, CML numbers, and mandatory warning text against standards.
- **💡 Explainable Recommendations:** Understand *why* an Indian Standard applies to your specific product parameters.
- **🗺️ Interactive Compliance Roadmap:** Step-by-step guidance from prototype testing to lab reports and final license application.
- **🎙️ Multilingual & Voice Ready:** Voice input and speech synthesis for accessibility across diverse user demographics.
- **⚡ Quick Demo Presets:** Instant one-click evaluations for common products (e.g., Electric Kettles, LED Lamps, Kitchen Appliances).

---

## 🛠️ Tech Stack

- **Frontend:** Next.js 16 (React 19), Tailwind CSS, Lucide Icons, Shadcn UI
- **Backend:** FastAPI (Python 3.11+), Uvicorn, Pydantic
- **AI & Reasoning:** Google Gemini API (`gemini-1.5-flash` / `gemini-1.5-pro`)
- **Document RAG:** ChromaDB Vector Database & Semantic Embeddings
- **OCR & Image Analysis:** Gemini Vision / Tesseract OCR
- **Hosting:** Netlify (Frontend) + Render (Backend)

---

## 📁 Repository Structure

```text
bis-sahayak-ai/
├── frontend/             # Next.js web application
│   ├── app/              # App router (Dashboard, Scan, Services)
│   ├── components/       # Reusable UI components
│   └── lib/              # API client & utility functions
├── backend/              # FastAPI cloud service
│   ├── app/              # API routes, RAG engine & OCR logic
│   └── data/             # BIS standards corpus & vector store
├── sample_labels/        # Test images for label scanner validation
├── docs/                 # Hackathon architecture and presentation decks
├── netlify.toml          # Netlify cloud deployment configuration
└── README.md             # Project documentation
```

---

## 💻 Local Development Setup

### 1. Prerequisites
- Node.js 18+ and npm
- Python 3.11+

### 2. Backend Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt

# Create .env with your Google Gemini API key:
echo "GEMINI_API_KEY=your_api_key_here" > .env

# Run FastAPI server
uvicorn app.main:app --reload --port 8000
```

### 3. Frontend Setup
```bash
cd frontend
npm install

# Configure API target in .env.local:
echo "NEXT_PUBLIC_API_URL=http://localhost:8000" > .env.local

# Run Next.js dev server
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the application.

---

## ⚖️ Disclaimer

> **Hackathon Prototype Notice:** This system is an AI-assisted decision-support prototype. It is designed to assist manufacturers and consumers in understanding compliance requirements but does NOT constitute official legal advice or official BIS certification. Always confirm compliance through authoritative [Bureau of Indian Standards (BIS)](https://www.bis.gov.in) publications.
