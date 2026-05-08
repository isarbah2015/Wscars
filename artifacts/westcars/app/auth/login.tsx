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
const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');

export default function LoginScreen() {
  const router = useRouter();
  const passwordRef = useRef<TextInput>(null);
  const googlePromptRef = useRef<(() => Promise<void>) | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    setError('');
    if (!email.trim() || !password.trim()) {
      setError('Please fill in all fields');
      return;
    }
    try {
      setLoading(true);
      await signInWithEmailAndPassword(auth!, email.trim(), password);
      router.replace('/(tabs)');
    } catch (e: any) {
      const msg = e.code === 'auth/invalid-credential'
        ? 'Incorrect email or password'
        : e.code === 'auth/too-many-requests'
        ? 'Too many attempts. Please try again later'
        : e.code === 'auth/user-not-found'
        ? 'No account found with this email'
        : e.code === 'auth/wrong-password'
        ? 'Incorrect password'
        : 'Login failed. Please try again';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleIdToken = useCallback(async (idToken: string, accessToken?: string) => {
    try {
      setGoogleLoading(true);
      setError('');
      await signInWithGoogleIdToken(idToken, accessToken);
      router.replace('/(tabs)');
    } catch {
      setError('Google sign-in failed. Please try again.');
    } finally {
      setGoogleLoading(false);
    }
  }, [router]);

  const handleGooglePress = async () => {
    if (googlePromptRef.current) await googlePromptRef.current();
  };

  const busy = loading || googleLoading;

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* ── Fintech background ── */}
      <LinearGradient
        colors={['#04111F', '#0A1628', '#0E2540', '#0A1628']}
        locations={[0, 0.35, 0.7, 1]}
        style={StyleSheet.absoluteFill}
      />

      {/* Teal glow halo */}
      <View pointerEvents="none" style={styles.glow}>
        <LinearGradient
          colors={['rgba(0,200,151,0.28)', 'rgba(14,181,202,0.10)', 'transparent']}
          style={StyleSheet.absoluteFill}
        />
      </View>

      {/* Decorative accent circles */}
      <View pointerEvents="none" style={styles.circleTopRight} />
      <View pointerEvents="none" style={styles.circleBottomLeft} />

      <GoogleAuthBridge onIdToken={handleGoogleIdToken} promptRef={googlePromptRef} />

      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="always"
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        {/* Car hero */}
        <View style={styles.heroWrap}>
          <Image source={CAR_IMAGE} style={styles.carImage} resizeMode="contain" />
        </View>

        {/* Glass form card */}
        <View style={styles.card}>
          <LinearGradient
            colors={['rgba(255,255,255,0.06)', 'rgba(255,255,255,0.02)']}
            style={StyleSheet.absoluteFill}
          />

          <Text style={styles.title}>Welcome Back</Text>
          <Text style={styles.subtitle}>Sign in to your Westcars account</Text>

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <TextInput
            style={styles.input}
            placeholder="Email address"
            placeholderTextColor="#6b8099"
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

          <TextInput
            ref={passwordRef}
            style={styles.input}
            placeholder="Password"
            placeholderTextColor="#6b8099"
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

          <TouchableOpacity
            style={[styles.button, busy && styles.buttonDisabled]}
            onPress={handleLogin}
            disabled={busy}
            activeOpacity={0.85}
          >
            {loading
              ? <ActivityIndicator color="#fff" />
              : <Text style={styles.buttonText}>Sign In</Text>
            }
          </TouchableOpacity>

          {/* Divider */}
          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or continue with</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Social buttons row */}
          <View style={styles.socialRow}>
            {/* Google */}
            <TouchableOpacity
              style={[styles.socialBtn, busy && styles.buttonDisabled]}
              onPress={handleGooglePress}
              disabled={busy}
              activeOpacity={0.8}
            >
              {googleLoading
                ? <ActivityIndicator color="#444" size="small" />
                : (
                  <>
                    <Text style={styles.googleG}>G</Text>
                    <Text style={styles.socialBtnText}>Google</Text>
                  </>
                )
              }
            </TouchableOpacity>

            {/* Phone */}
            <TouchableOpacity
              style={[styles.socialBtn, busy && styles.buttonDisabled]}
              onPress={() => router.push('/auth/phone' as any)}
              disabled={busy}
              activeOpacity={0.8}
            >
              <Text style={styles.phoneIcon}>📱</Text>
              <Text style={styles.socialBtnText}>Phone</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            onPress={() => router.push('/auth/signup')}
            activeOpacity={0.7}
            style={styles.link}
          >
            <Text style={styles.linkText}>
              Don't have an account?{' '}
              <Text style={styles.linkBold}>Create one</Text>
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push('/auth/forgot-password' as any)}
            activeOpacity={0.7}
            style={styles.link}
          >
            <Text style={styles.linkText}>Forgot password?</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A1628' },
  scroll: { flexGrow: 1, justifyContent: 'center', paddingBottom: 16 },

  /* Fintech background decorations */
  glow: {
    position: 'absolute',
    top: 0, left: -60, right: -60,
    height: SCREEN_H * 0.55,
    borderRadius: SCREEN_H * 0.55,
    overflow: 'hidden',
    transform: [{ scaleX: 1.3 }],
  },
  circleTopRight: {
    position: 'absolute',
    top: -60, right: -60,
    width: 200, height: 200,
    borderRadius: 100,
    borderWidth: 1,
    borderColor: 'rgba(0,200,151,0.15)',
  },
  circleBottomLeft: {
    position: 'absolute',
    bottom: 80, left: -80,
    width: 240, height: 240,
    borderRadius: 120,
    borderWidth: 1,
    borderColor: 'rgba(14,181,202,0.10)',
  },

  /* Car hero */
  heroWrap: {
    width: SCREEN_W,
    height: SCREEN_W * 0.68,
    alignItems: 'center',
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  carImage: {
    width: SCREEN_W * 1.08,
    height: SCREEN_W * 0.78,
    marginLeft: -SCREEN_W * 0.04,
    marginBottom: -38,
  },

  /* Glass card */
  card: {
    marginHorizontal: 18,
    borderRadius: 24,
    paddingHorizontal: 22,
    paddingTop: 24,
    paddingBottom: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    backgroundColor: 'rgba(10,22,40,0.60)',
    shadowColor: '#0EB5CA',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 12,
  },

  title: { fontSize: 26, fontWeight: '700', color: '#fff', marginBottom: 4 },
  subtitle: { fontSize: 14, color: 'rgba(255,255,255,0.55)', marginBottom: 20 },
  input: {
    height: 50,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 15,
    color: '#fff',
    marginBottom: 12,
    textAlign: 'left',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
  },
  button: {
    height: 50,
    backgroundColor: '#00C897',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
    shadowColor: '#00C897',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
  },
  buttonDisabled: { opacity: 0.55 },
  buttonText: { color: '#fff', fontSize: 15, fontWeight: '700', letterSpacing: 0.3 },
  error: { color: '#ff6b6b', marginBottom: 12, fontSize: 13, textAlign: 'center' },

  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 18,
    marginBottom: 14,
  },
  dividerLine: { flex: 1, height: 1, backgroundColor: 'rgba(255,255,255,0.10)' },
  dividerText: { color: 'rgba(255,255,255,0.40)', fontSize: 12, marginHorizontal: 10 },

  socialRow: {
    flexDirection: 'row',
    gap: 12,
  },
  socialBtn: {
    flex: 1,
    height: 48,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  googleG: { fontSize: 16, fontWeight: '800', color: '#4285F4' },
  phoneIcon: { fontSize: 16 },
  socialBtnText: { color: '#fff', fontSize: 14, fontWeight: '600' },

  link: { marginTop: 14, alignItems: 'center' },
  linkText: { color: 'rgba(255,255,255,0.45)', fontSize: 13 },
  linkBold: { color: '#00C897', fontWeight: '700' },
});
