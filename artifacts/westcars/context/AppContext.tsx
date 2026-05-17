/**
 * AppContext — central data hub for the Westcars app.
 *
 * Wired to Firebase (Auth + Firestore) when EXPO_PUBLIC_FIREBASE_* secrets
 * are configured. Falls back to mock data + AsyncStorage when they are not,
 * so the project keeps building and previewing without secrets.
 */
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { Car, Conversation, Message, Report, Review, Transaction, User } from "@/types";
import { ADMIN_USER, MOCK_CARS, MOCK_CONVERSATIONS, MOCK_MESSAGES, MOCK_USERS } from "@/utils/mockData";
import { isFirebaseReady, db } from "@/lib/firebase";
import * as fb from "@/services/firebase";
import {
  collection, query, where, orderBy, onSnapshot,
  addDoc, updateDoc, doc, writeBatch, serverTimestamp,
} from 'firebase/firestore';

export interface AppNotification {
  id: string;
  userId: string;
  type: 'message' | 'saved' | 'listing_view' | 'listing_expiry' | 'listing_approved' | 'price_drop';
  title: string;
  body: string;
  carId?: string;
  carName?: string;
  fromUserId?: string;
  fromUserName?: string;
  read: boolean;
  createdAt: string;
}

interface AppContextType {
  currentUser: User | null;
  isAuthenticated: boolean;
  favorites: string[];
  cars: Car[];
  conversations: Conversation[];
  messages: Record<string, Message[]>;
  isLoading: boolean;
  reviews: Review[];
  reports: Report[];
  transactions: Transaction[];
  blockedUsers: string[];

  login: (email: string, password: string) => Promise<boolean>;
  signup: (name: string, email: string, phone: string, password: string) => Promise<boolean>;
  loginWithGoogle: (idToken: string, accessToken?: string) => Promise<boolean>;
  loginWithGooglePopup: () => Promise<boolean>;
  logout: () => void;
  toggleFavorite: (carId: string) => void;
  isFavorite: (carId: string) => boolean;
  addCar: (car: Omit<Car, "id" | "seller" | "rating" | "createdAt" | "isSponsored">) => Promise<string | null>;
  sendMessage: (conversationId: string, text: string, mediaUrl?: string, mediaType?: "image" | "video" | "audio") => void;
  startConversation: (car: Car) => Promise<string>;
  updateUserProfile: (updates: Partial<User>) => void;
  markAsSold: (carId: string) => void;
  renewListing: (carId: string) => void;
  submitReview: (review: Omit<Review, "id" | "createdAt">) => void;
  reportItem: (report: Omit<Report, "id" | "createdAt" | "status">) => void;
  blockUser: (userId: string) => void;
  unblockUser: (userId: string) => void;
  isBlocked: (userId: string) => boolean;
  verifyPhone: () => Promise<boolean>;
  verifyId: () => Promise<boolean>;
  toggleAnonymous: () => void;
  getUserReviews: (userId: string) => Review[];
  getSellerTrustScore: (user: User) => number;
  deleteMessage: (conversationId: string, messageId: string) => void;
  markMessagesRead: (conversationId: string) => void;

  dismissReport: (reportId: string) => void;
  resolveReport: (reportId: string, action: "dismiss" | "remove") => void;
  toggleCarVisibility: (carId: string) => void;
  deleteCar: (carId: string) => void;

  notifications: AppNotification[];
  unreadNotificationsCount: number;
  markNotificationRead: (notifId: string) => Promise<void>;
  markAllNotificationsRead: () => Promise<void>;
  createNotification: (data: Omit<AppNotification, 'id' | 'createdAt' | 'read'>) => Promise<void>;
}

const AppContext = createContext<AppContextType | null>(null);

const STORAGE_KEYS = {
  USER:             "@westcars_user",
  FAVORITES:        "@westcars_favorites",
  REVIEWS:          "@westcars_reviews",
  REPORTS:          "@westcars_reports",
  TRANSACTIONS:     "@westcars_transactions",
  BLOCKED:          "@westcars_blocked",
  CARS:             "@westcars_cars_v2",
  REGISTERED_USERS: "@westcars_registered_users",
};

// ── Mock review seed data (must be declared before AppProvider) ───────────────
const MOCK_REVIEWS: Review[] = [
  {
    id: "rev1", fromUserId: "user2", fromUserName: "Ama Mensah",
    fromUserAvatar: "https://randomuser.me/api/portraits/women/44.jpg",
    toUserId: "user1", carId: "car1", rating: 5,
    comment: "Very honest seller. Car was exactly as described. Smooth transaction!",
    createdAt: "2024-11-15T10:00:00Z",
  },
  {
    id: "rev2", fromUserId: "user3", fromUserName: "Kofi Boateng",
    fromUserAvatar: "https://randomuser.me/api/portraits/men/67.jpg",
    toUserId: "user1", carId: "car2", rating: 4,
    comment: "Good experience. Seller was responsive and fair on price.",
    createdAt: "2024-10-20T09:00:00Z",
  },
  {
    id: "rev3", fromUserId: "user1", fromUserName: "Kwame Asante",
    fromUserAvatar: "https://randomuser.me/api/portraits/men/32.jpg",
    toUserId: "user2", rating: 4,
    comment: "Reliable buyer. Payment was fast. Recommended!",
    createdAt: "2024-09-05T14:30:00Z",
  },
];

export function AppProvider({ children }: { children: React.ReactNode }) {
  // Gate: use Firebase whenever it has been initialised successfully.
  // The old `&& !__DEV__` guard was the root cause of mock data leaking into
  // production — if Firebase init failed silently (missing secrets, network
  // error, etc.) useFirebase became false in prod and MOCK_CARS pre-loaded.
  const [useFirebase, setUseFirebase] = useState(() => isFirebaseReady());

  useEffect(() => {
    if (!useFirebase && isFirebaseReady()) {
      setUseFirebase(true);
    }
  }, []);

  // Only seed mock data in dev builds when Firebase is also unavailable.
  // In production, if Firebase isn't ready we surface an error — never mocks.
  const useMocks = !useFirebase && __DEV__;

  if (!useFirebase && !__DEV__) {
    console.error(
      "[AppContext] PRODUCTION: Firebase is not ready — real data unavailable. " +
      "Check that all EXPO_PUBLIC_FIREBASE_* env vars are set in the EAS build."
    );
  }

  const [currentUser,    setCurrentUser]    = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [favorites,      setFavorites]      = useState<string[]>([]);
  const [cars,           setCars]           = useState<Car[]>(useMocks ? MOCK_CARS : []);
  const [conversations,  setConversations]  = useState<Conversation[]>(useMocks ? MOCK_CONVERSATIONS : []);
  const [messages,       setMessages]       = useState<Record<string, Message[]>>(
    useMocks ? { conv1: MOCK_MESSAGES, conv2: [] } : {},
  );
  const [isLoading,      setIsLoading]      = useState(true);
  const [reviews,        setReviews]        = useState<Review[]>(useMocks ? MOCK_REVIEWS : []);
  const [reports,        setReports]        = useState<Report[]>([]);
  const [transactions,   setTransactions]   = useState<Transaction[]>([]);
  const [blockedUsers,   setBlockedUsers]   = useState<string[]>([]);
  const [notifications,  setNotifications]  = useState<AppNotification[]>([]);

  // Track per-conversation message subscriptions so we can clean up.
  const messageSubsRef = useRef<Record<string, () => void>>({});

  // ── Bootstrap ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (useFirebase) {
      // Firebase mode — auth state is the source of truth.
      const unsub = fb.subscribeAuth((u) => {
        setCurrentUser((prev) => {
          // Skip redundant re-render when same user is already in state
          if (prev?.id && prev.id === u?.id) return prev;
          return u;
        });
        setIsAuthenticated(!!u);
        setFavorites(u?.favorites as string[] | undefined ?? []);
        setBlockedUsers(u?.blockedUsers ?? []);
        setIsLoading(false);
      });
      // Also load favorites cache for instant UI
      AsyncStorage.getItem(STORAGE_KEYS.FAVORITES).then((raw) => {
        if (raw) try { setFavorites(JSON.parse(raw)); } catch {}
      });
      return () => unsub();
    }
    // Mock mode — preserve the original AsyncStorage flow.
    loadMockStored();
  }, [useFirebase]);

  const loadMockStored = async () => {
    try {
      const [storedUser, storedFavs, storedReviews, storedReports, storedBlocked] =
        await Promise.all([
          AsyncStorage.getItem(STORAGE_KEYS.USER),
          AsyncStorage.getItem(STORAGE_KEYS.FAVORITES),
          AsyncStorage.getItem(STORAGE_KEYS.REVIEWS),
          AsyncStorage.getItem(STORAGE_KEYS.REPORTS),
          AsyncStorage.getItem(STORAGE_KEYS.BLOCKED),
        ]);
      if (storedUser)    { const u = JSON.parse(storedUser); setCurrentUser(u); setIsAuthenticated(true); }
      if (storedFavs)    setFavorites(JSON.parse(storedFavs));
      if (storedReviews) setReviews([...MOCK_REVIEWS, ...JSON.parse(storedReviews)]);
      if (storedReports) setReports(JSON.parse(storedReports));
      if (storedBlocked) setBlockedUsers(JSON.parse(storedBlocked));
    } catch { /* ignore */ }
    finally { setIsLoading(false); }
  };

  // ── Firestore live subscriptions ─────────────────────────────────────────
  useEffect(() => {
    if (!useFirebase) return;
    const unsub = fb.subscribeCars(setCars);
    return () => unsub();
  }, [useFirebase]);

  useEffect(() => {
    if (!useFirebase) return;
    const unsub = fb.subscribeReviews(setReviews);
    return () => unsub();
  }, [useFirebase]);

  useEffect(() => {
    if (!useFirebase || !currentUser?.isAdmin) return;
    const unsub = fb.subscribeReports(setReports);
    return () => unsub();
  }, [useFirebase, currentUser?.isAdmin]);

  useEffect(() => {
    if (!useFirebase || !currentUser?.id) {
      setConversations([]);
      return;
    }
    const unsub = fb.subscribeConversations(currentUser.id, setConversations);
    return () => unsub();
  }, [useFirebase, currentUser?.id]);

  // For each visible conversation, subscribe to its messages (and clean up old ones).
  useEffect(() => {
    if (!useFirebase) return;
    const visibleIds = new Set(conversations.map((c) => c.id));
    // Tear down subs for convos no longer visible
    for (const id of Object.keys(messageSubsRef.current)) {
      if (!visibleIds.has(id)) {
        messageSubsRef.current[id]();
        delete messageSubsRef.current[id];
      }
    }
    // Spin up subs for new convos
    for (const id of visibleIds) {
      if (!messageSubsRef.current[id]) {
        messageSubsRef.current[id] = fb.subscribeMessages(id, (msgs) => {
          setMessages((prev) => ({ ...prev, [id]: msgs }));
        });
      }
    }
  }, [useFirebase, conversations]);

  useEffect(() => () => {
    // Final cleanup
    for (const off of Object.values(messageSubsRef.current)) off();
    messageSubsRef.current = {};
  }, []);

  useEffect(() => {
    if (!currentUser?.id || !db) return;
    const q = query(
      collection(db, 'notifications'),
      where('userId', '==', currentUser.id),
      orderBy('createdAt', 'desc')
    );
    const unsub = onSnapshot(q, (snap) => {
      setNotifications(
        snap.docs.map((d) => ({ id: d.id, ...d.data() } as AppNotification))
      );
    });
    return unsub;
  }, [currentUser?.id]);

  // ── Auth ─────────────────────────────────────────────────────────────────
  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    if (useFirebase) {
      // Let Firebase errors propagate — callers handle them with authErrorMessage().
      const user = await fb.signInEmail(email, password);
      // onAuthStateChanged will populate currentUser; pre-fill for snappier UX.
      setCurrentUser(user);
      setIsAuthenticated(true);
      return true;
    }
    // ── Mock fallback ──
    const normalised = email.toLowerCase().trim();
    if (normalised === "admin@westcars.gh") {
      const u = { ...ADMIN_USER };
      setCurrentUser(u); setIsAuthenticated(true);
      await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(u));
      return true;
    }
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEYS.REGISTERED_USERS);
      if (raw) {
        const map: Record<string, User> = JSON.parse(raw);
        if (map[normalised]) {
          const u = map[normalised];
          setCurrentUser(u); setIsAuthenticated(true);
          await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(u));
          return true;
        }
      }
    } catch { /* ignore */ }
    const u: User = {
      id: "currentUser",
      name: email.split("@")[0] || "Guest",
      phone: "", email, location: "Accra",
      memberSince: new Date().toISOString().split("T")[0],
      isVerified: false,
      verification: { phone: false, id: false, dealer: false },
      rating: 0, totalReviews: 0, totalListings: 0, trustScore: 15, totalSales: 0,
    };
    setCurrentUser(u); setIsAuthenticated(true);
    await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(u));
    return true;
  }, [useFirebase]);

  const signup = useCallback(async (name: string, email: string, phone: string, password: string): Promise<boolean> => {
    if (useFirebase) {
      // Let Firebase errors propagate — callers handle them with authErrorMessage().
      const user = await fb.signUpEmail(name, email, phone, password);
      setCurrentUser(user);
      setIsAuthenticated(true);
      return true;
    }
    // ── Mock fallback ──
    const normalised = email.toLowerCase().trim();
    const u: User = {
      id: `user_${Date.now()}`,
      name, phone, email: normalised, location: "Accra",
      memberSince: new Date().toISOString().split("T")[0],
      isVerified: false,
      verification: { phone: false, id: false, dealer: false },
      rating: 0, totalReviews: 0, totalListings: 0, trustScore: 15, totalSales: 0,
    };
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEYS.REGISTERED_USERS);
      const map: Record<string, User> = raw ? JSON.parse(raw) : {};
      map[normalised] = u;
      await AsyncStorage.setItem(STORAGE_KEYS.REGISTERED_USERS, JSON.stringify(map));
    } catch { /* ignore */ }
    setCurrentUser(u); setIsAuthenticated(true);
    await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(u));
    return true;
  }, [useFirebase]);

  const loginWithGoogle = useCallback(async (idToken: string, accessToken?: string): Promise<boolean> => {
    if (!useFirebase) return false;
    try {
      const { auth } = await import('@/lib/firebase-persistence');
      const { GoogleAuthProvider, signInWithCredential } = await import('firebase/auth');
      if (!auth) return false;
      const credential = GoogleAuthProvider.credential(idToken, accessToken);
      const result = await signInWithCredential(auth, credential);
      const fbUser = result.user;
      const { db } = await import('@/lib/firebase');
      const { doc, setDoc, getDoc, serverTimestamp } = await import('firebase/firestore');
      if (db) {
        const ref = doc(db, 'users', fbUser.uid);
        const snap = await getDoc(ref);
        if (!snap.exists()) {
          await setDoc(ref, {
            id: fbUser.uid,
            name: fbUser.displayName ?? 'User',
            email: fbUser.email ?? '',
            phone: '',
            photoURL: fbUser.photoURL ?? '',
            createdAt: serverTimestamp(),
            favorites: [],
            blockedUsers: [],
          });
        }
      }
      return true;
    } catch (err) {
      console.error('[Google sign-in]', err);
      return false;
    }
  }, [useFirebase]);

  const loginWithGooglePopup = useCallback(async (): Promise<boolean> => {
    return false; // login.tsx uses GoogleAuthBridge promptRef directly
  }, []);

  const logout = useCallback(async () => {
    if (useFirebase) {
      try { await fb.signOut(); } catch { /* ignore */ }
    }
    setCurrentUser(null); setIsAuthenticated(false);
    await AsyncStorage.removeItem(STORAGE_KEYS.USER);
  }, [useFirebase]);

  // ── Notifications ────────────────────────────────────────────────────────
  const createNotification = useCallback(async (data: Omit<AppNotification, 'id' | 'createdAt' | 'read'>) => {
    if (!db) return;
    await addDoc(collection(db, 'notifications'), {
      ...data,
      read: false,
      createdAt: new Date().toISOString(),
    });
  }, []);

  const markNotificationRead = useCallback(async (notifId: string) => {
    if (!db) return;
    await updateDoc(doc(db, 'notifications', notifId), { read: true });
  }, []);

  const markAllNotificationsRead = useCallback(async () => {
    if (!db || !currentUser?.id) return;
    const firestore = db;
    const batch = writeBatch(firestore);
    notifications
      .filter((n) => !n.read)
      .forEach((n) => batch.update(doc(firestore, 'notifications', n.id), { read: true }));
    await batch.commit();
  }, [currentUser?.id, notifications]);

  // ── Favorites ────────────────────────────────────────────────────────────
  const toggleFavorite = useCallback((carId: string) => {
    const isAdding = !favorites.includes(carId);
    setFavorites((prev) => {
      const next = prev.includes(carId) ? prev.filter((id) => id !== carId) : [...prev, carId];
      AsyncStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(next));
      // Persist to user doc when authenticated.
      if (useFirebase && currentUser?.id) {
        fb.updateUser(currentUser.id, { favorites: next } as any).catch(() => {});
      }
      return next;
    });
    if (isAdding && currentUser?.id) {
      const car = cars.find((c) => c.id === carId);
      if (car && car.sellerId !== currentUser.id) {
        createNotification({
          userId: car.sellerId,
          type: 'saved',
          title: 'Someone saved your listing',
          body: `${currentUser.name ?? 'A buyer'} saved your ${(car as any).title ?? `${(car as any).make} ${(car as any).model}`}`,
          carId: car.id,
          carName: (car as any).title ?? `${(car as any).make} ${(car as any).model}`,
          fromUserId: currentUser.id,
          fromUserName: currentUser.name ?? 'A buyer',
        }).catch(() => {});
      }
    }
  }, [useFirebase, currentUser, favorites, cars, createNotification]);

  const isFavorite = useCallback((carId: string) => favorites.includes(carId), [favorites]);

  // ── Cars ─────────────────────────────────────────────────────────────────
  const addCar = useCallback(async (carData: Omit<Car, "id" | "seller" | "rating" | "createdAt" | "isSponsored">): Promise<string | null> => {
    const now = new Date();
    const expires = new Date(now); expires.setDate(expires.getDate() + 30);
    const seller = currentUser || MOCK_USERS[0];
    const newCar: Omit<Car, "id"> = {
      ...carData,
      seller,
      sellerId: currentUser?.id || "currentUser",
      rating: { overall: 0, comfort: 0, ergonomics: 0, performance: 0, safety: 0, reliability: 0, totalRatings: 0 },
      createdAt: now.toISOString().split("T")[0],
      expiresAt: expires.toISOString().split("T")[0],
      isSponsored: false,
      reportCount: 0,
    };
    if (useFirebase) {
      try { return await fb.createCar(newCar); }
      catch (err) { console.warn("[addCar] failed:", err); return null; }
    }
    const localId = `car_${Date.now()}`;
    setCars((prev) => [{ id: localId, ...newCar }, ...prev]);
    return localId;
  }, [currentUser, useFirebase]);

  const markAsSold = useCallback((carId: string) => {
    if (useFirebase) {
      fb.markCarSold(carId).catch((e) => console.warn("[markSold]", e));
    } else {
      setCars((prev) => prev.map((c) => c.id === carId ? { ...c, isSold: true } : c));
    }
    const tx: Transaction = {
      id: `tx_${Date.now()}`,
      carId,
      sellerId: currentUser?.id || "currentUser",
      buyerId: "unknown",
      confirmedAt: new Date().toISOString(),
    };
    setTransactions((prev) => [tx, ...prev]);
    if (currentUser) {
      const updated = { ...currentUser, totalSales: (currentUser.totalSales || 0) + 1 };
      setCurrentUser(updated);
      if (useFirebase) fb.updateUser(currentUser.id, { totalSales: updated.totalSales }).catch(() => {});
      else AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(updated));
    }
  }, [currentUser, useFirebase]);

  const renewListing = useCallback((carId: string) => {
    if (useFirebase) {
      fb.renewCar(carId).catch((e) => console.warn("[renew]", e));
      return;
    }
    const expires = new Date(); expires.setDate(expires.getDate() + 30);
    setCars((prev) =>
      prev.map((c) => c.id === carId ? { ...c, expiresAt: expires.toISOString().split("T")[0] } : c),
    );
  }, [useFirebase]);

  // ── Messages ─────────────────────────────────────────────────────────────
  const startConversation = useCallback(async (car: Car): Promise<string> => {
    if (useFirebase && currentUser?.id) {
      try { return await fb.getOrCreateConversation(currentUser.id, car); }
      catch (err) { console.warn("[startConv]", err); }
    }
    const existing = conversations.find((c) => c.carId === car.id);
    if (existing) return existing.id;
    const id = `conv_${Date.now()}`;
    const newConv: Conversation = {
      id, participantId: car.sellerId,
      participant: car.seller || MOCK_USERS[0],
      carId: car.id, car,
      lastMessage: "", lastMessageTime: new Date().toISOString(), unreadCount: 0,
    };
    setConversations((prev) => [newConv, ...prev]);
    setMessages((prev) => ({ ...prev, [id]: [] }));
    return id;
  }, [conversations, currentUser?.id, useFirebase]);

  const sendMessage = useCallback((conversationId: string, text: string, mediaUrl?: string, mediaType?: "image" | "video" | "audio") => {
    if (useFirebase && currentUser?.id) {
      fb.sendMessage(conversationId, currentUser.id, text, mediaUrl, mediaType)
        .then(() => {
          const conv = conversations.find((c) => c.id === conversationId);
          const otherUserId = (conv as any)?.participantId ?? (conv as any)?.participantIds?.find((id: string) => id !== currentUser?.id);
          if (otherUserId) {
            createNotification({
              userId: otherUserId,
              type: 'message',
              title: 'New message',
              body: `${(currentUser as any).displayName ?? currentUser.name ?? 'Someone'} sent you a message`,
              fromUserId: currentUser.id,
              fromUserName: (currentUser as any).displayName ?? currentUser.name ?? 'Someone',
            }).catch(() => {});
          }
        })
        .catch((e) => console.warn("[sendMessage]", e));
      return;
    }
    // Mock fallback (with the original auto-reply for demo continuity)
    const msg: Message = {
      id: `msg_${Date.now()}`, conversationId,
      senderId: currentUser?.id || "currentUser",
      text, timestamp: new Date().toISOString(),
      ...(mediaUrl ? { mediaUrl, mediaType } : {}),
      isRead: false,
    };
    setMessages((prev) => ({ ...prev, [conversationId]: [...(prev[conversationId] || []), msg] }));
    setConversations((prev) => prev.map((c) =>
      c.id === conversationId ? { ...c, lastMessage: text || "📷 Photo", lastMessageTime: new Date().toISOString() } : c,
    ));
    setTimeout(() => {
      const reply: Message = {
        id: `msg_${Date.now()}_r`, conversationId, senderId: "other",
        text: "Thanks for your message! I'll get back to you shortly.",
        timestamp: new Date().toISOString(), isRead: false,
      };
      setMessages((prev) => ({ ...prev, [conversationId]: [...(prev[conversationId] || []), reply] }));
      setConversations((prev) => prev.map((c) =>
        c.id === conversationId ? { ...c, unreadCount: c.unreadCount + 1 } : c,
      ));
    }, 1500);
  }, [currentUser, useFirebase, conversations, createNotification]);

  const deleteMessage = useCallback((conversationId: string, messageId: string) => {
    if (useFirebase) {
      fb.softDeleteMessage(conversationId, messageId).catch((e) => console.warn("[delMsg]", e));
      return;
    }
    setMessages((prev) => ({
      ...prev,
      [conversationId]: (prev[conversationId] || []).map((m) =>
        m.id === messageId ? { ...m, isDeletedForSelf: true } : m,
      ),
    }));
  }, [useFirebase]);

  const markMessagesRead = useCallback((conversationId: string) => {
    if (useFirebase) {
      fb.markConversationRead(conversationId).catch(() => {});
      return;
    }
    setConversations((prev) => prev.map((c) => c.id === conversationId ? { ...c, unreadCount: 0 } : c));
    setMessages((prev) => ({
      ...prev,
      [conversationId]: (prev[conversationId] || []).map((m) => ({ ...m, isRead: true })),
    }));
  }, [useFirebase]);

  // ── Profile ──────────────────────────────────────────────────────────────
  const updateUserProfile = useCallback(async (updates: Partial<User>) => {
    setCurrentUser((prev) => {
      if (!prev) return prev;
      const updated = { ...prev, ...updates };
      if (useFirebase) fb.updateUser(prev.id, updates).catch(() => {});
      else AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(updated));
      return updated;
    });
  }, [useFirebase]);

  const toggleAnonymous = useCallback(() => {
    setCurrentUser((prev) => {
      if (!prev) return prev;
      const updated = { ...prev, isAnonymous: !prev.isAnonymous };
      if (useFirebase) fb.updateUser(prev.id, { isAnonymous: updated.isAnonymous }).catch(() => {});
      else AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(updated));
      return updated;
    });
  }, [useFirebase]);

  // ── Verification ─────────────────────────────────────────────────────────
  const verifyPhone = useCallback(async (): Promise<boolean> => {
    await new Promise((r) => setTimeout(r, 800));
    if (!currentUser) return false;
    const updated: User = {
      ...currentUser,
      isVerified: true,
      verification: { ...(currentUser.verification || { phone: false, id: false, dealer: false }), phone: true },
      trustScore: Math.min(100, (currentUser.trustScore || 0) + 20),
    };
    setCurrentUser(updated);
    if (useFirebase) {
      fb.updateUser(currentUser.id, {
        isVerified: true,
        verification: updated.verification,
        trustScore: updated.trustScore,
      }).catch(() => {});
    } else {
      await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(updated));
    }
    return true;
  }, [currentUser, useFirebase]);

  const verifyId = useCallback(async (): Promise<boolean> => {
    await new Promise((r) => setTimeout(r, 1200));
    if (!currentUser) return false;
    const updated: User = {
      ...currentUser,
      isVerified: true,
      verification: { ...(currentUser.verification || { phone: false, id: false, dealer: false }), id: true },
      trustScore: Math.min(100, (currentUser.trustScore || 0) + 30),
    };
    setCurrentUser(updated);
    if (useFirebase) {
      fb.updateUser(currentUser.id, {
        isVerified: true,
        verification: updated.verification,
        trustScore: updated.trustScore,
      }).catch(() => {});
    } else {
      await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(updated));
    }
    return true;
  }, [currentUser, useFirebase]);

  // ── Reviews ──────────────────────────────────────────────────────────────
  const submitReview = useCallback((review: Omit<Review, "id" | "createdAt">) => {
    if (useFirebase) {
      fb.createReview(review).catch((e) => console.warn("[submitReview]", e));
      return;
    }
    const newReview: Review = { ...review, id: `rev_${Date.now()}`, createdAt: new Date().toISOString() };
    setReviews((prev) => {
      const next = [newReview, ...prev];
      AsyncStorage.setItem(STORAGE_KEYS.REVIEWS, JSON.stringify(next.filter((r) => !MOCK_REVIEWS.find((m) => m.id === r.id))));
      return next;
    });
  }, [useFirebase]);

  const getUserReviews = useCallback((userId: string) =>
    reviews.filter((r) => r.toUserId === userId),
  [reviews]);

  // ── Reports ──────────────────────────────────────────────────────────────
  const reportItem = useCallback((report: Omit<Report, "id" | "createdAt" | "status">) => {
    if (useFirebase) {
      fb.createReport(report).catch((e) => console.warn("[reportItem]", e));
      // Auto-hide @ 3 reports is enforced by reportContent Cloud Function.
      return;
    }
    const newReport: Report = { ...report, id: `rep_${Date.now()}`, createdAt: new Date().toISOString(), status: "pending" };
    setReports((prev) => {
      const next = [newReport, ...prev];
      AsyncStorage.setItem(STORAGE_KEYS.REPORTS, JSON.stringify(next));
      return next;
    });
    if (report.targetType === "listing") {
      setCars((prev) => prev.map((c) => {
        if (c.id !== report.targetId) return c;
        const count = (c.reportCount || 0) + 1;
        return { ...c, reportCount: count, isHidden: count >= 3 };
      }));
    }
  }, [useFirebase]);

  // ── Admin Actions ────────────────────────────────────────────────────────
  const dismissReport = useCallback((reportId: string) => {
    if (useFirebase) {
      fb.setReportStatus(reportId, "dismissed").catch(() => {});
      return;
    }
    setReports((prev) => {
      const next = prev.map((r) => r.id === reportId ? { ...r, status: "dismissed" as const } : r);
      AsyncStorage.setItem(STORAGE_KEYS.REPORTS, JSON.stringify(next));
      return next;
    });
  }, [useFirebase]);

  const resolveReport = useCallback((reportId: string, action: "dismiss" | "remove") => {
    if (useFirebase) {
      const target = reports.find((r) => r.id === reportId);
      fb.setReportStatus(reportId, "reviewed").catch(() => {});
      if (action === "remove" && target?.targetType === "listing") {
        fb.deleteCar(target.targetId).catch(() => {});
      }
      return;
    }
    setReports((prev) => {
      const report = prev.find((r) => r.id === reportId);
      const next = prev.map((r) => r.id === reportId ? { ...r, status: "reviewed" as const } : r);
      AsyncStorage.setItem(STORAGE_KEYS.REPORTS, JSON.stringify(next));
      if (action === "remove" && report?.targetType === "listing") {
        setCars((cars) => cars.filter((c) => c.id !== report.targetId));
      }
      return next;
    });
  }, [reports, useFirebase]);

  const toggleCarVisibility = useCallback((carId: string) => {
    const car = cars.find((c) => c.id === carId);
    if (useFirebase) {
      fb.setCarHidden(carId, !car?.isHidden).catch(() => {});
      return;
    }
    setCars((prev) => prev.map((c) => c.id === carId ? { ...c, isHidden: !c.isHidden } : c));
  }, [cars, useFirebase]);

  const deleteCar = useCallback((carId: string) => {
    if (useFirebase) {
      fb.deleteCar(carId).catch(() => {});
      return;
    }
    setCars((prev) => prev.filter((c) => c.id !== carId));
  }, [useFirebase]);

  // ── Block ────────────────────────────────────────────────────────────────
  const blockUser = useCallback((userId: string) => {
    setBlockedUsers((prev) => {
      if (prev.includes(userId)) return prev;
      const next = [...prev, userId];
      AsyncStorage.setItem(STORAGE_KEYS.BLOCKED, JSON.stringify(next));
      if (useFirebase && currentUser?.id) {
        fb.updateUser(currentUser.id, { blockedUsers: next }).catch(() => {});
      }
      return next;
    });
  }, [useFirebase, currentUser?.id]);

  const unblockUser = useCallback((userId: string) => {
    setBlockedUsers((prev) => {
      const next = prev.filter((id) => id !== userId);
      AsyncStorage.setItem(STORAGE_KEYS.BLOCKED, JSON.stringify(next));
      if (useFirebase && currentUser?.id) {
        fb.updateUser(currentUser.id, { blockedUsers: next }).catch(() => {});
      }
      return next;
    });
  }, [useFirebase, currentUser?.id]);

  const isBlocked = useCallback((userId: string) => blockedUsers.includes(userId), [blockedUsers]);

  // ── Trust Score ──────────────────────────────────────────────────────────
  const getSellerTrustScore = useCallback((user: User): number => {
    if (user.trustScore !== undefined) return user.trustScore;
    let score = 0;
    const v = user.verification;
    if (v?.phone)  score += 20;
    if (v?.id)     score += 25;
    if (v?.dealer) score += 15;
    if (user.rating > 0) score += Math.round(user.rating * 6);
    const months = Math.floor((Date.now() - new Date(user.memberSince).getTime()) / (30 * 24 * 60 * 60 * 1000));
    score += Math.min(10, months);
    score += Math.min(10, (user.totalSales || 0) * 2);
    return Math.min(100, score);
  }, []);

  const ctxValue = useMemo<AppContextType>(() => ({
    currentUser, isAuthenticated, favorites, cars, conversations, messages,
    isLoading, reviews, reports, transactions, blockedUsers,
    login, signup, loginWithGoogle, loginWithGooglePopup, logout, toggleFavorite, isFavorite, addCar, sendMessage,
    startConversation, updateUserProfile, markAsSold, renewListing, submitReview,
    reportItem, blockUser, unblockUser, isBlocked, verifyPhone, verifyId,
    toggleAnonymous, getUserReviews, getSellerTrustScore, deleteMessage, markMessagesRead,
    dismissReport, resolveReport, toggleCarVisibility, deleteCar,
    notifications,
    unreadNotificationsCount: notifications.filter((n) => !n.read).length,
    markNotificationRead,
    markAllNotificationsRead,
    createNotification,
  }), [
    currentUser, isAuthenticated, favorites, cars, conversations, messages, isLoading,
    reviews, reports, transactions, blockedUsers,
    login, signup, loginWithGoogle, loginWithGooglePopup, logout, toggleFavorite, isFavorite, addCar, sendMessage,
    startConversation, updateUserProfile, markAsSold, renewListing, submitReview,
    reportItem, blockUser, unblockUser, isBlocked, verifyPhone, verifyId,
    toggleAnonymous, getUserReviews, getSellerTrustScore, deleteMessage, markMessagesRead,
    dismissReport, resolveReport, toggleCarVisibility, deleteCar,
    notifications, markNotificationRead, markAllNotificationsRead, createNotification,
  ]);

  return <AppContext.Provider value={ctxValue}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
