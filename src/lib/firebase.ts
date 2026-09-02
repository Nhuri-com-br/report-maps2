/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut as firebaseSignOut, 
  onAuthStateChanged as firebaseOnAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';
import { getFirestore, doc, getDocFromServer } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Configurações do provedor Google
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

export interface AppUser {
  uid: string;
  displayName: string | null;
  email: string | null;
  photoURL?: string | null;
  role?: 'citizen' | 'admin' | 'gov_official';
}

const LOCAL_STORAGE_KEY = 'report_maps_custom_user';
const authSubscribers: Array<(user: AppUser | null) => void> = [];

let currentUserState: AppUser | null = null;

// Inicializa estado a partir do LocalStorage se existir
try {
  const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
  if (saved) {
    currentUserState = JSON.parse(saved);
  }
} catch (e) {
  console.warn('Erro ao carregar sessão local:', e);
}

function notifySubscribers(user: AppUser | null) {
  currentUserState = user;
  authSubscribers.forEach(cb => cb(user));
}

// Ouvir mudanças do Firebase Auth
firebaseOnAuthStateChanged(auth, (fbUser) => {
  if (fbUser) {
    const user: AppUser = {
      uid: fbUser.uid,
      displayName: fbUser.displayName || 'Cidadão Conectado',
      email: fbUser.email,
      photoURL: fbUser.photoURL,
      role: fbUser.email === 'yuridragoni6@gmail.com' ? 'admin' : 'citizen'
    };
    try {
      localStorage.removeItem(LOCAL_STORAGE_KEY);
    } catch {}
    notifySubscribers(user);
  } else {
    // Se não há usuário no Firebase, verifica se há sessão local salva
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        notifySubscribers(JSON.parse(saved));
        return;
      }
    } catch {}
    notifySubscribers(null);
  }
});

export function onAppAuthStateChanged(callback: (user: AppUser | null) => void) {
  authSubscribers.push(callback);
  // Dispara imediatamente o estado atual
  callback(currentUserState);
  return () => {
    const index = authSubscribers.indexOf(callback);
    if (index > -1) authSubscribers.splice(index, 1);
  };
}

export const loginWithGoogle = async (): Promise<{ success: boolean; error?: string }> => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const fbUser = result.user;
    const user: AppUser = {
      uid: fbUser.uid,
      displayName: fbUser.displayName,
      email: fbUser.email,
      photoURL: fbUser.photoURL,
      role: fbUser.email === 'yuridragoni6@gmail.com' ? 'admin' : 'citizen'
    };
    notifySubscribers(user);
    return { success: true };
  } catch (error: any) {
    console.warn('Firebase Google Auth error:', error.code, error.message);
    return { 
      success: false, 
      error: error.code || error.message || 'Falha no login com Google' 
    };
  }
};

export const loginAsDemoUser = (profile: { 
  name: string; 
  email: string; 
  role: 'citizen' | 'admin' | 'gov_official';
  photoURL?: string;
}) => {
  const user: AppUser = {
    uid: `local-${profile.role}-${Math.random().toString(36).substr(2, 6)}`,
    displayName: profile.name,
    email: profile.email,
    role: profile.role,
    photoURL: profile.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.name)}&background=2563eb&color=fff`
  };

  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(user));
  } catch (e) {
    console.warn(e);
  }

  notifySubscribers(user);
  return user;
};

export const logout = async () => {
  try {
    localStorage.removeItem(LOCAL_STORAGE_KEY);
  } catch {}
  
  try {
    await firebaseSignOut(auth);
  } catch (e) {
    console.warn(e);
  }

  notifySubscribers(null);
};

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
  }
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: currentUserState?.uid || auth.currentUser?.uid,
      email: currentUserState?.email || auth.currentUser?.email,
      emailVerified: true,
      isAnonymous: false,
      tenantId: null,
    },
    operationType,
    path
  }
  console.warn('Firestore Operation: ', JSON.stringify(errInfo));
}

