import datetime
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.db.database import Base

class Roadmap(Base):
    __tablename__ = "roadmaps"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(String(100), default="default_user", index=True)
    product = Column(String(200), nullable=False, index=True)
    standard = Column(String(100), nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    steps = relationship(
        "RoadmapStep",
        back_populates="roadmap",
        cascade="all, delete-orphan",
        order_by="RoadmapStep.step_number"
    )

class RoadmapStep(Base):
    __tablename__ = "roadmap_steps"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    roadmap_id = Column(Integer, ForeignKey("roadmaps.id"), nullable=False, index=True)
    step_number = Column(Integer, nullable=False)
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=False)
    status = Column(String(50), default="pending")  # pending, in_progress, completed, warning, blocked
    reason = Column(Text, nullable=True)
    requirements = Column(Text, nullable=True)
    standard_reference = Column(String(100), nullable=True)
    completed_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    roadmap = relationship("Roadmap", back_populates="steps")
