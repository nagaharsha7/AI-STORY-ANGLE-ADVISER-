import os
import logging

# Set up logging configuration
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

try:
    import firebase_admin
    from firebase_admin import credentials, firestore, auth
except ImportError:
    firebase_admin = None
    logging.warning("firebase_admin package is missing. Run pip install -r requirements.txt")

db = None
firebase_initialized = False

def init_firebase():
    """Initializes the Firebase Admin SDK and returns the Firestore client."""
    global db, firebase_initialized
    if firebase_initialized:
        return db
    
    if firebase_admin is None:
        logging.error("Firebase Admin SDK is not available (import failure).")
        return None

    service_account_path = os.getenv('FIREBASE_SERVICE_ACCOUNT_PATH', 'firebase-service-account.json')
    
    # Resolve relative paths relative to the backend root directory
    if not os.path.isabs(service_account_path):
        base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        service_account_path = os.path.join(base_dir, service_account_path)

    try:
        # Avoid double initialization
        if not firebase_admin._apps:
            if os.path.exists(service_account_path):
                cred = credentials.Certificate(service_account_path)
                firebase_admin.initialize_app(cred)
                logging.info(f"Firebase Admin SDK initialized using service account: {service_account_path}")
            else:
                # Fallback to application default credentials (ADC) if available
                try:
                    firebase_admin.initialize_app()
                    logging.info("Firebase Admin SDK initialized using Application Default Credentials.")
                except Exception as default_err:
                    logging.warning(f"Could not load application default credentials: {default_err}")
                    # Attempt mock / no-op init or print warning
                    raise FileNotFoundError(f"Service account file not found at {service_account_path} and ADC failed.")
        
        db = firestore.client()
        firebase_initialized = True
        
        # Verify analytics document exists; if not, initialize it
        try:
            analytics_ref = db.collection('analytics').document('global_stats')
            if not analytics_ref.get().exists:
                analytics_ref.set({
                    'totalGenerations': 0,
                    'averageRating': 0.0,
                    'totalRatingPoints': 0,
                    'ratedGenerationsCount': 0
                })
                logging.info("Global analytics document initialized in Firestore.")
        except Exception as db_err:
            logging.error(f"Connected to Firestore, but failed to init analytics document: {db_err}")
            
    except Exception as e:
        logging.error(f"Failed to initialize Firebase Admin SDK: {e}")
        logging.warning("Firestore database operations will fail. Please place your Firebase service account JSON file at backend/firebase-service-account.json or set FIREBASE_SERVICE_ACCOUNT_PATH environment variable.")
        db = None
        firebase_initialized = False

    return db

def get_db():
    """Returns the database client, initializing it if necessary."""
    global db
    if db is None:
        init_firebase()
    return db
