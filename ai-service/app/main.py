import logging
from fastapi import FastAPI, HTTPException
from .pipeline import InferencePipeline
from .schemas import AnalysisRequest, AnalysisResponse, FeedbackRequest

logging.basicConfig(level=logging.INFO)
app = FastAPI(title='Grievance AI Service', version='1.0.0')
pipeline = InferencePipeline()
feedback_log: list[dict] = []

@app.get('/health')
def health(): return {'status': 'ok', 'model_version': pipeline.model_version}

@app.post('/v1/analyze', response_model=AnalysisResponse)
def analyze(request: AnalysisRequest):
    return pipeline.analyze(request.title, request.description, request.category, request.urgency, [item.model_dump() for item in request.recent_complaints], request.language)

@app.post('/v1/feedback')
def feedback(request: FeedbackRequest):
    feedback_log.append(request.model_dump())
    return {'accepted': True, 'queued_for_training': True, 'feedback_count': len(feedback_log)}

@app.get('/v1/feedback/metrics')
def feedback_metrics():
    total = len(feedback_log)
    accepted = sum(1 for item in feedback_log if item['accepted'])
    return {'total': total, 'accepted': accepted, 'acceptance_rate': accepted / total if total else 0}
