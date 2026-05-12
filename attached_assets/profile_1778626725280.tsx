// app/(tabs)/profile.tsx
// WestCars — own profile screen, always editable avatar

import { useState } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  SafeAreaView,
} from 'react-native'
import { Image } from 'expo-image'
import { auth } from '@/lib/firebase'
import { useAvatarUpload } from '@/hooks/useAvatarUpload'
import AvatarUploadSheet from '@/components/AvatarUploadSheet'

// ─── Feather camera badge icon ────────────────────────────────────────────────

function CameraSmallIcon({ color = '#fff', size = 14 }: { color?: string; size?: number }) {
  const { Svg, Path, Circle } = require('react-native-svg')
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <Path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
      <Circle cx="12" cy="13" r="4" />
    </Svg>
  )
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function ProfileScreen() {
  const user = auth.currentUser!
  const [sheetOpen, setSheetOpen] = useState(false)

  const { photoURL, progress, isUploading, pickAndUpload, removePhoto } =
    useAvatarUpload({
      userId: user.uid,
      initialPhotoURL: user.photoURL,
    })

  const initials = user.displayName?.slice(0, 2).toUpperCase() ?? 'ME'

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>

        {/* ── Header bar ── */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>My Profile</Text>
        </View>

        {/* ── Avatar section ── */}
        <View style={styles.avatarSection}>
          <TouchableOpacity
            onPress={() => setSheetOpen(true)}
            disabled={isUploading}
            activeOpacity={0.85}
            style={styles.avatarWrap}
          >
            {photoURL ? (
              <Image
                source={{ uri: photoURL }}
                style={styles.avatar}
                contentFit="cover"
                transition={200}
              />
            ) : (
              <View style={[styles.avatar, styles.avatarFallback]}>
                <Text style={styles.initials}>{initials}</Text>
              </View>
            )}

            {/* Teal camera badge */}
            <View style={styles.cameraBadge}>
              {isUploading
                ? <ActivityIndicator size="small" color="#fff" />
                : <CameraSmallIcon color="#fff" size={13} />}
            </View>
          </TouchableOpacity>

          {/* Upload progress bar */}
          {progress !== null && (
            <View style={styles.progressTrack}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${Math.round(progress * 100)}%` },
                ]}
              />
            </View>
          )}

          {/* Display name */}
          <Text style={styles.displayName}>
            {user.displayName ?? 'Your Name'}
          </Text>
          <Text style={styles.email}>{user.email}</Text>

          <TouchableOpacity
            style={styles.editPhotoHint}
            onPress={() => setSheetOpen(true)}
            disabled={isUploading}
          >
            <Text style={styles.editPhotoHintText}>
              {isUploading ? 'Uploading…' : 'Change profile photo'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* ── Profile details card ── */}
        <View style={styles.card}>
          <Text style={styles.cardLabel}>ACCOUNT</Text>
          <View style={styles.cardRow}>
            <Text style={styles.cardKey}>Name</Text>
            <Text style={styles.cardVal}>{user.displayName ?? '—'}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.cardRow}>
            <Text style={styles.cardKey}>Email</Text>
            <Text style={styles.cardVal}>{user.email}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.cardRow}>
            <Text style={styles.cardKey}>Member since</Text>
            <Text style={styles.cardVal}>
              {user.metadata.creationTime
                ? new Date(user.metadata.creationTime).toLocaleDateString('en-GB', {
                    month: 'short', year: 'numeric',
                  })
                : '—'}
            </Text>
          </View>
        </View>

      </ScrollView>

      {/* ── Bottom sheet ── */}
      <AvatarUploadSheet
        visible={sheetOpen}
        hasPhoto={!!photoURL}
        onCamera={() => { setSheetOpen(false); pickAndUpload('camera') }}
        onLibrary={() => { setSheetOpen(false); pickAndUpload('library') }}
        onRemove={() => { setSheetOpen(false); removePhoto() }}
        onClose={() => setSheetOpen(false)}
      />
    </SafeAreaView>
  )
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#f7fafa' },
  container: { paddingBottom: 40 },

  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 10,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eaf4f4',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#006666',
  },

  // Avatar
  avatarSection: {
    alignItems: 'center',
    paddingVertical: 32,
    backgroundColor: '#fff',
    marginBottom: 16,
  },
  avatarWrap: { position: 'relative' },
  avatar: { width: 96, height: 96, borderRadius: 48 },
  avatarFallback: {
    backgroundColor: '#e0f2f2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: { fontSize: 32, fontWeight: '800', color: '#006666' },
  cameraBadge: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#008080',
    borderWidth: 2,
    borderColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressTrack: {
    height: 4,
    backgroundColor: '#e0f2f2',
    borderRadius: 4,
    marginTop: 10,
    width: 96,
  },
  progressFill: { height: 4, backgroundColor: '#008080', borderRadius: 4 },
  displayName: {
    marginTop: 14,
    fontSize: 20,
    fontWeight: '800',
    color: '#111',
  },
  email: {
    fontSize: 13,
    color: '#888',
    marginTop: 3,
  },
  editPhotoHint: { marginTop: 10 },
  editPhotoHintText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#008080',
  },

  // Card
  card: {
    marginHorizontal: 16,
    backgroundColor: '#fff',
    borderRadius: 18,
    paddingHorizontal: 18,
    paddingVertical: 14,
    shadowColor: '#008080',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  cardLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#008080',
    letterSpacing: 1,
    marginBottom: 10,
  },
  cardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
  },
  cardKey: { fontSize: 14, color: '#555', fontWeight: '600' },
  cardVal: { fontSize: 14, color: '#111', fontWeight: '700', maxWidth: '60%', textAlign: 'right' },
  divider: { height: 1, backgroundColor: '#f0f0f0' },
})
