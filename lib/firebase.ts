/**
 * Firebase Configuration and Initialization Module
 * 
 * This module handles the setup and initialization of Firebase services including:
 * - Firebase App
 * - Authentication
 * - Firestore Database
 * - Vertex AI (Gemini) Integration
 */

// Import required Firebase modules
import { initializeApp, getApps } from 'firebase/app';  // Core Firebase functionality
import { getAuth } from 'firebase/auth';                // Authentication services
import { getFirestore } from 'firebase/firestore';      // Firestore database

/**
 * Firebase configuration object containing essential credentials and settings
 * These values are loaded from environment variables for security
 * All values are prefixed with NEXT_PUBLIC_ to make them available client-side in Next.js
 */
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,           // API key for Firebase services
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,   // Auth domain for Firebase hosting
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,     // Firebase project identifier
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET, // Storage bucket URL
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID, // Firebase Cloud Messaging
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,            // Firebase app identifier
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID, // Analytics measurement ID
};

/**
 * Initialize Firebase app instance
 * This checks if an app is already initialized to prevent duplicate instances
 * Returns existing app if found, otherwise creates new instance
 */
const app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];

// Get Authentication instance for handling user authentication
const auth = getAuth(app);

// Get Firestore instance for database operations
const db = getFirestore(app);

// Export initialized services for use in other parts of the application
export { app, auth, db }; 