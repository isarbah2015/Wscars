/**
 * Firestore CRUD for the `users` collection.
 */
import {
  collection,
  doc,
  getDoc,
  getDocs,
  updateDoc,
  onSnapshot,
  type Unsubscribe,
} from "firebase/firestore";
import { db, isFirebaseReady } from "@/lib/firebase";
import { User } from "@/types";

const COLL = "users";

const ensureReady = () => {
  if (!isFirebaseReady() || !db) throw new Error("Firebase not configured.");
};

export async function getUser(id: string): Promise<User | null> {
  ensureReady();
  const snap = await getDoc(doc(db!, COLL, id));
  if (!snap.exists()) return null;
  return { id, ...(snap.data() as Omit<User, "id">) };
}

export async function listUsers(): Promise<User[]> {
  ensureReady();
  const snap = await getDocs(collection(db!, COLL));
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<User, "id">) }));
}

export function subscribeUsers(cb: (users: User[]) => void): Unsubscribe {
  if (!isFirebaseReady() || !db) {
    cb([]);
    return () => {};
  }
  return onSnapshot(
    collection(db, COLL),
    (snap) => cb(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<User, "id">) }))),
    (err) => console.warn("[users] subscribe error:", err),
  );
}

/** Update profile fields. NEVER allow isAdmin / isVerified to be set client-side. */
export async function updateUser(id: string, updates: Partial<User>): Promise<void> {
  ensureReady();
  // Strip protected fields client-side too (rules enforce on server).
  const { isAdmin: _adm, ...safe } = updates as any;
  await updateDoc(doc(db!, COLL, id), safe);
}
