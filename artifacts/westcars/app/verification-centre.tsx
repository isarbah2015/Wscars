// app/verification-centre.tsx
// FIX #6 — Two-step verification: Phone OTP first, then ID/Passport photo upload
// Step 1: Firebase phone OTP → verifiedPhone badge
// Step 2: Upload National ID or Passport photo → verifiedId badge (pending admin review)

import React, { useState } from 'react'
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView,
  Modal, TextInput, ActivityIndicator,
  Alert, Image, Pressable, Linking,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import * as ImagePicker from 'expo-image-picker'
import { Feather } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import {
  PhoneAuthProvider,
  signInWithCredential,
} from 'firebase/auth'
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore'
import { auth } from '@/lib/firebase-persistence'
import { db } from '@/lib/firebase'
import { useApp } from '@/context/AppContext'
import { uploadIdImage } from '@/services/firebase/storage'

const TEAL       = '#008080'
const TEAL_LIGHT = '#e0f2f2'
const TEAL_DARK  = '#006666'

// ─── Badge ────────────────────────────────────────────────────────────────────

function Badge({ label, done, pending }: { label: string; done: boolean; pending?: boolean }) {
  const bg    = done ? TEAL : pending ? '#FFF3CD' : TEAL_LIGHT
  const color = done ? '#fff' : pending ? '#856404' : TEAL_DARK
  const icon  = done ? 'check' : pending ? 'clock' : 'circle'
  return (
    <View style={[badgeS.wrap, { backgroundColor: bg }]}>
      <Feather name={icon as any} size={12} color={color} />
      <Text style={[badgeS.txt, { color }]}>{label}</Text>
    </View>
  )
}
const badgeS = StyleSheet.create({
  wrap: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  txt:  { fontSize: 12, fontWeight: '700' },
})

// ─── Step card ────────────────────────────────────────────────────────────────

function StepCard({
  step, title, description, done, pending, onPress, disabled,
}: {
  step: number; title: string; description: string
  done: boolean; pending?: boolean; onPress: () => void; disabled?: boolean
}) {
  return (
    <TouchableOpacity
      style={[s.stepCard, done && s.stepDone, disabled && s.stepDisabled]}
      onPress={onPress}
      disabled={disabled || done}
      activeOpacity={0.8}
    >
      <View style={[s.stepNum, { backgroundColor: done ? TEAL : TEAL_LIGHT }]}>
        {done
          ? <Feather name="check" size={16} color="#fff" />
          : <Text style={[s.stepNumTxt, { color: TEAL_DARK }]}>{step}</Text>}
      </View>
      <View style={{ flex: 1 }}>
        <Text style={s.stepTitle}>{title}</Text>
        <Text style={s.stepDesc}>{description}</Text>
        {pending && (
          <View style={s.pendingRow}>
            <Feather name="clock" size={12} color="#856404" />
            <Text style={s.pendingTxt}>Under review — usually 24 hrs</Text>
          </View>
        )}
      </View>
      {!done && !pending && !disabled && (
        <Feather name="chevron-right" size={20} color={TEAL} />
      )}
    </TouchableOpacity>
  )
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function VerificationCentreScreen() {
  const router = useRouter()
  const { currentUser } = useApp()

  const verifiedPhone = !!currentUser?.verifiedPhone
  const verifiedId    = !!currentUser?.verifiedId
  const idPending     = !!currentUser?.idVerificationPending

  // Phone OTP state
  const [phoneModal,      setPhoneModal]      = useState(false)
  const [phoneNum,        setPhoneNum]        = useState('')
  const [otpCode,         setOtpCode]         = useState('')
  const [verificationId,  setVerificationId]  = useState<string | null>(null)
  const [phoneLoading,    setPhoneLoading]    = useState(false)

  // ID upload state
  const [idModal,     setIdModal]     = useState(false)
  const [idType,      setIdType]      = useState<'national_id' | 'passport'>('national_id')
  const [idImageUri,  setIdImageUri]  = useState<string | null>(null)
  const [idUploading, setIdUploading] = useState(false)

  // ── Phone OTP ───────────────────────────────────────────────────────────────

  const sendOtp = async () => {
    if (!phoneNum.trim()) return
    setPhoneLoading(true)
    try {
      const { confirmationResult } = await (auth as any).signInWithPhoneNumber(
        phoneNum.startsWith('+') ? phoneNum : `+233${phoneNum.replace(/^0/, '')}`
      )
      setVerificationId(confirmationResult.verificationId ?? confirmationResult)
    } catch (err: any) {
      Alert.alert('Error', err?.message ?? 'Could not send OTP. Check the number and try again.')
    } finally {
      setPhoneLoading(false)
    }
  }

  const verifyOtp = async () => {
    if (!otpCode.trim() || !verificationId) return
    setPhoneLoading(true)
    try {
      const credential = PhoneAuthProvider.credential(verificationId, otpCode)
      await signInWithCredential(auth!, credential)
      await updateDoc(doc(db!, 'users', currentUser!.id), {
        verifiedPhone: true,
        phoneVerifiedAt: serverTimestamp(),
      })
      setPhoneModal(false)
      setOtpCode('')
      setPhoneNum('')
      setVerificationId(null)
      Alert.alert('Phone Verified ✓', 'Your phone number has been verified.')
    } catch (err: any) {
      Alert.alert('Invalid code', 'The code you entered is incorrect. Please try again.')
    } finally {
      setPhoneLoading(false)
    }
  }

  // ── ID / Passport upload ────────────────────────────────────────────────────

  const pickIdImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync()
    if (status !== 'granted') {
      Alert.alert(
        'Permission needed',
        'WestCars needs photo library access to upload your ID.',
        [
          { text: 'Not Now', style: 'cancel' },
          { text: 'Open Settings', onPress: () => Linking.openSettings() },
        ]
      )
      return
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'] as any,
      quality: 0.9,
      allowsEditing: false,
    })
    if (!result.canceled) setIdImageUri(result.assets[0].uri)
  }

  const submitId = async () => {
    if (!idImageUri || !currentUser) return
    setIdUploading(true)
    try {
      const url = await uploadIdImage(currentUser.id, idType, idImageUri)

      await updateDoc(doc(db!, 'users', currentUser.id), {
        idVerificationPending: true,
        idVerificationType: idType,
        idVerificationUrl: url,
        idVerificationSubmittedAt: serverTimestamp(),
      })

      setIdModal(false)
      setIdImageUri(null)
      Alert.alert(
        'Document Submitted ✓',
        "Your document is under review. This usually takes up to 24 hours. You'll be notified once approved."
      )
    } catch (err: any) {
      Alert.alert('Upload failed', err?.message ?? 'Could not upload document. Try again.')
    } finally {
      setIdUploading(false)
    }
  }

  // ── Trust score ──────────────────────────────────────────────────────────────
  const trustScore = (verifiedPhone ? 40 : 0) + (verifiedId ? 60 : idPending ? 20 : 0)

  return (
    <SafeAreaView style={s.safe}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
          <Feather name="arrow-left" size={22} color={TEAL_DARK} />
        </TouchableOpacity>
        <Text style={s.headerTitle}>Verification Centre</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView contentContainerStyle={s.scroll}>

        {/* Trust score card */}
        <View style={s.scoreCard}>
          <Text style={s.scoreLabel}>Trust Score</Text>
          <Text style={s.scoreNum}>{trustScore}%</Text>
          <View style={s.scoreTrack}>
            <View style={[s.scoreFill, { width: `${trustScore}%` as any }]} />
          </View>
          <View style={s.badgeRow}>
            {verifiedPhone && <Badge label="Phone Verified" done />}
            {verifiedId    && <Badge label="ID Verified" done />}
            {idPending     && <Badge label="ID Under Review" done={false} pending />}
          </View>
        </View>

        {/* Step 1 — Phone OTP */}
        <Text style={s.sectionLabel}>STEP 1 — PHONE</Text>
        <StepCard
          step={1}
          title="Verify Phone Number"
          description="Receive a one-time code via SMS to confirm your number."
          done={verifiedPhone}
          onPress={() => setPhoneModal(true)}
        />

        {/* Step 2 — ID/Passport (unlocks after phone) */}
        <Text style={[s.sectionLabel, { marginTop: 20 }]}>STEP 2 — IDENTITY</Text>
        <StepCard
          step={2}
          title="Upload ID or Passport"
          description="Submit a photo of your National ID or Passport for identity verification."
          done={verifiedId}
          pending={idPending}
          disabled={!verifiedPhone}
          onPress={() => setIdModal(true)}
        />
        {!verifiedPhone && (
          <Text style={s.lockedNote}>Complete phone verification first to unlock this step.</Text>
        )}

      </ScrollView>

      {/* ── Phone OTP Modal ─────────────────────────────────────────────────── */}
      <Modal visible={phoneModal} transparent animationType="slide" onRequestClose={() => setPhoneModal(false)}>
        <Pressable style={s.backdrop} onPress={() => setPhoneModal(false)} />
        <View style={s.sheet}>
          <View style={s.handle} />
          <Text style={s.sheetTitle}>Verify Phone Number</Text>

          {!verificationId ? (
            <>
              <Text style={s.sheetDesc}>Enter your Ghana mobile number. We'll send a 6-digit code.</Text>
              <View style={s.inputRow}>
                <Text style={s.flag}>🇬🇭 +233</Text>
                <TextInput
                  style={s.input}
                  placeholder="24 000 0000"
                  keyboardType="phone-pad"
                  value={phoneNum}
                  onChangeText={setPhoneNum}
                  maxLength={12}
                />
              </View>
              <TouchableOpacity
                style={[s.actionBtn, (!phoneNum.trim() || phoneLoading) && s.actionBtnDisabled]}
                onPress={sendOtp}
                disabled={!phoneNum.trim() || phoneLoading}
              >
                {phoneLoading
                  ? <ActivityIndicator color="#fff" />
                  : <Text style={s.actionBtnTxt}>Send Code</Text>}
              </TouchableOpacity>
            </>
          ) : (
            <>
              <Text style={s.sheetDesc}>Enter the 6-digit code sent to {phoneNum}.</Text>
              <TextInput
                style={[s.input, { textAlign: 'center', fontSize: 24, letterSpacing: 8 }]}
                placeholder="000000"
                keyboardType="number-pad"
                value={otpCode}
                onChangeText={setOtpCode}
                maxLength={6}
              />
              <TouchableOpacity
                style={[s.actionBtn, (otpCode.length < 6 || phoneLoading) && s.actionBtnDisabled]}
                onPress={verifyOtp}
                disabled={otpCode.length < 6 || phoneLoading}
              >
                {phoneLoading
                  ? <ActivityIndicator color="#fff" />
                  : <Text style={s.actionBtnTxt}>Verify Code</Text>}
              </TouchableOpacity>
              <TouchableOpacity style={s.resendBtn} onPress={() => setVerificationId(null)}>
                <Text style={s.resendTxt}>← Change number</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </Modal>

      {/* ── ID / Passport Modal ──────────────────────────────────────────────── */}
      <Modal visible={idModal} transparent animationType="slide" onRequestClose={() => setIdModal(false)}>
        <Pressable style={s.backdrop} onPress={() => setIdModal(false)} />
        <View style={s.sheet}>
          <View style={s.handle} />
          <Text style={s.sheetTitle}>Upload Identity Document</Text>
          <Text style={s.sheetDesc}>Choose your document type and upload a clear photo. All documents are encrypted and used only for verification.</Text>

          {/* Document type toggle */}
          <View style={s.typeRow}>
            {(['national_id', 'passport'] as const).map(type => (
              <TouchableOpacity
                key={type}
                style={[s.typeBtn, idType === type && s.typeBtnActive]}
                onPress={() => setIdType(type)}
              >
                <Feather
                  name={type === 'passport' ? 'book-open' : 'credit-card'}
                  size={16}
                  color={idType === type ? '#fff' : TEAL_DARK}
                />
                <Text style={[s.typeTxt, idType === type && s.typeTxtActive]}>
                  {type === 'national_id' ? 'National ID' : 'Passport'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Image preview / picker */}
          <TouchableOpacity style={s.idUploadBox} onPress={pickIdImage} activeOpacity={0.8}>
            {idImageUri ? (
              <Image source={{ uri: idImageUri }} style={s.idPreview} resizeMode="cover" />
            ) : (
              <>
                <Feather name="upload" size={28} color={TEAL} />
                <Text style={s.idUploadTxt}>Tap to select photo</Text>
                <Text style={s.idUploadSub}>
                  Front side of your {idType === 'passport' ? 'passport bio page' : 'Ghana Card'}
                </Text>
              </>
            )}
          </TouchableOpacity>

          {idImageUri && (
            <TouchableOpacity style={s.rePickBtn} onPress={pickIdImage}>
              <Text style={s.rePickTxt}>Choose different photo</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={[s.actionBtn, (!idImageUri || idUploading) && s.actionBtnDisabled]}
            onPress={submitId}
            disabled={!idImageUri || idUploading}
          >
            {idUploading
              ? <ActivityIndicator color="#fff" />
              : <Text style={s.actionBtnTxt}>Submit for Review</Text>}
          </TouchableOpacity>

          <Text style={s.privacyNote}>
            🔒 Your document is encrypted and only used to verify your identity on WestCars.
          </Text>
        </View>
      </Modal>
    </SafeAreaView>
  )
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  safe:   { flex: 1, backgroundColor: '#f7fafa' },
  scroll: { padding: 16, paddingBottom: 40 },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 14,
    backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#eaf4f4',
  },
  backBtn:     { width: 36 },
  headerTitle: { fontSize: 17, fontWeight: '800', color: TEAL_DARK },

  scoreCard: {
    backgroundColor: '#fff', borderRadius: 18, padding: 20,
    marginBottom: 24, alignItems: 'center',
    shadowColor: TEAL, shadowOpacity: 0.07, shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 }, elevation: 2,
  },
  scoreLabel: { fontSize: 12, fontWeight: '700', color: '#888', letterSpacing: 1, marginBottom: 4 },
  scoreNum:   { fontSize: 48, fontWeight: '800', color: TEAL_DARK, lineHeight: 56 },
  scoreTrack: { height: 6, width: '100%', backgroundColor: TEAL_LIGHT, borderRadius: 4, marginVertical: 10 },
  scoreFill:  { height: 6, backgroundColor: TEAL, borderRadius: 4 },
  badgeRow:   { flexDirection: 'row', gap: 8, flexWrap: 'wrap', justifyContent: 'center', marginTop: 4 },

  sectionLabel: { fontSize: 11, fontWeight: '700', color: TEAL, letterSpacing: 1, marginBottom: 8 },

  stepCard: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    backgroundColor: '#fff', borderRadius: 16, padding: 16,
    shadowColor: TEAL, shadowOpacity: 0.06, shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 }, elevation: 2,
  },
  stepDone:     { borderLeftWidth: 3, borderLeftColor: TEAL },
  stepDisabled: { opacity: 0.45 },
  stepNum: {
    width: 36, height: 36, borderRadius: 18,
    alignItems: 'center', justifyContent: 'center',
  },
  stepNumTxt:  { fontSize: 15, fontWeight: '800' },
  stepTitle:   { fontSize: 15, fontWeight: '800', color: '#111', marginBottom: 2 },
  stepDesc:    { fontSize: 13, color: '#666', lineHeight: 18 },
  pendingRow:  { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  pendingTxt:  { fontSize: 12, color: '#856404', fontWeight: '600' },
  lockedNote:  { fontSize: 12, color: '#aaa', marginTop: 6, paddingLeft: 4 },

  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)' },
  sheet: {
    backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24,
    padding: 22, paddingBottom: 40,
  },
  handle:     { width: 36, height: 4, backgroundColor: '#ddd', borderRadius: 4, alignSelf: 'center', marginBottom: 18 },
  sheetTitle: { fontSize: 18, fontWeight: '800', color: '#111', marginBottom: 6 },
  sheetDesc:  { fontSize: 13, color: '#666', lineHeight: 19, marginBottom: 18 },

  inputRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: '#f4fafa', borderRadius: 12, paddingHorizontal: 14,
    paddingVertical: 12, marginBottom: 16,
    borderWidth: 1, borderColor: TEAL_LIGHT,
  },
  flag:  { fontSize: 15, fontWeight: '700', color: '#333' },
  input: { flex: 1, fontSize: 16, color: '#111', fontWeight: '600' },

  actionBtn: {
    height: 52, borderRadius: 16, backgroundColor: TEAL,
    alignItems: 'center', justifyContent: 'center', marginBottom: 10,
  },
  actionBtnDisabled: { backgroundColor: '#b2d8d8' },
  actionBtnTxt:      { fontSize: 15, fontWeight: '800', color: '#fff' },
  resendBtn:         { alignItems: 'center', paddingVertical: 8 },
  resendTxt:         { fontSize: 13, color: TEAL, fontWeight: '600' },

  typeRow:       { flexDirection: 'row', gap: 10, marginBottom: 16 },
  typeBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 6, paddingVertical: 12, borderRadius: 12,
    backgroundColor: TEAL_LIGHT, borderWidth: 1, borderColor: '#b2e0e0',
  },
  typeBtnActive: { backgroundColor: TEAL, borderColor: TEAL },
  typeTxt:       { fontSize: 13, fontWeight: '700', color: TEAL_DARK },
  typeTxtActive: { color: '#fff' },

  idUploadBox: {
    height: 160, borderRadius: 14, backgroundColor: '#f4fafa',
    borderWidth: 1.5, borderColor: TEAL_LIGHT, borderStyle: 'dashed',
    alignItems: 'center', justifyContent: 'center', marginBottom: 12, overflow: 'hidden',
  },
  idPreview:   { width: '100%', height: '100%' },
  idUploadTxt: { fontSize: 14, fontWeight: '700', color: TEAL, marginTop: 8 },
  idUploadSub: { fontSize: 12, color: '#888', marginTop: 4, textAlign: 'center', paddingHorizontal: 20 },
  rePickBtn:   { alignItems: 'center', marginBottom: 12 },
  rePickTxt:   { fontSize: 13, color: TEAL, fontWeight: '600' },
  privacyNote: { fontSize: 11, color: '#999', textAlign: 'center', marginTop: 8, lineHeight: 16 },
})
