import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  updateProfile,
  type User,
} from 'firebase/auth';  // ← FIXED: was '@firebase/auth'
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { auth } from '@/lib/firebase-persistence';
import { db } from '@/lib/firebase';

export interface SponsorshipInfo {
  tier?: string;
  adCredits?: number;
}

export interface ChineseSellerProfile {
  isChineseSeller: boolean;
  wechatId?: string;
  locationInChina?: string;
  businessName?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  chineseProfile: ChineseSellerProfile | null;
  sponsorship: SponsorshipInfo | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  logOut: () => Promise<void>;
  saveChineseProfile: (profile: ChineseSellerProfile) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [chineseProfile, setChineseProfile] = useState<ChineseSellerProfile | null>(null);
  const [sponsorship, setSponsorship] = useState<SponsorshipInfo | null>(null);

  useEffect(() => {
    if (!auth) {
      setLoading(false);
      return;
    }
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        try {
          const ref = doc(db, 'users', firebaseUser.uid);
          const snap = await getDoc(ref);
          if (snap.exists()) {
            const data = snap.data();
            setChineseProfile(data?.chineseSellerProfile ?? null);
            setSponsorship(data?.sponsorship ?? null);
          }
        } catch (e) {
          console.error('[AuthContext] Firestore fetch failed:', e);
        }
      } else {
        setChineseProfile(null);
        setSponsorship(null);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const signIn = async (email: string, password: string) => {
    if (!auth) throw new Error('Auth not available');
    await signInWithEmailAndPassword(auth, email.trim(), password);
  };

  const signUp = async (email: string, password: string, name: string) => {
    if (!auth) throw new Error('Auth not available');
    const { user: newUser } = await createUserWithEmailAndPassword(auth, email.trim(), password);
    await updateProfile(newUser, { displayName: name.trim() });
    await setDoc(doc(db, 'users', newUser.uid), {
      displayName: name.trim(),
      email: email.trim(),
      createdAt: serverTimestamp(),
      chineseSellerProfile: { isChineseSeller: false },
    });
  };

  const logOut = async () => {
    if (!auth) throw new Error('Auth not available');
    await signOut(auth);
  };

  const saveChineseProfile = async (profile: ChineseSellerProfile) => {
    if (!user) throw new Error('No user logged in');
    const ref = doc(db, 'users', user.uid);
    await updateDoc(ref, { chineseSellerProfile: profile });
    setChineseProfile(profile);
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, chineseProfile, sponsorship, signIn, signUp, logOut, saveChineseProfile }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
