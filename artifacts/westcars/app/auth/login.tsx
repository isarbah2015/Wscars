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
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ScrollView } from 'react-native-gesture-handler';
import { useRouter } from 'expo-router';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../lib/firebase-persistence';
import { GoogleAuthBridge } from '../../components/GoogleAuthBridge';
import { signInWithGoogleIdToken } from '../../services/firebase/auth';

const CAR_IMAGE = require('../../assets/images/car-hero.png');
const WC_LOGO   = require('../../assets/images/wc-logo.png');
const { width: SCREEN_W } = Dimensions.get('window');

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
        {/* ── White wave top ── */}
        <View style={styles.waveSection}>
          <View style={styles.waveHeader}>
            <Image source={WC_LOGO} style={styles.waveLogo} resizeMode="contain" tintColor="#FF6B00" />
            <TouchableOpacity onPress={() => router.push('/auth/signup')} activeOpacity={0.7} style={styles.waveSignUpBtn}>
              <Text style={styles.waveSignUpText}>Sign Up</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.waveTitle}>Sign In</Text>
        </View>

        {/* ── Dark form section ── */}
        <View style={styles.darkSection}>
          {error ? <Text style={styles.error}>{error}</Text> : null}

          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.darkInput}
            placeholder="your@email.com"
            placeholderTextColor="rgba(255,255,255,0.22)"
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
            style={styles.darkInput}
            placeholder="••••••••••"
            placeholderTextColor="rgba(255,255,255,0.22)"
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
            style={[styles.signInBtn, busy && styles.btnDisabled]}
            onPress={handleLogin}
            disabled={busy}
            activeOpacity={0.85}
          >
            {loading ? <ActivityIndicator color="#fff" /> : (
              <>
                <View style={styles.signInArrow}>
                  <Text style={styles.signInArrowIcon}>→</Text>
                </View>
                <Text style={styles.signInText}>Sign In</Text>
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

          {/* ── Social pill buttons (centered) ── */}
          <View style={styles.socialRow}>
            {/* Google */}
            <TouchableOpacity
              style={[styles.socialPill, styles.socialPillGoogle, busy && styles.btnDisabled]}
              onPress={handleGooglePress}
              disabled={busy}
              activeOpacity={0.8}
            >
              {googleLoading ? <ActivityIndicator color="#444" size="small" /> : (
                <>
                  <Text style={styles.googleG}>G</Text>
                  <Text style={styles.socialPillTextDark}>Google</Text>
                </>
              )}
            </TouchableOpacity>

            {/* Phone */}
            <TouchableOpacity
              style={[styles.socialPill, styles.socialPillPhone, busy && styles.btnDisabled]}
              onPress={() => router.push('/auth/phone' as any)}
              disabled={busy}
              activeOpacity={0.8}
            >
              <Text style={styles.phoneEmoji}>📱</Text>
              <Text style={styles.socialPillTextLight}>Phone</Text>
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
  container: { flex: 1, backgroundColor: '#0D0D1A' },
  scroll: { flexGrow: 1 },

  /* White wave top */
  waveSection: {
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: 56,
    borderBottomRightRadius: 56,
    paddingTop: Platform.OS === 'ios' ? 60 : 48,
    paddingBottom: 36,
    paddingHorizontal: 26,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.14,
    shadowRadius: 24,
    elevation: 12,
  },
  waveHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 20,
  },
  waveLogo: { width: 100, height: 36 },
  waveSignUpBtn: {
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#FF6B00',
  },
  waveSignUpText: { fontSize: 13, fontFamily: 'Inter_600SemiBold', color: '#FF6B00' },
  waveTitle: {
    fontSize: 40,
    fontFamily: 'Manrope_800ExtraBold',
    color: '#0D0D1A',
    letterSpacing: -1,
  },

  /* Dark form */
  darkSection: {
    flex: 1,
    paddingHorizontal: 26,
    paddingTop: 28,
    paddingBottom: 28,
    backgroundColor: '#0D0D1A',
    alignItems: 'center',
  },
  label: {
    alignSelf: 'flex-start',
    fontSize: 11,
    fontFamily: 'Inter_600SemiBold',
    color: 'rgba(255,255,255,0.40)',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 7,
    marginTop: 4,
  },
  darkInput: {
    width: '100%',
    height: 52,
    backgroundColor: '#1C1C2E',
    borderRadius: 28,
    paddingHorizontal: 20,
    fontSize: 15,
    color: '#fff',
    marginBottom: 14,
    textAlign: 'left',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
  },
  error: { color: '#FF6B6B', fontSize: 13, textAlign: 'center', marginBottom: 12, fontFamily: 'Inter_500Medium' },

  signInBtn: {
    width: '100%',
    height: 52,
    backgroundColor: '#FF6B00',
    borderRadius: 28,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6,
    gap: 12,
    shadowColor: '#FF6B00',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.45,
    shadowRadius: 14,
    elevation: 8,
  },
  btnDisabled: { opacity: 0.55 },
  signInArrow: {
    width: 30, height: 30, borderRadius: 15,
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center', justifyContent: 'center',
  },
  signInArrowIcon: { color: '#fff', fontSize: 18, lineHeight: 22 },
  signInText: { color: '#fff', fontSize: 16, fontFamily: 'Inter_700Bold', letterSpacing: 0.3 },

  forgotWrap: { alignItems: 'center', marginTop: 14, marginBottom: 4 },
  forgotText: { color: 'rgba(255,255,255,0.30)', fontSize: 13, fontFamily: 'Inter_500Medium' },

  dividerRow: { flexDirection: 'row', alignItems: 'center', marginVertical: 20, width: '100%' },
  dividerLine: { flex: 1, height: 1, backgroundColor: 'rgba(255,255,255,0.08)' },
  dividerText: { color: 'rgba(255,255,255,0.28)', fontSize: 12, marginHorizontal: 12, fontFamily: 'Inter_500Medium' },

  /* Social pills */
  socialRow: { flexDirection: 'row', gap: 12, justifyContent: 'center', width: '100%' },
  socialPill: {
    flex: 1,
    height: 50,
    borderRadius: 25,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  socialPillGoogle: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.10,
    shadowRadius: 8,
    elevation: 4,
  },
  socialPillPhone: {
    backgroundColor: '#FF6B00',
    shadowColor: '#FF6B00',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.45,
    shadowRadius: 10,
    elevation: 6,
  },
  googleG: { fontSize: 18, fontFamily: 'Manrope_800ExtraBold', color: '#4285F4', lineHeight: 22 },
  phoneEmoji: { fontSize: 18, lineHeight: 22 },
  socialPillTextDark: { fontSize: 14, fontFamily: 'Inter_600SemiBold', color: '#222' },
  socialPillTextLight: { fontSize: 14, fontFamily: 'Inter_600SemiBold', color: '#fff' },

  /* Browse as guest */
  guestBtn: { alignItems: 'center', marginTop: 22, paddingVertical: 6 },
  guestText: { color: 'rgba(255,255,255,0.35)', fontSize: 13, fontFamily: 'Inter_500Medium' },
});
