import datetime
from typing import Optional, List
from pydantic import BaseModel

class RoadmapStepBase(BaseModel):
    id: Optional[int] = None
    step_number: int
    title: str
    description: str
    status: str  # pending, in_progress, completed, warning, blocked
    reason: Optional[str] = None
    requirements: Optional[str] = None
    standard_reference: Optional[str] = None
    completed_at: Optional[datetime.datetime] = None

    class Config:
        from_attributes = True

class RoadmapStepUpdate(BaseModel):
    status: str
    reason: Optional[str] = None

class RoadmapResponse(BaseModel):
    id: int
    user_id: str
    product: str
    standard: Optional[str] = None
    created_at: Optional[datetime.datetime] = None
    updated_at: Optional[datetime.datetime] = None
    steps: List[RoadmapStepBase] = []

    class Config:
        from_attributes = True

class RoadmapEvaluateRequest(BaseModel):
    product: str
    standard: Optional[str] = None
