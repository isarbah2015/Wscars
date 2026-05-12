// components/AvatarUploadSheet.tsx
// WestCars — reusable bottom sheet for avatar upload
// Uses React Native SVG inline icons (no external icon lib required)

import { Modal, Pressable, View, Text, TouchableOpacity, StyleSheet } from 'react-native'

// ─── Feather-style inline icons ───────────────────────────────────────────────

function CameraIcon({ color = '#fff', size = 22 }: { color?: string; size?: number }) {
  const { Svg, Rect, Circle, Line, Path } = require('react-native-svg')
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <Path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
      <Circle cx="12" cy="13" r="4" />
    </Svg>
  )
}

function GalleryIcon({ color = '#fff', size = 22 }: { color?: string; size?: number }) {
  const { Svg, Rect, Polyline, Line } = require('react-native-svg')
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <Rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
      <Circle cx="8.5" cy="8.5" r="1.5" fill={color} stroke="none" />
      <Polyline points="21 15 16 10 5 21" />
    </Svg>
  )
}

function TrashIcon({ color = '#e24b4a', size = 18 }: { color?: string; size?: number }) {
  const { Svg, Polyline, Path, Line } = require('react-native-svg')
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <Polyline points="3 6 5 6 21 6" />
      <Path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
      <Path d="M10 11v6" />
      <Path d="M14 11v6" />
      <Path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
    </Svg>
  )
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface AvatarUploadSheetProps {
  visible: boolean
  hasPhoto: boolean
  onCamera: () => void
  onLibrary: () => void
  onRemove: () => void
  onClose: () => void
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function AvatarUploadSheet({
  visible,
  hasPhoto,
  onCamera,
  onLibrary,
  onRemove,
  onClose,
}: AvatarUploadSheetProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <Pressable style={styles.backdrop} onPress={onClose} />

      <View style={styles.sheet}>
        {/* Drag handle */}
        <View style={styles.handle} />

        <Text style={styles.title}>Update Profile Photo</Text>

        {/* Camera + Library row */}
        <View style={styles.optRow}>
          <TouchableOpacity style={styles.opt} onPress={onCamera} activeOpacity={0.75}>
            <View style={styles.optIcon}>
              <CameraIcon color="#fff" size={22} />
            </View>
            <Text style={styles.optLabel}>Camera</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.opt} onPress={onLibrary} activeOpacity={0.75}>
            <View style={styles.optIcon}>
              <GalleryIcon color="#fff" size={22} />
            </View>
            <Text style={styles.optLabel}>Library</Text>
          </TouchableOpacity>
        </View>

        {/* Remove — only shown when a photo exists */}
        {hasPhoto && (
          <TouchableOpacity style={styles.removeRow} onPress={onRemove} activeOpacity={0.75}>
            <TrashIcon color="#e24b4a" size={18} />
            <Text style={styles.removeText}>Remove Photo</Text>
          </TouchableOpacity>
        )}

        {/* Cancel */}
        <TouchableOpacity style={styles.cancelRow} onPress={onClose} activeOpacity={0.75}>
          <Text style={styles.cancelText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  )
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  sheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    padding: 20,
    paddingBottom: 40,
  },
  handle: {
    width: 36,
    height: 4,
    backgroundColor: '#ddd',
    borderRadius: 4,
    alignSelf: 'center',
    marginBottom: 18,
  },
  title: {
    fontSize: 16,
    fontWeight: '800',
    color: '#111',
    marginBottom: 18,
    textAlign: 'center',
  },
  optRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  opt: {
    flex: 1,
    backgroundColor: '#f4fafa',
    borderRadius: 16,
    padding: 18,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0f2f2',
  },
  optIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#008080',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  optLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#111',
  },
  removeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    marginTop: 4,
  },
  removeText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#e24b4a',
  },
  cancelRow: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  cancelText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#888',
  },
})
