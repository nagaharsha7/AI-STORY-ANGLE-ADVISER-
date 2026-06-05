import sys
import os

# Add the 'backend' folder to the Python import search path
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'backend'))

# Import the Flask app instance
from app import app

# This handler is required by Vercel's Python serverless engine
# It maps the serverless gateway requests to our Flask app instance
def handler(request, client):
    return app(request, client)
