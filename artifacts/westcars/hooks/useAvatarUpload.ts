import { useState, useCallback } from "react";
import { Alert, Platform } from "react-native";
import * as ImagePicker from "expo-image-picker";
import {
  ref,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
import { doc, updateDoc } from "firebase/firestore";
import { storage, db } from "@/lib/firebase";

// ─── Types ────────────────────────────────────────────────────

export type UploadSource = "camera" | "library";

export interface UseAvatarUploadReturn {
  photoURL: string | null;
  progress: number | null;
  isUploading: boolean;
  error: string | null;
  pickAndUpload: (source: UploadSource) => Promise<void>;
  removePhoto: () => Promise<void>;
}

// ─── Hook ─────────────────────────────────────────────────────

/**
 * useAvatarUpload
 *
 * Shared by:
 *   app/(tabs)/profile.tsx  — always editable (own profile)
 *   app/user/[id].tsx       — editable only when id === currentUser.uid
 *
 * Flow:
 *   1. expo-image-picker → local URI
 *   2. fetch() blob → uploadBytesResumable → avatars/{userId}.jpg in Storage
 *   3. getDownloadURL → updateDoc users/{userId}.photoURL in Firestore
 *   4. Local state updates instantly so UI reflects change without re-fetch
 */
export function useAvatarUpload({
  userId,
  initialPhotoURL,
}: {
  userId: string;
  initialPhotoURL?: string | null;
}): UseAvatarUploadReturn {
  const [photoURL, setPhotoURL]     = useState<string | null>(initialPhotoURL ?? null);
  const [progress, setProgress]     = useState<number | null>(null);
  const [isUploading, setUploading] = useState(false);
  const [error, setError]           = useState<string | null>(null);

  // ── Permissions ──────────────────────────────────────────────

  const requestLibraryPermission = useCallback(async (): Promise<boolean> => {
    if (Platform.OS === "web") return true;
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission needed", "Please allow photo library access in Settings.");
      return false;
    }
    return true;
  }, []);

  const requestCameraPermission = useCallback(async (): Promise<boolean> => {
    if (Platform.OS === "web") return true;
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Camera access needed", "Please allow camera access in Settings.");
      return false;
    }
    return true;
  }, []);

  // ── Core upload ──────────────────────────────────────────────

  const uploadBlob = useCallback(
    (blob: Blob): Promise<string> =>
      new Promise((resolve, reject) => {
        if (!storage) { reject(new Error("Firebase Storage not initialised")); return; }
        const storageRef = ref(storage, `avatars/${userId}.jpg`);
        const task = uploadBytesResumable(storageRef, blob, {
          contentType: "image/jpeg",
          customMetadata: { uploadedBy: userId },
        });
        task.on(
          "state_changed",
          (snap) => setProgress(snap.bytesTransferred / snap.totalBytes),
          reject,
          async () => resolve(await getDownloadURL(task.snapshot.ref))
        );
      }),
    [userId]
  );

  // ── Pick & Upload ────────────────────────────────────────────

  const pickAndUpload = useCallback(
    async (source: UploadSource): Promise<void> => {
      setError(null);

      const hasPermission =
        source === "camera"
          ? await requestCameraPermission()
          : await requestLibraryPermission();
      if (!hasPermission) return;

      const opts: ImagePicker.ImagePickerOptions = {
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.85,
      };

      const result =
        source === "camera"
          ? await ImagePicker.launchCameraAsync(opts)
          : await ImagePicker.launchImageLibraryAsync({
              ...opts,
              mediaTypes: ImagePicker.MediaTypeOptions.Images,
            });

      if (result.canceled) return;

      const uri = result.assets[0].uri;
      setUploading(true);
      setProgress(0);

      try {
        const blob = await (await fetch(uri)).blob();
        const downloadURL = await uploadBlob(blob);

        if (db) {
          await updateDoc(doc(db, "users", userId), {
            photoURL: downloadURL,
            photoUpdatedAt: new Date().toISOString(),
          });
        }

        setPhotoURL(downloadURL);
      } catch (err: any) {
        const msg = err?.message ?? "Upload failed. Please try again.";
        setError(msg);
        Alert.alert("Upload failed", msg);
      } finally {
        setUploading(false);
        setProgress(null);
      }
    },
    [userId, requestCameraPermission, requestLibraryPermission, uploadBlob]
  );

  // ── Remove Photo ─────────────────────────────────────────────

  const removePhoto = useCallback(async (): Promise<void> => {
    setError(null);
    setUploading(true);
    try {
      if (storage) {
        try {
          await deleteObject(ref(storage, `avatars/${userId}.jpg`));
        } catch {
          // File may not exist yet — ignore
        }
      }
      if (db) {
        await updateDoc(doc(db, "users", userId), {
          photoURL: null,
          photoUpdatedAt: new Date().toISOString(),
        });
      }
      setPhotoURL(null);
    } catch (err: any) {
      const msg = err?.message ?? "Could not remove photo.";
      setError(msg);
      Alert.alert("Error", msg);
    } finally {
      setUploading(false);
      setProgress(null);
    }
  }, [userId]);

  return { photoURL, progress, isUploading, error, pickAndUpload, removePhoto };
}
