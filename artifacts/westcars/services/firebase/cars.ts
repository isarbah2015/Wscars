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
  getDoc,
  serverTimestamp,
  type Unsubscribe,
} from "firebase/firestore";
import { db, isFirebaseReady } from "@/lib/firebase";
import { Car } from "@/types";
import { toDateString } from "@/utils/formatFirestoreDate";

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
      const today = new Date().toISOString().split("T")[0];
      const cars = snap.docs.map((d) => {
        const raw = { id: d.id, ...(d.data() as Omit<Car, "id">) };
        return {
          ...raw,
          createdAt: toDateString(raw.createdAt, today),
          expiresAt: raw.expiresAt ? toDateString(raw.expiresAt) : raw.expiresAt,
        } as Car;
      });
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
  let payload = { ...updates };
  if (updates.price !== undefined) {
    const snap = await getDoc(doc(db!, COLL, id));
    const current = snap.data()?.price;
    if (typeof current === "number" && current !== updates.price) {
      payload = {
        ...payload,
        previousPrice: current,
        priceChangedAt: new Date().toISOString(),
      };
    }
  }
  await updateDoc(doc(db!, COLL, id), payload as Record<string, unknown>);
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
