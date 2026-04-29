/**
 * Firestore service layer for the Westcars Admin web app.
 * Mirrors the mobile-app shape so the same `users`, `cars`, `reports`
 * collections back both clients.
 */
import {
  collection,
  doc,
  onSnapshot,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  type Unsubscribe,
} from "firebase/firestore";
import { db, isFirebaseReady } from "./firebase";
import type { AppUser, Car, Report } from "@/data/mock";

const ensureReady = () => {
  if (!isFirebaseReady() || !db) throw new Error("Firebase not configured.");
};

/* ── Cars ──────────────────────────────────────────────────────────── */

interface FirestoreCar {
  id: string;
  brand: string;
  model: string;
  year: number;
  price: number;
  mileage: number;
  condition?: string;
  location: string;
  category?: string;
  seller?: { id?: string; name?: string; isVerified?: boolean };
  sellerId?: string;
  views?: number;
  isSponsored?: boolean;
  isFeatured?: boolean;
  isHidden?: boolean;
  isSold?: boolean;
  reportCount?: number;
  expiresAt?: string;
  createdAt?: any;
  images?: string[];
}

const toAdminCar = (c: FirestoreCar): Car => {
  // Compute admin-shaped status from mobile flags.
  const status: Car["status"] =
    c.isSold              ? "sold"   :
    c.isHidden            ? "hidden" :
    (c.reportCount ?? 0) >= 3 ? "pending" :
    "active";

  return {
    id:          c.id,
    brand:       c.brand || "",
    model:       c.model || "",
    year:        c.year ?? 0,
    price:       c.price ?? 0,
    mileage:     c.mileage ?? 0,
    condition:   (c.condition as Car["condition"]) || "Foreign Used",
    location:    c.location || "Accra",
    category:    (c.category as Car["category"]) || "sedan",
    seller: {
      id:         c.seller?.id || c.sellerId || "",
      name:       c.seller?.name || "Unknown",
      isVerified: !!c.seller?.isVerified,
    },
    views:       c.views ?? 0,
    isSponsored: !!c.isSponsored,
    isFeatured:  !!c.isFeatured,
    status,
    createdAt:   typeof c.createdAt === "string"
                  ? c.createdAt
                  : (c.createdAt?.toDate?.()?.toISOString().split("T")[0] || ""),
    images:      c.images || [],
  };
};

export function subscribeAdminCars(cb: (cars: Car[]) => void): Unsubscribe {
  if (!isFirebaseReady() || !db) { cb([]); return () => {}; }
  const q = query(collection(db, "cars"), orderBy("createdAt", "desc"));
  return onSnapshot(
    q,
    (snap) => cb(snap.docs.map((d) => toAdminCar({ id: d.id, ...(d.data() as any) }))),
    (err) => console.warn("[admin/cars] subscribe error:", err),
  );
}

export async function setAdminCarStatus(id: string, status: Car["status"]): Promise<void> {
  ensureReady();
  // Map admin status → mobile flags. Approving (→ "active") clears the
  // report count so a previously auto-hidden listing actually becomes active.
  const updates: Record<string, any> = {
    isHidden: status === "hidden",
    isSold:   status === "sold",
  };
  if (status === "active") updates.reportCount = 0;
  await updateDoc(doc(db!, "cars", id), updates);
}

export async function deleteAdminCar(id: string): Promise<void> {
  ensureReady();
  await deleteDoc(doc(db!, "cars", id));
}

/* ── Users ─────────────────────────────────────────────────────────── */

interface FirestoreUser {
  id: string;
  name: string;
  email: string;
  phone?: string;
  location?: string;
  memberSince?: string;
  isVerified?: boolean;
  isDealer?: boolean;
  isBlocked?: boolean;
  totalListings?: number;
  trustScore?: number;
  avatar?: string;
}

const toAdminUser = (u: FirestoreUser): AppUser => ({
  id:            u.id,
  name:          u.name || "User",
  email:         u.email || "",
  phone:         u.phone || "",
  location:      u.location || "",
  memberSince:   u.memberSince || "",
  isVerified:    !!u.isVerified,
  isDealer:      !!u.isDealer,
  totalListings: u.totalListings ?? 0,
  trustScore:    u.trustScore ?? 0,
  status:        u.isBlocked ? "blocked" : "active",
  avatar:        u.avatar || "https://ui-avatars.com/api/?name=" + encodeURIComponent(u.name || "U"),
});

export function subscribeAdminUsers(cb: (users: AppUser[]) => void): Unsubscribe {
  if (!isFirebaseReady() || !db) { cb([]); return () => {}; }
  return onSnapshot(
    collection(db, "users"),
    (snap) => cb(snap.docs.map((d) => toAdminUser({ id: d.id, ...(d.data() as any) }))),
    (err) => console.warn("[admin/users] subscribe error:", err),
  );
}

export async function setAdminUserStatus(id: string, status: AppUser["status"]): Promise<void> {
  ensureReady();
  await updateDoc(doc(db!, "users", id), { isBlocked: status === "blocked" });
}

export async function setAdminUserVerified(id: string, verified = true): Promise<void> {
  ensureReady();
  await updateDoc(doc(db!, "users", id), { isVerified: verified });
}

/* ── Reports ───────────────────────────────────────────────────────── */

export function subscribeAdminReports(cb: (reports: Report[]) => void): Unsubscribe {
  if (!isFirebaseReady() || !db) { cb([]); return () => {}; }
  const q = query(collection(db, "reports"), orderBy("createdAt", "desc"));
  return onSnapshot(
    q,
    (snap) => cb(snap.docs.map((d) => {
      const data: any = d.data();
      // Normalise Firestore status → admin shape (open | resolved | dismissed).
      const raw = data.status || "open";
      const status: Report["status"] =
        raw === "reviewed"  ? "resolved"  :
        raw === "dismissed" ? "dismissed" :
        raw === "resolved"  ? "resolved"  :
        "open";
      return {
        id:         d.id,
        type:       data.targetType || data.type || "listing",
        targetId:   data.targetId || "",
        targetName: data.targetName || data.targetId || "—",
        reason:     data.reason || "",
        reportedBy: data.reporterName || data.reporterId || "Anonymous",
        createdAt:  typeof data.createdAt === "string"
                      ? data.createdAt
                      : (data.createdAt?.toDate?.()?.toISOString() || ""),
        status,
      } as Report;
    })),
    (err) => console.warn("[admin/reports] subscribe error:", err),
  );
}

export async function setAdminReportStatus(id: string, status: Report["status"]): Promise<void> {
  ensureReady();
  const fbStatus = status === "resolved" ? "reviewed" : status;
  await updateDoc(doc(db!, "reports", id), { status: fbStatus });
}
