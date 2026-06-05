import logging
from flask import Blueprint, request, jsonify
from routes.generate import require_auth
from services.firestore_service import add_feedback

feedback_bp = Blueprint('feedback', __name__)

@feedback_bp.route('/feedback', methods=['POST'])
@require_auth
def submit_feedback():
    data = request.get_json() or {}
    history_id = data.get('historyId')
    rating = data.get('rating')
    comment = data.get('comment', '')
    
    if not history_id:
        return jsonify({'error': 'Missing historyId parameter.'}), 400
        
    if rating is None or not isinstance(rating, (int, float)) or not (1 <= rating <= 5):
        return jsonify({'error': 'Rating must be a number between 1 and 5.'}), 400
        
    try:
        success = add_feedback(
            history_id=history_id,
            rating=rating,
            comment=comment
        )
        if success:
            return jsonify({'message': 'Feedback and rating logged successfully.'}), 200
        else:
            return jsonify({'error': 'Failed to save feedback. Ensure the historyId exists.'}), 500
    except Exception as e:
        logging.error(f"Error saving feedback: {e}")
        return jsonify({'error': 'An internal error occurred while saving feedback.'}), 500
