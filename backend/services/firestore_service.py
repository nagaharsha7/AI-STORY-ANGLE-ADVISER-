import logging
from datetime import datetime, timedelta
from google.cloud import firestore
from config.firebase_config import get_db

logging.basicConfig(level=logging.INFO)

def save_history(story_text, editor_email, title, category, generated_output):
    """
    Saves a generated story analysis to the history collection, 
    and increments the total generation counter in analytics.
    """
    db = get_db()
    if db is None:
        logging.error("Firestore database connection is unavailable.")
        return None

    try:
        # Create history doc
        history_ref = db.collection('history').document()
        history_data = {
            'id': history_ref.id,
            'story': story_text,
            'editor': editor_email,
            'title': title,
            'category': category,
            'generated_output': generated_output,
            'rating': None,
            'timestamp': firestore.SERVER_TIMESTAMP
        }
        
        # Save to database
        history_ref.set(history_data)
        
        # Increment total generations in analytics
        analytics_ref = db.collection('analytics').document('global_stats')
        analytics_ref.update({
            'totalGenerations': firestore.Increment(1)
        })
        
        logging.info(f"Successfully saved story analysis with id: {history_ref.id}")
        return history_ref.id
    except Exception as e:
        logging.error(f"Error saving story history to Firestore: {e}")
        return None

def get_history(search_query=None, category_filter=None):
    """
    Fetches the history of story analyses from Firestore.
    Applies filters on category if requested, and searches text in Python.
    """
    db = get_db()
    if db is None:
        return []

    try:
        query = db.collection('history')
        
        # Apply category filter at database level
        if category_filter:
            query = query.where('category', '==', category_filter)
            
        # Order by timestamp descending
        query = query.order_by('timestamp', direction=firestore.Query.DESCENDING)
        
        # Cap at 100 entries for safety and performance
        docs = query.limit(100).stream()
        
        results = []
        for doc in docs:
            data = doc.to_dict()
            # Convert firestore datetime to ISO string
            if 'timestamp' in data and data['timestamp']:
                data['timestamp'] = data['timestamp'].isoformat()
            else:
                data['timestamp'] = datetime.utcnow().isoformat()
            
            # Simple text search in title or story contents
            if search_query:
                sq = search_query.lower()
                title_match = sq in data.get('title', '').lower()
                story_match = sq in data.get('story', '').lower()
                if not (title_match or story_match):
                    continue
            
            results.append(data)
            
        return results
    except Exception as e:
        logging.error(f"Error fetching history from Firestore: {e}")
        return []

def get_history_by_id(history_id):
    """Retrieves a single story analysis by its unique ID."""
    db = get_db()
    if db is None:
        return None

    try:
        doc_ref = db.collection('history').document(history_id)
        doc = doc_ref.get()
        if doc.exists:
            data = doc.to_dict()
            if 'timestamp' in data and data['timestamp']:
                data['timestamp'] = data['timestamp'].isoformat()
            else:
                data['timestamp'] = datetime.utcnow().isoformat()
            return data
        return None
    except Exception as e:
        logging.error(f"Error fetching history document {history_id}: {e}")
        return None

def add_feedback(history_id, rating, comment):
    """
    Adds user feedback for a story analysis.
    Updates the history document rating and dynamically recalculates global analytics.
    """
    db = get_db()
    if db is None:
        return False

    try:
        # Save feedback record
        feedback_ref = db.collection('feedback').document()
        feedback_data = {
            'id': feedback_ref.id,
            'historyId': history_id,
            'rating': rating,
            'comment': comment,
            'timestamp': firestore.SERVER_TIMESTAMP
        }
        feedback_ref.set(feedback_data)

        # Retrieve the original history document
        history_ref = db.collection('history').document(history_id)
        history_doc = history_ref.get()
        
        if not history_doc.exists:
            logging.error(f"History document {history_id} not found for rating update.")
            return False
            
        old_rating = history_doc.to_dict().get('rating')
        
        # Update rating on history document
        history_ref.update({'rating': rating})
        
        # Recalculate global rating in analytics using a transaction
        analytics_ref = db.collection('analytics').document('global_stats')
        
        @firestore.transactional
        def update_ratings_transaction(transaction, ref):
            snapshot = ref.get(transaction=transaction)
            stats = snapshot.to_dict() if snapshot.exists else {}
            
            total_points = stats.get('totalRatingPoints', 0)
            rated_count = stats.get('ratedGenerationsCount', 0)
            
            if old_rating is None:
                # New rating being submitted
                new_rated_count = rated_count + 1
                new_total_points = total_points + rating
            else:
                # Updating an existing rating
                new_rated_count = rated_count
                new_total_points = total_points - old_rating + rating
                
            new_avg = round(float(new_total_points) / max(new_rated_count, 1), 2)
            
            transaction.update(ref, {
                'totalRatingPoints': new_total_points,
                'ratedGenerationsCount': new_rated_count,
                'averageRating': new_avg
            })
            
        transaction = db.transaction()
        update_ratings_transaction(transaction, analytics_ref)
        
        logging.info(f"Feedback logged successfully for history: {history_id}")
        return True
    except Exception as e:
        logging.error(f"Error adding feedback/rating: {e}")
        return False

def get_analytics():
    """
    Retrieves global metrics and performs dynamic aggregation on 
    the history collection to construct daily usage logs and category distributions.
    """
    db = get_db()
    if db is None:
        return {
            'totalGenerations': 0,
            'averageRating': 0.0,
            'dailyUsage': [],
            'topCategories': []
        }

    try:
        # 1. Fetch global stats (counters)
        analytics_ref = db.collection('analytics').document('global_stats')
        doc = analytics_ref.get()
        stats = doc.to_dict() if doc.exists else {}
        
        total_gens = stats.get('totalGenerations', 0)
        avg_rating = stats.get('averageRating', 0.0)
        
        # 2. Fetch history records for dynamic charting (past 30 days)
        limit_date = datetime.utcnow() - timedelta(days=30)
        histories_ref = db.collection('history')
        # We order by timestamp and filter items with a valid timestamp
        # Note: If no composite indexes are created, we query items and filter in python
        docs = histories_ref.stream()
        
        daily_usage_map = {}
        category_map = {}
        
        # Seed daily usage map with last 7 days to show empty days on chart if there is no activity
        for i in range(7):
            day_str = (datetime.utcnow() - timedelta(days=i)).strftime('%Y-%m-%d')
            daily_usage_map[day_str] = 0
            
        for d in docs:
            data = d.to_dict()
            ts = data.get('timestamp')
            
            # Skip if timestamp is missing or not a datetime object
            if not ts:
                continue
                
            # Handle both string and datetime formats safely
            if isinstance(ts, str):
                try:
                    ts = datetime.fromisoformat(ts.replace('Z', '+00:00'))
                except ValueError:
                    continue
            
            # Only count items from past 30 days
            if ts.replace(tzinfo=None) < limit_date:
                continue
                
            # Aggregate Daily Usage
            day_key = ts.strftime('%Y-%m-%d')
            daily_usage_map[day_key] = daily_usage_map.get(day_key, 0) + 1
            
            # Aggregate Categories
            cat = data.get('category', 'General')
            category_map[cat] = category_map.get(cat, 0) + 1
            
        # Format Daily Usage for Recharts (Sorted chronologically)
        daily_usage = [
            {'date': k, 'count': v} 
            for k, v in daily_usage_map.items()
        ]
        daily_usage.sort(key=lambda x: x['date'])
        
        # Format Top Categories for Recharts (Sorted by count descending)
        top_categories = [
            {'name': k, 'count': v}
            for k, v in category_map.items()
        ]
        top_categories.sort(key=lambda x: x['count'], reverse=True)
        
        return {
            'totalGenerations': total_gens,
            'averageRating': avg_rating,
            'dailyUsage': daily_usage[-14:],  # Show past 14 days on chart
            'topCategories': top_categories[:5]    # Show top 5 categories
        }
    except Exception as e:
        logging.error(f"Error preparing analytics aggregations: {e}")
        return {
            'totalGenerations': 0,
            'averageRating': 0.0,
            'dailyUsage': [],
            'topCategories': []
        }
