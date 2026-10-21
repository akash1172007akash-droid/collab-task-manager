import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';

export interface FirebaseCustomConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket?: string;
  messagingSenderId?: string;
  appId?: string;
}

const STORAGE_KEY = 'COLAB_TASK_FIREBASE_CONFIG';
const EMULATOR_STORAGE_KEY = 'COLAB_TASK_USE_EMULATOR';

// Helper to read stored custom config
export function getStoredFirebaseConfig(): FirebaseCustomConfig | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed.apiKey && parsed.projectId) {
      return parsed;
    }
  } catch (err) {
    console.warn('Failed to parse stored Firebase config:', err);
  }
  return null;
}

export function saveStoredFirebaseConfig(config: FirebaseCustomConfig): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  window.location.reload();
}

export function clearStoredFirebaseConfig(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEY);
  window.location.reload();
}

export function getIsEmulatorPreferred(): boolean {
  if (typeof window === 'undefined') return false;
  // If explicitly set in localStorage
  const stored = localStorage.getItem(EMULATOR_STORAGE_KEY);
  if (stored !== null) return stored === 'true';
  // Or if set in vite env
  return import.meta.env.VITE_USE_FIREBASE_EMULATOR === 'true';
}

export function setIsEmulatorPreferred(enabled: boolean): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(EMULATOR_STORAGE_KEY, enabled ? 'true' : 'false');
  window.location.reload();
}

// 1. Resolve configuration
const storedConfig = getStoredFirebaseConfig();

const envApiKey = import.meta.env.VITE_FIREBASE_API_KEY;
const envAuthDomain = import.meta.env.VITE_FIREBASE_AUTH_DOMAIN;
const envProjectId = import.meta.env.VITE_FIREBASE_PROJECT_ID;
const envStorageBucket = import.meta.env.VITE_FIREBASE_STORAGE_BUCKET;
const envMessagingSenderId = import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID;
const envAppId = import.meta.env.VITE_FIREBASE_APP_ID;

const isEnvConfigValid = Boolean(
  envApiKey &&
  envApiKey !== 'your_firebase_api_key_here' &&
  envProjectId &&
  envProjectId !== 'your_project_id'
);

export const isLiveConfigAvailable = Boolean(storedConfig || isEnvConfigValid);

// Determine host environment
const isLocalhost = typeof window !== 'undefined' && (
  window.location.hostname === 'localhost' ||
  window.location.hostname === '127.0.0.1' ||
  window.location.hostname === '[::1]'
);

export const isUsingEmulator = Boolean(
  isLocalhost && (getIsEmulatorPreferred() || !isLiveConfigAvailable)
);

// Resolved config object
export const resolvedFirebaseConfig = storedConfig || (isEnvConfigValid ? {
  apiKey: envApiKey,
  authDomain: envAuthDomain,
  projectId: envProjectId,
  storageBucket: envStorageBucket,
  messagingSenderId: envMessagingSenderId,
  appId: envAppId,
} : {
  apiKey: 'demo-task-manager-api-key',
  authDomain: 'demo-task-manager.firebaseapp.com',
  projectId: 'demo-task-manager',
  storageBucket: 'demo-task-manager.appspot.com',
  messagingSenderId: '1234567890',
  appId: '1:1234567890:web:abcdef123456',
});

// Initialize Firebase App singleton
export const app = getApps().length === 0 ? initializeApp(resolvedFirebaseConfig) : getApp();
export const auth = getAuth(app);
export const db = getFirestore(app);

// Connect emulators ONLY when running on localhost and explicitly using emulator
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
