import logging
import os
import re
from dataclasses import dataclass
from typing import Iterable

import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

logger = logging.getLogger(__name__)

TAXONOMY = {
    'public-works': ('Public Works', {'road': 'Roads & Footpaths', 'pothole': 'Roads & Footpaths', 'footpath': 'Roads & Footpaths', 'street light': 'Street Lighting', 'drain': 'Drainage & Flooding', 'flood': 'Drainage & Flooding'}),
    'water': ('Water Supply', {'water': 'Water Leakage', 'leak': 'Water Leakage', 'pipe': 'Water Leakage', 'quality': 'Water Quality', 'connection': 'New Connection'}),
    'sanitation': ('Sanitation & Waste', {'garbage': 'Garbage Collection', 'waste': 'Garbage Collection', 'dump': 'Illegal Dumping', 'toilet': 'Public Toilets', 'litter': 'Garbage Collection'}),
    'electricity': ('Electricity', {'power': 'Power Outage', 'electric': 'Unsafe Wiring', 'wire': 'Unsafe Wiring', 'meter': 'Metering', 'outage': 'Power Outage'}),
    'transport': ('Transport', {'bus': 'Public Transit', 'traffic': 'Traffic Signals', 'signal': 'Traffic Signals', 'parking': 'Parking'}),
    'health': ('Public Health', {'hospital': 'Clinics & Hospitals', 'clinic': 'Clinics & Hospitals', 'mosquito': 'Mosquito Control', 'food': 'Food Safety'}),
}

@dataclass
class Prediction:
    department: str
    category: str
    score: float
    matched_terms: list[str]

class InferencePipeline:
    def __init__(self):
        self.threshold = float(os.getenv('AI_LOW_CONFIDENCE_THRESHOLD', '0.62'))
        self.duplicate_threshold = float(os.getenv('AI_DUPLICATE_THRESHOLD', '0.82'))
        self.model_version = os.getenv('AI_MODEL_VERSION', 'rules-v1')
        self.encoder = None
        try:
            if os.getenv('AI_ENABLE_TRANSFORMER', 'false').lower() != 'true':
                raise RuntimeError('transformer loading disabled for this environment')
            from sentence_transformers import SentenceTransformer
            self.encoder = SentenceTransformer(os.getenv('AI_MODEL_NAME', 'sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2'))
            self.model_version = os.getenv('AI_MODEL_VERSION', 'sentence-transformers-multilingual')
        except Exception as error:
            logger.warning('Transformer unavailable; using deterministic fallback: %s', error)

    def predict(self, title: str, description: str, requested_category: str | None = None) -> Prediction:
        text = f'{title} {description}'.lower()
        scores = []
        for department, (_label, terms) in TAXONOMY.items():
            matched = [term for term in terms if term in text]
            scores.append((len(matched), department, matched))
        matches, department, terms = max(scores, key=lambda item: item[0])
        if not matches:
            return Prediction('other', requested_category or 'Other', 0.28, [])
        category = requested_category or TAXONOMY[department][1][terms[0]]
        score = min(0.96, 0.55 + matches * 0.12)
        return Prediction(department, category, score, terms)

    def duplicate_score(self, text: str, recent: Iterable[dict]) -> tuple[float, dict | None]:
        items = list(recent)
        if not items: return 0.0, None
        corpus = [text] + [f"{item.get('title','')} {item.get('description','')}" for item in items]
        if self.encoder is not None:
            vectors = self.encoder.encode(corpus, normalize_embeddings=True)
            scores = np.asarray(vectors[1:]) @ np.asarray(vectors[0])
        else:
            vectors = TfidfVectorizer(stop_words='english').fit_transform(corpus)
            scores = cosine_similarity(vectors[0:1], vectors[1:]).ravel()
        index = int(scores.argmax())
        return float(max(0, scores[index])), items[index]

    def analyze(self, title: str, description: str, category: str | None, urgency: str, recent: list[dict], language: str) -> dict:
        prediction = self.predict(title, description, category)
        duplicate, match = self.duplicate_score(f'{title} {description}', recent)
        priority = urgency
        text = f'{title} {description}'.lower()
        if any(term in text for term in ('dangerous', 'injury', 'fire', 'collapse', 'emergency')): priority = 'critical'
        elif priority == 'low' and duplicate >= self.duplicate_threshold: priority = 'medium'
        keywords = list(dict.fromkeys(prediction.matched_terms + re.findall(r'\b[a-zA-Z]{5,}\b', text)))[:8]
        summary = re.sub(r'\s+', ' ', description).strip()[:240]
        review = prediction.score < self.threshold
        explanation = f"Matched {', '.join(prediction.matched_terms) or 'no department-specific terms'}; language={language}."
        if match and duplicate >= self.duplicate_threshold: explanation += f" Similar to {match.get('id', 'an existing complaint')} ({duplicate:.2f})."
        return {'predicted_department': prediction.department, 'predicted_category': prediction.category, 'confidence_score': round(prediction.score, 4), 'duplicate_score': round(duplicate, 4), 'priority_level': priority, 'keywords': keywords, 'summary': summary, 'review_required': review, 'explanation': explanation, 'model_version': self.model_version}
