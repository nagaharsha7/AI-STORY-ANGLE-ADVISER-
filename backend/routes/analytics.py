import logging
from flask import Blueprint, jsonify
from routes.generate import require_auth
from services.firestore_service import get_analytics

analytics_bp = Blueprint('analytics', __name__)

@analytics_bp.route('/analytics', methods=['GET'])
@require_auth
def fetch_analytics():
    try:
        data = get_analytics()
        return jsonify(data), 200
    except Exception as e:
        logging.error(f"Error serving analytics: {e}")
        return jsonify({'error': 'Failed to compile newsroom metrics.'}), 500
