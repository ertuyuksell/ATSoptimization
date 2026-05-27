from typing import Any, Dict, List, Optional

from pydantic import BaseModel, Field


class TopRole(BaseModel):
    role: str
    probability: float


class JobMatch(BaseModel):
    similarity: Optional[float] = None
    matched_keywords: List[str] = Field(default_factory=list)
    missing_keywords: List[str] = Field(default_factory=list)


class AnalysisResponse(BaseModel):
    predicted_role: str
    confidence: float
    top_role_candidates: List[TopRole]
    ats_score: int
    ats_components: Dict[str, int]
    skills: List[str]
    skill_count: int
    sections_detected: Dict[str, bool]
    quality_signals: Dict[str, Any]
    recruiter_simulation: Dict[str, Any]
    job_match: Optional[JobMatch] = None
    page_count: int
    char_count: int


class HealthResponse(BaseModel):
    status: str
    model_loaded: bool
    version: str
