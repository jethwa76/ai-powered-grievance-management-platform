from typing import Any, Literal
from pydantic import BaseModel, Field

class RecentComplaint(BaseModel):
    id: str | None = None
    title: str = ''
    description: str = ''
    category: str | None = None

class AnalysisRequest(BaseModel):
    title: str = Field(min_length=3, max_length=160)
    description: str = Field(min_length=10, max_length=10000)
    category: str | None = None
    urgency: Literal['low', 'medium', 'high', 'critical'] = 'medium'
    language: str = 'en'
    recent_complaints: list[RecentComplaint] = []

class AnalysisResponse(BaseModel):
    predicted_department: str
    predicted_category: str
    confidence_score: float = Field(ge=0, le=1)
    duplicate_score: float = Field(ge=0, le=1)
    priority_level: Literal['low', 'medium', 'high', 'critical']
    keywords: list[str]
    summary: str
    review_required: bool
    explanation: str
    model_version: str

class FeedbackRequest(BaseModel):
    complaint_id: str
    predicted_department: str
    actual_department: str
    predicted_category: str | None = None
    actual_category: str | None = None
    accepted: bool
    notes: str | None = None
