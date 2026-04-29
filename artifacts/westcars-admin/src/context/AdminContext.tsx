/**
 * AdminContext — central data hub for the Westcars Admin dashboard.
 * Live-subscribes to Firestore when configured, falls back to mock data.
 */
import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { Car, AppUser, Report, MOCK_CARS, MOCK_USERS } from "@/data/mock";
import { isFirebaseReady } from "@/lib/firebase";
import {
  subscribeAdminCars,
  subscribeAdminUsers,
  subscribeAdminReports,
  setAdminCarStatus,
  deleteAdminCar,
  setAdminUserStatus,
  setAdminUserVerified,
  setAdminReportStatus,
} from "@/lib/firestore";

interface AdminContextValue {
  cars: Car[];
  users: AppUser[];
  reports: Report[];
  setCars: React.Dispatch<React.SetStateAction<Car[]>>;
  setUsers: React.Dispatch<React.SetStateAction<AppUser[]>>;
  updateCarStatus: (id: string, status: Car["status"]) => void;
  deleteCar: (id: string) => void;
  updateUserStatus: (id: string, status: AppUser["status"]) => void;
  verifyUser: (id: string) => void;
  resolveReport: (id: string) => void;
  dismissReport: (id: string) => void;
}

const AdminContext = createContext<AdminContextValue | null>(null);

export function AdminProvider({ children }: { children: React.ReactNode }) {
  const useFirebase = isFirebaseReady();

  const [cars, setCars]       = useState<Car[]>(useFirebase ? [] : MOCK_CARS);
  const [users, setUsers]     = useState<AppUser[]>(useFirebase ? [] : MOCK_USERS);
  const [reports, setReports] = useState<Report[]>([]);

  // ── Firestore subscriptions ──
  useEffect(() => {
    if (!useFirebase) return;
    const off1 = subscribeAdminCars(setCars);
    const off2 = subscribeAdminUsers(setUsers);
    const off3 = subscribeAdminReports(setReports);
    return () => { off1(); off2(); off3(); };
  }, [useFirebase]);

  // ── Mutations ──
  const updateCarStatus = useCallback((id: string, status: Car["status"]) => {
    if (useFirebase) {
      setAdminCarStatus(id, status).catch((e) => console.warn("[updateCarStatus]", e));
    } else {
      setCars((prev) => prev.map((c) => c.id === id ? { ...c, status } : c));
    }
  }, [useFirebase]);

  const deleteCar = useCallback((id: string) => {
    if (useFirebase) {
      deleteAdminCar(id).catch((e) => console.warn("[deleteCar]", e));
    } else {
      setCars((prev) => prev.filter((c) => c.id !== id));
    }
  }, [useFirebase]);

  const updateUserStatus = useCallback((id: string, status: AppUser["status"]) => {
    if (useFirebase) {
      setAdminUserStatus(id, status).catch((e) => console.warn("[updateUserStatus]", e));
    } else {
      setUsers((prev) => prev.map((u) => u.id === id ? { ...u, status } : u));
    }
  }, [useFirebase]);

  const verifyUser = useCallback((id: string) => {
    if (useFirebase) {
      setAdminUserVerified(id, true).catch((e) => console.warn("[verifyUser]", e));
    } else {
      setUsers((prev) => prev.map((u) => u.id === id ? { ...u, isVerified: true } : u));
    }
  }, [useFirebase]);

  const resolveReport = useCallback((id: string) => {
    if (useFirebase) {
      setAdminReportStatus(id, "resolved").catch((e) => console.warn("[resolveReport]", e));
    } else {
      setReports((prev) => prev.map((r) => r.id === id ? { ...r, status: "resolved" } : r));
    }
  }, [useFirebase]);

  const dismissReport = useCallback((id: string) => {
    if (useFirebase) {
      setAdminReportStatus(id, "dismissed").catch((e) => console.warn("[dismissReport]", e));
    } else {
      setReports((prev) => prev.map((r) => r.id === id ? { ...r, status: "dismissed" } : r));
    }
  }, [useFirebase]);

  return (
    <AdminContext.Provider value={{
      cars, users, reports, setCars, setUsers,
      updateCarStatus, deleteCar, updateUserStatus, verifyUser,
      resolveReport, dismissReport,
    }}>
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  const ctx = useContext(AdminContext);
  if (!ctx) throw new Error("useAdmin must be used inside AdminProvider");
  return ctx;
}
