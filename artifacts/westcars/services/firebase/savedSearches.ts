import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  updateDoc,
  where,
  type Unsubscribe,
} from "firebase/firestore";
import { db, isFirebaseReady } from "@/lib/firebase";
import { auth } from "@/lib/firebase-persistence";
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
  cb: (searches: SavedSearch[], error?: Error) => void,
): Unsubscribe {
  if (!isFirebaseReady() || !db || !auth) {
    cb([]);
    return () => {};
  }

  let innerUnsub: Unsubscribe | null = null;
  let cancelled = false;

  const attach = async () => {
    try {
      await auth.authStateReady();
      if (cancelled) return;
      const uid = auth.currentUser?.uid;
      if (!uid) {
        cb([]);
        return;
      }
      const q = query(collection(db!, COLL), where("userId", "==", uid));
      innerUnsub = onSnapshot(
        q,
        (snap) => {
          const list = snap.docs.map((d) => ({
            id: d.id,
            ...(d.data() as Omit<SavedSearch, "id">),
          }));
          list.sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || ""));
          cb(list);
        },
        (err) => {
          console.warn("[savedSearches] subscribe error:", err);
          cb([], err instanceof Error ? err : new Error(String(err)));
        },
      );
    } catch (err) {
      console.warn("[savedSearches] attach error:", err);
      cb([], err instanceof Error ? err : new Error(String(err)));
    }
  };

  void attach();

  return () => {
    cancelled = true;
    innerUnsub?.();
  };
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
