from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.schemas.roadmap import RoadmapResponse, RoadmapStepBase, RoadmapStepUpdate, RoadmapEvaluateRequest
from app.services.roadmap_service import (
    generate_or_get_roadmap,
    update_roadmap_step,
    evaluate_and_regenerate_roadmap,
    get_latest_roadmap
)

router = APIRouter()

@router.get("/", response_model=RoadmapResponse)
def get_roadmap(
    product: Optional[str] = Query(None, description="Optional product name to get or generate roadmap for"),
    db: Session = Depends(get_db)
):
    """
    Returns the active compliance roadmap for the given product or the latest session roadmap.
    Data is stored and retrieved from the backend database as the source of truth.
    """
    try:
        if product and product.strip():
            roadmap = generate_or_get_roadmap(db, product.strip())
        else:
            roadmap = get_latest_roadmap(db)
        return roadmap
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.patch("/{step_id}", response_model=RoadmapStepBase)
def update_step_status(
    step_id: int,
    payload: RoadmapStepUpdate,
    db: Session = Depends(get_db)
):
    """
    Updates the progress of a specific compliance roadmap step.
    Enforces prerequisite step dependencies.
    """
    return update_roadmap_step(db, step_id, payload.status, payload.reason)

@router.post("/evaluate", response_model=RoadmapResponse)
def evaluate_roadmap(
    payload: RoadmapEvaluateRequest,
    db: Session = Depends(get_db)
):
    """
    Re-evaluates compliance for a product using updated BIS Knowledge Base and Gemini AI,
    while preserving previously completed user progress.
    """
    try:
        return evaluate_and_regenerate_roadmap(db, payload.product, payload.standard)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Unable to re-evaluate compliance: {str(e)}")
