/**
 * Firestore CRUD for conversations + messages.
 *   conversations/{convId}             — convo metadata + denormalised car/participant
 *   conversations/{convId}/messages/*  — individual messages
 */
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  addDoc,
  updateDoc,
  doc,
  serverTimestamp,
  setDoc,
  getDocs,
  limit,
  type Unsubscribe,
} from "firebase/firestore";
import { db, isFirebaseReady } from "@/lib/firebase";
import { Car, Conversation, Message } from "@/types";

const ensureReady = (): void => {
  if (!isFirebaseReady() || !db) {
    throw new Error('[Firestore] Not ready — check EXPO_PUBLIC_FIREBASE_* env vars and db initialization.');
  }
};

const CONV = "conversations";

/** Live-subscribe to a user's conversations (newest activity first). */
export function subscribeConversations(userId: string, cb: (conversations: Conversation[]) => void): Unsubscribe {
  if (!isFirebaseReady() || !db) {
    cb([]);
    return () => {};
  }
  const q = query(
    collection(db, CONV),
    where("participantIds", "array-contains", userId),
    orderBy("lastMessageTime", "desc"),
  );
  return onSnapshot(
    q,
    (snap) => cb(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Conversation, "id">) }))),
    (err) => console.warn("[conversations] subscribe error:", err),
  );
}

/** Live-subscribe to messages within a conversation. */
export function subscribeMessages(conversationId: string, cb: (messages: Message[]) => void): Unsubscribe {
  if (!isFirebaseReady() || !db) {
    cb([]);
    return () => {};
  }
  const q = query(
    collection(db, CONV, conversationId, "messages"),
    orderBy("timestamp", "asc"),
  );
  return onSnapshot(
    q,
    (snap) => cb(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Message, "id">) }))),
    (err) => console.warn("[messages] subscribe error:", err),
  );
}

/**
 * Find or create a conversation between currentUserId and the seller of a car.
 * Returns the conversation id.
 */
export async function getOrCreateConversation(currentUserId: string, car: Car): Promise<string> {
  ensureReady();
  // Look for an existing conversation between these two participants for this car.
  const q = query(
    collection(db!, CONV),
    where("carId", "==", car.id),
    where("participantIds", "array-contains", currentUserId),
    limit(1),
  );
  const existing = await getDocs(q);
  if (!existing.empty) return existing.docs[0].id;

  const ref = await addDoc(collection(db!, CONV), {
    participantIds: [currentUserId, car.sellerId].filter(Boolean),
    participantId: car.sellerId,
    participant: car.seller || null,
    carId: car.id,
    car,
    lastMessage: "",
    lastMessageTime: serverTimestamp(),
    unreadCount: 0,
  });
  return ref.id;
}

export async function sendMessage(
  conversationId: string,
  senderId: string,
  text: string,
  mediaUrl?: string,
  mediaType?: "image" | "video" | "audio",
): Promise<void> {
  ensureReady();
  await addDoc(collection(db!, CONV, conversationId, "messages"), {
    conversationId,
    senderId,
    text,
    timestamp: serverTimestamp(),
    isRead: false,
    ...(mediaUrl ? { mediaUrl, mediaType } : {}),
  });
  await updateDoc(doc(db!, CONV, conversationId), {
    lastMessage: text || "📷 Photo",
    lastMessageTime: serverTimestamp(),
  });
}

export async function markConversationRead(conversationId: string): Promise<void> {
  ensureReady();
  await updateDoc(doc(db!, CONV, conversationId), { unreadCount: 0 });
}

export async function softDeleteMessage(conversationId: string, messageId: string): Promise<void> {
  ensureReady();
  await setDoc(
    doc(db!, CONV, conversationId, "messages", messageId),
    { isDeletedForSelf: true },
    { merge: true },
  );
}
