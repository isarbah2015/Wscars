import { auth } from '@/lib/firebase-persistence';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as fbSignOut,
  onAuthStateChanged,
  updateProfile,
  sendPasswordResetEmail as fbSendPasswordResetEmail,
  signInWithPhoneNumber,
  GoogleAuthProvider,
  signInWithCredential,
  signInWithPopup,
  PhoneAuthProvider,
  type UserCredential,
  type ApplicationVerifier,
  type ConfirmationResult,
  type User as FirebaseUser,
  type Unsubscribe,
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { User } from '@/types';

const todayIso = () => new Date().toISOString().split('T')[0];

const buildDefaultUserDoc = (fbUser: FirebaseUser, overrides: Partial<User> = {}): User => ({
  id: fbUser.uid,
  name: overrides.name ?? fbUser.displayName ?? (fbUser.email?.split('@')[0] || 'User'),
  email: fbUser.email || '',
  phone: overrides.phone ?? fbUser.phoneNumber ?? '',
  location: overrides.location ?? 'Accra',
  avatar: overrides.avatar ?? fbUser.photoURL ?? undefined,
  memberSince: todayIso(),
  isVerified: false,
  verification: { phone: false, id: false, dealer: false },
  rating: 0,
  totalReviews: 0,
  totalListings: 0,
  trustScore: 15,
  totalSales: 0,
  ...overrides,
});

export async function loadOrCreateUserDoc(fbUser: FirebaseUser, overrides: Partial<User> = {}): Promise<User> {
  if (!db) return buildDefaultUserDoc(fbUser, overrides);
  try {
    const ref = doc(db, 'users', fbUser.uid);
    const snap = await getDoc(ref);
    if (snap.exists()) return { id: fbUser.uid, ...(snap.data() as Omit<User, 'id'>) };
    const profile = buildDefaultUserDoc(fbUser, overrides);
    try { await setDoc(ref, { ...profile, createdAt: serverTimestamp() }); } catch {}
    return profile;
  } catch {
    return buildDefaultUserDoc(fbUser, overrides);
  }
}

export async function signInEmail(email: string, password: string): Promise<User> {
  const cred = await signInWithEmailAndPassword(auth!, email.trim(), password);
  return loadOrCreateUserDoc(cred.user);
}

export async function signUpEmail(name: string, email: string, phone: string, password: string): Promise<User> {
  const cred = await createUserWithEmailAndPassword(auth!, email.trim(), password);
  if (name) { try { await updateProfile(cred.user, { displayName: name }); } catch {} }
  return loadOrCreateUserDoc(cred.user, { name, phone });
}

export async function sendPhoneOtp(
  phoneNumber: string,
  appVerifier: ApplicationVerifier,
): Promise<ConfirmationResult> {
  return signInWithPhoneNumber(auth!, phoneNumber.trim(), appVerifier);
}

export async function confirmPhoneOtp(confirmation: ConfirmationResult, code: string, overrides: Partial<User> = {}): Promise<User> {
  const trimmed = code.trim();
  let result: UserCredential;
  if (typeof confirmation.confirm === "function") {
    result = await confirmation.confirm(trimmed);
  } else {
    const verificationId = confirmation.verificationId;
    if (!verificationId) throw new Error("Missing verification session. Request a new code.");
    const credential = PhoneAuthProvider.credential(verificationId, trimmed);
    result = await signInWithCredential(auth!, credential);
  }
  return loadOrCreateUserDoc(result.user, {
    phone: result.user.phoneNumber ?? overrides.phone ?? '',
    ...overrides,
  });
}

export async function signInWithGoogleIdToken(idToken: string, accessToken?: string): Promise<User> {
  const credential = GoogleAuthProvider.credential(idToken, accessToken);
  const result = await signInWithCredential(auth!, credential);
  return loadOrCreateUserDoc(result.user);
}

export async function signInWithGooglePopup(): Promise<User> {
  const provider = new GoogleAuthProvider();
  provider.addScope('email');
  provider.addScope('profile');
  const result = await signInWithPopup(auth!, provider);
  return loadOrCreateUserDoc(result.user);
}

export async function signOut(): Promise<void> {
  await fbSignOut(auth!);
}

export async function sendPasswordResetEmail(email: string): Promise<void> {
  await fbSendPasswordResetEmail(auth!, email.trim());
}

export function subscribeAuth(cb: (user: User | null) => void): Unsubscribe {
  return onAuthStateChanged(auth!, async (fbUser) => {
    if (!fbUser) { cb(null); return; }
    try {
      const u = await loadOrCreateUserDoc(fbUser);
      cb(u);
    } catch {
      cb(buildDefaultUserDoc(fbUser, { favorites: [], blockedUsers: [] }));
    }
  });
}

export function authErrorMessage(err: unknown): string {
  const code = (err as { code?: string })?.code || '';
  switch (code) {
    case 'auth/invalid-email': return 'That email address is not valid.';
    case 'auth/user-not-found':
    case 'auth/wrong-password':
    case 'auth/invalid-credential': return 'Invalid email or password.';
    case 'auth/email-already-in-use': return 'An account with that email already exists.';
    case 'auth/weak-password': return 'Password must be at least 6 characters.';
    case 'auth/network-request-failed': return 'Network error. Check your connection and try again.';
    case 'auth/too-many-requests': return 'Too many failed attempts. Please wait a moment and try again.';
    case 'auth/user-disabled': return 'This account has been disabled. Contact support.';
    case 'auth/operation-not-allowed': return 'This sign-in method is not enabled. Contact support.';
    case 'auth/invalid-verification-code': return 'That verification code is incorrect.';
    case 'auth/missing-verification-code': return 'Enter the 6-digit verification code.';
    case 'auth/quota-exceeded': return 'SMS limit reached. Please try again later.';
    case 'auth/account-exists-with-different-credential': return 'An account already exists with the same email but a different sign-in method.';
    case 'auth/credential-already-in-use': return 'This credential is already linked to a different account.';
    case 'auth/requires-recent-login': return 'Please sign in again to complete this action.';
    case 'auth/popup-closed-by-user':
    case 'auth/cancelled-by-user': return 'Sign-in cancelled. Please try again.';
    case 'auth/popup-blocked': return 'Pop-up was blocked by the browser. Allow pop-ups and try again.';
    case 'auth/expired-action-code': return 'This link has expired. Please request a new one.';
    case 'auth/invalid-action-code': return 'This link is invalid or has already been used.';
    default: return (err as Error)?.message || 'Something went wrong. Please try again.';
  }
}

export { auth };
