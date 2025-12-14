import * as firebase from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';
import { FirebaseConfig } from '../types';

let app: any;
let db: Firestore | undefined;

const CONFIG_KEY = 'albion_firebase_config';

export const getFirebaseConfig = (): FirebaseConfig | null => {
  const stored = localStorage.getItem(CONFIG_KEY);
  return stored ? JSON.parse(stored) : null;
};

export const saveFirebaseConfig = (config: FirebaseConfig) => {
  localStorage.setItem(CONFIG_KEY, JSON.stringify(config));
  // Re-initialize immediately
  initializeFirebase(config);
};

export const clearFirebaseConfig = () => {
  localStorage.removeItem(CONFIG_KEY);
  app = undefined;
  db = undefined;
};

export const initializeFirebase = (config: FirebaseConfig | null): boolean => {
  if (!config) return false;
  
  try {
    app = firebase.initializeApp(config);
    db = getFirestore(app);
    console.log("Firebase initialized successfully");
    return true;
  } catch (error) {
    console.error("Failed to initialize Firebase:", error);
    return false;
  }
};

export const getDb = (): Firestore | undefined => {
  return db;
};

// Try to initialize on module load if config exists
const savedConfig = getFirebaseConfig();
if (savedConfig) {
  initializeFirebase(savedConfig);
}