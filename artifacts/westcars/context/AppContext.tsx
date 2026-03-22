import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { Car, Conversation, Message, Report, Review, Transaction, User } from "@/types";
import { ADMIN_USER, MOCK_CARS, MOCK_CONVERSATIONS, MOCK_MESSAGES, MOCK_USERS } from "@/utils/mockData";

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
  logout: () => void;
  toggleFavorite: (carId: string) => void;
  isFavorite: (carId: string) => boolean;
  addCar: (car: Omit<Car, "id" | "seller" | "rating" | "createdAt" | "isSponsored">) => void;
  sendMessage: (conversationId: string, text: string, mediaUrl?: string, mediaType?: "image" | "voice") => void;
  startConversation: (car: Car) => string;
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
}

const AppContext = createContext<AppContextType | null>(null);

const STORAGE_KEYS = {
  USER:          "@westcars_user",
  FAVORITES:     "@westcars_favorites",
  REVIEWS:       "@westcars_reviews",
  REPORTS:       "@westcars_reports",
  TRANSACTIONS:  "@westcars_transactions",
  BLOCKED:       "@westcars_blocked",
  CARS:          "@westcars_cars_v2",
};

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [currentUser,    setCurrentUser]    = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [favorites,      setFavorites]      = useState<string[]>([]);
  const [cars,           setCars]           = useState<Car[]>(MOCK_CARS);
  const [conversations,  setConversations]  = useState<Conversation[]>(MOCK_CONVERSATIONS);
  const [messages,       setMessages]       = useState<Record<string, Message[]>>({
    conv1: MOCK_MESSAGES,
    conv2: [],
  });
  const [isLoading,      setIsLoading]      = useState(true);
  const [reviews,        setReviews]        = useState<Review[]>(MOCK_REVIEWS);
  const [reports,        setReports]        = useState<Report[]>([]);
  const [transactions,   setTransactions]   = useState<Transaction[]>([]);
  const [blockedUsers,   setBlockedUsers]   = useState<string[]>([]);

  useEffect(() => {
    loadStoredData();
  }, []);

  const loadStoredData = async () => {
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
    finally  { setIsLoading(false); }
  };

  // ── Auth ──────────────────────────────────────────────────────────────
  const login = useCallback(async (email: string, _pw: string): Promise<boolean> => {
    const isAdmin = email.toLowerCase().trim() === "admin@westcars.gh";
    const u: User = isAdmin ? { ...ADMIN_USER } : {
      id: "currentUser",
      name: "Akosua Darko",
      phone: "+233 24 555 0000",
      email,
      location: "Accra",
      avatar: "https://randomuser.me/api/portraits/women/68.jpg",
      memberSince: "2024-01-01",
      isVerified: false,
      verification: { phone: false, id: false, dealer: false },
      rating: 4.1,
      totalReviews: 3,
      totalListings: 0,
      trustScore: 42,
      totalSales: 0,
    };
    setCurrentUser(u); setIsAuthenticated(true);
    await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(u));
    return true;
  }, []);

  const signup = useCallback(async (name: string, email: string, phone: string, _pw: string): Promise<boolean> => {
    const u: User = {
      id: "currentUser",
      name, phone, email,
      location: "Accra",
      memberSince: new Date().toISOString().split("T")[0],
      isVerified: false,
      verification: { phone: false, id: false, dealer: false },
      rating: 0,
      totalReviews: 0,
      totalListings: 0,
      trustScore: 15,
      totalSales: 0,
    };
    setCurrentUser(u); setIsAuthenticated(true);
    await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(u));
    return true;
  }, []);

  const logout = useCallback(async () => {
    setCurrentUser(null); setIsAuthenticated(false);
    await AsyncStorage.removeItem(STORAGE_KEYS.USER);
  }, []);

  // ── Favorites ──────────────────────────────────────────────────────────
  const toggleFavorite = useCallback((carId: string) => {
    setFavorites((prev) => {
      const next = prev.includes(carId) ? prev.filter((id) => id !== carId) : [...prev, carId];
      AsyncStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(next));
      return next;
    });
  }, []);

  const isFavorite = useCallback((carId: string) => favorites.includes(carId), [favorites]);

  // ── Cars ───────────────────────────────────────────────────────────────
  const addCar = useCallback((carData: Omit<Car, "id" | "seller" | "rating" | "createdAt" | "isSponsored">) => {
    const now = new Date();
    const expires = new Date(now); expires.setDate(expires.getDate() + 30);
    const newCar: Car = {
      ...carData,
      id: `car_${Date.now()}`,
      seller: currentUser || MOCK_USERS[0],
      sellerId: currentUser?.id || "currentUser",
      rating: { overall: 0, comfort: 0, ergonomics: 0, performance: 0, safety: 0, reliability: 0, totalRatings: 0 },
      createdAt: now.toISOString().split("T")[0],
      expiresAt: expires.toISOString().split("T")[0],
      isSponsored: false,
      reportCount: 0,
    };
    setCars((prev) => [newCar, ...prev]);
  }, [currentUser]);

  const markAsSold = useCallback((carId: string) => {
    setCars((prev) => prev.map((c) => c.id === carId ? { ...c, isSold: true } : c));
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
      AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(updated));
    }
  }, [currentUser]);

  const renewListing = useCallback((carId: string) => {
    const expires = new Date(); expires.setDate(expires.getDate() + 30);
    setCars((prev) =>
      prev.map((c) => c.id === carId ? { ...c, expiresAt: expires.toISOString().split("T")[0] } : c)
    );
  }, []);

  // ── Messages ───────────────────────────────────────────────────────────
  const startConversation = useCallback((car: Car): string => {
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
  }, [conversations]);

  const sendMessage = useCallback((conversationId: string, text: string, mediaUrl?: string, mediaType?: "image" | "voice") => {
    const msg: Message = {
      id: `msg_${Date.now()}`,
      conversationId,
      senderId: currentUser?.id || "currentUser",
      text,
      timestamp: new Date().toISOString(),
      ...(mediaUrl ? { mediaUrl, mediaType } : {}),
      isRead: false,
    };
    setMessages((prev) => ({ ...prev, [conversationId]: [...(prev[conversationId] || []), msg] }));
    setConversations((prev) => prev.map((c) =>
      c.id === conversationId ? { ...c, lastMessage: text || "📷 Photo", lastMessageTime: new Date().toISOString() } : c
    ));
    // Auto-reply
    setTimeout(() => {
      const reply: Message = {
        id: `msg_${Date.now()}_r`,
        conversationId,
        senderId: "other",
        text: "Thanks for your message! I'll get back to you shortly.",
        timestamp: new Date().toISOString(),
        isRead: false,
      };
      setMessages((prev) => ({ ...prev, [conversationId]: [...(prev[conversationId] || []), reply] }));
      setConversations((prev) => prev.map((c) =>
        c.id === conversationId ? { ...c, unreadCount: c.unreadCount + 1 } : c
      ));
    }, 1500);
  }, [currentUser]);

  const deleteMessage = useCallback((conversationId: string, messageId: string) => {
    setMessages((prev) => ({
      ...prev,
      [conversationId]: (prev[conversationId] || []).map((m) =>
        m.id === messageId ? { ...m, isDeletedForSelf: true } : m
      ),
    }));
  }, []);

  const markMessagesRead = useCallback((conversationId: string) => {
    setConversations((prev) => prev.map((c) =>
      c.id === conversationId ? { ...c, unreadCount: 0 } : c
    ));
    setMessages((prev) => ({
      ...prev,
      [conversationId]: (prev[conversationId] || []).map((m) => ({ ...m, isRead: true })),
    }));
  }, []);

  // ── Profile ────────────────────────────────────────────────────────────
  const updateUserProfile = useCallback(async (updates: Partial<User>) => {
    setCurrentUser((prev) => {
      if (!prev) return prev;
      const updated = { ...prev, ...updates };
      AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const toggleAnonymous = useCallback(() => {
    setCurrentUser((prev) => {
      if (!prev) return prev;
      const updated = { ...prev, isAnonymous: !prev.isAnonymous };
      AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(updated));
      return updated;
    });
  }, []);

  // ── Verification ───────────────────────────────────────────────────────
  const verifyPhone = useCallback(async (): Promise<boolean> => {
    // Simulates Firebase SMS verification
    await new Promise((r) => setTimeout(r, 800));
    if (currentUser) {
      const updated = {
        ...currentUser,
        isVerified: true,
        verification: { ...(currentUser.verification || { phone: false, id: false, dealer: false }), phone: true },
        trustScore: Math.min(100, (currentUser.trustScore || 0) + 20),
      };
      setCurrentUser(updated);
      await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(updated));
    }
    return true;
  }, [currentUser]);

  const verifyId = useCallback(async (): Promise<boolean> => {
    await new Promise((r) => setTimeout(r, 1200));
    if (currentUser) {
      const updated = {
        ...currentUser,
        isVerified: true,
        verification: { ...(currentUser.verification || { phone: false, id: false, dealer: false }), id: true },
        trustScore: Math.min(100, (currentUser.trustScore || 0) + 30),
      };
      setCurrentUser(updated);
      await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(updated));
    }
    return true;
  }, [currentUser]);

  // ── Reviews ────────────────────────────────────────────────────────────
  const submitReview = useCallback((review: Omit<Review, "id" | "createdAt">) => {
    const newReview: Review = {
      ...review,
      id: `rev_${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setReviews((prev) => {
      const next = [newReview, ...prev];
      AsyncStorage.setItem(STORAGE_KEYS.REVIEWS, JSON.stringify(next.filter((r) => !MOCK_REVIEWS.find((m) => m.id === r.id))));
      return next;
    });
  }, []);

  const getUserReviews = useCallback((userId: string) =>
    reviews.filter((r) => r.toUserId === userId),
  [reviews]);

  // ── Reports ────────────────────────────────────────────────────────────
  const reportItem = useCallback((report: Omit<Report, "id" | "createdAt" | "status">) => {
    const newReport: Report = {
      ...report,
      id: `rep_${Date.now()}`,
      createdAt: new Date().toISOString(),
      status: "pending",
    };
    setReports((prev) => {
      const next = [newReport, ...prev];
      AsyncStorage.setItem(STORAGE_KEYS.REPORTS, JSON.stringify(next));
      return next;
    });
    // Auto-hide if 3+ reports
    if (report.targetType === "listing") {
      setCars((prev) => prev.map((c) => {
        if (c.id !== report.targetId) return c;
        const count = (c.reportCount || 0) + 1;
        return { ...c, reportCount: count, isHidden: count >= 3 };
      }));
    }
  }, []);

  // ── Block ──────────────────────────────────────────────────────────────
  const blockUser = useCallback((userId: string) => {
    setBlockedUsers((prev) => {
      if (prev.includes(userId)) return prev;
      const next = [...prev, userId];
      AsyncStorage.setItem(STORAGE_KEYS.BLOCKED, JSON.stringify(next));
      return next;
    });
  }, []);

  const unblockUser = useCallback((userId: string) => {
    setBlockedUsers((prev) => {
      const next = prev.filter((id) => id !== userId);
      AsyncStorage.setItem(STORAGE_KEYS.BLOCKED, JSON.stringify(next));
      return next;
    });
  }, []);

  const isBlocked = useCallback((userId: string) => blockedUsers.includes(userId), [blockedUsers]);

  // ── Trust Score ────────────────────────────────────────────────────────
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

  return (
    <AppContext.Provider value={{
      currentUser, isAuthenticated, favorites, cars, conversations, messages,
      isLoading, reviews, reports, transactions, blockedUsers,
      login, signup, logout, toggleFavorite, isFavorite, addCar, sendMessage,
      startConversation, updateUserProfile, markAsSold, renewListing, submitReview,
      reportItem, blockUser, unblockUser, isBlocked, verifyPhone, verifyId,
      toggleAnonymous, getUserReviews, getSellerTrustScore, deleteMessage, markMessagesRead,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}

// ── Mock review seed data ──────────────────────────────────────────────────
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
