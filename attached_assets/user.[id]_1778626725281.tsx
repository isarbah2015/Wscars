// app/user/[id].tsx
// WestCars — seller profile screen
// Avatar upload only available when viewer === owner (isOwner gate)

import { useState } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  SafeAreaView,
  Linking,
} from 'react-native'
import { Image } from 'expo-image'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { auth } from '@/lib/firebase'
import { useAvatarUpload } from '@/hooks/useAvatarUpload'
import { useDocument } from '@/hooks/useDocument'   // your Firestore listener hook
import AvatarUploadSheet from '@/components/AvatarUploadSheet'

// ─── Feather icons ────────────────────────────────────────────────────────────

function CameraSmallIcon({ color = '#fff', size = 13 }: { color?: string; size?: number }) {
  const { Svg, Path, Circle } = require('react-native-svg')
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <Path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
      <Circle cx="12" cy="13" r="4" />
    </Svg>
  )
}

function MessageIcon({ color = '#006666', size = 18 }: { color?: string; size?: number }) {
  const { Svg, Path } = require('react-native-svg')
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <Path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </Svg>
  )
}

function PhoneIcon({ color = '#fff', size = 18 }: { color?: string; size?: number }) {
  const { Svg, Path } = require('react-native-svg')
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <Path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.3 2 2 0 0 1 3.59 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.56a16 16 0 0 0 5.93 5.93l.94-.94a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
    </Svg>
  )
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function UserProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const router = useRouter()
  const currentUid = auth.currentUser?.uid
  const isOwner = currentUid === id

  // Firestore seller data
  const { data: seller } = useDocument(`users/${id}`)

  const [sheetOpen, setSheetOpen] = useState(false)

  // Hook is always called (Rules of Hooks) — only does real work when isOwner
  const { photoURL, progress, isUploading, pickAndUpload, removePhoto } =
    useAvatarUpload({
      userId: id,
      initialPhotoURL: seller?.photoURL ?? null,
    })

  const initials =
    seller?.displayName?.slice(0, 2).toUpperCase() ?? '??'

  // Derived photo: prefer hook state (reflects just-uploaded), fall back to Firestore
  const displayPhoto = photoURL ?? seller?.photoURL ?? null

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>

        {/* ── Header ── */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Text style={styles.backText}>‹ Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            {isOwner ? 'My Profile' : 'Seller Profile'}
          </Text>
          <View style={{ width: 60 }} />
        </View>

        {/* ── Avatar section ── */}
        <View style={styles.avatarSection}>
          <TouchableOpacity
            onPress={isOwner ? () => setSheetOpen(true) : undefined}
            disabled={!isOwner || isUploading}
            activeOpacity={isOwner ? 0.85 : 1}
            style={styles.avatarWrap}
          >
            {displayPhoto ? (
              <Image
                source={{ uri: displayPhoto }}
                style={styles.avatar}
                contentFit="cover"
                transition={200}
              />
            ) : (
              <View style={[styles.avatar, styles.avatarFallback]}>
                <Text style={styles.initials}>{initials}</Text>
              </View>
            )}

            {/* Camera badge — owner only */}
            {isOwner && (
              <View style={styles.cameraBadge}>
                {isUploading
                  ? <ActivityIndicator size="small" color="#fff" />
                  : <CameraSmallIcon color="#fff" size={13} />}
              </View>
            )}
          </TouchableOpacity>

          {/* Upload progress — owner only */}
          {isOwner && progress !== null && (
            <View style={styles.progressTrack}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${Math.round(progress * 100)}%` },
                ]}
              />
            </View>
          )}

          <Text style={styles.displayName}>
            {seller?.displayName ?? (isOwner ? auth.currentUser?.displayName : null) ?? 'Seller'}
          </Text>

          {isOwner && (
            <TouchableOpacity
              style={styles.editPhotoHint}
              onPress={() => setSheetOpen(true)}
              disabled={isUploading}
            >
              <Text style={styles.editPhotoHintText}>
                {isUploading ? 'Uploading…' : 'Change profile photo'}
              </Text>
            </TouchableOpacity>
          )}

          {!isOwner && seller?.memberSince && (
            <Text style={styles.memberSince}>
              Member since{' '}
              {new Date(seller.memberSince).toLocaleDateString('en-GB', {
                month: 'short', year: 'numeric',
              })}
            </Text>
          )}
        </View>

        {/* ── Seller stats card ── */}
        {!isOwner && (
          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Text style={styles.statNum}>{seller?.totalListings ?? '—'}</Text>
              <Text style={styles.statLabel}>Listings</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statBox}>
              <Text style={styles.statNum}>{seller?.totalSales ?? '—'}</Text>
              <Text style={styles.statLabel}>Sales</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statBox}>
              <Text style={styles.statNum}>
                {seller?.rating ? seller.rating.toFixed(1) : '—'}
              </Text>
              <Text style={styles.statLabel}>Rating</Text>
            </View>
          </View>
        )}

        {/* ── Contact buttons — non-owners only ── */}
        {!isOwner && (
          <View style={styles.contactRow}>
            <TouchableOpacity
              style={styles.msgBtn}
              activeOpacity={0.8}
              onPress={() => router.push(`/messages/new?recipientId=${id}`)}
            >
              <MessageIcon color="#006666" size={18} />
              <Text style={styles.msgBtnText}>Message Seller</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.callBtn}
              activeOpacity={0.8}
              onPress={() => seller?.phone && Linking.openURL(`tel:${seller.phone}`)}
            >
              <PhoneIcon color="#fff" size={18} />
              <Text style={styles.callBtnText}>Call Seller</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* ── Account details — owner only ── */}
        {isOwner && (
          <View style={styles.card}>
            <Text style={styles.cardLabel}>ACCOUNT</Text>
            <View style={styles.cardRow}>
              <Text style={styles.cardKey}>Email</Text>
              <Text style={styles.cardVal}>{auth.currentUser?.email ?? '—'}</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.cardRow}>
              <Text style={styles.cardKey}>User ID</Text>
              <Text style={[styles.cardVal, { fontSize: 11 }]}>{id}</Text>
            </View>
          </View>
        )}

      </ScrollView>

      {/* ── Upload sheet — owner only ── */}
      {isOwner && (
        <AvatarUploadSheet
          visible={sheetOpen}
          hasPhoto={!!displayPhoto}
          onCamera={() => { setSheetOpen(false); pickAndUpload('camera') }}
          onLibrary={() => { setSheetOpen(false); pickAndUpload('library') }}
          onRemove={() => { setSheetOpen(false); removePhoto() }}
          onClose={() => setSheetOpen(false)}
        />
      )}
    </SafeAreaView>
  )
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#f7fafa' },
  container: { paddingBottom: 40 },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 10,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eaf4f4',
  },
  backBtn: { width: 60 },
  backText: { fontSize: 16, color: '#008080', fontWeight: '600' },
  headerTitle: { fontSize: 17, fontWeight: '800', color: '#006666' },

  // Avatar
  avatarSection: {
    alignItems: 'center',
    paddingVertical: 30,
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
  memberSince: { fontSize: 13, color: '#888', marginTop: 4 },
  editPhotoHint: { marginTop: 10 },
  editPhotoHintText: { fontSize: 13, fontWeight: '600', color: '#008080' },

  // Stats
  statsRow: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    marginHorizontal: 16,
    borderRadius: 18,
    padding: 16,
    marginBottom: 14,
    shadowColor: '#008080',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  statBox: { flex: 1, alignItems: 'center' },
  statNum: { fontSize: 22, fontWeight: '800', color: '#008080' },
  statLabel: { fontSize: 12, color: '#888', fontWeight: '600', marginTop: 2 },
  statDivider: { width: 1, backgroundColor: '#f0f0f0' },

  // Contact buttons
  contactRow: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 16,
    marginBottom: 14,
  },
  msgBtn: {
    flex: 1,
    height: 52,
    borderRadius: 16,
    backgroundColor: '#e0f2f2',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: '#b2e0e0',
  },
  msgBtnText: { fontSize: 15, fontWeight: '800', color: '#006666' },
  callBtn: {
    flex: 1,
    height: 52,
    borderRadius: 16,
    backgroundColor: '#008080',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  callBtnText: { fontSize: 15, fontWeight: '800', color: '#fff' },

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
