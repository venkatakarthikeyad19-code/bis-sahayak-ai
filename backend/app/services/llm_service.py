import os
import re
from dotenv import load_dotenv
from app.schemas.chat import ChatResponse, Recommendation, Evidence, ProductProfile, ReadinessRoadmapStep, ChecklistItem
from app.services.knowledge_base import search_bis_knowledge
from app.db.database import SessionLocal
from app.services.roadmap_service import generate_or_get_roadmap

# Simple in‑memory persistence for checklist items (demo only)
# Structure: {product_name: {item_id: status}}
CHECKLIST_STATE: dict[str, dict[str, str]] = {}

def get_checklist_state(product: str) -> dict[str, dict[str, str]]:
    """Return the checklist dict for a product, creating if needed."""
    return CHECKLIST_STATE.setdefault(product, {})

def update_checklist_item(product: str, item_id: str, status: str) -> None:
    """Update status of a checklist item for a given product."""
    get_checklist_state(product)[item_id] = status

# Load environment variables
load_dotenv()

# Google Gemini Client
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
gemini_client = None
if GEMINI_API_KEY:
    try:
        from google import genai
        gemini_client = genai.Client(api_key=GEMINI_API_KEY)
    except Exception as e:
        print(f"Could not initialize Gemini Client: {e}")

# Optional OpenAI Fallback (only initialized if explicitly configured)
OPENAI_BASE_URL = os.getenv("OPENAI_BASE_URL")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
MODEL_NAME = os.getenv("LLM_MODEL_NAME", "gpt-4o-mini")

openai_client = None
if OPENAI_API_KEY:
    try:
        from openai import OpenAI
        openai_client = OpenAI(
            base_url=OPENAI_BASE_URL if OPENAI_BASE_URL else None,
            api_key=OPENAI_API_KEY,
        )
    except Exception as e:
        print(f"Could not initialize OpenAI Client: {e}")

SYSTEM_PROMPT_TEMPLATE = """You are BIS Sahayak AI, an authoritative, helpful compliance assistant for the Bureau of Indian Standards (BIS).

Answer the user's question clearly, professionally, and authoritatively using the supplied BIS evidence.

Rules:
- Do not invent non-existent standard numbers or requirements.
- For every recommendation, explain why it applies based on the evidence.
- If asking general questions about BIS, answer clearly and informatively.
- Do not claim official legal certification; always suggest checking manakonline.in for final regulatory filings.
"""

def is_greeting_or_casual(query: str) -> bool:
    """Detects simple greetings, introductions, or casual conversation."""
    cleaned = re.sub(r"[^a-zA-Z0-9\s]", "", query).lower().strip()
    
    # Exact greeting matches
    greetings = {
        "hi", "hello", "hey", "hey hi", "hi hey", "hello there", "hey there",
        "good morning", "good afternoon", "good evening", "greetings",
        "namaste", "vanakkam", "hola", "yo", "sup",
        "how are you", "who are you", "what can you do", "what is this",
        "help", "help me", "tell me about yourself", "thanks", "thank you",
        "bye", "goodbye", "ok", "okay"
    }
    if cleaned in greetings:
        return True
    
    words = cleaned.split()
    # Short queries (<= 3 words) containing greeting keywords
    if len(words) <= 3:
        greeting_words = {"hi", "hello", "hey", "namaste", "morning", "evening", "afternoon", "help", "thanks"}
        if any(w in greeting_words for w in words):
            return True
    
    return False

def call_ai_model(prompt: str, system_prompt: str = SYSTEM_PROMPT_TEMPLATE) -> str:
    """Calls Gemini first; falls back to OpenAI if configured."""
    # 1. Try Gemini (gemini-3.6-flash with fallbacks)
    if gemini_client:
        for model_name in ['gemini-3.6-flash', 'gemini-2.5-flash', 'gemini-1.5-flash']:
            try:
                full_prompt = f"{system_prompt}\n\nUser Question:\n{prompt}"
                response = gemini_client.models.generate_content(
                    model=model_name,
                    contents=full_prompt
                )
                if response and response.text:
                    return response.text.strip()
            except Exception as e:
                print(f"Gemini generation error with {model_name}: {e}")
    
    # 2. Try OpenAI if client is available
    if openai_client:
        try:
            response = openai_client.chat.completions.create(
                model=MODEL_NAME,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": prompt}
                ],
                stream=False,
                temperature=0.3,
                max_tokens=600
            )
            if response.choices and response.choices[0].message and response.choices[0].message.content:
                return response.choices[0].message.content.strip()
        except Exception as e:
            print(f"OpenAI generation error: {e}")
    
    return None

def extract_product_term(query: str) -> str:
    """Extracts the intended product name from user natural language query."""
    patterns = [
        r"manufacture\s+(?:an?|the)?\s*([a-zA-Z0-9\s\-]+?)(?:\s+for|\s+in|\s+with|\.|\?|$)",
        r"make\s+(?:an?|the)?\s*([a-zA-Z0-9\s\-]+?)(?:\s+for|\s+in|\s+with|\.|\?|$)",
        r"produce\s+(?:an?|the)?\s*([a-zA-Z0-9\s\-]+?)(?:\s+for|\s+in|\s+with|\.|\?|$)",
        r"standards?\s+(?:for|on|of)\s+(?:an?|the)?\s*([a-zA-Z0-9\s\-]+?)(?:\.|\?|$)",
        r"requirements?\s+(?:for|on|of)\s+(?:an?|the)?\s*([a-zA-Z0-9\s\-]+?)(?:\.|\?|$)",
        r"bis\s+(?:for|on)\s+(?:an?|the)?\s*([a-zA-Z0-9\s\-]+?)(?:\.|\?|$)"
    ]
    for pattern in patterns:
        match = re.search(pattern, query, re.IGNORECASE)
        if match:
            term = match.group(1).strip()
            if len(term) > 2 and term.lower() not in ["it", "this", "something", "product"]:
                return term.title()
    cleaned = re.sub(r"[^\w\s]", "", query).strip()
    return cleaned.title() if cleaned else "Unspecified Product"

async def generate_bis_assistant_response(query: str) -> ChatResponse:
    """
    Intelligent Conversational RAG Pipeline:
    1. Fast Greeting / Casual chat detection (Instant response)
    2. Search BIS Knowledge Base
    3. If found: Return Grounded Standards + Evidence + Checklists + Roadmaps
    4. If not found in local DB: Use AI Conversation (Gemini 3.6) to assist naturally
    """
    
    # -------------------------------------------------------------
    # CASE 1: INSTANT GREETING & CASUAL CONVERSATION
    # -------------------------------------------------------------
    if is_greeting_or_casual(query):
        greeting_text = (
            "Hello! 👋 I am **BIS Sahayak AI**, your intelligent compliance and standards assistant for the Bureau of Indian Standards.\n\n"
            "Here is how I can help you today:\n"
            "* 🔍 **Discover Mandatory Standards:** Ask about standards for *Electric Kettles*, *Laptops*, *Air Conditioners*, *Refrigerators*, *LED Lamps*, *Electric Irons*, or *Toys*.\n"
            "* 📋 **Compliance Checklists:** Get step-by-step lab testing and readiness roadmaps.\n"
            "* 📷 **Label Verification & Counterfeit Detection:** Switch to the **Scan** tab to upload a product rating label to verify authentic IS/R-numbers.\n\n"
            "**What product would you like to certify, manufacture, or verify today?**"
        )
        return ChatResponse(
            answer=greeting_text,
            potential_standards=[],
            evidence=[],
            readiness_roadmap=[],
            checklist=[],
            bis_services=[],
            warnings=[],
            sources=["Bureau of Indian Standards Portal (www.bis.gov.in)"]
        )
    
    # -------------------------------------------------------------
    # CASE 2: SEARCH LOCAL BIS KNOWLEDGE BASE
    # -------------------------------------------------------------
    kb_entry, relevance_score = search_bis_knowledge(query)
    
    # -------------------------------------------------------------
    # CASE 3: MATCHED LOCAL BIS STANDARD
    # -------------------------------------------------------------
    if kb_entry:
        evidence_text = f"""Product: {kb_entry['product_name']}
Category: {kb_entry['category']}
Standard Number: {kb_entry['standard_number']}
Standard Title: {kb_entry['standard_title']}
Relevant Clauses: {kb_entry['relevant_clause']}
Official Evidence Snippet: {kb_entry['evidence_snippet']}
Mandatory Testing: {', '.join(kb_entry['testing_requirements'])}
Applicable BIS Service: {kb_entry['bis_service']['name']} ({kb_entry['bis_service']['portal']})"""
        
        prompt = f"User asked: {query}\n\nOfficial BIS Knowledge Base Record:\n{evidence_text}\n\nProvide a comprehensive, structured compliance summary for the user explaining the standard, safety clauses, testing protocol, and next steps."
        
        llm_answer = call_ai_model(prompt)
        
        # High quality grounded fallback if LLM is unavailable
        if not llm_answer:
            llm_answer = (
                f"Based on authoritative BIS records for **{kb_entry['product_name']}**, the applicable Indian Standard is **{kb_entry['standard_number']}**.\n\n"
                f"### Standard Title\n*{kb_entry['standard_title']}*\n\n"
                f"### Why this Standard Applies:\nThe product is classified under **{kb_entry['category']}** for **{kb_entry['intended_use']}**. Under Quality Control Orders (QCO), compliance with {kb_entry['standard_number']} is mandatory to ensure consumer safety.\n\n"
                f"### Supporting Evidence & Key Clauses:\n> \"{kb_entry['evidence_snippet']}\"\n\n"
                f"### Mandatory Laboratory Testing Requirements:\n- " + "\n- ".join(kb_entry['testing_requirements']) + "\n\n"
                f"### Certification Scheme:\nAdministered under **{kb_entry['bis_service']['name']}** via [{kb_entry['bis_service']['portal']}](https://{kb_entry['bis_service']['portal']})."
            )
        
        product_profile = ProductProfile(
            product=kb_entry["product_name"],
            category=kb_entry["category"],
            intended_use=kb_entry["intended_use"],
            material=kb_entry["material"],
            market="India (BIS Jurisdiction)"
        )
        
        potential_standards = [
            Recommendation(
                standard_number=kb_entry["standard_number"],
                title=kb_entry["standard_title"],
                relevance="High" if relevance_score >= 0.85 else "Medium",
                why=f"Covers construction, performance, and electrical/mechanical safety for {kb_entry['product_name']}.",
                evidence_id=1
            )
        ]
        
        evidence_items = [
            Evidence(
                standard_number=kb_entry["standard_number"],
                title=kb_entry["standard_title"],
                section=kb_entry["relevant_clause"],
                snippet=kb_entry["evidence_snippet"],
                source_url="https://www.bis.gov.in",
                relevance_score=relevance_score
            )
        ]
        
        db = SessionLocal()
        try:
            db_roadmap = generate_or_get_roadmap(db, kb_entry["product_name"])
            readiness_roadmap = [
                ReadinessRoadmapStep(
                    id=s.id,
                    step_number=s.step_number,
                    title=s.title,
                    status=s.status,
                    description=s.description,
                    reason=s.reason,
                    requirements=s.requirements,
                    standard_reference=s.standard_reference,
                    completed_at=s.completed_at.isoformat() if s.completed_at else None
                )
                for s in db_roadmap.steps
            ]
        except Exception as e:
            print(f"Error fetching DB roadmap in chat: {e}")
            readiness_roadmap = [
                ReadinessRoadmapStep(id=1, step_number=1, title="Define Product Scope & Specs", status="completed", description=f"Identified as {kb_entry['product_name']} under {kb_entry['category']}."),
                ReadinessRoadmapStep(id=2, step_number=2, title="Identify Applicable Standard", status="completed", description=f"Matched standard: {kb_entry['standard_number']}."),
                ReadinessRoadmapStep(id=3, step_number=3, title="Safety Clause Review", status="warning", description=f"Review mandatory clauses: {kb_entry['relevant_clause']}."),
                ReadinessRoadmapStep(id=4, step_number=4, title="Laboratory Testing", status="pending", description=f"Execute required tests: {kb_entry['testing_requirements'][0]}."),
                ReadinessRoadmapStep(id=5, step_number=5, title="Portal Application", status="pending", description=f"Register on {kb_entry['bis_service']['portal']}."),
                ReadinessRoadmapStep(id=6, step_number=6, title="Official Grant of Licence", status="pending", description="Submit NABL test reports and receive BIS authorization.")
            ]
        finally:
            db.close()
        
        checklist_items = [
            ChecklistItem(id=item["id"], task=item["task"], status=item["status"]) for item in kb_entry["checklist"]
        ]
        
        return ChatResponse(
            answer=llm_answer,
            product_profile=product_profile,
            potential_standards=potential_standards,
            evidence=evidence_items,
            readiness_roadmap=readiness_roadmap,
            checklist=checklist_items,
            bis_services=[kb_entry["bis_service"]],
            warnings=[
                "AI-assisted guidance grounded on authoritative BIS standards.",
                "Does not replace formal regulatory grant by the Bureau of Indian Standards."
            ],
            sources=["Bureau of Indian Standards (www.bis.gov.in)", f"Portal: {kb_entry['bis_service']['portal']}"]
        )
    
    # -------------------------------------------------------------
    # CASE 4: GENERAL QUERY / UNINDEXED PRODUCT (AI Conversation via Gemini)
    # -------------------------------------------------------------
    detected_product = extract_product_term(query)
    
    general_ai_prompt = f"""User Query: \"{query}\"\n\nYou are BIS Sahayak AI.\nProvide an informative, highly useful response answering the user's question about standards, compliance, or regulations in India.\nIf they are inquiring about a specific physical product (e.g. \"{detected_product}\"):\n- Mention what general Indian Standard or technical committee (e.g., Electronics, Electrical, Mechanical, Food) might apply if you know it.\n- Explicitly explain that this specific product is not yet cached in the local offline fast-index.\n- Advise them to verify the exact Quality Control Order (QCO) via the official portal at https://services.bis.gov.in or https://manakonline.in.\n- Keep the tone helpful, professional, and compliant."""
    
    ai_answer = call_ai_model(general_ai_prompt)
    if not ai_answer:
        ai_answer = (
            f"### Query: **{detected_product}**\n\n"
            f"A direct match for **\"{detected_product}\"** is not currently in our local fast-cache knowledge base.\n\n"
            "**Recommended Steps:**\n"
            "1. **Search Manakonline:** Visit https://services.bis.gov.in to search Indian Standards by product keyword or HS Code.\n"
            "2. **Check Quality Control Orders (QCO):** Check the relevant Ministry notifications to verify if certification is mandatory before manufacturing or importing.\n"
            "3. **Contact BIS Enquiry:** Submit an online inquiry through the https://manakonline.in portal."
        )
    
    db = SessionLocal()
    try:
        db_roadmap = generate_or_get_roadmap(db, detected_product)
        gen_roadmap = [
            ReadinessRoadmapStep(
                id=s.id,
                step_number=s.step_number,
                title=s.title,
                status=s.status,
                description=s.description,
                reason=s.reason,
                requirements=s.requirements,
                standard_reference=s.standard_reference,
                completed_at=s.completed_at.isoformat() if s.completed_at else None
            )
            for s in db_roadmap.steps
        ]
    except Exception as e:
        print(f"Error fetching DB roadmap for general query: {e}")
        gen_roadmap = [
            ReadinessRoadmapStep(id=1, step_number=1, title="Identify Product Scope", status="completed", description=f"Query: {detected_product}."),
            ReadinessRoadmapStep(id=2, step_number=2, title="Official Standards Search", status="warning", description="Search www.services.bis.gov.in for sectional committee classification."),
            ReadinessRoadmapStep(id=3, step_number=3, title="Confirm Regulatory Mandate", status="pending", description="Verify mandatory QCO applicability."),
            ReadinessRoadmapStep(id=4, step_number=4, title="Consult Recognized Laboratory", status="pending", description="Engage NABL/BIS accredited test lab.")
        ]
    finally:
        db.close()

    return ChatResponse(
        answer=ai_answer,
        product_profile=ProductProfile(
            product=detected_product,
            category="General Inquiry / Pending Verification",
            intended_use="Standard Compliance",
            market="India (BIS Jurisdiction)"
        ),
        potential_standards=[],
        evidence=[],
        readiness_roadmap=gen_roadmap,
        checklist=[
            ChecklistItem(id="u1", task=f"Confirm detailed technical datasheet for {detected_product}", status="completed"),
            ChecklistItem(id="u2", task="Search BIS Standards portal using exact HS Code", status="pending"),
            ChecklistItem(id="u3", task="Submit query to BIS enquiry cell via Manakonline", status="pending")
        ],
        bis_services=[
            {
                "name": "Know Your Standards Portal",
                "type": "Official Search Facility",
                "portal": "services.bis.gov.in",
                "description": "Public search engine for all published and draft Indian Standards."
            }
        ],
        warnings=["Information generated via AI conversational assistant — verify through official BIS sources (manakonline.in)."],
        sources=["Bureau of Indian Standards Official Portal (www.bis.gov.in)"]
    )
