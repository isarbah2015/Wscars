/**
 * Firebase Storage upload helpers.
 *
 * Expo image-picker returns a local file:// URI. We convert it to a Blob via
 * fetch() before uploading because uploadBytesResumable cannot read RN paths
 * directly.
 */
import { Platform } from "react-native";
import {
  ref,
  uploadBytes,
  uploadBytesResumable,
  getDownloadURL,
} from "firebase/storage";
import { storage, isFirebaseReady } from "@/lib/firebase";

export type UploadProgressCallback = (fraction: number) => void;

const ensureReady = () => {
  if (!isFirebaseReady() || !storage) throw new Error("Firebase not configured.");
};

/** file:// URIs on Android need XHR — fetch() often fails. */
const localUriToBlob = async (uri: string): Promise<Blob> => {
  if (Platform.OS === "web") {
    const res = await fetch(uri);
    return await res.blob();
  }
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.onload = () => resolve(xhr.response);
    xhr.onerror = () => reject(new Error("Failed to load image"));
    xhr.responseType = "blob";
    xhr.open("GET", uri, true);
    xhr.send(null);
  });
};

function guessExt(uri: string): string {
  const lower = uri.toLowerCase();
  if (lower.includes('.heic')) return 'jpg';
  if (lower.includes('.heif')) return 'jpg';
  if (lower.includes('.jpg') || lower.includes('.jpeg')) return 'jpg';
  if (lower.includes('.png')) return 'png';
  if (lower.includes('.webp')) return 'webp';
  if (lower.includes('.gif')) return 'gif';
  return 'jpg';
}

async function uploadAt(
  uri: string,
  path: string,
  onProgress?: UploadProgressCallback,
): Promise<string> {
  ensureReady();
  onProgress?.(0);
  const blob = await localUriToBlob(uri);
  const r = ref(storage!, path);
  const metadata = { contentType: blob.type || "image/jpeg" };

  if (!onProgress) {
    await uploadBytes(r, blob, metadata);
    return await getDownloadURL(r);
  }

  // Reserve 10% for local blob prep; map upload bytes to 10–95%.
  const reportUpload = (bytesTransferred: number, totalBytes: number) => {
    if (totalBytes <= 0) return;
    onProgress(0.1 + (bytesTransferred / totalBytes) * 0.85);
  };

  onProgress(0.1);

  return new Promise((resolve, reject) => {
    const task = uploadBytesResumable(r, blob, metadata);
    task.on(
      "state_changed",
      (snapshot) => {
        reportUpload(snapshot.bytesTransferred, snapshot.totalBytes);
      },
      reject,
      async () => {
        try {
          onProgress(0.95);
          resolve(await getDownloadURL(task.snapshot.ref));
        } catch (err) {
          reject(err);
        }
      },
    );
  });
}

/** Upload a car listing photo. Returns the public download URL. */
export async function uploadCarImage(userId: string, carId: string, uri: string, idx = 0): Promise<string> {
  // userId in its own path segment so Storage Rules can enforce ownership.
  const path = `cars/${carId}/${userId}/${Date.now()}_${idx}.${guessExt(uri)}`;
  return uploadAt(uri, path);
}

/** Upload an ID-verification document (private — rules forbid public read). */
export async function uploadIdImage(userId: string, side: string, uri: string): Promise<string> {
  const path = `id-verification/${userId}/${side}_${Date.now()}.${guessExt(uri)}`;
  return uploadAt(uri, path);
}

export async function uploadAvatar(
  userId: string,
  uri: string,
  onProgress?: UploadProgressCallback,
): Promise<string> {
  const path = `avatars/${userId}.${guessExt(uri)}`;
  return uploadAt(uri, path, onProgress);
}

/** Upload a chat attachment (image or voice). */
export async function uploadChatMedia(conversationId: string, userId: string, uri: string, kind: "image" | "voice"): Promise<string> {
  const ext = kind === "voice" ? "m4a" : guessExt(uri);
  // userId in its own path segment so Storage Rules can enforce participant + ownership.
  const path = `chat/${conversationId}/${userId}/${Date.now()}.${ext}`;
  return uploadAt(uri, path);
}
