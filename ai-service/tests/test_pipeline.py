from app.pipeline import InferencePipeline

def test_routes_road_complaint():
    result = InferencePipeline().analyze('Large pothole', 'A large pothole is blocking the road near the school.', None, 'medium', [], 'en')
    assert result['predicted_department'] == 'public-works'
    assert result['predicted_category'] == 'Roads & Footpaths'

def test_unknown_complaint_requires_review():
    result = InferencePipeline().analyze('Need help', 'This issue does not mention a known service area.', None, 'medium', [], 'en')
    assert result['review_required'] is True
