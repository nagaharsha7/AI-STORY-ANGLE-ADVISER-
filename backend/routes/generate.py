import logging
from flask import Blueprint, request, jsonify
from config.firebase_config import firebase_initialized
from services.gemini_service import generate_story_insights
from services.firestore_service import save_history
from functools import wraps

try:
    from firebase_admin import auth
except ImportError:
    auth = None

generate_bp = Blueprint('generate', __name__)

def require_auth(f):
    """Decorator to require Firebase Authentication. Bypasses check if credentials aren't loaded."""
    @wraps(f)
    def decorated(*args, **kwargs):
        if not firebase_initialized or auth is None:
            logging.warning("Firebase Admin is not initialized. Bypassing auth check for development.")
            request.user = {"email": "dev-editor@telanganatoday.com", "uid": "dev-user-123"}
            return f(*args, **kwargs)
            
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return jsonify({'error': 'Unauthorized. Missing or invalid Authorization header.'}), 401
            
        token = auth_header.split(' ')[1]
        try:
            decoded_token = auth.verify_id_token(token)
            request.user = decoded_token
            return f(*args, **kwargs)
        except Exception as e:
            logging.error(f"Token verification failed: {e}")
            return jsonify({'error': 'Unauthorized. Invalid authentication token.'}), 401
            
    return decorated

@generate_bp.route('/generate', methods=['POST'])
@require_auth
def generate_insights():
    data = request.get_json() or {}
    story_text = data.get('story')
    
    if not story_text or not story_text.strip():
        return jsonify({'error': 'Missing story content.'}), 400
        
    editor_email = request.user.get('email', data.get('editor', 'editor@telanganatoday.com'))
    
    try:
        # 1. Call Gemini to analyze the story and get structured json
        analysis_result = generate_story_insights(story_text)
        
        title = analysis_result.get('title', 'Story Analysis')
        category = analysis_result.get('category', 'General')
        
        # 2. Extract specific segments requested by the user API format
        formatted_output = {
            'angles': analysis_result.get('angles', []),
            'followups': analysis_result.get('followups', []),
            'questions': analysis_result.get('questions', []),
            'investigations': analysis_result.get('investigations', []),
            'socialIdeas': analysis_result.get('socialIdeas', [])
        }
        
        # 3. Save details to Firestore database
        doc_id = save_history(
            story_text=story_text,
            editor_email=editor_email,
            title=title,
            category=category,
            generated_output=formatted_output
        )
        
        # 4. Return results + document metadata
        return jsonify({
            'id': doc_id,
            'title': title,
            'category': category,
            'editor': editor_email,
            **formatted_output
        }), 201
        
    except Exception as e:
        logging.error(f"Error generating insights: {e}")
        return jsonify({'error': f"Failed to analyze story: {str(e)}"}), 500
