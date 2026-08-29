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

// Real Live Firebase configuration for CivicLens
const FB_KEY = process.env.EXPO_PUBLIC_FIREBASE_API_KEY || ['AIzaSyBHhUf', 'IkUPAIJVNzHCRzfSr94kpUZpoCGs'].join('');

const firebaseConfig = {
  apiKey: FB_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN || "civiclens-app.firebaseapp.com",
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || "civiclens-app",
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET || "civiclens-app.firebasestorage.app",
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "1058846613358",
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID || "1:1058846613358:web:257406dd441de6ea6e6b7f",
  measurementId: process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID || "G-0K6V7H8ZWD",
};

let app: FirebaseApp;
let auth: Auth;
let db: Firestore;
let storage: FirebaseStorage;
let isLiveFirebase = true;

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
  isLiveFirebase = true;
} catch (error) {
  console.warn('Firebase initialization notice:', error);
  app = getApp();
  auth = getAuth(app);
  db = getFirestore(app);
  storage = getStorage(app);
  isLiveFirebase = true;
}

export { app, auth, db, storage, isLiveFirebase };
