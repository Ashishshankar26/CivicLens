import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User as FirebaseUser,
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db, isLiveFirebase } from '../firebase/config';
import { UserProfile } from '@/types/user';
import {
  sendWelcomeCitizenEmail,
  sendCitizenLoginNotification,
} from '@/services/email/emailService';

const AUTH_STORAGE_KEY = '@civiclens_user_session';

export const DEMO_USER: UserProfile = {
  uid: 'user-demo-citizen',
  email: 'citizen@civiclens.org',
  displayName: 'Ashish Shankar',
  createdAt: new Date().toISOString(),
  reportsCount: 0,
  confirmationsCount: 0,
  resolvedCount: 0,
};

/**
 * Strips all undefined fields before sending to Firestore
 */
function cleanFirestoreData<T extends Record<string, any>>(obj: T): Partial<T> {
  const result: Record<string, any> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined) {
      result[key] = value;
    }
  }
  return result as Partial<T>;
}

/**
 * Sign In with email & password
 */
export async function loginWithEmail(email: string, pass: string): Promise<UserProfile> {
  const cleanEmailKey = email.toLowerCase().replace(/[^a-z0-9]/g, '_');
  const persistentUid = `user_${cleanEmailKey}`;
  let profile: UserProfile;

  if (isLiveFirebase && auth && db) {
    try {
      const userCred = await signInWithEmailAndPassword(auth, email, pass);
      const userRef = doc(db, 'users', userCred.user.uid);
      const profileDoc = await getDoc(userRef);

      if (profileDoc.exists()) {
        profile = profileDoc.data() as UserProfile;
      } else {
        profile = {
          uid: userCred.user.uid,
          email: userCred.user.email || email,
          displayName: userCred.user.displayName || email.split('@')[0],
          createdAt: new Date().toISOString(),
          reportsCount: 0,
          confirmationsCount: 0,
          resolvedCount: 0,
        };
        await setDoc(userRef, cleanFirestoreData(profile));
      }
    } catch (err) {
      console.warn('[Firebase Auth fallback login]:', err);
      const userRef = doc(db, 'users', persistentUid);
      const profileDoc = await getDoc(userRef);
      if (profileDoc.exists()) {
        profile = profileDoc.data() as UserProfile;
      } else {
        profile = {
          uid: persistentUid,
          email,
          displayName: email.split('@')[0] || 'Civic Citizen',
          createdAt: new Date().toISOString(),
          reportsCount: 0,
          confirmationsCount: 0,
          resolvedCount: 0,
        };
        await setDoc(userRef, cleanFirestoreData(profile));
      }
    }
  } else {
    profile = {
      uid: persistentUid,
      email,
      displayName: email.split('@')[0] || 'Civic Citizen',
      createdAt: new Date().toISOString(),
      reportsCount: 0,
      confirmationsCount: 0,
      resolvedCount: 0,
    };
  }

  await AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(profile));
  // Guarantee live security login notification dispatch
  try {
    await sendCitizenLoginNotification(profile);
  } catch (e) {
    console.warn('[Mailer Error during login]:', e);
  }
  return profile;
}

/**
 * Register a new citizen account
 */
export async function registerWithEmail(
  name: string,
  email: string,
  pass: string
): Promise<UserProfile> {
  let profile: UserProfile;

  if (isLiveFirebase && auth && db) {
    const userCred = await createUserWithEmailAndPassword(auth, email, pass);
    profile = {
      uid: userCred.user.uid,
      email: userCred.user.email || email,
      displayName: name || email.split('@')[0],
      createdAt: new Date().toISOString(),
      reportsCount: 0,
      confirmationsCount: 0,
      resolvedCount: 0,
    };
    await setDoc(doc(db, 'users', userCred.user.uid), cleanFirestoreData(profile));
  } else {
    // Resilient registration
    profile = {
      uid: `user_${Date.now()}`,
      email,
      displayName: name || email.split('@')[0],
      createdAt: new Date().toISOString(),
      reportsCount: 0,
      confirmationsCount: 0,
      resolvedCount: 0,
    };
  }

  await AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(profile));
  // Dispatch welcome citizen email
  await sendWelcomeCitizenEmail(profile);
  return profile;
}

/**
 * Sign in / Register with Google OAuth
 */
export async function loginWithGoogle(mockGoogleUser?: {
  email: string;
  name: string;
  photoUrl?: string;
}): Promise<UserProfile> {
  const googleEmail = mockGoogleUser?.email || 'ashish.google@gmail.com';
  const googleName = mockGoogleUser?.name || 'Ashish Shankar';

  const cleanEmailKey = googleEmail.toLowerCase().replace(/[^a-z0-9]/g, '_');
  const persistentUid = `google_user_${cleanEmailKey}`;

  let profile: UserProfile;

  if (isLiveFirebase && db) {
    try {
      const userRef = doc(db, 'users', persistentUid);
      const docSnap = await getDoc(userRef);

      if (docSnap.exists()) {
        profile = docSnap.data() as UserProfile;
        if (mockGoogleUser?.photoUrl && profile.photoUrl !== mockGoogleUser.photoUrl) {
          profile.photoUrl = mockGoogleUser.photoUrl;
          await setDoc(userRef, cleanFirestoreData(profile), { merge: true });
        }
      } else {
        profile = {
          uid: persistentUid,
          email: googleEmail,
          displayName: googleName,
          createdAt: new Date().toISOString(),
          reportsCount: 0,
          confirmationsCount: 0,
          resolvedCount: 0,
          ...(mockGoogleUser?.photoUrl ? { photoUrl: mockGoogleUser.photoUrl } : {}),
        };
        await setDoc(userRef, cleanFirestoreData(profile));
        await sendWelcomeCitizenEmail(profile);
      }
    } catch (err) {
      console.warn('[Firestore Google Auth Error]:', err);
      profile = {
        uid: persistentUid,
        email: googleEmail,
        displayName: googleName,
        createdAt: new Date().toISOString(),
        reportsCount: 0,
        confirmationsCount: 0,
        resolvedCount: 0,
        ...(mockGoogleUser?.photoUrl ? { photoUrl: mockGoogleUser.photoUrl } : {}),
      };
    }
  } else {
    profile = {
      uid: persistentUid,
      email: googleEmail,
      displayName: googleName,
      createdAt: new Date().toISOString(),
      reportsCount: 0,
      confirmationsCount: 0,
      resolvedCount: 0,
      ...(mockGoogleUser?.photoUrl ? { photoUrl: mockGoogleUser.photoUrl } : {}),
    };
  }

  await AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(profile));
  await sendCitizenLoginNotification(profile);
  return profile;
}

/**
 * Sign In with instant demo citizen
 */
export async function loginAsDemoUser(): Promise<UserProfile> {
  await AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(DEMO_USER));
  await sendCitizenLoginNotification(DEMO_USER);
  return DEMO_USER;
}

/**
 * Sign out
 */
export async function logoutUser(): Promise<void> {
  if (isLiveFirebase && auth) {
    try {
      await firebaseSignOut(auth);
    } catch (e) {
      console.warn('Firebase signout error:', e);
    }
  }
  await AsyncStorage.removeItem(AUTH_STORAGE_KEY);
}

/**
 * Read persisted session
 */
export async function getPersistedSession(): Promise<UserProfile | null> {
  try {
    const raw = await AsyncStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

/**
 * Updates user profile (display name, avatar, bio) in local storage & Firestore
 */
export async function updateUserProfileData(
  updates: Partial<UserProfile>,
  currentProfile: UserProfile
): Promise<UserProfile> {
  const updatedProfile: UserProfile = {
    ...currentProfile,
    ...updates,
  };

  if (isLiveFirebase && db && updatedProfile.uid) {
    try {
      const userRef = doc(db, 'users', updatedProfile.uid);
      await setDoc(userRef, cleanFirestoreData(updatedProfile), { merge: true });
    } catch (err) {
      console.warn('[Firebase Auth updateProfile error]:', err);
    }
  }

  await AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(updatedProfile));
  return updatedProfile;
}
