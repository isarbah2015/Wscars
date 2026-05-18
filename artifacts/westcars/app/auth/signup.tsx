import React, { useRef, useState } from 'react';
import {
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
  KeyboardAvoidingView,
  StyleSheet,
  Image,
  View,
} from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { useRouter } from 'expo-router';
import { type ConfirmationResult } from 'firebase/auth';
import { authErrorMessage, confirmPhoneOtp, sendPhoneOtp, signUpEmail } from '../../services/firebase/auth';
import app from '../../lib/firebase';
import { useTheme } from '@/context/ThemeContext';

const WC_LOGO = require('../../assets/images/wc-logo.png');

function formatPhone(input: string) {
  const trimmed = input.trim();
  if (!trimmed) return '';
  if (trimmed.startsWith('+')) return trimmed.replace(/\s+/g, '');
  const digits = trimmed.replace(/\D/g, '');
  if (digits.startsWith('0')) return `+233${digits.slice(1)}`;
  if (digits.startsWith('233')) return `+${digits}`;
  return `+233${digits}`;
}

function passwordStrength(password: string) {
  let score = 0;
  if (password.length >= 6) score += 1;
  if (password.length >= 10) score += 1;
  if (/[A-Z]/.test(password) && /\d/.test(password)) score += 1;
  if (score <= 1) return { width: '33%', color: '#EF4444', label: 'Weak' } as const;
  if (score === 2) return { width: '66%', color: '#F97316', label: 'Good' } as const;
  return { width: '100%', color: '#22C55E', label: 'Strong' } as const;
}

const mapFirebaseError = (code: string): string => {
  switch (code) {
    case 'auth/invalid-email': return 'Invalid email address';
    case 'auth/user-not-found': return 'No account found with this email';
    case 'auth/wrong-password':
    case 'auth/invalid-credential': return 'Incorrect password';
    case 'auth/email-already-in-use': return 'An account with this email already exists';
    case 'auth/weak-password': return 'Password must be at least 6 characters';
    case 'auth/too-many-requests': return 'Too many attempts. Please try again later';
    case 'auth/network-request-failed': return 'Check your internet connection';
    default: return 'Something went wrong. Please try again';
  }
};

export default function SignupScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const styles = makeStyles(colors);
  const emailRef = useRef<TextInput>(null);
  const phoneRef = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);
  const confirmRef = useRef<TextInput>(null);
  const codeRef = useRef<TextInput>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [otp, setOtp] = useState('');
  const [confirmation, setConfirmation] = useState<ConfirmationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [phoneLoading, setPhoneLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleSignup = async () => {
    setError('');
    if (!name.trim() || !email.trim() || !password || !confirm) {
      setError('Please fill in all required fields'); return;
    }
    if (password.length < 6) { setError('Password must be at least 6 characters'); return; }
    if (password !== confirm) { setError('Passwords do not match'); return; }
    if (!app) {
      setError('Firebase is not configured. Please restart the app.');
      return;
    }
    try {
      setLoading(true);
      await signUpEmail(name.trim(), email, phone, password);
      router.replace('/(tabs)');
    } catch (e: any) {
      setError(e?.code ? mapFirebaseError(e.code) : authErrorMessage(e));
    } finally { setLoading(false); }
  };

  const handleSendOtp = async () => {
    setError('');
    const formatted = formatPhone(phone);
    if (formatted.length < 10) {
      setError('Enter a valid phone number.');
      return;
    }
    try {
      setPhoneLoading(true);
      const result = await sendPhoneOtp(formatted);
      setConfirmation(result);
      setTimeout(() => codeRef.current?.focus(), 100);
    } catch (e: any) {
      setError(authErrorMessage(e));
    } finally {
      setPhoneLoading(false);
    }
  };

  const handleConfirmOtp = async () => {
    setError('');
    if (!confirmation || otp.trim().length !== 6) {
      setError('Enter the 6-digit verification code.');
      return;
    }
    try {
      setPhoneLoading(true);
      await confirmPhoneOtp(confirmation, otp, { name: name.trim() || undefined, phone: formatPhone(phone) });
      router.replace('/(tabs)');
    } catch (e: any) {
      setError(authErrorMessage(e));
    } finally {
      setPhoneLoading(false);
    }
  };

  const strength = passwordStrength(password);
  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="always"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.card}>
          <View style={styles.topRow}>
            <Image source={WC_LOGO} style={styles.logo} resizeMode="contain" />
            <TouchableOpacity onPress={() => router.push('/auth/login')} activeOpacity={0.7} style={styles.navBtn}>
              <Text style={styles.navBtnText}>Sign In</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Join Westcars today</Text>

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <View style={styles.phoneBox}>
            <TouchableOpacity
              style={[styles.phoneBtn, phoneLoading && styles.btnDisabled]}
              onPress={confirmation ? handleConfirmOtp : handleSendOtp}
              disabled={phoneLoading}
              activeOpacity={0.85}
            >
              {phoneLoading
                ? <ActivityIndicator color="#0EB5CA" />
                : <Text style={styles.phoneBtnText}>{confirmation ? 'Verify Phone Code' : 'Continue with Phone'}</Text>
              }
            </TouchableOpacity>
            {confirmation ? (
              <>
                <Text style={styles.label}>6-Digit Code</Text>
                <TextInput
                  ref={codeRef}
                  style={styles.input}
                  placeholder="123456"
                  placeholderTextColor={colors.textTertiary}
                  value={otp}
                  onChangeText={(value) => setOtp(value.replace(/\D/g, '').slice(0, 6))}
                  keyboardType="number-pad"
                  maxLength={6}
                  editable={!phoneLoading && !loading}
                  returnKeyType="done"
                  onSubmitEditing={handleConfirmOtp}
                />
              </>
            ) : null}
          </View>

          <Text style={styles.label}>Full Name</Text>
          <TextInput
            style={styles.input}
            placeholder="John Mensah"
            placeholderTextColor={colors.textTertiary}
            value={name}
            onChangeText={(value) => { setName(value); setError(''); }}
            autoCapitalize="words"
            autoCorrect={false}
            autoComplete="name"
            returnKeyType="next"
            blurOnSubmit={false}
            editable={!loading && !phoneLoading}
            onSubmitEditing={() => emailRef.current?.focus()}
          />

          <Text style={styles.label}>Email</Text>
          <TextInput
            ref={emailRef}
            style={styles.input}
            placeholder="your@email.com"
            placeholderTextColor={colors.textTertiary}
            value={email}
            onChangeText={(value) => { setEmail(value); setError(''); }}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            autoComplete="email"
            returnKeyType="next"
            blurOnSubmit={false}
            editable={!loading && !phoneLoading}
            onSubmitEditing={() => phoneRef.current?.focus()}
          />

          <Text style={styles.label}>Phone Number <Text style={styles.optional}>(optional)</Text></Text>
          <TextInput
            ref={phoneRef}
            style={styles.input}
            placeholder="024 123 4567"
            placeholderTextColor={colors.textTertiary}
            value={phone}
            onChangeText={(value) => { setPhone(value); setError(''); }}
            keyboardType="phone-pad"
            autoComplete="tel"
            returnKeyType="next"
            blurOnSubmit={false}
            editable={!loading && !phoneLoading}
            onSubmitEditing={() => passwordRef.current?.focus()}
          />

          <Text style={styles.label}>Password</Text>
          <View style={styles.passwordRow}>
            <TextInput
              ref={passwordRef}
              style={[styles.input, { marginBottom: 0, flex: 1, borderWidth: 0 }]}
              placeholder="Min. 6 characters"
              placeholderTextColor={colors.textTertiary}
              value={password}
              onChangeText={(value) => { setPassword(value); setError(''); }}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete="new-password"
              returnKeyType="next"
              blurOnSubmit={false}
              editable={!loading && !phoneLoading}
              onSubmitEditing={() => confirmRef.current?.focus()}
            />
            <TouchableOpacity onPress={() => setShowPassword(v => !v)} hitSlop={8} style={styles.eyeBtn}>
              <Text style={styles.eyeText}>{showPassword ? 'Hide' : 'Show'}</Text>
            </TouchableOpacity>
          </View>
          {password.length > 0 ? (
            <View style={styles.strengthWrap}>
              <View style={styles.strengthTrack}>
                <View style={[styles.strengthFill, { width: strength.width, backgroundColor: strength.color }]} />
              </View>
              <Text style={[styles.strengthText, { color: strength.color }]}>{strength.label}</Text>
            </View>
          ) : null}

          <Text style={styles.label}>Confirm Password</Text>
          <View style={styles.passwordRow}>
            <TextInput
              ref={confirmRef}
              style={[styles.input, { marginBottom: 0, flex: 1, borderWidth: 0 }]}
              placeholder="••••••••••"
              placeholderTextColor={colors.textTertiary}
              value={confirm}
              onChangeText={(value) => { setConfirm(value); setError(''); }}
              secureTextEntry={!showConfirm}
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete="new-password"
              returnKeyType="done"
              editable={!loading && !phoneLoading}
              onSubmitEditing={handleSignup}
            />
            <TouchableOpacity onPress={() => setShowConfirm(v => !v)} hitSlop={8} style={styles.eyeBtn}>
              <Text style={styles.eyeText}>{showConfirm ? 'Hide' : 'Show'}</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[styles.primaryBtn, loading && styles.btnDisabled]}
            onPress={handleSignup}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading ? <ActivityIndicator color="#fff" /> : (
              <Text style={styles.primaryBtnText}>Create Account</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.replace('/(tabs)' as any)}
            activeOpacity={0.7}
            style={styles.guestBtn}
          >
            <Text style={styles.guestText}>Browse listings without signing in  →</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const makeStyles = (colors: ReturnType<typeof useTheme>["colors"]) => StyleSheet.create({
  container: { flex: 1, backgroundColor: '#EDF4F7' },
  scroll: { flexGrow: 1, justifyContent: 'center', paddingHorizontal: 16, paddingVertical: 12 },
  card: { backgroundColor: '#FFFFFF', borderRadius: 24, paddingHorizontal: 20, paddingVertical: 16, shadowColor: '#0EB5CA', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.08, shadowRadius: 24, elevation: 8 },
  topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 },
  logo: { width: 48, height: 48 },
  navBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 999, borderWidth: 1.5, borderColor: '#0EB5CA' },
  navBtnText: { fontSize: 13, fontFamily: 'Inter_600SemiBold', color: '#0EB5CA' },
  title: { fontSize: 28, fontFamily: 'Manrope_800ExtraBold', color: '#0F172A', letterSpacing: -0.5, marginBottom: 8 },
  subtitle: { fontSize: 14, fontFamily: 'Inter_400Regular', color: '#64748B', marginBottom: 12 },
  startingRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 14, padding: 12, borderRadius: 14, backgroundColor: '#F5FBFC', borderWidth: 1, borderColor: '#D7F0F5' },
  startingText: { fontSize: 13, fontFamily: 'Inter_500Medium', color: '#64748B' },
  error: { color: '#EF4444', fontSize: 13, textAlign: 'center', marginBottom: 10, fontFamily: 'Inter_500Medium' },
  phoneBox: { marginBottom: 10 },
  phoneBtn: { width: '100%', height: 50, borderRadius: 14, alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, borderColor: '#0EB5CA', backgroundColor: '#FFFFFF', marginBottom: 10 },
  phoneBtnText: { color: '#0EB5CA', fontSize: 15, fontFamily: 'Inter_700Bold' },
  label: { alignSelf: 'flex-start', fontSize: 10, fontFamily: 'Inter_600SemiBold', color: '#64748B', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 4, marginTop: 0 },
  optional: { fontFamily: 'Inter_400Regular', color: '#94A3B8', letterSpacing: 0, textTransform: 'none' },
  input: { width: '100%', height: 48, backgroundColor: '#F5FBFC', borderRadius: 12, paddingHorizontal: 16, fontSize: 14, color: '#0F172A', marginBottom: 10, borderWidth: 1.5, borderColor: '#E2E8F0', fontFamily: 'Inter_400Regular' },
  primaryBtn: { width: '100%', height: 50, backgroundColor: '#0EB5CA', borderRadius: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 0, gap: 12, shadowColor: '#0EB5CA', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.35, shadowRadius: 12, elevation: 8 },
  btnDisabled: { opacity: 0.55 },
  primaryBtnText: { color: '#fff', fontSize: 16, fontFamily: 'Inter_700Bold', letterSpacing: 0.3 },
  guestBtn: { alignItems: 'center', marginTop: 10, paddingVertical: 4 },
  guestText: { color: '#94A3B8', fontSize: 13, fontFamily: 'Inter_400Regular' },
  passwordRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F5FBFC', borderRadius: 12, borderWidth: 1.5, borderColor: '#E2E8F0', marginBottom: 10, paddingRight: 12, overflow: 'hidden' },
  eyeBtn: { paddingHorizontal: 8 },
  eyeText: { color: '#0EB5CA', fontSize: 13, fontFamily: 'Inter_600SemiBold' },
  strengthWrap: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  strengthTrack: { flex: 1, height: 4, borderRadius: 999, backgroundColor: '#E2E8F0', overflow: 'hidden' },
  strengthFill: { height: '100%', borderRadius: 999 },
  strengthText: { fontSize: 11, fontFamily: 'Inter_600SemiBold' },
});
