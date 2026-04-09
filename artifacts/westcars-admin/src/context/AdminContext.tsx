import React, { createContext, useContext, useState, useCallback } from "react";
import { Car, AppUser, MOCK_CARS, MOCK_USERS } from "@/data/mock";

interface AdminContextValue {
  cars: Car[];
  users: AppUser[];
  setCars: React.Dispatch<React.SetStateAction<Car[]>>;
  setUsers: React.Dispatch<React.SetStateAction<AppUser[]>>;
  updateCarStatus: (id: string, status: Car["status"]) => void;
  deleteCar: (id: string) => void;
  updateUserStatus: (id: string, status: AppUser["status"]) => void;
  verifyUser: (id: string) => void;
}

const AdminContext = createContext<AdminContextValue | null>(null);

export function AdminProvider({ children }: { children: React.ReactNode }) {
  const [cars, setCars] = useState<Car[]>(MOCK_CARS);
  const [users, setUsers] = useState<AppUser[]>(MOCK_USERS);

  const updateCarStatus = useCallback((id: string, status: Car["status"]) => {
    setCars(prev => prev.map(c => c.id === id ? { ...c, status } : c));
  }, []);

  const deleteCar = useCallback((id: string) => {
    setCars(prev => prev.filter(c => c.id !== id));
  }, []);

  const updateUserStatus = useCallback((id: string, status: AppUser["status"]) => {
    setUsers(prev => prev.map(u => u.id === id ? { ...u, status } : u));
  }, []);

  const verifyUser = useCallback((id: string) => {
    setUsers(prev => prev.map(u => u.id === id ? { ...u, isVerified: true } : u));
  }, []);

  return (
    <AdminContext.Provider value={{ cars, users, setCars, setUsers, updateCarStatus, deleteCar, updateUserStatus, verifyUser }}>
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  const ctx = useContext(AdminContext);
  if (!ctx) throw new Error("useAdmin must be used inside AdminProvider");
  return ctx;
}
