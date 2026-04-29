/**
 * Firestore CRUD for reviews.
 */
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  addDoc,
  serverTimestamp,
  type Unsubscribe,
} from "firebase/firestore";
import { db, isFirebaseReady } from "@/lib/firebase";
import { Review } from "@/types";

const COLL = "reviews";

const ensureReady = () => {
  if (!isFirebaseReady() || !db) throw new Error("Firebase not configured.");
};

export function subscribeReviews(cb: (reviews: Review[]) => void): Unsubscribe {
  if (!isFirebaseReady() || !db) {
    cb([]);
    return () => {};
  }
  const q = query(collection(db, COLL), orderBy("createdAt", "desc"));
  return onSnapshot(
    q,
    (snap) => cb(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Review, "id">) }))),
    (err) => console.warn("[reviews] subscribe error:", err),
  );
}

export async function createReview(review: Omit<Review, "id" | "createdAt">): Promise<string> {
  ensureReady();
  const ref = await addDoc(collection(db!, COLL), {
    ...review,
    createdAt: serverTimestamp(),
  });
  return ref.id;
}
