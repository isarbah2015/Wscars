/**
 * services/firebase.ts
 *
 * Firebase service layer — all Firestore reads/writes and Auth operations
 * go through here so AppContext stays clean.
 *
 * Auth is imported from lib/firebase-persistence so that AsyncStorage
 * persistence is always active on native builds.
 */

import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  updateProfile,
  type User as FirebaseUser,
} from 'firebase/auth';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  addDoc,
  onSnapshot,
  query,
  where,
  orderBy,
  serverTimestamp,
  Timestamp,
  type Unsubscribe,
} from 'firebase/firestore';
import { auth } from '@/lib/firebase-persistence';
import { db } from '@/lib/firebase';
import type { User, Car, Conversation, Message, Review, Report } from '@/types';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function tsToString(ts: any): string {
  if (!ts) return new Date().toISOString();
  if (ts instanceof Timestamp) return ts.toDate().toISOString();
  if (typeof ts === 'string') return ts;
  return new Date().toISOString();
}

function docToUser(id: string, data: any): User {
  return {
    id,
    name:          data.name          ?? 'User',
    email:         data.email         ?? '',
    phone:         data.phone         ?? '',
    location:      data.location      ?? 'Accra',
    avatar:        data.avatar        ?? data.photoURL ?? undefined,
    isVerified:    data.isVerified     ?? false,
    isAdmin:       data.isAdmin        ?? false,
    memberSince:   data.memberSince    ?? data.createdAt?.toDate?.()?.toISOString?.()?.split('T')[0] ?? '',
    verification:  data.verification   ?? { phone: false, id: false, dealer: false },
    rating:        data.rating         ?? 0,
    totalReviews:  data.totalReviews   ?? 0,
    totalListings: data.totalListings  ?? 0,
    trustScore:    data.trustScore     ?? 15,
    totalSales:    data.totalSales     ?? 0,
    favorites:     data.favorites      ?? [],
    blockedUsers:  data.blockedUsers   ?? [],
    bio:           data.bio            ?? undefined,
    idVerificationPending: data.idVerificationPending ?? false,
  };
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

/**
 * subscribeAuth — listens to Firebase auth state changes.
 * On sign-in, fetches (or creates) the Firestore user doc and passes it back.
 * This is what makes sessions persist: Firebase Auth + AsyncStorage persistence
 * means onAuthStateChanged fires automatically on app restart with the cached user.
 */
export function subscribeAuth(callback: (user: User | null) => void): Unsubscribe {
  if (!auth) {
    callback(null);
    return () => {};
  }

  return onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
    if (!firebaseUser) {
      callback(null);
      return;
    }

    // User is signed in — fetch their Firestore profile
    if (!db) {
      // Firebase Auth works but Firestore doesn't — build a minimal user
      callback({
        id: firebaseUser.uid,
        name: firebaseUser.displayName ?? 'User',
        email: firebaseUser.email ?? '',
        phone: '',
        location: 'Accra',
        isVerified: false,
        memberSince: new Date().toISOString().split('T')[0],
        verification: { phone: false, id: false, dealer: false },
        rating: 0, totalReviews: 0, totalListings: 0, trustScore: 15, totalSales: 0,
        favorites: [], blockedUsers: [],
      });
      return;
    }

    try {
      const ref  = doc(db, 'users', firebaseUser.uid);
      const snap = await getDoc(ref);

      if (snap.exists()) {
        callback(docToUser(firebaseUser.uid, snap.data()));
      } else {
        // First-time sign-in via Google or similar — create the user doc
        const newUser: any = {
          name:          firebaseUser.displayName ?? 'User',
          email:         firebaseUser.email ?? '',
          phone:         '',
          location:      'Accra',
          avatar:        firebaseUser.photoURL ?? null,
          isVerified:    false,
          isAdmin:       false,
          memberSince:   new Date().toISOString().split('T')[0],
          verification:  { phone: false, id: false, dealer: false },
          rating:        0,
          totalReviews:  0,
          totalListings: 0,
          trustScore:    15,
          totalSales:    0,
          favorites:     [],
          blockedUsers:  [],
          createdAt:     serverTimestamp(),
        };
        await setDoc(ref, newUser);
        callback(docToUser(firebaseUser.uid, newUser));
      }
    } catch (err) {
      console.warn('[subscribeAuth] Firestore fetch failed:', err);
      callback(null);
    }
  });
}

/**
 * signInEmail — signs in with email + password.
 * Returns the WestCars User object from Firestore.
 * Throws Firebase auth errors so callers can show the right message.
 */
export async function signInEmail(email: string, password: string): Promise<User> {
  if (!auth) throw new Error('Firebase Auth not initialised');
  const cred = await signInWithEmailAndPassword(auth, email, password);
  if (!db) {
    return {
      id: cred.user.uid,
      name: cred.user.displayName ?? email.split('@')[0],
      email, phone: '', location: 'Accra',
      isVerified: false,
      memberSince: new Date().toISOString().split('T')[0],
      verification: { phone: false, id: false, dealer: false },
      rating: 0, totalReviews: 0, totalListings: 0, trustScore: 15, totalSales: 0,
      favorites: [], blockedUsers: [],
    };
  }
  const snap = await getDoc(doc(db, 'users', cred.user.uid));
  if (snap.exists()) return docToUser(cred.user.uid, snap.data());
  // Doc missing — create it
  const fallback = {
    name: cred.user.displayName ?? email.split('@')[0],
    email, phone: '', location: 'Accra',
    isVerified: false, isAdmin: false,
    memberSince: new Date().toISOString().split('T')[0],
    verification: { phone: false, id: false, dealer: false },
    rating: 0, totalReviews: 0, totalListings: 0, trustScore: 15, totalSales: 0,
    favorites: [], blockedUsers: [], createdAt: serverTimestamp(),
  };
  await setDoc(doc(db, 'users', cred.user.uid), fallback);
  return docToUser(cred.user.uid, fallback);
}

/**
 * signUpEmail — creates account + Firestore user doc.
 */
export async function signUpEmail(
  name: string, email: string, phone: string, password: string,
): Promise<User> {
  if (!auth) throw new Error('Firebase Auth not initialised');
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(cred.user, { displayName: name });

  const newUser: any = {
    name, email, phone,
    location:      'Accra',
    avatar:        null,
    isVerified:    false,
    isAdmin:       false,
    memberSince:   new Date().toISOString().split('T')[0],
    verification:  { phone: false, id: false, dealer: false },
    rating:        0,
    totalReviews:  0,
    totalListings: 0,
    trustScore:    15,
    totalSales:    0,
    favorites:     [],
    blockedUsers:  [],
    createdAt:     serverTimestamp(),
  };

  if (db) {
    await setDoc(doc(db, 'users', cred.user.uid), newUser);
  }
  return docToUser(cred.user.uid, newUser);
}

export async function signOut(): Promise<void> {
  if (auth) await firebaseSignOut(auth);
}

// ─── User ─────────────────────────────────────────────────────────────────────

export async function updateUser(userId: string, updates: Partial<User>): Promise<void> {
  if (!db) return;
  await updateDoc(doc(db, 'users', userId), updates as any);
}

// ─── Cars ─────────────────────────────────────────────────────────────────────

function docToCar(id: string, data: any): Car {
  return {
    id,
    ...data,
    createdAt:   tsToString(data.createdAt),
    updatedAt:   tsToString(data.updatedAt),
    expiresAt:   tsToString(data.expiresAt),
  } as Car;
}

export function subscribeCars(callback: (cars: Car[]) => void): Unsubscribe {
  if (!db) { callback([]); return () => {}; }
  const q = query(
    collection(db, 'cars'),
    where('isHidden', '!=', true),
    orderBy('isHidden'),
    orderBy('createdAt', 'desc'),
  );
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map(d => docToCar(d.id, d.data())));
  }, (err) => {
    console.warn('[subscribeCars]', err);
    callback([]);
  });
}

export async function createCar(car: Omit<Car, 'id'>): Promise<Car> {
  if (!db) throw new Error('Firestore not ready');
  const ref = await addDoc(collection(db, 'cars'), {
    ...car,
    createdAt:  serverTimestamp(),
    updatedAt:  serverTimestamp(),
    expiresAt:  new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    isHidden:   false,
    isSold:     false,
  });
  return { ...car, id: ref.id } as Car;
}

export async function markCarSold(carId: string): Promise<void> {
  if (!db) return;
  await updateDoc(doc(db, 'cars', carId), { isSold: true, updatedAt: serverTimestamp() });
}

export async function renewCar(carId: string): Promise<void> {
  if (!db) return;
  await updateDoc(doc(db, 'cars', carId), {
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: serverTimestamp(),
  });
}

export async function setCarHidden(carId: string, hidden: boolean): Promise<void> {
  if (!db) return;
  await updateDoc(doc(db, 'cars', carId), { isHidden: hidden, updatedAt: serverTimestamp() });
}

export async function deleteCar(carId: string): Promise<void> {
  if (!db) return;
  await deleteDoc(doc(db, 'cars', carId));
}

// ─── Conversations ────────────────────────────────────────────────────────────

export function subscribeConversations(
  userId: string,
  callback: (convs: Conversation[]) => void,
): Unsubscribe {
  if (!db) { callback([]); return () => {}; }
  const q = query(
    collection(db, 'conversations'),
    where('participantIds', 'array-contains', userId),
    orderBy('updatedAt', 'desc'),
  );
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map(d => ({ id: d.id, ...d.data() } as Conversation)));
  }, () => callback([]));
}

export async function getOrCreateConversation(
  buyerId: string, car: Car,
): Promise<string> {
  if (!db) throw new Error('Firestore not ready');
  // Check for existing conversation
  const q = query(
    collection(db, 'conversations'),
    where('participantIds', 'array-contains', buyerId),
    where('carId', '==', car.id),
  );
  const snap = await getDocs(q);
  if (!snap.empty) return snap.docs[0].id;

  const ref = await addDoc(collection(db, 'conversations'), {
    carId:          car.id,
    carTitle:       `${car.year} ${car.make} ${car.model}`,
    carImage:       car.images?.[0] ?? null,
    participantIds: [buyerId, car.sellerId],
    buyerId,
    sellerId:       car.sellerId,
    lastMessage:    '',
    updatedAt:      serverTimestamp(),
    createdAt:      serverTimestamp(),
    unreadCount:    { [buyerId]: 0, [car.sellerId]: 0 },
  });
  return ref.id;
}

// ─── Messages ─────────────────────────────────────────────────────────────────

export function subscribeMessages(
  conversationId: string,
  callback: (msgs: Message[]) => void,
): Unsubscribe {
  if (!db) { callback([]); return () => {}; }
  const q = query(
    collection(db, 'conversations', conversationId, 'messages'),
    orderBy('createdAt', 'asc'),
  );
  return onSnapshot(q, (snap) => {
    callback(snap.docs
      .map(d => ({ id: d.id, ...d.data() } as Message))
      .filter(m => !m.deletedAt));
  }, () => callback([]));
}

export async function sendMessage(
  conversationId: string,
  senderId: string,
  text: string,
  mediaUrl?: string,
  mediaType?: string,
): Promise<void> {
  if (!db) return;
  await addDoc(collection(db, 'conversations', conversationId, 'messages'), {
    senderId, text,
    mediaUrl:  mediaUrl  ?? null,
    mediaType: mediaType ?? null,
    createdAt: serverTimestamp(),
    deletedAt: null,
  });
  await updateDoc(doc(db, 'conversations', conversationId), {
    lastMessage: text || '📎 Media',
    updatedAt:   serverTimestamp(),
  });
}

export async function softDeleteMessage(
  conversationId: string, messageId: string,
): Promise<void> {
  if (!db) return;
  await updateDoc(
    doc(db, 'conversations', conversationId, 'messages', messageId),
    { deletedAt: serverTimestamp() },
  );
}

export async function markConversationRead(conversationId: string): Promise<void> {
  if (!db || !auth?.currentUser) return;
  await updateDoc(doc(db, 'conversations', conversationId), {
    [`unreadCount.${auth.currentUser.uid}`]: 0,
  });
}

// ─── Reviews ──────────────────────────────────────────────────────────────────

export function subscribeReviews(callback: (reviews: Review[]) => void): Unsubscribe {
  if (!db) { callback([]); return () => {}; }
  const q = query(collection(db, 'reviews'), orderBy('createdAt', 'desc'));
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map(d => ({ id: d.id, ...d.data() } as Review)));
  }, () => callback([]));
}

export async function createReview(review: Omit<Review, 'id'>): Promise<void> {
  if (!db) return;
  await addDoc(collection(db, 'reviews'), { ...review, createdAt: serverTimestamp() });
}

// ─── Reports ──────────────────────────────────────────────────────────────────

export function subscribeReports(callback: (reports: Report[]) => void): Unsubscribe {
  if (!db) { callback([]); return () => {}; }
  const q = query(collection(db, 'reports'), orderBy('createdAt', 'desc'));
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map(d => ({ id: d.id, ...d.data() } as Report)));
  }, () => callback([]));
}

export async function createReport(report: Omit<Report, 'id'>): Promise<void> {
  if (!db) return;
  await addDoc(collection(db, 'reports'), { ...report, createdAt: serverTimestamp() });
}

export async function setReportStatus(
  reportId: string, status: 'dismissed' | 'reviewed',
): Promise<void> {
  if (!db) return;
  await updateDoc(doc(db, 'reports', reportId), { status });
}
