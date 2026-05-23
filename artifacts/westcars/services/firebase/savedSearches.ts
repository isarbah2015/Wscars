import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  updateDoc,
  where,
  type Unsubscribe,
} from "firebase/firestore";
import { db, isFirebaseReady } from "@/lib/firebase";
import { ListingSearchFilters, QuickFilterKey } from "@/utils/listingSearchFilters";

export interface SavedSearch {
  id: string;
  userId: string;
  name: string;
  query: string;
  quickFilter: QuickFilterKey;
  filters: ListingSearchFilters | null;
  enabled: boolean;
  createdAt: string;
  lastNotifiedAt?: string;
}

const COLL = "savedSearches";

const ensureReady = () => {
  if (!isFirebaseReady() || !db) throw new Error("Firebase not configured.");
};

export function subscribeSavedSearches(
  userId: string,
  cb: (searches: SavedSearch[]) => void,
): Unsubscribe {
  if (!isFirebaseReady() || !db) {
    cb([]);
    return () => {};
  }
  const q = query(
    collection(db, COLL),
    where("userId", "==", userId),
    orderBy("createdAt", "desc"),
  );
  return onSnapshot(
    q,
    (snap) =>
      cb(
        snap.docs.map((d) => ({
          id: d.id,
          ...(d.data() as Omit<SavedSearch, "id">),
        })),
      ),
    (err) => console.warn("[savedSearches] subscribe error:", err),
  );
}

export async function createSavedSearch(input: {
  userId: string;
  name: string;
  query?: string;
  quickFilter?: QuickFilterKey;
  filters?: ListingSearchFilters | null;
}): Promise<string> {
  ensureReady();
  const ref = await addDoc(collection(db!, COLL), {
    userId: input.userId,
    name: input.name,
    query: input.query ?? "",
    quickFilter: input.quickFilter ?? "All",
    filters: input.filters ?? null,
    enabled: true,
    createdAt: new Date().toISOString(),
  });
  return ref.id;
}

export async function deleteSavedSearch(id: string): Promise<void> {
  ensureReady();
  await deleteDoc(doc(db!, COLL, id));
}

export async function setSavedSearchEnabled(id: string, enabled: boolean): Promise<void> {
  ensureReady();
  await updateDoc(doc(db!, COLL, id), { enabled });
}
