import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { auth } from '@/lib/firebase-persistence';
import { db } from '@/lib/firebase';

export interface ChineseSellerProfile {
  isChineseSeller: boolean;
  wechatId?: string;
  locationInChina?: string;
  businessName?: string;
}

export interface SponsorshipInfo {
  tier?: string;
  adCredits?: number;
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
    const unsubscribe = onAuthStateChanged(auth!, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        try {
          const snap = await getDoc(doc(db, 'users', firebaseUser.uid));
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
    const { signInWithEmailAndPassword } = await import('firebase/auth');
    await signInWithEmailAndPassword(auth!, email.trim(), password);
  };

  const signUp = async (email: string, password: string, name: string) => {
    const { createUserWithEmailAndPassword, updateProfile } = await import('firebase/auth');
    const { user: newUser } = await createUserWithEmailAndPassword(auth!, email.trim(), password);
    await updateProfile(newUser, { displayName: name.trim() });
    await setDoc(doc(db, 'users', newUser.uid), {
      id: newUser.uid,
      displayName: name.trim(),
      name: name.trim(),
      email: email.trim(),
      phone: '',
      location: 'Accra',
      avatar: null,
      memberSince: new Date().toISOString().split('T')[0],
      isVerified: false,
      verification: { phone: false, id: false, dealer: false },
      rating: 0,
      totalReviews: 0,
      totalListings: 0,
      trustScore: 15,
      totalSales: 0,
      createdAt: serverTimestamp(),
      chineseSellerProfile: { isChineseSeller: false },
    });
  };

  const logOut = async () => {
    const { signOut } = await import('firebase/auth');
    await signOut(auth!);
  };

  const saveChineseProfile = async (profile: ChineseSellerProfile) => {
    if (!user) throw new Error('No user logged in');
    await updateDoc(doc(db, 'users', user.uid), { chineseSellerProfile: profile });
    setChineseProfile(profile);
  };

  return (
    <AuthContext.Provider value={{ user, loading, chineseProfile, sponsorship, signIn, signUp, logOut, saveChineseProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
