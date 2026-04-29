/**
 * Firestore CRUD for the `cars` collection. Used by AppContext + screens.
 */
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
  type Unsubscribe,
} from "firebase/firestore";
import { db, isFirebaseReady } from "@/lib/firebase";
import { Car } from "@/types";

const COLL = "cars";

const ensureReady = () => {
  if (!isFirebaseReady() || !db) throw new Error("Firebase not configured.");
};

/** Live-subscribe to all car listings (newest first). */
export function subscribeCars(cb: (cars: Car[]) => void): Unsubscribe {
  if (!isFirebaseReady() || !db) {
    cb([]);
    return () => {};
  }
  const q = query(collection(db, COLL), orderBy("createdAt", "desc"));
  return onSnapshot(
    q,
    (snap) => {
      const cars = snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Car, "id">) }));
      cb(cars);
    },
    (err) => console.warn("[cars] subscribe error:", err),
  );
}

/** Create a new listing. Returns the new doc id. */
export async function createCar(carData: Omit<Car, "id">): Promise<string> {
  ensureReady();
  const ref = await addDoc(collection(db!, COLL), {
    ...carData,
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

export async function updateCar(id: string, updates: Partial<Car>): Promise<void> {
  ensureReady();
  await updateDoc(doc(db!, COLL, id), updates as any);
}

export async function deleteCar(id: string): Promise<void> {
  ensureReady();
  await deleteDoc(doc(db!, COLL, id));
}

export async function markCarSold(id: string): Promise<void> {
  return updateCar(id, { isSold: true });
}

export async function setCarHidden(id: string, hidden: boolean): Promise<void> {
  return updateCar(id, { isHidden: hidden });
}

export async function renewCar(id: string): Promise<void> {
  const expires = new Date();
  expires.setDate(expires.getDate() + 30);
  return updateCar(id, { expiresAt: expires.toISOString().split("T")[0] });
}
