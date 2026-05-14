/**
 * Firebase Auth helpers for Westcars.
 * Wraps Firebase Auth with friendly error messages and a Firestore user-doc
 * shape that matches the existing User type.
 */
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as fbSignOut,
  onAuthStateChanged,
  updateProfile,
  sendPasswordResetEmail as fbSendPasswordResetEmail,
  GoogleAuthProvider,
  signInWithCredential,
  signInWithPopup,
  type User as FirebaseUser,
  type Unsubscribe,
} from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { db, isFirebaseReady } from "@/lib/firebase";
import { auth } from "@/lib/firebase-persistence";
import { User } from "@/types";

const ensureReady = (): void => {
  if (!isFirebaseReady() || !auth) {
    throw new Error(
      '[Firebase] Not ready — check EXPO_PUBLIC_FIREBASE_* env vars and auth initialization.'
    );
  }
};

const todayIso = () => new Date().toISOString().split("T")[0];

/** Build a default User doc shape from a Firebase auth user. */
const buildDefaultUserDoc = (fbUser: FirebaseUser, overrides: Partial<User> = {}): User => ({
  id: fbUser.uid,
  name: overrides.name ?? fbUser.displayName ?? (fbUser.email?.split("@")[0] || "User"),
  email: fbUser.email || "",
  phone: overrides.phone ?? fbUser.phoneNumber ?? "",
  location: overrides.location ?? "Accra",
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

/** Look up the Firestore profile for a Firebase user, creating one if missing.
 *  Falls back to an auth-only profile if Firestore rules block the read/write
 *  (e.g. rules not yet deployed) so login still succeeds. */
export async function loadOrCreateUserDoc(fbUser: FirebaseUser, overrides: Partial<User> = {}): Promise<User> {
  ensureReady();
  try {
    const ref = doc(db!, "users", fbUser.uid);
    const snap = await getDoc(ref);
    if (snap.exists()) {
      return { id: fbUser.uid, ...(snap.data() as Omit<User, "id">) };
    }
    const profile = buildDefaultUserDoc(fbUser, overrides);
    try {
      await setDoc(ref, { ...profile, createdAt: serverTimestamp() });
    } catch (writeErr) {
      console.warn("[auth] Firestore write blocked (check rules):", writeErr);
    }
    return profile;
  } catch (err) {
    // Firestore unavailable — return a working profile from auth data alone.
    console.warn("[auth] Firestore read failed, using auth-only profile:", err);
    return buildDefaultUserDoc(fbUser, overrides);
  }
}

/** Sign in with email + password, return the Firestore user profile. */
export async function signInEmail(email: string, password: string): Promise<User> {
  ensureReady();
  const cred = await signInWithEmailAndPassword(auth!, email.trim(), password);
  return loadOrCreateUserDoc(cred.user);
}

/** Create a new account, persist user doc, return the Firestore profile. */
export async function signUpEmail(
  name: string,
  email: string,
  phone: string,
  password: string,
): Promise<User> {
  ensureReady();
  const cred = await createUserWithEmailAndPassword(auth!, email.trim(), password);
  if (name) {
    try { await updateProfile(cred.user, { displayName: name }); } catch { /* ignore */ }
  }
  return loadOrCreateUserDoc(cred.user, { name, phone });
}

/** Exchange a Google id_token (from expo-auth-session) for a Firebase session. */
export async function signInWithGoogleIdToken(idToken: string, accessToken?: string): Promise<User> {
  ensureReady();
  const credential = GoogleAuthProvider.credential(idToken, accessToken);
  const result = await signInWithCredential(auth!, credential);
  return loadOrCreateUserDoc(result.user);
}

/**
 * Open Firebase's built-in Google sign-in popup (web only).
 * Works with just the Firebase config — no separate OAuth client ID needed.
 */
export async function signInWithGooglePopup(): Promise<User> {
  ensureReady();
  const provider = new GoogleAuthProvider();
  provider.addScope("email");
  provider.addScope("profile");
  const result = await signInWithPopup(auth!, provider);
  return loadOrCreateUserDoc(result.user);
}

export async function signOut(): Promise<void> {
  ensureReady();
  await fbSignOut(auth!);
}

/** Send a password-reset email to the given address. */
export async function sendPasswordResetEmail(email: string): Promise<void> {
  ensureReady();
  await fbSendPasswordResetEmail(auth!, email.trim());
}

/** Subscribe to auth state changes; resolves the user-doc on each login. */
export function subscribeAuth(cb: (user: User | null) => void): Unsubscribe {
  if (!isFirebaseReady()) { cb(null); return () => {}; }
  return onAuthStateChanged(auth, async (fbUser) => {
    if (!fbUser) { cb(null); return; }
    try {
      const u = await loadOrCreateUserDoc(fbUser);
      cb(u);
    } catch (err) {
      console.warn("[auth] failed to load user doc:", err);
      cb(null);
    }
  });
}

/** Friendly error message from a Firebase auth error code. */
export function authErrorMessage(err: unknown): string {
  const code = (err as { code?: string })?.code || "";
  switch (code) {
    case "auth/invalid-email":
      return "That email address is not valid.";
    case "auth/user-not-found":
    case "auth/wrong-password":
    case "auth/invalid-credential":
      return "Invalid email or password.";
    case "auth/email-already-in-use":
      return "An account with that email already exists.";
    case "auth/weak-password":
      return "Password must be at least 6 characters.";
    case "auth/network-request-failed":
      return "Network error. Check your connection and try again.";
    case "auth/too-many-requests":
      return "Too many failed attempts. Please wait a moment and try again.";
    case "auth/user-disabled":
      return "This account has been disabled. Contact support.";
    case "auth/operation-not-allowed":
      return "This sign-in method is not enabled. Contact support.";
    case "auth/account-exists-with-different-credential":
      return "An account already exists with the same email but a different sign-in method.";
    case "auth/credential-already-in-use":
      return "This credential is already linked to a different account.";
    case "auth/requires-recent-login":
      return "Please sign in again to complete this action.";
    case "auth/popup-closed-by-user":
    case "auth/cancelled-by-user":
      return "Sign-in cancelled. Please try again.";
    case "auth/popup-blocked":
      return "Pop-up was blocked by the browser. Allow pop-ups and try again.";
    case "auth/expired-action-code":
      return "This link has expired. Please request a new one.";
    case "auth/invalid-action-code":
      return "This link is invalid or has already been used.";
    default:
      return (err as Error)?.message || "Something went wrong. Please try again.";
  }
}
