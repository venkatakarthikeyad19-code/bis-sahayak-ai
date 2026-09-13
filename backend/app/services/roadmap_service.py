import os
import json
import re
import datetime
from typing import Optional, List, Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy import or_
from fastapi import HTTPException

from app.db.database import SessionLocal
from app.models.roadmap import Roadmap, RoadmapStep
from app.services.knowledge_base import search_bis_knowledge, BIS_STANDARDS_KNOWLEDGE

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
gemini_client = None
if GEMINI_API_KEY:
    try:
        from google import genai
        gemini_client = genai.Client(api_key=GEMINI_API_KEY)
    except Exception as e:
        print(f"RoadmapService: Could not initialize Gemini Client: {e}")

DEFAULT_STANDARD_MAP = {
    "laptop": {
        "product": "Laptop / Notebook Computer",
        "standard": "IS 13252 (Part 1) : 2010",
        "warning_reason": "Internal rechargeable Lithium-ion battery requires mandatory secondary certification under IS 16046 (Part 2) before system-level submission.",
        "testing_requirement": "Electric strength, earth leakage current, and thermal rise under Clause 4.5"
    },
    "kettle": {
        "product": "Electric Kettle",
        "standard": "IS 302 (Part 2/Sec 15) : 2009",
        "warning_reason": "Automatic cut-out mechanism required under Clause 19.101 for boil-dry protection with food-grade plastic certification.",
        "testing_requirement": "Boiling-dry abnormal operation and insulation resistance under Clause 13 & 19"
    },
    "pressure_cooker": {
        "product": "Domestic Pressure Cooker",
        "standard": "IS 2347 : 2017",
        "warning_reason": "Hydrostatic proof pressure at 200 kPa and fusible safety release plug must be certified under DPIIT mandatory QCO.",
        "testing_requirement": "Hydrostatic proof pressure test and safety relief valve bursting test"
    },
    "led_bulb": {
        "product": "Self-Ballasted LED Lamp",
        "standard": "IS 16102 (Part 1) : 2012",
        "warning_reason": "Insulation resistance must remain above 4 MΩ after 48-hour humidity chamber treatment.",
        "testing_requirement": "Surge protection test and 2,000-hour lumen maintenance verification"
    }
}

def generate_default_roadmap_steps(product: str, standard: str, kb_entry: Optional[Dict[str, Any]] = None) -> List[Dict[str, Any]]:
    """
    Constructs the authoritative 6-stage compliance roadmap grounded in BIS knowledge.
    """
    warning_reason = "Mandatory safety clause verification required before lab testing sample dispatch."
    standard_ref = standard or "BIS Standard"
    test_req = "Safety and endurance testing at a BIS-recognized / NABL accredited laboratory."

    # Look up specific warning reason if known in knowledge base
    if kb_entry:
        standard_ref = kb_entry.get("standard_number", standard)
        relevant_clause = kb_entry.get("relevant_clause", "")
        test_reqs = kb_entry.get("testing_requirements", [])
        test_req = test_reqs[0] if test_reqs else test_req
        warning_reason = f"Mandatory compliance check: {relevant_clause}."
    else:
        # Check lookup map
        lower_p = product.lower()
        for k, v in DEFAULT_STANDARD_MAP.items():
            if k in lower_p or lower_p in k:
                standard_ref = v["standard"]
                warning_reason = v["warning_reason"]
                test_req = v["testing_requirement"]
                break

    return [
        {
            "step_number": 1,
            "title": "Define Product Scope & Specs",
            "description": f"Identify technical classification, intended use, and components for {product}.",
            "status": "completed",
            "reason": None,
            "requirements": "Product datasheet, BOM (Bill of Materials), user manual",
            "standard_reference": standard_ref,
            "completed_at": datetime.datetime.utcnow()
        },
        {
            "step_number": 2,
            "title": "Identify Applicable Standard",
            "description": f"Matched applicable mandatory Indian Standard: {standard_ref}.",
            "status": "completed",
            "reason": None,
            "requirements": "Quality Control Order (QCO) Gazette Notification Review",
            "standard_reference": standard_ref,
            "completed_at": datetime.datetime.utcnow()
        },
        {
            "step_number": 3,
            "title": "Safety Clause Review",
            "description": f"Review critical safety and construction clauses under {standard_ref}.",
            "status": "warning",
            "reason": warning_reason,
            "requirements": "Pre-compliance review of protective impedance and flame resistance",
            "standard_reference": standard_ref,
            "completed_at": None
        },
        {
            "step_number": 4,
            "title": "Laboratory Testing",
            "description": f"Execute required tests: {test_req}.",
            "status": "pending",
            "reason": "Testing reports must be issued by a BIS-recognized / NABL accredited laboratory.",
            "requirements": "3 production test samples submitted to accredited lab",
            "standard_reference": standard_ref,
            "completed_at": None
        },
        {
            "step_number": 5,
            "title": "Portal Application",
            "description": "Submit formal licence application with valid test reports on official BIS portal.",
            "status": "pending",
            "reason": "Requires valid NABL test report and factory quality control documents.",
            "requirements": "Online application, factory premises layout, test certificates",
            "standard_reference": standard_ref,
            "completed_at": None
        },
        {
            "step_number": 6,
            "title": "Official Grant of Licence",
            "description": "Complete BIS technical scrutiny / inspection audit to receive authorization mark.",
            "status": "pending",
            "reason": "Prerequisite steps must be approved by BIS competent authority.",
            "requirements": "Final scrutiny clearance and payment of marking fees",
            "standard_reference": standard_ref,
            "completed_at": None
        }
    ]

def call_gemini_for_roadmap(product: str, standard: str, evidence_context: str) -> Optional[List[Dict[str, Any]]]:
    """
    Queries Gemini for structured roadmap steps, validating output structure.
    Does NOT expose keys to frontend.
    """
    if not gemini_client:
        return None

    prompt = f"""You are BIS Sahayak AI's regulatory decision engine.
Analyze the compliance pathway for:
Product: {product}
Standard: {standard}
Evidence Context: {evidence_context}

Generate a sequential, 6-stage compliance roadmap from product scope definition to official grant of BIS licence.
The 6 stages MUST be:
1. Define Product Scope & Specs (status: completed)
2. Identify Applicable Standard (status: completed)
3. Safety Clause Review (status: warning if special safety clauses/batteries apply, else completed or in_progress)
4. Laboratory Testing (status: pending)
5. Portal Application (status: pending)
6. Official Grant of Licence (status: pending)

Return ONLY a valid JSON object matching this schema without markdown fences:
{{
  "product": "{product}",
  "standard": "{standard}",
  "roadmap": [
    {{
      "id": 1,
      "title": "Define Product Scope & Specs",
      "description": "Short explanation",
      "status": "completed",
      "reason": ""
    }},
    {{
      "id": 2,
      "title": "Identify Applicable Standard",
      "description": "Short explanation",
      "status": "completed",
      "reason": ""
    }},
    {{
      "id": 3,
      "title": "Safety Clause Review",
      "description": "Short explanation",
      "status": "warning",
      "reason": "Specific safety clause reason",
      "standard_reference": "{standard}"
    }},
    {{
      "id": 4,
      "title": "Laboratory Testing",
      "description": "Short explanation",
      "status": "pending",
      "reason": ""
    }},
    {{
      "id": 5,
      "title": "Portal Application",
      "description": "Short explanation",
      "status": "pending",
      "reason": ""
    }},
    {{
      "id": 6,
      "title": "Official Grant of Licence",
      "description": "Short explanation",
      "status": "pending",
      "reason": ""
    }}
  ]
}}"""

    for model_name in ['gemini-3.6-flash', 'gemini-2.5-flash', 'gemini-1.5-flash']:
        try:
            res = gemini_client.models.generate_content(
                model=model_name,
                contents=prompt
            )
            if res and res.text:
                cleaned = res.text.strip()
                if cleaned.startswith("```json"):
                    cleaned = cleaned[7:]
                if cleaned.startswith("```"):
                    cleaned = cleaned[3:]
                if cleaned.endswith("```"):
                    cleaned = cleaned[:-3]
                data = json.loads(cleaned.strip())
                if "roadmap" in data and isinstance(data["roadmap"], list) and len(data["roadmap"]) >= 4:
                    formatted_steps = []
                    for idx, s in enumerate(data["roadmap"], start=1):
                        formatted_steps.append({
                            "step_number": idx,
                            "title": s.get("title", f"Stage {idx}"),
                            "description": s.get("description", ""),
                            "status": s.get("status", "pending"),
                            "reason": s.get("reason", None) or None,
                            "requirements": s.get("requirements", None),
                            "standard_reference": s.get("standard_reference", standard),
                            "completed_at": datetime.datetime.utcnow() if s.get("status") == "completed" else None
                        })
                    return formatted_steps
        except Exception as e:
            print(f"Gemini roadmap generation error with {model_name}: {e}")

    return None

def generate_or_get_roadmap(db: Session, product: str, user_id: str = "default_user") -> Roadmap:
    """
    Retrieves or generates the persistent roadmap for a given product.
    """
    clean_product = product.strip()
    kb_entry, _ = search_bis_knowledge(clean_product)
    canonical_product = kb_entry["product_name"] if kb_entry else clean_product

    # Case-insensitive lookup in DB
    existing = db.query(Roadmap).filter(
        Roadmap.user_id == user_id,
        or_(
            Roadmap.product.ilike(f"%{clean_product}%"),
            Roadmap.product.ilike(f"%{canonical_product}%")
        )
    ).first()

    if existing and existing.steps:
        return existing

    # Find authoritative BIS knowledge for product
    standard_name = kb_entry["standard_number"] if kb_entry else "IS 13252"

    # Attempt Gemini generation with fallback
    steps_data = None
    if kb_entry:
        context = f"Clauses: {kb_entry.get('relevant_clause')}; Tests: {kb_entry.get('testing_requirements')}"
        steps_data = call_gemini_for_roadmap(clean_product, standard_name, context)

    if not steps_data:
        steps_data = generate_default_roadmap_steps(clean_product, standard_name, kb_entry)

    # Save to database
    new_roadmap = Roadmap(
        user_id=user_id,
        product=kb_entry["product_name"] if kb_entry else clean_product,
        standard=standard_name
    )
    db.add(new_roadmap)
    db.flush()

    for s in steps_data:
        step_model = RoadmapStep(
            roadmap_id=new_roadmap.id,
            step_number=s["step_number"],
            title=s["title"],
            description=s["description"],
            status=s["status"],
            reason=s.get("reason"),
            requirements=s.get("requirements"),
            standard_reference=s.get("standard_reference"),
            completed_at=s.get("completed_at")
        )
        db.add(step_model)

    db.commit()
    db.refresh(new_roadmap)
    return new_roadmap

def update_roadmap_step(db: Session, step_id: int, new_status: str, reason: Optional[str] = None) -> RoadmapStep:
    """
    Updates a step status with logical dependency enforcement.
    """
    step = db.query(RoadmapStep).filter(RoadmapStep.id == step_id).first()
    if not step:
        raise HTTPException(status_code=404, detail="Roadmap step not found.")

    allowed_statuses = {"pending", "in_progress", "completed", "warning", "blocked"}
    if new_status not in allowed_statuses:
        raise HTTPException(status_code=400, detail=f"Invalid status '{new_status}'. Allowed: {allowed_statuses}")

    roadmap = db.query(Roadmap).filter(Roadmap.id == step.roadmap_id).first()
    all_steps = sorted(roadmap.steps, key=lambda x: x.step_number)

    # Dependency Validation when marking as completed
    if new_status == "completed":
        # Step 5 (Portal Application) requires Step 4 (Lab Testing) to be completed
        if step.step_number == 5:
            step_4 = next((s for s in all_steps if s.step_number == 4), None)
            if step_4 and step_4.status != "completed":
                raise HTTPException(
                    status_code=400,
                    detail="Complete the previous compliance requirement (Step 4: Laboratory Testing) first."
                )

        # Step 6 (Grant of Licence) requires Step 5 (Portal Application) to be completed
        if step.step_number == 6:
            step_5 = next((s for s in all_steps if s.step_number == 5), None)
            if step_5 and step_5.status != "completed":
                raise HTTPException(
                    status_code=400,
                    detail="Complete the previous compliance requirement (Step 5: Portal Application) first."
                )

        # Step 4 (Laboratory Testing) requires Step 1 and Step 2 to be completed
        if step.step_number == 4:
            step_2 = next((s for s in all_steps if s.step_number == 2), None)
            if step_2 and step_2.status != "completed":
                raise HTTPException(
                    status_code=400,
                    detail="Complete the previous compliance requirement (Step 2: Identify Applicable Standard) first."
                )

        step.completed_at = datetime.datetime.utcnow()
    else:
        step.completed_at = None

    step.status = new_status
    if reason is not None:
        step.reason = reason

    # Unblock subsequent step if it was blocked
    if new_status == "completed":
        next_step = next((s for s in all_steps if s.step_number == step.step_number + 1), None)
        if next_step and next_step.status == "blocked":
            next_step.status = "in_progress"

    db.commit()
    db.refresh(step)
    return step

def evaluate_and_regenerate_roadmap(
    db: Session,
    product: str,
    standard: Optional[str] = None,
    user_id: str = "default_user"
) -> Roadmap:
    """
    Re-evaluates compliance against updated BIS Knowledge / Gemini while preserving valid user progress.
    """
    clean_product = product.strip()
    kb_entry, _ = search_bis_knowledge(clean_product)
    canonical_product = kb_entry["product_name"] if kb_entry else clean_product
    standard_name = standard or (kb_entry["standard_number"] if kb_entry else "IS 13252")

    # Find existing roadmap to preserve completed steps
    existing = db.query(Roadmap).filter(
        Roadmap.user_id == user_id,
        or_(
            Roadmap.product.ilike(f"%{clean_product}%"),
            Roadmap.product.ilike(f"%{canonical_product}%")
        )
    ).first()

    completed_step_numbers = set()
    if existing:
        for s in existing.steps:
            if s.status == "completed":
                completed_step_numbers.add(s.step_number)

    # Generate fresh steps
    steps_data = None
    if kb_entry:
        context = f"Clauses: {kb_entry.get('relevant_clause')}; Tests: {kb_entry.get('testing_requirements')}"
        steps_data = call_gemini_for_roadmap(clean_product, standard_name, context)

    if not steps_data:
        steps_data = generate_default_roadmap_steps(clean_product, standard_name, kb_entry)

    # Preserve user-completed progress!
    for s in steps_data:
        if s["step_number"] in completed_step_numbers:
            s["status"] = "completed"
            s["completed_at"] = datetime.datetime.utcnow()

    if existing:
        # Update existing roadmap record
        existing.standard = standard_name
        existing.updated_at = datetime.datetime.utcnow()

        # Update or recreate steps
        for old_step in existing.steps:
            matching_new = next((x for x in steps_data if x["step_number"] == old_step.step_number), None)
            if matching_new:
                old_step.title = matching_new["title"]
                old_step.description = matching_new["description"]
                old_step.status = matching_new["status"]
                old_step.reason = matching_new["reason"]
                old_step.requirements = matching_new["requirements"]
                old_step.standard_reference = matching_new["standard_reference"]
                old_step.completed_at = matching_new["completed_at"]

        db.commit()
        db.refresh(existing)
        return existing
    else:
        # Create new roadmap
        new_roadmap = Roadmap(
            user_id=user_id,
            product=kb_entry["product_name"] if kb_entry else clean_product,
            standard=standard_name
        )
        db.add(new_roadmap)
        db.flush()

        for s in steps_data:
            step_model = RoadmapStep(
                roadmap_id=new_roadmap.id,
                step_number=s["step_number"],
                title=s["title"],
                description=s["description"],
                status=s["status"],
                reason=s.get("reason"),
                requirements=s.get("requirements"),
                standard_reference=s.get("standard_reference"),
                completed_at=s.get("completed_at")
            )
            db.add(step_model)

        db.commit()
        db.refresh(new_roadmap)
        return new_roadmap

def get_latest_roadmap(db: Session, user_id: str = "default_user") -> Roadmap:
    """
    Returns the most recently active roadmap, or generates the default Laptop roadmap.
    """
    latest = db.query(Roadmap).filter(Roadmap.user_id == user_id).order_by(Roadmap.updated_at.desc()).first()
    if latest and latest.steps:
        return latest

    # Default to Laptop / Notebook Computer
    return generate_or_get_roadmap(db, "Laptop / Notebook Computer", user_id)
