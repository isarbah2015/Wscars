/**
 * Firestore CRUD for reports.
 * The auto-hide-after-3-reports rule lives in the reportContent Cloud Function.
 */
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  addDoc,
  updateDoc,
  doc,
  serverTimestamp,
  type Unsubscribe,
} from "firebase/firestore";
import { db, isFirebaseReady } from "@/lib/firebase";
import { Report } from "@/types";

const COLL = "reports";

const ensureReady = () => {
  if (!isFirebaseReady() || !db) throw new Error("Firebase not configured.");
};

export function subscribeReports(cb: (reports: Report[]) => void): Unsubscribe {
  if (!isFirebaseReady() || !db) {
    cb([]);
    return () => {};
  }
  const q = query(collection(db, COLL), orderBy("createdAt", "desc"));
  return onSnapshot(
    q,
    (snap) => cb(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Report, "id">) }))),
    (err) => console.warn("[reports] subscribe error:", err),
  );
}

export async function createReport(report: Omit<Report, "id" | "createdAt" | "status">): Promise<string> {
  ensureReady();
  const ref = await addDoc(collection(db!, COLL), {
    ...report,
    createdAt: serverTimestamp(),
    status: "pending",
  });
  return ref.id;
}

export async function setReportStatus(id: string, status: Report["status"]): Promise<void> {
  ensureReady();
  await updateDoc(doc(db!, COLL, id), { status });
}
