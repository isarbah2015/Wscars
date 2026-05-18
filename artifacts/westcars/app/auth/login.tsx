import React, { useRef, useState } from 'react';
import {
  Text, TextInput, TouchableOpacity, ActivityIndicator,
  Platform, KeyboardAvoidingView, StyleSheet, View, Image,
} from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { useRouter } from 'expo-router';
import { signInWithEmailAndPassword, type ConfirmationResult } from 'firebase/auth';
import { useTheme } from '@/context/ThemeContext';
import app from '../../lib/firebase';
import { auth, authErrorMessage, confirmPhoneOtp, sendPhoneOtp } from '@/services/firebase/auth';

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

const mapFirebaseError = (code: string): string => {
  switch (code) {
    case 'auth/invalid-email': return 'Invalid email address';
    case 'auth/user-not-found': return 'No account found with this email';
    case 'auth/wrong-password':
    case 'auth/invalid-credential': return 'Incorrect password';
    case 'auth/too-many-requests': return 'Too many attempts. Please try again later';
    case 'auth/network-request-failed': return 'Check your internet connection';
    default: return 'Something went wrong. Please try again';
  }
};

export default function LoginScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const styles = makeStyles(colors);
  const passwordRef = useRef<TextInput>(null);
  const codeRef = useRef<TextInput>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [confirmation, setConfirmation] = useState<ConfirmationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [phoneLoading, setPhoneLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    setError('');
    if (!email.trim() || !password.trim()) {
      setError('Please fill in all fields');
      return;
    }
    if (!app) {
      setError('Firebase is not configured. Please restart the app.');
      return;
    }
    if (!auth) {
      setError('Authentication service unavailable. Please try again.');
      return;
    }
    try {
      setLoading(true);
      await signInWithEmailAndPassword(auth, email.trim(), password);
      router.replace('/(tabs)');
    } catch (e: any) {
      setError(mapFirebaseError(e.code));
    } finally {
      setLoading(false);
    }
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
      await confirmPhoneOtp(confirmation, otp, { phone: formatPhone(phone) });
      router.replace('/(tabs)');
    } catch (e: any) {
      setError(authErrorMessage(e));
    } finally {
      setPhoneLoading(false);
    }
  };

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
            <TouchableOpacity onPress={() => router.push('/auth/signup')} activeOpacity={0.7} style={styles.navBtn}>
              <Text style={styles.navBtnText}>Create Account</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.title}>Welcome Back</Text>
          <Text style={styles.subtitle}>Sign in to your Westcars account</Text>

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <View style={styles.phoneBox}>
            <Text style={styles.label}>Phone Number</Text>
            <TextInput
              style={styles.input}
              placeholder="024 123 4567"
              placeholderTextColor={colors.textTertiary}
              value={phone}
              onChangeText={(value) => { setPhone(value); setError(''); }}
              keyboardType="phone-pad"
              autoComplete="tel"
              editable={!phoneLoading && !loading}
              returnKeyType="send"
              onSubmitEditing={confirmation ? handleConfirmOtp : handleSendOtp}
            />
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
            <TouchableOpacity
              style={[styles.phoneBtn, phoneLoading && styles.btnDisabled]}
              onPress={confirmation ? handleConfirmOtp : handleSendOtp}
              disabled={phoneLoading}
              activeOpacity={0.85}
            >
              {phoneLoading
                ? <ActivityIndicator color="#0EB5CA" />
                : <Text style={styles.phoneBtnText}>{confirmation ? 'Verify Code' : 'Continue with Phone'}</Text>
              }
            </TouchableOpacity>
          </View>

          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or</Text>
            <View style={styles.dividerLine} />
          </View>

          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            placeholder="your@email.com"
            placeholderTextColor={colors.textTertiary}
            value={email}
            onChangeText={(value) => { setEmail(value); setError(''); }}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
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
              placeholder="••••••••••"
              placeholderTextColor={colors.textTertiary}
              value={password}
              onChangeText={(value) => { setPassword(value); setError(''); }}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="done"
              editable={!loading && !phoneLoading}
              onSubmitEditing={handleLogin}
            />
            <TouchableOpacity style={styles.eyeBtn} onPress={() => setShowPassword(v => !v)} hitSlop={8}>
              <Text style={styles.eyeText}>{showPassword ? 'Hide' : 'Show'}</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[styles.primaryBtn, loading && styles.btnDisabled]}
            onPress={handleLogin}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading
              ? <ActivityIndicator color="#fff" />
              : <Text style={styles.primaryBtnText}>Sign In</Text>
            }
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push('/auth/forgot-password')}
            activeOpacity={0.7}
            style={styles.guestBtn}
          >
            <Text style={styles.guestText}>Forgot password?</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const makeStyles = (colors: ReturnType<typeof useTheme>["colors"]) => StyleSheet.create({
  container: { flex: 1, backgroundColor: '#EDF4F7' },
  scroll: { flexGrow: 1, justifyContent: 'center', paddingHorizontal: 20, paddingVertical: 32 },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    paddingHorizontal: 24,
    paddingTop: 28,
    paddingBottom: 28,
    shadowColor: '#0EB5CA',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 24,
    elevation: 8,
  },
  topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 },
  logo: { width: 48, height: 48 },
  navBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 999, borderWidth: 1.5, borderColor: '#0EB5CA' },
  navBtnText: { fontSize: 13, fontFamily: 'Inter_600SemiBold', color: '#0EB5CA' },
  title: { fontSize: 32, fontFamily: 'Manrope_800ExtraBold', color: '#0F172A', letterSpacing: -0.5, marginBottom: 4 },
  subtitle: { fontSize: 15, fontFamily: 'Inter_400Regular', color: '#64748B', marginBottom: 20 },
  startingRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 14, padding: 12, borderRadius: 14, backgroundColor: '#F5FBFC', borderWidth: 1, borderColor: '#D7F0F5' },
  startingText: { fontSize: 13, fontFamily: 'Inter_500Medium', color: '#64748B' },
  error: { color: '#EF4444', fontSize: 13, textAlign: 'center', marginBottom: 12, fontFamily: 'Inter_500Medium' },
  phoneBox: { marginBottom: 16 },
  label: { alignSelf: 'flex-start', fontSize: 11, fontFamily: 'Inter_600SemiBold', color: '#64748B', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 7, marginTop: 4 },
  input: { width: '100%', height: 52, backgroundColor: '#F5FBFC', borderRadius: 12, paddingHorizontal: 18, fontSize: 15, color: '#0F172A', marginBottom: 14, borderWidth: 1.5, borderColor: '#E2E8F0', fontFamily: 'Inter_400Regular' },
  phoneBtn: { width: '100%', height: 52, borderRadius: 14, alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, borderColor: '#0EB5CA', backgroundColor: '#FFFFFF' },
  phoneBtnText: { color: '#0EB5CA', fontSize: 15, fontFamily: 'Inter_700Bold' },
  dividerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16, gap: 10 },
  dividerLine: { flex: 1, height: 1, backgroundColor: '#E2E8F0' },
  dividerText: { fontSize: 12, fontFamily: 'Inter_500Medium', color: '#94A3B8' },
  primaryBtn: { width: '100%', height: 54, backgroundColor: '#0EB5CA', borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginTop: 8, shadowColor: '#0EB5CA', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.35, shadowRadius: 12, elevation: 8 },
  btnDisabled: { opacity: 0.55 },
  primaryBtnText: { color: '#fff', fontSize: 16, fontFamily: 'Inter_700Bold', letterSpacing: 0.3 },
  guestBtn: { alignItems: 'center', marginTop: 22, paddingVertical: 6 },
  guestText: { color: '#64748B', fontSize: 14, fontFamily: 'Inter_500Medium' },
  passwordRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F5FBFC', borderRadius: 12, borderWidth: 1.5, borderColor: '#E2E8F0', marginBottom: 14, paddingRight: 12, overflow: 'hidden' },
  eyeBtn: { paddingHorizontal: 8 },
  eyeText: { color: '#0EB5CA', fontSize: 13, fontFamily: 'Inter_600SemiBold' },
});
