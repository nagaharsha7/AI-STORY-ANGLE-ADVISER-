import logging
from flask import Blueprint, request, jsonify
from routes.generate import require_auth
from services.firestore_service import get_history, get_history_by_id

history_bp = Blueprint('history', __name__)

@history_bp.route('/history', methods=['GET'])
@require_auth
def fetch_history():
    search_query = request.args.get('search')
    category_filter = request.args.get('category')
    
    try:
        records = get_history(
            search_query=search_query,
            category_filter=category_filter
        )
        return jsonify(records), 200
    except Exception as e:
        logging.error(f"Error getting history list: {e}")
        return jsonify({'error': 'Failed to retrieve history logs.'}), 500

@history_bp.route('/history/<string:history_id>', methods=['GET'])
@require_auth
def fetch_single_history(history_id):
    try:
        record = get_history_by_id(history_id)
        if not record:
            return jsonify({'error': f'History record with ID {history_id} not found.'}), 404
        return jsonify(record), 200
    except Exception as e:
        logging.error(f"Error getting single history {history_id}: {e}")
        return jsonify({'error': 'Failed to retrieve history record.'}), 500
