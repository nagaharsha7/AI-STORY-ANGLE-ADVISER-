import os
import logging
from flask import Flask, jsonify
from flask_cors import CORS
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

# Initialize Flask app
app = Flask(__name__)

# Configure CORS - Allow cross-origin requests from typical Vite dev servers and production hosts
CORS(app, resources={r"/api/*": {"origins": "*"}})

# Initialize Firebase on startup
from config.firebase_config import init_firebase
init_firebase()

# Register blueprints
from routes.generate import generate_bp
from routes.history import history_bp
from routes.feedback import feedback_bp
from routes.analytics import analytics_bp

app.register_blueprint(generate_bp, url_prefix='/api')
app.register_blueprint(history_bp, url_prefix='/api')
app.register_blueprint(feedback_bp, url_prefix='/api')
app.register_blueprint(analytics_bp, url_prefix='/api')

@app.route('/', methods=['GET'])
@app.route('/health', methods=['GET'])
def health_check():
    """Simple API status route."""
    from config.firebase_config import firebase_initialized
    return jsonify({
        'status': 'healthy',
        'service': 'Telangana Today AI Story Advisor API',
        'firebase_connected': firebase_initialized,
        'environment': os.getenv('FLASK_ENV', 'production')
    }), 200

# Error Handlers
@app.errorhandler(404)
def not_found(error):
    return jsonify({'error': 'Resource not found.'}), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({'error': 'Internal server error.'}), 500

if __name__ == '__main__':
    port = int(os.getenv('PORT', 5000))
    debug = os.getenv('FLASK_ENV') == 'development'
    logging.info(f"Starting Telangana Today AI backend on port {port}...")
    app.run(host='0.0.0.0', port=port, debug=debug)
