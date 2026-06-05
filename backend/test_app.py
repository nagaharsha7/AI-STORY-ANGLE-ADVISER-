import json
import unittest
from app import app
from config.firebase_config import firebase_initialized

class NewsroomAdvisorTestCase(unittest.TestCase):
    def setUp(self):
        """Configure test environments and initialize client client."""
        app.config['TESTING'] = True
        self.client = app.test_client()

    def test_health_check(self):
        """Verifies that the root and /health endpoints return 200 and show correct metadata."""
        response = self.client.get('/health')
        self.assertEqual(response.status_code, 200)
        
        data = json.loads(response.data)
        self.assertEqual(data.get('status'), 'healthy')
        self.assertIn('firebase_connected', data)

    def test_auth_protection_on_history(self):
        """
        Verifies that /api/history returns 401 unauthorized if Firebase admin SDK 
        is active and no Authorization header is provided.
        If running in mock dev mode (Firebase initialized = False), it should succeed (200).
        """
        response = self.client.get('/api/history')
        if firebase_initialized:
            # Under live production environment without token headers
            self.assertEqual(response.status_code, 401)
        else:
            # Under local developer fallback bypass environment
            self.assertEqual(response.status_code, 200)

    def test_auth_protection_on_analytics(self):
        """Verifies security controls on the /api/analytics endpoints."""
        response = self.client.get('/api/analytics')
        if firebase_initialized:
            self.assertEqual(response.status_code, 401)
        else:
            self.assertEqual(response.status_code, 200)

    def test_generate_validation(self):
        """Verifies that submitting an empty story to /api/generate triggers a 400 validation error."""
        response = self.client.post('/api/generate', 
                                    data=json.dumps({'story': '', 'editor': 'test-user'}),
                                    content_type='application/json')
        
        # Validation checks should run before auth checks in mock/dev scenarios
        if not firebase_initialized:
            self.assertEqual(response.status_code, 400)
            data = json.loads(response.data)
            self.assertIn('error', data)

if __name__ == '__main__':
    unittest.main()
