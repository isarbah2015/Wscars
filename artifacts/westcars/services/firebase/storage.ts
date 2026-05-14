/**
 * Firebase Storage upload helpers.
 *
 * Expo image-picker returns a local file:// URI. We convert it to a Blob via
 * fetch() before uploading because uploadBytesResumable cannot read RN paths
 * directly.
 */
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage, isFirebaseReady } from "@/lib/firebase";

const ensureReady = (): void => {
  if (!isFirebaseReady() || !storage) {
    throw new Error('[Storage] Not ready — check Firebase config and storage initialization');
  }
};

const localUriToBlob = async (uri: string): Promise<Blob> => {
  const res = await fetch(uri);
  return await res.blob();
};

const guessExt = (uri: string): string => {
  const m = uri.match(/\.([a-zA-Z0-9]+)(?:\?|$)/);
  return m ? m[1].toLowerCase() : "jpg";
};

async function uploadAt(uri: string, path: string): Promise<string> {
  ensureReady();
  const blob = await localUriToBlob(uri);
  const r = ref(storage!, path);
  await uploadBytes(r, blob, { contentType: blob.type || "image/jpeg" });
  return await getDownloadURL(r);
}

/** Upload a car listing photo. Returns the public download URL. */
export async function uploadCarImage(userId: string, carId: string, uri: string, idx = 0): Promise<string> {
  // userId in its own path segment so Storage Rules can enforce ownership.
  const path = `cars/${carId}/${userId}/${Date.now()}_${idx}.${guessExt(uri)}`;
  return uploadAt(uri, path);
}

/** Upload an ID-verification document (private — rules forbid public read). */
export async function uploadIdImage(userId: string, side: "front" | "back" | "selfie", uri: string): Promise<string> {
  const path = `id-verification/${userId}/${side}_${Date.now()}.${guessExt(uri)}`;
  return uploadAt(uri, path);
}

export async function uploadAvatar(userId: string, uri: string): Promise<string> {
  // Store as avatars/{userId}/profile.{ext} so the Storage rule can match
  // on the {userId} segment independently of the file extension.
  const path = `avatars/${userId}/profile.${guessExt(uri)}`;
  return uploadAt(uri, path);
}

/** Upload a chat attachment (image or voice). */
export async function uploadChatMedia(conversationId: string, userId: string, uri: string, kind: "image" | "voice"): Promise<string> {
  const ext = kind === "voice" ? "m4a" : guessExt(uri);
  // userId in its own path segment so Storage Rules can enforce participant + ownership.
  const path = `chat/${conversationId}/${userId}/${Date.now()}.${ext}`;
  return uploadAt(uri, path);
}
