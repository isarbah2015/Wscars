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
import { ScrollView } from 'react-native-gesture-handler';
import { useRouter } from 'expo-router';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../lib/firebase-persistence';
import { GoogleAuthBridge } from '../../components/GoogleAuthBridge';
import { signInWithGoogleIdToken } from '../../services/firebase/auth';

const CAR_IMAGE = require('../../assets/images/car-hero.png');
const { width: SCREEN_W } = Dimensions.get('window');

const HAS_GOOGLE =
  !!process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID ||
  !!process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID;

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
    if (googlePromptRef.current) {
      await googlePromptRef.current();
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {HAS_GOOGLE && (
        <GoogleAuthBridge onIdToken={handleGoogleIdToken} promptRef={googlePromptRef} />
      )}

      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="always"
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        {/* Spacer pushes content to the lower portion of the screen */}
        <View style={styles.topSpacer} />

        {/* Car hero — edge to edge, no horizontal padding */}
        <View style={styles.heroWrap}>
          <Image
            source={CAR_IMAGE}
            style={styles.carImage}
            resizeMode="contain"
          />
        </View>

        {/* Form card */}
        <View style={styles.formCard}>
          <Text style={styles.title}>Welcome Back</Text>
          <Text style={styles.subtitle}>Sign in to your Westcars account</Text>

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <TextInput
            style={styles.input}
            placeholder="Email address"
            placeholderTextColor="#999"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            autoComplete="email"
            returnKeyType="next"
            blurOnSubmit={false}
            editable={!loading && !googleLoading}
            textAlign="left"
            onSubmitEditing={() => passwordRef.current?.focus()}
          />

          <TextInput
            ref={passwordRef}
            style={styles.input}
            placeholder="Password"
            placeholderTextColor="#999"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoCapitalize="none"
            autoCorrect={false}
            autoComplete="password"
            returnKeyType="done"
            editable={!loading && !googleLoading}
            textAlign="left"
            onSubmitEditing={handleLogin}
          />

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleLogin}
            disabled={loading || googleLoading}
            activeOpacity={0.8}
          >
            {loading
              ? <ActivityIndicator color="#fff" />
              : <Text style={styles.buttonText}>Sign In</Text>
            }
          </TouchableOpacity>

          {/* Google sign-in */}
          {HAS_GOOGLE && (
            <>
              <View style={styles.dividerRow}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>or</Text>
                <View style={styles.dividerLine} />
              </View>

              <TouchableOpacity
                style={[styles.googleButton, googleLoading && styles.buttonDisabled]}
                onPress={handleGooglePress}
                disabled={loading || googleLoading}
                activeOpacity={0.8}
              >
                {googleLoading ? (
                  <ActivityIndicator color="#444" />
                ) : (
                  <>
                    <Text style={styles.googleG}>G</Text>
                    <Text style={styles.googleText}>Continue with Google</Text>
                  </>
                )}
              </TouchableOpacity>
            </>
          )}

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
  scroll: { flexGrow: 1 },

  topSpacer: { flex: 1 },

  heroWrap: {
    width: SCREEN_W,
    height: SCREEN_W * 0.68,
    backgroundColor: '#0A1628',
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

  formCard: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 8,
  },
  title: { fontSize: 28, fontWeight: '700', color: '#fff', marginBottom: 6 },
  subtitle: { fontSize: 15, color: '#aaa', marginBottom: 28 },
  input: {
    height: 52,
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#000',
    marginBottom: 16,
    textAlign: 'left',
  },
  button: {
    height: 52,
    backgroundColor: '#00C897',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  error: { color: '#ff4444', marginBottom: 16, fontSize: 14, textAlign: 'center' },

  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 4,
  },
  dividerLine: { flex: 1, height: 1, backgroundColor: '#2a3a52' },
  dividerText: { color: '#666', fontSize: 13, marginHorizontal: 12 },

  googleButton: {
    height: 52,
    backgroundColor: '#fff',
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    gap: 10,
  },
  googleG: {
    fontSize: 18,
    fontWeight: '700',
    color: '#4285F4',
  },
  googleText: { color: '#333', fontSize: 15, fontWeight: '600' },

  link: { marginTop: 16, alignItems: 'center' },
  linkText: { color: '#aaa', fontSize: 14 },
  linkBold: { color: '#00C897', fontWeight: '700' },
});
