# BIS Sahayak AI 🛡️

**Smart India Hackathon (SIH26107) Prototype**

An AI-powered Intelligent Assistant for Indian Standards and BIS Services.
BIS Sahayak AI acts as a decision-support platform to help manufacturers and consumers seamlessly navigate the complexities of BIS compliances, discover relevant standards, and build a readiness roadmap based on authoritative knowledge.

## Features
- **Intelligent Standards Discovery:** Semantic matching between a product description and BIS standards.
- **Explainable Recommendations:** See exactly *why* an Indian Standard applies.
- **Verifiable Evidence:** Trace recommendations back to source documents.
- **Readiness Roadmap:** Step-by-step guidance from product idea to verification.
- **Smart Checklists:** Interactive compliance tracking.
- **Live Demo Mode:** Quick one-click scenarios (Electric Kettle, etc.) for judging.

## Tech Stack
- **Frontend:** Next.js (React), Tailwind CSS, Lucide Icons
- **Backend:** FastAPI (Python)
- **AI / Embeddings:** Gemini API (Google)
- **Vector DB:** ChromaDB
- **Deployment:** Docker & Docker Compose

## Quick Start (Docker)

1. Clone the repository.
2. Provide your API keys in the environment file:
   ```bash
   cp backend/.env.example backend/.env
   # Add your GEMINI_API_KEY to backend/.env
   ```
3. Run with Docker Compose:
   ```bash
   docker-compose up --build
   ```
4. Access the web interface at `http://localhost:3000`

## Project Structure
- `/frontend`: Next.js web application.
- `/backend`: FastAPI service handling RAG, embeddings, and chat logic.

## Disclaimer
> **This is a hackathon prototype.** It uses sample data explicitly marked as `DEMO DATA`. This system provides AI-assisted guidance and does NOT provide official BIS certification or legal compliance guarantees. Always verify requirements through official BIS channels.
