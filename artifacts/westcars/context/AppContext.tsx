import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { Car, Conversation, Message, User } from "@/types";
import { MOCK_CARS, MOCK_CONVERSATIONS, MOCK_MESSAGES, MOCK_USERS } from "@/utils/mockData";

interface AppContextType {
  currentUser: User | null;
  isAuthenticated: boolean;
  favorites: string[];
  cars: Car[];
  conversations: Conversation[];
  messages: Record<string, Message[]>;
  isLoading: boolean;

  login: (email: string, password: string) => Promise<boolean>;
  signup: (name: string, email: string, phone: string, password: string) => Promise<boolean>;
  logout: () => void;
  toggleFavorite: (carId: string) => void;
  isFavorite: (carId: string) => boolean;
  addCar: (car: Omit<Car, "id" | "seller" | "rating" | "createdAt" | "isSponsored">) => void;
  sendMessage: (conversationId: string, text: string) => void;
  startConversation: (car: Car) => string;
  updateUserProfile: (updates: Partial<User>) => void;
}

const AppContext = createContext<AppContextType | null>(null);

const STORAGE_KEYS = {
  USER: "@westcars_user",
  FAVORITES: "@westcars_favorites",
  CARS: "@westcars_cars",
  MESSAGES: "@westcars_messages",
  CONVERSATIONS: "@westcars_conversations",
};

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [cars, setCars] = useState<Car[]>(MOCK_CARS);
  const [conversations, setConversations] = useState<Conversation[]>(MOCK_CONVERSATIONS);
  const [messages, setMessages] = useState<Record<string, Message[]>>({
    conv1: MOCK_MESSAGES,
    conv2: [],
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadStoredData();
  }, []);

  const loadStoredData = async () => {
    try {
      const [storedUser, storedFavorites] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.USER),
        AsyncStorage.getItem(STORAGE_KEYS.FAVORITES),
      ]);

      if (storedUser) {
        const user = JSON.parse(storedUser);
        setCurrentUser(user);
        setIsAuthenticated(true);
      }
      if (storedFavorites) {
        setFavorites(JSON.parse(storedFavorites));
      }
    } catch (e) {
      // ignore
    } finally {
      setIsLoading(false);
    }
  };

  const login = useCallback(async (email: string, _password: string): Promise<boolean> => {
    // Simulate authentication - in production this uses Firebase Auth
    const mockUser: User = {
      id: "currentUser",
      name: "Akosua Darko",
      phone: "+233 24 555 0000",
      email,
      location: "Accra",
      avatar: "https://randomuser.me/api/portraits/women/68.jpg",
      memberSince: "2024-01-01",
      isVerified: false,
      rating: 0,
      totalReviews: 0,
      totalListings: 0,
    };

    setCurrentUser(mockUser);
    setIsAuthenticated(true);
    await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(mockUser));
    return true;
  }, []);

  const signup = useCallback(async (name: string, email: string, phone: string, _password: string): Promise<boolean> => {
    const newUser: User = {
      id: "currentUser",
      name,
      phone,
      email,
      location: "Accra",
      memberSince: new Date().toISOString().split("T")[0],
      isVerified: false,
      rating: 0,
      totalReviews: 0,
      totalListings: 0,
    };

    setCurrentUser(newUser);
    setIsAuthenticated(true);
    await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(newUser));
    return true;
  }, []);

  const logout = useCallback(async () => {
    setCurrentUser(null);
    setIsAuthenticated(false);
    await AsyncStorage.removeItem(STORAGE_KEYS.USER);
  }, []);

  const toggleFavorite = useCallback((carId: string) => {
    setFavorites((prev) => {
      const next = prev.includes(carId)
        ? prev.filter((id) => id !== carId)
        : [...prev, carId];
      AsyncStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(next));
      return next;
    });
  }, []);

  const isFavorite = useCallback(
    (carId: string) => favorites.includes(carId),
    [favorites]
  );

  const addCar = useCallback(
    (carData: Omit<Car, "id" | "seller" | "rating" | "createdAt" | "isSponsored">) => {
      const newCar: Car = {
        ...carData,
        id: `car_${Date.now()}`,
        seller: currentUser || MOCK_USERS[0],
        sellerId: currentUser?.id || "currentUser",
        rating: {
          overall: 0,
          comfort: 0,
          ergonomics: 0,
          performance: 0,
          safety: 0,
          reliability: 0,
          totalRatings: 0,
        },
        createdAt: new Date().toISOString().split("T")[0],
        isSponsored: false,
      };
      setCars((prev) => [newCar, ...prev]);
    },
    [currentUser]
  );

  const startConversation = useCallback(
    (car: Car): string => {
      const existingConv = conversations.find((c) => c.carId === car.id);
      if (existingConv) return existingConv.id;

      const newConvId = `conv_${Date.now()}`;
      const newConv: Conversation = {
        id: newConvId,
        participantId: car.sellerId,
        participant: car.seller || MOCK_USERS[0],
        carId: car.id,
        car,
        lastMessage: "",
        lastMessageTime: new Date().toISOString(),
        unreadCount: 0,
      };
      setConversations((prev) => [newConv, ...prev]);
      setMessages((prev) => ({ ...prev, [newConvId]: [] }));
      return newConvId;
    },
    [conversations]
  );

  const sendMessage = useCallback(
    (conversationId: string, text: string) => {
      const newMsg: Message = {
        id: `msg_${Date.now()}`,
        conversationId,
        senderId: currentUser?.id || "currentUser",
        text,
        timestamp: new Date().toISOString(),
      };

      setMessages((prev) => ({
        ...prev,
        [conversationId]: [...(prev[conversationId] || []), newMsg],
      }));

      setConversations((prev) =>
        prev.map((c) =>
          c.id === conversationId
            ? { ...c, lastMessage: text, lastMessageTime: new Date().toISOString() }
            : c
        )
      );

      // Simulate auto-reply after 1.5s
      setTimeout(() => {
        const reply: Message = {
          id: `msg_${Date.now()}_reply`,
          conversationId,
          senderId: "other",
          text: "Thanks for your message! I'll get back to you shortly.",
          timestamp: new Date().toISOString(),
        };
        setMessages((prev) => ({
          ...prev,
          [conversationId]: [...(prev[conversationId] || []), reply],
        }));
      }, 1500);
    },
    [currentUser]
  );

  const updateUserProfile = useCallback(async (updates: Partial<User>) => {
    setCurrentUser((prev) => {
      if (!prev) return prev;
      const updated = { ...prev, ...updates };
      AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(updated));
      return updated;
    });
  }, []);

  return (
    <AppContext.Provider
      value={{
        currentUser,
        isAuthenticated,
        favorites,
        cars,
        conversations,
        messages,
        isLoading,
        login,
        signup,
        logout,
        toggleFavorite,
        isFavorite,
        addCar,
        sendMessage,
        startConversation,
        updateUserProfile,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
