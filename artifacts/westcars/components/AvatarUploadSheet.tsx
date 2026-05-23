import { Modal, Pressable, View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import Svg, { Path, Circle, Rect, Polyline } from 'react-native-svg'
import { useTheme } from '@/context/ThemeContext'

// ─── Inline Feather-style icons ───────────────────────────────────────────────

function CameraIcon({ color = '#fff', size = 22 }: { color?: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <Path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
      <Circle cx="12" cy="13" r="4" />
    </Svg>
  )
}

function GalleryIcon({ color = '#fff', size = 22 }: { color?: string; size?: number }) {
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
  const { colors, isDark } = useTheme()
  const line = isDark ? colors.border : '#f0f0f0'

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <Pressable style={styles.backdrop} onPress={onClose} />

      <View style={[styles.sheet, { backgroundColor: colors.card }]}>
        <View style={[styles.handle, { backgroundColor: isDark ? 'rgba(255,255,255,0.2)' : '#ddd' }]} />

        <Text style={[styles.title, { color: colors.text }]}>Update Profile Photo</Text>

        <View style={styles.optRow}>
          <TouchableOpacity
            style={[styles.opt, { backgroundColor: colors.inputBg, borderColor: isDark ? colors.border : '#e0f2f2' }]}
            onPress={onCamera}
            activeOpacity={0.75}
          >
            <View style={styles.optIcon}>
              <CameraIcon color="#fff" size={22} />
            </View>
            <Text style={[styles.optLabel, { color: colors.text }]}>Camera</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.opt, { backgroundColor: colors.inputBg, borderColor: isDark ? colors.border : '#e0f2f2' }]}
            onPress={onLibrary}
            activeOpacity={0.75}
          >
            <View style={styles.optIcon}>
              <GalleryIcon color="#fff" size={22} />
            </View>
            <Text style={[styles.optLabel, { color: colors.text }]}>Library</Text>
          </TouchableOpacity>
        </View>

        {hasPhoto && (
          <TouchableOpacity style={[styles.removeRow, { borderTopColor: line }]} onPress={onRemove} activeOpacity={0.75}>
            <TrashIcon color="#e24b4a" size={18} />
            <Text style={styles.removeText}>Remove Photo</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity style={styles.cancelRow} onPress={onClose} activeOpacity={0.75}>
          <Text style={[styles.cancelText, { color: colors.textTertiary }]}>Cancel</Text>
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
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    padding: 20,
    paddingBottom: 40,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 4,
    alignSelf: 'center',
    marginBottom: 18,
  },
  title: {
    fontSize: 16,
    fontWeight: '800',
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
    borderRadius: 16,
    padding: 18,
    alignItems: 'center',
    borderWidth: 1,
  },
  optIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#0EB5CA',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  optLabel: {
    fontSize: 13,
    fontWeight: '700',
  },
  removeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderTopWidth: 1,
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
  },
})
