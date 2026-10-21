import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';

// Read environment variables
const apiKey = import.meta.env.VITE_FIREBASE_API_KEY;
const authDomain = import.meta.env.VITE_FIREBASE_AUTH_DOMAIN;
const projectId = import.meta.env.VITE_FIREBASE_PROJECT_ID;
const storageBucket = import.meta.env.VITE_FIREBASE_STORAGE_BUCKET;
const messagingSenderId = import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID;
const appId = import.meta.env.VITE_FIREBASE_APP_ID;
const useEmulator = import.meta.env.VITE_USE_FIREBASE_EMULATOR === 'true';

// Determine if we have live valid configuration
export const isLiveConfigAvailable = Boolean(
  apiKey &&
  apiKey !== 'your_firebase_api_key_here' &&
  projectId &&
  projectId !== 'your_project_id'
);

const firebaseConfig = {
  apiKey: apiKey || 'demo-task-manager-api-key',
  authDomain: authDomain || 'demo-task-manager.firebaseapp.com',
  projectId: projectId || 'demo-task-manager',
  storageBucket: storageBucket || 'demo-task-manager.appspot.com',
  messagingSenderId: messagingSenderId || '1234567890',
  appId: appId || '1:1234567890:web:abcdef123456',
};

// Initialize Firebase App singleton
export const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);
export const db = getFirestore(app);

// Check if emulator connection should be initialized
export const isUsingEmulator = useEmulator || !isLiveConfigAvailable;

// Flag to avoid reconnecting emulator multiple times in HMR
declare global {
  // eslint-disable-next-line no-var
  var __FIREBASE_EMULATORS_CONNECTED__: boolean | undefined;
}

if (isUsingEmulator && !globalThis.__FIREBASE_EMULATORS_CONNECTED__) {
  try {
    const authHost = 'http://127.0.0.1:9099';
    connectAuthEmulator(auth, authHost, { disableWarnings: true });
    connectFirestoreEmulator(db, '127.0.0.1', 8080);
    globalThis.__FIREBASE_EMULATORS_CONNECTED__ = true;
    console.info('[Firebase] Connected to local Firebase Auth & Firestore Emulators.');
  } catch (err) {
    console.warn('[Firebase] Emulator connection skipped or already initialized:', err);
  }
}
