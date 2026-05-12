// ─────────────────────────────────────────────────────────────────────────────
// INTEGRATION: useAvatarUpload in both profile screens
// ─────────────────────────────────────────────────────────────────────────────


// ─────────────────────────────────────────────────────────────────────────────
// 1. app/(tabs)/profile.tsx  — Own profile, always editable
// ─────────────────────────────────────────────────────────────────────────────

import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native'
import { Image } from 'expo-image'
import { auth } from '@/lib/firebase'
import { useAvatarUpload } from '@/hooks/useAvatarUpload'
import AvatarUploadSheet from '@/components/AvatarUploadSheet'
import { useState } from 'react'

export default function ProfileScreen() {
  const user = auth.currentUser!
  const [sheetOpen, setSheetOpen] = useState(false)

  const { photoURL, progress, isUploading, pickAndUpload, removePhoto } =
    useAvatarUpload({
      userId: user.uid,
      initialPhotoURL: user.photoURL,
    })

  return (
    <View style={styles.container}>

      {/* Avatar — always tappable on own profile */}
      <TouchableOpacity onPress={() => setSheetOpen(true)} disabled={isUploading}>
        {photoURL ? (
          <Image source={{ uri: photoURL }} style={styles.avatar} />
        ) : (
          <View style={[styles.avatar, styles.avatarFallback]}>
            <Text style={styles.initials}>
              {user.displayName?.slice(0, 2).toUpperCase() ?? 'ME'}
            </Text>
          </View>
        )}

        {/* Teal camera badge */}
        <View style={styles.cameraBadge}>
          {isUploading
            ? <ActivityIndicator size="small" color="#fff" />
            : <CameraIcon />}
        </View>
      </TouchableOpacity>

      {/* Upload progress bar */}
      {progress !== null && (
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${Math.round(progress * 100)}%` }]} />
        </View>
      )}

      {/* Bottom sheet */}
      <AvatarUploadSheet
        visible={sheetOpen}
        hasPhoto={!!photoURL}
        onCamera={() => { setSheetOpen(false); pickAndUpload('camera') }}
        onLibrary={() => { setSheetOpen(false); pickAndUpload('library') }}
        onRemove={() => { setSheetOpen(false); removePhoto() }}
        onClose={() => setSheetOpen(false)}
      />

    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  avatar: { width: 88, height: 88, borderRadius: 44 },
  avatarFallback: { backgroundColor: '#e0f2f2', alignItems: 'center', justifyContent: 'center' },
  initials: { fontSize: 28, fontWeight: '800', color: '#006666' },
  cameraBadge: {
    position: 'absolute', bottom: 0, right: 0,
    width: 26, height: 26, borderRadius: 13,
    backgroundColor: '#008080',
    borderWidth: 2, borderColor: '#fff',
    alignItems: 'center', justifyContent: 'center',
  },
  progressTrack: {
    height: 4, backgroundColor: '#e0f2f2',
    borderRadius: 4, marginTop: 10, width: 88,
  },
  progressFill: {
    height: 4, backgroundColor: '#008080', borderRadius: 4,
  },
})


// ─────────────────────────────────────────────────────────────────────────────
// 2. app/user/[id].tsx  — Seller profile, editable only if viewer is owner
// ─────────────────────────────────────────────────────────────────────────────

import { useLocalSearchParams } from 'expo-router'
import { useDocument } from '@/hooks/useDocument'   // your Firestore listener hook

export default function UserProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const currentUid = auth.currentUser?.uid
  const isOwner = currentUid === id

  // Fetch seller data from Firestore
  const { data: seller } = useDocument(`users/${id}`)

  const [sheetOpen, setSheetOpen] = useState(false)

  // Hook only does real work when isOwner — safe to always call (Rules of Hooks)
  const { photoURL, progress, isUploading, pickAndUpload, removePhoto } =
    useAvatarUpload({
      userId: id,
      initialPhotoURL: seller?.photoURL,
    })

  return (
    <View style={sellerStyles.container}>

      {/* Avatar — tappable only if viewer owns this profile */}
      <TouchableOpacity
        onPress={isOwner ? () => setSheetOpen(true) : undefined}
        disabled={!isOwner || isUploading}
        activeOpacity={isOwner ? 0.7 : 1}
      >
        {photoURL ? (
          <Image source={{ uri: photoURL }} style={sellerStyles.avatar} />
        ) : (
          <View style={[sellerStyles.avatar, sellerStyles.avatarFallback]}>
            <Text style={sellerStyles.initials}>
              {seller?.displayName?.slice(0, 2).toUpperCase() ?? '??'}
            </Text>
          </View>
        )}

        {/* Camera badge — only visible when owner is viewing their own profile */}
        {isOwner && (
          <View style={sellerStyles.cameraBadge}>
            {isUploading
              ? <ActivityIndicator size="small" color="#fff" />
              : <CameraIcon />}
          </View>
        )}
      </TouchableOpacity>

      {/* Progress bar — only when uploading */}
      {isOwner && progress !== null && (
        <View style={sellerStyles.progressTrack}>
          <View style={[sellerStyles.progressFill, { width: `${Math.round(progress * 100)}%` }]} />
        </View>
      )}

      {/* Upload sheet — only rendered for owner */}
      {isOwner && (
        <AvatarUploadSheet
          visible={sheetOpen}
          hasPhoto={!!photoURL}
          onCamera={() => { setSheetOpen(false); pickAndUpload('camera') }}
          onLibrary={() => { setSheetOpen(false); pickAndUpload('library') }}
          onRemove={() => { setSheetOpen(false); removePhoto() }}
          onClose={() => setSheetOpen(false)}
        />
      )}

      {/* Contact buttons — only visible to non-owners */}
      {!isOwner && (
        <View style={sellerStyles.contactRow}>
          <TouchableOpacity style={sellerStyles.msgBtn}>
            <Text style={sellerStyles.msgBtnText}>Message Seller</Text>
          </TouchableOpacity>
          <TouchableOpacity style={sellerStyles.callBtn}>
            <Text style={sellerStyles.callBtnText}>Call Seller</Text>
          </TouchableOpacity>
        </View>
      )}

    </View>
  )
}

const sellerStyles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  avatar: { width: 88, height: 88, borderRadius: 44 },
  avatarFallback: { backgroundColor: '#e0f2f2', alignItems: 'center', justifyContent: 'center' },
  initials: { fontSize: 28, fontWeight: '800', color: '#006666' },
  cameraBadge: {
    position: 'absolute', bottom: 0, right: 0,
    width: 26, height: 26, borderRadius: 13,
    backgroundColor: '#008080',
    borderWidth: 2, borderColor: '#fff',
    alignItems: 'center', justifyContent: 'center',
  },
  progressTrack: { height: 4, backgroundColor: '#e0f2f2', borderRadius: 4, marginTop: 10, width: 88 },
  progressFill: { height: 4, backgroundColor: '#008080', borderRadius: 4 },
  contactRow: { flexDirection: 'row', gap: 10, paddingHorizontal: 18, marginTop: 16 },
  msgBtn: {
    flex: 1, height: 50, borderRadius: 16,
    backgroundColor: '#e0f2f2',
    alignItems: 'center', justifyContent: 'center',
  },
  msgBtnText: { fontSize: 15, fontWeight: '800', color: '#006666' },
  callBtn: {
    flex: 1, height: 50, borderRadius: 16,
    backgroundColor: '#008080',
    alignItems: 'center', justifyContent: 'center',
  },
  callBtnText: { fontSize: 15, fontWeight: '800', color: '#fff' },
})


// ─────────────────────────────────────────────────────────────────────────────
// 3. components/AvatarUploadSheet.tsx  — Reusable bottom sheet
// ─────────────────────────────────────────────────────────────────────────────

import { Modal, Pressable } from 'react-native'

interface AvatarUploadSheetProps {
  visible: boolean
  hasPhoto: boolean
  onCamera: () => void
  onLibrary: () => void
  onRemove: () => void
  onClose: () => void
}

export function AvatarUploadSheet({
  visible, hasPhoto, onCamera, onLibrary, onRemove, onClose,
}: AvatarUploadSheetProps) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={sheetStyles.backdrop} onPress={onClose} />
      <View style={sheetStyles.sheet}>
        <View style={sheetStyles.handle} />
        <Text style={sheetStyles.title}>Update Profile Photo</Text>

        <View style={sheetStyles.optRow}>
          <TouchableOpacity style={sheetStyles.opt} onPress={onCamera}>
            <View style={sheetStyles.optIcon}>
              <CameraIcon color="#fff" />
            </View>
            <Text style={sheetStyles.optLabel}>Camera</Text>
          </TouchableOpacity>
          <TouchableOpacity style={sheetStyles.opt} onPress={onLibrary}>
            <View style={sheetStyles.optIcon}>
              <GalleryIcon color="#fff" />
            </View>
            <Text style={sheetStyles.optLabel}>Library</Text>
          </TouchableOpacity>
        </View>

        {hasPhoto && (
          <TouchableOpacity style={sheetStyles.removeRow} onPress={onRemove}>
            <TrashIcon color="#e24b4a" />
            <Text style={sheetStyles.removeText}>Remove Photo</Text>
          </TouchableOpacity>
        )}
      </View>
    </Modal>
  )
}

const sheetStyles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)' },
  sheet: {
    backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20,
    padding: 20, paddingBottom: 36,
  },
  handle: { width: 36, height: 4, backgroundColor: '#ddd', borderRadius: 4, alignSelf: 'center', marginBottom: 16 },
  title: { fontSize: 16, fontWeight: '800', color: '#111', marginBottom: 16 },
  optRow: { flexDirection: 'row', gap: 12, marginBottom: 16 },
  opt: { flex: 1, backgroundColor: '#f7f7f7', borderRadius: 14, padding: 16, alignItems: 'center' },
  optIcon: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: '#008080',
    alignItems: 'center', justifyContent: 'center', marginBottom: 8,
  },
  optLabel: { fontSize: 13, fontWeight: '700', color: '#111' },
  removeRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 10 },
  removeText: { fontSize: 14, fontWeight: '700', color: '#e24b4a' },
})

// Helper icon components (replace with your icon library)
function CameraIcon({ color = '#fff' }: { color?: string }) {
  return null // swap in your SVG / Lucide / Ionicons camera icon
}
function GalleryIcon({ color = '#fff' }: { color?: string }) {
  return null // swap in your gallery icon
}
function TrashIcon({ color = '#e24b4a' }: { color?: string }) {
  return null // swap in your trash icon
}
