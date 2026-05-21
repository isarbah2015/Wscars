import { useState, useCallback, useEffect } from 'react'
import { Alert, Platform, Linking } from 'react-native'
import * as ImagePicker from 'expo-image-picker'
import { updateProfile } from 'firebase/auth'
import { ref, deleteObject } from 'firebase/storage'
import { doc, setDoc } from 'firebase/firestore'
import { storage, db, isFirebaseReady } from '@/lib/firebase'
import { uploadAvatar } from '@/services/firebase/storage'
import { auth } from '@/lib/firebase-persistence'

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

  const pickAndUpload = useCallback(
    async (source: UploadSource): Promise<void> => {
      setError(null)

      if (!userId) {
        Alert.alert('Error', 'You must be logged in to upload a photo')
        return
      }
      if (!isFirebaseReady()) {
        Alert.alert('Error', 'Firebase is not configured. Please update the app.')
        return
      }

      const hasPermission = await requestPermission(source)
      if (!hasPermission) return

      const result =
        source === 'camera'
          ? await ImagePicker.launchCameraAsync({ allowsEditing: true, aspect: [1, 1], quality: 0.85 })
          : await ImagePicker.launchImageLibraryAsync({
              allowsEditing: true, aspect: [1, 1], quality: 0.85,
              mediaTypes: ['images'] as any,
            })

      if (result.canceled) return

      const uri = result.assets[0].uri
      setIsUploading(true)
      setProgress(0)

      try {
        // Step 1 — upload file to Firebase Storage
        const downloadURL = await uploadAvatar(userId, uri, setProgress)

        // Step 2 — update Firebase Auth profile (no Firestore rules needed)
        const fbUser = auth?.currentUser
        if (fbUser) {
          await updateProfile(fbUser, { photoURL: downloadURL })
        }

        // Step 3 — best-effort Firestore sync (silently ignore rules errors)
        if (db && fbUser) {
          try {
            await setDoc(
              doc(db, 'users', userId),
              { avatar: downloadURL, photoUpdatedAt: new Date().toISOString() },
              { merge: true },
            )
          } catch {
            // Firestore rules may not be deployed yet — photo is saved via Auth above
          }
        }

        setPhotoURL(downloadURL)
        onSuccess?.(downloadURL)
      } catch (err: any) {
        const message = err?.message ?? 'Upload failed. Please try again.'
        setError(message)
        Alert.alert('Upload failed', message)
      } finally {
        setIsUploading(false)
        setProgress(null)
      }
    },
    [userId, requestPermission, onSuccess]
  )

  const removePhoto = useCallback(async (): Promise<void> => {
    setError(null)
    setIsUploading(true)
    try {
      if (storage) {
        for (const ext of ['jpg', 'jpeg', 'png', 'webp']) {
          try { await deleteObject(ref(storage, `avatars/${userId}.${ext}`)) } catch {}
        }
      }
      const fbUser = auth?.currentUser
      if (fbUser) {
        await updateProfile(fbUser, { photoURL: null })
      }
      if (db) {
        try {
          await setDoc(doc(db, 'users', userId), { avatar: null, photoUpdatedAt: new Date().toISOString() }, { merge: true })
        } catch {}
      }
      setPhotoURL(null)
      onSuccess?.('')
    } catch (err: any) {
      const message = err?.message ?? 'Could not remove photo.'
      setError(message)
      Alert.alert('Error', message)
    } finally {
      setIsUploading(false)
      setProgress(null)
    }
  }, [userId, onSuccess])

  return { photoURL, progress, isUploading, error, pickAndUpload, removePhoto, requestPermission }
}
