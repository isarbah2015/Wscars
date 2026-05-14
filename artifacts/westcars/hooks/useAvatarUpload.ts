import { useState, useCallback, useEffect } from 'react'
import { Alert, Platform, Linking } from 'react-native'
import * as ImagePicker from 'expo-image-picker'
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { uploadAvatar } from '@/services/firebase/storage'

export type UploadSource = 'camera' | 'library'

export interface AvatarUploadState {
  photoURL: string | null
  progress: number | null
  isUploading: boolean
  error: string | null
}

export interface UseAvatarUploadOptions {
  userId: string
  initialPhotoURL: string | null | undefined
  onSuccess?: (url: string) => void
}

export interface UseAvatarUploadReturn extends AvatarUploadState {
  pickAndUpload: (source: UploadSource) => Promise<void>
  removePhoto: () => Promise<void>
  requestPermission: (source: UploadSource) => Promise<boolean>
}

export function useAvatarUpload({
  userId,
  initialPhotoURL,
  onSuccess,
}: UseAvatarUploadOptions): UseAvatarUploadReturn {

  const [photoURL, setPhotoURL] = useState<string | null>(initialPhotoURL ?? null)
  const [progress, setProgress] = useState<number | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (initialPhotoURL && !photoURL) {
      setPhotoURL(initialPhotoURL)
    }
  }, [initialPhotoURL])

  // ── Permission ────────────────────────────────────────────────────────────────

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
          { text: 'Open Settings', onPress: () => Linking.openSettings() },
        ]
      )
      return false
    },
    []
  )

  // ── Pick & Upload ─────────────────────────────────────────────────────────────

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
        // uploadAvatar handles: null storage check, fetch→blob, uploadBytes, getDownloadURL
        const url = await uploadAvatar(userId, uri)

        if (!db) throw new Error('Firestore not ready')
        await updateDoc(doc(db, 'users', userId), {
          avatar: url,
          photoUpdatedAt: serverTimestamp(),
        })

        setPhotoURL(url)
        onSuccess?.(url)
      } catch (err: any) {
        const message = err?.message ?? 'Upload failed. Please try again.'
        console.error('[useAvatarUpload]', err?.code ?? err?.message ?? err)
        setError(message)
        Alert.alert('Upload failed', message)
      } finally {
        setIsUploading(false)
        setProgress(null)
      }
    },
    [userId, requestPermission, onSuccess]
  )

  // ── Remove Photo ──────────────────────────────────────────────────────────────

  const removePhoto = useCallback(async (): Promise<void> => {
    setError(null)
    setIsUploading(true)
    try {
      if (!db) throw new Error('Firestore not ready')

      // Delete from Storage if a URL exists
      if (photoURL) {
        const { storage } = await import('@/lib/firebase')
        const { ref, deleteObject } = await import('firebase/storage')
        if (storage) {
          try {
            await deleteObject(ref(storage, `avatars/${userId}.jpg`))
          } catch {
            // File may not exist — ignore
          }
        }
      }

      await updateDoc(doc(db, 'users', userId), {
        avatar: null,
        photoUpdatedAt: serverTimestamp(),
      })

      setPhotoURL(null)
      onSuccess?.('')
    } catch (err: any) {
      const message = err?.message ?? 'Could not remove photo.'
      console.error('[removePhoto]', err?.code ?? err?.message ?? err)
      setError(message)
      Alert.alert('Error', message)
    } finally {
      setIsUploading(false)
      setProgress(null)
    }
  }, [userId, photoURL, onSuccess])

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
