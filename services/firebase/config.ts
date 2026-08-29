import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import {
  initializeAuth,
  // @ts-ignore
  getReactNativePersistence,
  getAuth,
  Auth,
} from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getStorage, FirebaseStorage } from 'firebase/storage';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Default / fallback Firebase configuration for CivicLens
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY || "AIzaSyDummyCivicLensKeyForHackathonDemo123",
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN || "civiclens-app.firebaseapp.com",
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || "civiclens-app",
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET || "civiclens-app.firebasestorage.app",
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "123456789012",
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID || "1:123456789012:web:abcdef123456"
};

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;
let storage: FirebaseStorage | null = null;
let isLiveFirebase = false;

try {
  if (!getApps().length) {
    app = initializeApp(firebaseConfig);
    try {
      auth = initializeAuth(app, {
        persistence: getReactNativePersistence(AsyncStorage),
      });
    } catch {
      auth = getAuth(app);
    }
  } else {
    app = getApp();
    auth = getAuth(app);
  }
  
  db = getFirestore(app);
  storage = getStorage(app);
  
  if (process.env.EXPO_PUBLIC_FIREBASE_API_KEY && !process.env.EXPO_PUBLIC_FIREBASE_API_KEY.includes('Dummy')) {
    isLiveFirebase = true;
  }
} catch (error) {
  console.warn('Firebase initialization notice: Running in resilient hybrid mode for hackathon.', error);
}

export { app, auth, db, storage, isLiveFirebase };
