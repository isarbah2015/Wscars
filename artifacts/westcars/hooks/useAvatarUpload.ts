import { useState, useCallback } from 'react'
import { Alert, Platform, Linking } from 'react-native'
import * as ImagePicker from 'expo-image-picker'
import {
  ref,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
} from 'firebase/storage'
import { doc, updateDoc } from 'firebase/firestore'
import { storage, db } from '@/lib/firebase'

export type UploadSource = 'camera' | 'library'

export interface AvatarUploadState {
  photoURL: string | null
  progress: number | null
  isUploading: boolean
  error: string | null
}

export interface UseAvatarUploadReturn extends AvatarUploadState {
  pickAndUpload: (source: UploadSource) => Promise<void>
  removePhoto: () => Promise<void>
  requestPermission: (source: UploadSource) => Promise<boolean>
}

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

  // ── FIX #1: Permission denied → open phone Settings directly ────────────────

  const requestPermission = useCallback(
    async (source: UploadSource): Promise<boolean> => {
      if (Platform.OS === 'web') return true

      const { status } =
        source === 'camera'
          ? await ImagePicker.requestCameraPermissionsAsync()
          : await ImagePicker.requestMediaLibraryPermissionsAsync()

      if (status === 'granted') return true

      Alert.alert(
        source === 'camera' ? 'Camera Access Needed' : 'Photo Library Access Needed',
        source === 'camera'
          ? 'WestCars needs camera access to take a profile photo. Tap "Open Settings" and enable Camera.'
          : 'WestCars needs photo library access. Tap "Open Settings" and enable Photos.',
        [
          { text: 'Not Now', style: 'cancel' },
          {
            text: 'Open Settings',
            onPress: () => Linking.openSettings(),
          },
        ]
      )
      return false
    },
    []
  )

  // ── Core upload ──────────────────────────────────────────────────────────────

  const uploadBlob = useCallback(
    (blob: Blob): Promise<string> => {
      return new Promise((resolve, reject) => {
        if (!storage) {
          reject(new Error('Firebase Storage not initialised'))
          return
        }
        const storageRef = ref(storage, `avatars/${userId}.jpg`)
        const task = uploadBytesResumable(storageRef, blob, {
          contentType: 'image/jpeg',
          customMetadata: { uploadedBy: userId },
        })
        task.on(
          'state_changed',
          (snapshot) => setProgress(snapshot.bytesTransferred / snapshot.totalBytes),
          reject,
          async () => resolve(await getDownloadURL(task.snapshot.ref))
        )
      })
    },
    [userId]
  )

  // ── Pick & Upload ────────────────────────────────────────────────────────────

  const pickAndUpload = useCallback(
    async (source: UploadSource): Promise<void> => {
      setError(null)

      const hasPermission = await requestPermission(source)
      if (!hasPermission) return

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
              mediaTypes: ['images'] as any,
            })

      if (result.canceled) return

      const uri = result.assets[0].uri
      setIsUploading(true)
      setProgress(0)

      try {
        const response = await fetch(uri)
        const blob = await response.blob()
        const downloadURL = await uploadBlob(blob)

        if (!db) throw new Error('Firestore not initialised')

        await updateDoc(doc(db, 'users', userId), {
          avatar: downloadURL,
          photoUpdatedAt: new Date().toISOString(),
        })

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
    [userId, requestPermission, uploadBlob]
  )

  // ── Remove Photo ─────────────────────────────────────────────────────────────

  const removePhoto = useCallback(async (): Promise<void> => {
    setError(null)
    setIsUploading(true)
    try {
      if (storage) {
        try {
          await deleteObject(ref(storage, `avatars/${userId}.jpg`))
        } catch {
          // File may not exist — ignore
        }
      }
      if (!db) throw new Error('Firestore not initialised')
      await updateDoc(doc(db, 'users', userId), {
        avatar: null,
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

  return {
    photoURL,
    progress,
    isUploading,
    error,
    pickAndUpload,
    removePhoto,
    requestPermission,
  }
}
