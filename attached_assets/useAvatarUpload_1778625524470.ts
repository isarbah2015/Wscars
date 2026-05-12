import { useState, useCallback } from 'react'
import { Alert, Platform } from 'react-native'
import * as ImagePicker from 'expo-image-picker'
import {
  ref,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
} from 'firebase/storage'
import { doc, updateDoc } from 'firebase/firestore'
import { storage, db } from '@/lib/firebase'

// ─── Types ────────────────────────────────────────────────────────────────────

export type UploadSource = 'camera' | 'library'

export interface AvatarUploadState {
  photoURL: string | null       // current photo URL (live, reflects latest upload)
  progress: number | null       // 0–1 while uploading, null when idle
  isUploading: boolean
  error: string | null
}

export interface UseAvatarUploadReturn extends AvatarUploadState {
  pickAndUpload: (source: UploadSource) => Promise<void>
  removePhoto: () => Promise<void>
  requestPermissions: () => Promise<boolean>
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

/**
 * useAvatarUpload
 *
 * Shared hook used by both:
 *   - app/(tabs)/profile.tsx  (own profile — always editable)
 *   - app/user/[id].tsx       (only when id === currentUser.uid)
 *
 * Flow:
 *   1. expo-image-picker → get local URI
 *   2. fetch() blob → uploadBytesResumable to Firebase Storage
 *      path: avatars/{userId}.jpg
 *   3. getDownloadURL → updateDoc users/{userId}.photoURL in Firestore
 *   4. Local state updates immediately so UI reflects change without re-fetch
 *
 * Usage:
 *   const { photoURL, progress, isUploading, pickAndUpload, removePhoto } =
 *     useAvatarUpload({ userId, initialPhotoURL: user.photoURL })
 */
export function useAvatarUpload({
  userId,
  initialPhotoURL,
}: {
  userId: string
  initialPhotoURL: string | null | undefined
}): UseAvatarUploadReturn {

  const [photoURL, setPhotoURL] = useState<string | null>(initialPhotoURL ?? null)
  const [progress, setProgress] = useState<number | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // ── Permissions ─────────────────────────────────────────────────────────────

  const requestPermissions = useCallback(async (): Promise<boolean> => {
    if (Platform.OS === 'web') return true

    const { status: mediaStatus } =
      await ImagePicker.requestMediaLibraryPermissionsAsync()

    if (mediaStatus !== 'granted') {
      Alert.alert(
        'Permission needed',
        'Please allow access to your photo library in Settings.',
        [{ text: 'OK' }]
      )
      return false
    }
    return true
  }, [])

  const requestCameraPermission = useCallback(async (): Promise<boolean> => {
    if (Platform.OS === 'web') return true

    const { status } = await ImagePicker.requestCameraPermissionsAsync()
    if (status !== 'granted') {
      Alert.alert(
        'Camera access needed',
        'Please allow camera access in Settings.',
        [{ text: 'OK' }]
      )
      return false
    }
    return true
  }, [])

  // ── Core upload ─────────────────────────────────────────────────────────────

  const uploadBlob = useCallback(
    (blob: Blob): Promise<string> => {
      return new Promise((resolve, reject) => {
        const storageRef = ref(storage, `avatars/${userId}.jpg`)

        const task = uploadBytesResumable(storageRef, blob, {
          contentType: 'image/jpeg',
          customMetadata: { uploadedBy: userId },
        })

        task.on(
          'state_changed',
          (snapshot) => {
            const pct = snapshot.bytesTransferred / snapshot.totalBytes
            setProgress(pct)
          },
          (err) => {
            reject(err)
          },
          async () => {
            const url = await getDownloadURL(task.snapshot.ref)
            resolve(url)
          }
        )
      })
    },
    [userId]
  )

  // ── Pick & Upload ────────────────────────────────────────────────────────────

  const pickAndUpload = useCallback(
    async (source: UploadSource): Promise<void> => {
      setError(null)

      // 1. Permissions
      const hasPermission =
        source === 'camera'
          ? await requestCameraPermission()
          : await requestPermissions()

      if (!hasPermission) return

      // 2. Launch picker
      const pickerOptions: ImagePicker.ImagePickerOptions = {
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.85,
        base64: false,
      }

      const result =
        source === 'camera'
          ? await ImagePicker.launchCameraAsync(pickerOptions)
          : await ImagePicker.launchImageLibraryAsync({
              ...pickerOptions,
              mediaTypes: ImagePicker.MediaTypeOptions.Images,
            })

      if (result.canceled) return

      const uri = result.assets[0].uri

      // 3. Upload
      setIsUploading(true)
      setProgress(0)

      try {
        // Convert local URI → Blob
        const response = await fetch(uri)
        const blob = await response.blob()

        // Upload to Firebase Storage + track progress
        const downloadURL = await uploadBlob(blob)

        // 4. Persist to Firestore
        await updateDoc(doc(db, 'users', userId), {
          photoURL: downloadURL,
          photoUpdatedAt: new Date().toISOString(),
        })

        // 5. Update local state — UI reflects instantly
        setPhotoURL(downloadURL)
      } catch (err: any) {
        const message = err?.message ?? 'Upload failed. Please try again.'
        setError(message)
        Alert.alert('Upload failed', message)
      } finally {
        setIsUploading(false)
        setProgress(null)
      }
    },
    [userId, requestPermissions, requestCameraPermission, uploadBlob]
  )

  // ── Remove Photo ─────────────────────────────────────────────────────────────

  const removePhoto = useCallback(async (): Promise<void> => {
    setError(null)
    setIsUploading(true)

    try {
      // Delete from Storage (best-effort — file may not exist)
      try {
        const storageRef = ref(storage, `avatars/${userId}.jpg`)
        await deleteObject(storageRef)
      } catch {
        // Ignore — file might not exist in Storage yet
      }

      // Clear in Firestore
      await updateDoc(doc(db, 'users', userId), {
        photoURL: null,
        photoUpdatedAt: new Date().toISOString(),
      })

      setPhotoURL(null)
    } catch (err: any) {
      const message = err?.message ?? 'Could not remove photo.'
      setError(message)
      Alert.alert('Error', message)
    } finally {
      setIsUploading(false)
      setProgress(null)
    }
  }, [userId])

  // ── Return ───────────────────────────────────────────────────────────────────

  return {
    photoURL,
    progress,
    isUploading,
    error,
    pickAndUpload,
    removePhoto,
    requestPermissions,
  }
}
