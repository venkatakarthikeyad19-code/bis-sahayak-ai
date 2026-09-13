from pydantic import BaseModel
from typing import List, Optional, Any, Dict

class ChatMessage(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    query: str
    history: List[ChatMessage] = []

class Evidence(BaseModel):
    standard_number: str
    title: str
    section: Optional[str] = None
    snippet: str
    source_url: Optional[str] = None
    relevance_score: float = 0.0

class Recommendation(BaseModel):
    standard_number: str
    title: str
    relevance: str = "High" # High, Medium, Low
    why: str
    evidence_id: int = 1

class ProductProfile(BaseModel):
    product: str
    intended_use: Optional[str] = None
    category: Optional[str] = None
    material: Optional[str] = None
    capacity: Optional[str] = None
    market: str = "India"
    attributes: Dict[str, Any] = {}

class ChecklistItem(BaseModel):
    id: str
    task: str
    status: str = "pending"

class ReadinessRoadmapStep(BaseModel):
    id: int
    title: str
    status: str = "pending" # completed, warning, pending, in_progress, blocked
    description: str
    step_number: Optional[int] = None
    reason: Optional[str] = None
    requirements: Optional[str] = None
    standard_reference: Optional[str] = None
    completed_at: Optional[Any] = None

class ChatResponse(BaseModel):
    answer: str
    product_profile: Optional[ProductProfile] = None
    potential_standards: List[Recommendation] = []
    evidence: List[Evidence] = []
    readiness_roadmap: List[ReadinessRoadmapStep] = []
    checklist: List[ChecklistItem] = []
    bis_services: List[Dict[str, Any]] = []
    warnings: List[str] = []
    sources: List[str] = []
