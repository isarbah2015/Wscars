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

export type UploadSource = "camera" | "library";

export interface UseAvatarUploadReturn {
  photoURL: string | null;
  progress: number | null;       // 0–1 while uploading, null when idle
  isUploading: boolean;
  error: string | null;
  pickAndUpload: (source: UploadSource) => Promise<void>;
  removePhoto: () => Promise<void>;
}

export function useAvatarUpload({
  userId,
  initialPhotoURL,
}: {
  userId: string;
  initialPhotoURL: string | null | undefined;
}): UseAvatarUploadReturn {
  const [photoURL, setPhotoURL] = useState<string | null>(
    initialPhotoURL ?? null
  );
  const [progress, setProgress] = useState<number | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ── Permissions ──────────────────────────────────────────────────────────────
  const requestPermission = useCallback(
    async (source: UploadSource): Promise<boolean> => {
      if (Platform.OS === "web") return true;

      if (source === "camera") {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== "granted") {
          Alert.alert(
            "Camera access needed",
            "Please allow camera access in Settings."
          );
          return false;
        }
      } else {
        const { status } =
          await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== "granted") {
          Alert.alert(
            "Permission needed",
            "Please allow photo library access in Settings."
          );
          return false;
        }
      }
      return true;
    },
    []
  );

  // ── Core upload to Firebase Storage ─────────────────────────────────────────
  const uploadBlob = useCallback(
    (blob: Blob): Promise<string> => {
      return new Promise((resolve, reject) => {
        if (!storage) {
          reject(new Error("Firebase Storage not initialised"));
          return;
        }

        const storageRef = ref(storage, `avatars/${userId}.jpg`);
        const task = uploadBytesResumable(storageRef, blob, {
          contentType: "image/jpeg",
          customMetadata: { uploadedBy: userId },
        });

        task.on(
          "state_changed",
          (snap) => setProgress(snap.bytesTransferred / snap.totalBytes),
          reject,
          async () => {
            const url = await getDownloadURL(task.snapshot.ref);
            resolve(url);
          }
        );
      });
    },
    [userId]
  );

  // ── Pick & Upload ────────────────────────────────────────────────────────────
  const pickAndUpload = useCallback(
    async (source: UploadSource): Promise<void> => {
      setError(null);

      const hasPermission = await requestPermission(source);
      if (!hasPermission) return;

      const pickerOptions: ImagePicker.ImagePickerOptions = {
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.85,
      };

      const result =
        source === "camera"
          ? await ImagePicker.launchCameraAsync(pickerOptions)
          : await ImagePicker.launchImageLibraryAsync({
              ...pickerOptions,
              mediaTypes: ImagePicker.MediaTypeOptions.Images,
            });

      if (result.canceled) return;

      setIsUploading(true);
      setProgress(0);

      try {
        const response = await fetch(result.assets[0].uri);
        const blob = await response.blob();
        const downloadURL = await uploadBlob(blob);

        if (!db) throw new Error("Firestore not initialised");

        await updateDoc(doc(db, "users", userId), {
          avatar: downloadURL,
          photoUpdatedAt: new Date().toISOString(),
        });

        setPhotoURL(downloadURL);
      } catch (err: any) {
        const msg = err?.message ?? "Upload failed. Please try again.";
        setError(msg);
        Alert.alert("Upload failed", msg);
      } finally {
        setIsUploading(false);
        setProgress(null);
      }
    },
    [userId, requestPermission, uploadBlob]
  );

  // ── Remove Photo ─────────────────────────────────────────────────────────────
  const removePhoto = useCallback(async (): Promise<void> => {
    setError(null);
    setIsUploading(true);

    try {
      if (storage) {
        try {
          await deleteObject(ref(storage, `avatars/${userId}.jpg`));
        } catch {
          // file may not exist yet — safe to ignore
        }
      }

      if (!db) throw new Error("Firestore not initialised");

      await updateDoc(doc(db, "users", userId), {
        avatar: null,
        photoUpdatedAt: new Date().toISOString(),
      });

      setPhotoURL(null);
    } catch (err: any) {
      const msg = err?.message ?? "Could not remove photo.";
      setError(msg);
      Alert.alert("Error", msg);
    } finally {
      setIsUploading(false);
      setProgress(null);
    }
  }, [userId]);

  return { photoURL, progress, isUploading, error, pickAndUpload, removePhoto };
}
