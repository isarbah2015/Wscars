import React, { useCallback, useRef, useState } from 'react';
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
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../lib/firebase-persistence';
import { GoogleAuthBridge } from '../../components/GoogleAuthBridge';
import { signInWithGoogleIdToken } from '../../services/firebase/auth';

const CAR_IMAGE = require('../../assets/images/car-hero.png');
const WC_LOGO   = require('../../assets/images/wc-logo.png');

export default function LoginScreen() {
  const router = useRouter();
  const passwordRef = useRef<TextInput>(null);
  const googlePromptRef = useRef<(() => Promise<void>) | null>(null);
  const [email, setEmail]                   = useState('');
  const [password, setPassword]             = useState('');
  const [loading, setLoading]               = useState(false);
  const [googleLoading, setGoogleLoading]   = useState(false);
  const [error, setError]                   = useState('');

  const handleLogin = async () => {
    setError('');
    if (!email.trim() || !password.trim()) { setError('Please fill in all fields'); return; }
    try {
      setLoading(true);
      await signInWithEmailAndPassword(auth!, email.trim(), password);
      router.replace('/(tabs)');
    } catch (e: any) {
      const msg = e.code === 'auth/invalid-credential'   ? 'Incorrect email or password'
                : e.code === 'auth/too-many-requests'    ? 'Too many attempts. Try again later'
                : e.code === 'auth/user-not-found'       ? 'No account found with this email'
                : e.code === 'auth/wrong-password'       ? 'Incorrect password'
                : 'Login failed. Please try again';
      setError(msg);
    } finally { setLoading(false); }
  };

  const handleGoogleIdToken = useCallback(async (idToken: string, accessToken?: string) => {
    try {
      setGoogleLoading(true); setError('');
      await signInWithGoogleIdToken(idToken, accessToken);
      router.replace('/(tabs)');
    } catch { setError('Google sign-in failed. Please try again.'); }
    finally { setGoogleLoading(false); }
  }, [router]);

  const handleGooglePress = async () => { if (googlePromptRef.current) await googlePromptRef.current(); };
  const busy = loading || googleLoading;

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <GoogleAuthBridge onIdToken={handleGoogleIdToken} promptRef={googlePromptRef} />

      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="always"
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        {/* ── Card ── */}
        <View style={styles.card}>

          {/* Logo + nav row */}
          <View style={styles.topRow}>
            <Image source={WC_LOGO} style={styles.logo} resizeMode="contain" tintColor="#FF6B00" />
            <TouchableOpacity onPress={() => router.push('/auth/signup')} activeOpacity={0.7} style={styles.navBtn}>
              <Text style={styles.navBtnText}>Sign Up</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.title}>Sign In</Text>
          <Text style={styles.subtitle}>Welcome back to Westcars</Text>

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            placeholder="your@email.com"
            placeholderTextColor="#94A3B8"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            autoComplete="email"
            returnKeyType="next"
            blurOnSubmit={false}
            editable={!busy}
            textAlign="left"
            onSubmitEditing={() => passwordRef.current?.focus()}
          />

          <Text style={styles.label}>Password</Text>
          <TextInput
            ref={passwordRef}
            style={styles.input}
            placeholder="••••••••••"
            placeholderTextColor="#94A3B8"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoCapitalize="none"
            autoCorrect={false}
            autoComplete="password"
            returnKeyType="done"
            editable={!busy}
            textAlign="left"
            onSubmitEditing={handleLogin}
          />

          {/* Sign In button */}
          <TouchableOpacity
            style={[styles.primaryBtn, busy && styles.btnDisabled]}
            onPress={handleLogin}
            disabled={busy}
            activeOpacity={0.85}
          >
            {loading ? <ActivityIndicator color="#fff" /> : (
              <>
                <View style={styles.btnArrow}>
                  <Text style={styles.btnArrowIcon}>→</Text>
                </View>
                <Text style={styles.primaryBtnText}>Sign In</Text>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.push('/auth/forgot-password' as any)} activeOpacity={0.7} style={styles.forgotWrap}>
            <Text style={styles.forgotText}>Forgot password?</Text>
          </TouchableOpacity>

          {/* ── Social divider ── */}
          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or continue with</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* ── Social pills ── */}
          <View style={styles.socialRow}>
            <TouchableOpacity
              style={[styles.socialPill, styles.socialGoogle, busy && styles.btnDisabled]}
              onPress={handleGooglePress}
              disabled={busy}
              activeOpacity={0.8}
            >
              {googleLoading ? <ActivityIndicator color="#444" size="small" /> : (
                <>
                  <Text style={styles.googleG}>G</Text>
                  <Text style={styles.socialTextDark}>Google</Text>
                </>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.socialPill, styles.socialPhone, busy && styles.btnDisabled]}
              onPress={() => router.push('/auth/phone' as any)}
              disabled={busy}
              activeOpacity={0.8}
            >
              <Text style={styles.phoneEmoji}>📱</Text>
              <Text style={styles.socialTextLight}>Phone</Text>
            </TouchableOpacity>
          </View>

          {/* ── Browse as guest ── */}
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

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#EDF4F7' },
  scroll: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 32,
  },

  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    paddingHorizontal: 24,
    paddingTop: 28,
    paddingBottom: 28,
    shadowColor: '#0A1628',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.10,
    shadowRadius: 20,
    elevation: 6,
  },

  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  logo: { width: 100, height: 34 },
  navBtn: {
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#FF6B00',
  },
  navBtnText: { fontSize: 13, fontFamily: 'Inter_600SemiBold', color: '#FF6B00' },

  title: {
    fontSize: 32,
    fontFamily: 'Manrope_800ExtraBold',
    color: '#0F172A',
    letterSpacing: -0.8,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    color: '#64748B',
    marginBottom: 24,
  },

  label: {
    alignSelf: 'flex-start',
    fontSize: 11,
    fontFamily: 'Inter_600SemiBold',
    color: '#475569',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 7,
    marginTop: 4,
  },
  input: {
    width: '100%',
    height: 52,
    backgroundColor: '#F5FBFC',
    borderRadius: 16,
    paddingHorizontal: 18,
    fontSize: 15,
    color: '#0F172A',
    marginBottom: 14,
    textAlign: 'left',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    fontFamily: 'Inter_400Regular',
  },
  error: {
    color: '#EF4444',
    fontSize: 13,
    textAlign: 'center',
    marginBottom: 12,
    fontFamily: 'Inter_500Medium',
  },

  primaryBtn: {
    width: '100%',
    height: 52,
    backgroundColor: '#FF6B00',
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6,
    gap: 12,
    shadowColor: '#FF6B00',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 8,
  },
  btnDisabled: { opacity: 0.55 },
  btnArrow: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center', justifyContent: 'center',
  },
  btnArrowIcon: { color: '#fff', fontSize: 16, lineHeight: 20 },
  primaryBtnText: { color: '#fff', fontSize: 16, fontFamily: 'Inter_700Bold', letterSpacing: 0.3 },

  forgotWrap: { alignItems: 'center', marginTop: 14, marginBottom: 4 },
  forgotText: { color: '#94A3B8', fontSize: 13, fontFamily: 'Inter_500Medium' },

  dividerRow: { flexDirection: 'row', alignItems: 'center', marginVertical: 20, width: '100%' },
  dividerLine: { flex: 1, height: 1, backgroundColor: '#E2E8F0' },
  dividerText: { color: '#94A3B8', fontSize: 12, marginHorizontal: 12, fontFamily: 'Inter_500Medium' },

  socialRow: { flexDirection: 'row', gap: 12, justifyContent: 'center', width: '100%' },
  socialPill: {
    flex: 1,
    height: 50,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  socialGoogle: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  socialPhone: {
    backgroundColor: '#FF6B00',
    shadowColor: '#FF6B00',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 6,
  },
  googleG: { fontSize: 18, fontFamily: 'Manrope_800ExtraBold', color: '#4285F4', lineHeight: 22 },
  phoneEmoji: { fontSize: 18, lineHeight: 22 },
  socialTextDark: { fontSize: 14, fontFamily: 'Inter_600SemiBold', color: '#0F172A' },
  socialTextLight: { fontSize: 14, fontFamily: 'Inter_600SemiBold', color: '#fff' },

  guestBtn: { alignItems: 'center', marginTop: 22, paddingVertical: 6 },
  guestText: { color: '#94A3B8', fontSize: 13, fontFamily: 'Inter_500Medium' },
});
