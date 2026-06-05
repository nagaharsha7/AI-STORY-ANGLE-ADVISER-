import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Check if credentials are placeholders
const isMockFirebase = !import.meta.env.VITE_FIREBASE_API_KEY || 
                       import.meta.env.VITE_FIREBASE_API_KEY === 'mock-api-key' ||
                       import.meta.env.VITE_FIREBASE_API_KEY.includes('your_');

let app;
let auth = null;

if (!isMockFirebase) {
  try {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    auth = getAuth(app);
    console.log("Firebase Auth client SDK initialized successfully.");
  } catch (error) {
    console.error("Firebase SDK Client initialization failed. Defaulting to mock mode.", error);
  }
} else {
  console.log("Running application in Local Development Mock Auth Mode.");
}

export { auth, isMockFirebase };
export default app;
