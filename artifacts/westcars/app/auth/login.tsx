import React, { useEffect, useRef, useState } from 'react';
import {
  Text, TextInput, TouchableOpacity, ActivityIndicator,
  Platform, KeyboardAvoidingView, StyleSheet, View, Image,
} from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { useRouter } from 'expo-router';
import { auth } from '../../lib/firebase-persistence';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import { useApp } from '@/context/AppContext';
import { useTheme } from '@/context/ThemeContext';
import { isFirebaseReady } from '@/lib/firebase';
import { authErrorMessage } from '@/services/firebase/auth';

WebBrowser.maybeCompleteAuthSession();

const WC_LOGO = require('../../assets/images/wc-logo.png');
const GOOGLE_ANDROID_ID = process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID;
const GOOGLE_WEB_ID     = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;
const GOOGLE_CONFIGURED = !!(GOOGLE_ANDROID_ID || GOOGLE_WEB_ID);

export default function LoginScreen() {
  const router = useRouter();
  const { login, loginWithGoogle, isLoading } = useApp();
  const { colors } = useTheme();
  const styles = makeStyles(colors);
  const passwordRef = useRef<TextInput>(null);
  const [email,        setEmail]        = useState('');
  const [password,     setPassword]     = useState('');
  const [loading,      setLoading]      = useState(false);
  const [error,        setError]        = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const [request, response, promptAsync] = Google.useAuthRequest({
    androidClientId: GOOGLE_ANDROID_ID,
    webClientId:     GOOGLE_WEB_ID,
  });

  useEffect(() => {
    if (response?.type === 'success') {
      const idToken =
        response.params?.id_token ??
        (response.authentication as any)?.idToken;
      const accessToken =
        response.authentication?.accessToken ??
        response.params?.access_token;
      if (idToken) {
        setGoogleLoading(true);
        loginWithGoogle(idToken, accessToken ?? undefined)
          .catch(() => setError('Google sign-in failed. Please try again.'))
          .finally(() => setGoogleLoading(false));
      } else {
        setError('Google sign-in failed. Please try again.');
      }
    } else if (response?.type === 'error') {
      setError('Google sign-in failed: ' + (response.error?.message ?? 'unknown error'));
    }
  }, [response]);

  const handleGoogle = async () => {
    if (!GOOGLE_CONFIGURED) {
      setError('Google sign-in is not configured.');
      return;
    }
    setError('');
    await promptAsync();
  };

  const handleLogin = async () => {
    setError('');
    if (isLoading || !auth || !isFirebaseReady()) {
      setError('Secure sign-in is still starting. Please try again in a moment.');
      return;
    }
    if (!email.trim() || !password.trim()) {
      setError('Please fill in all fields');
      return;
    }
    try {
      setLoading(true);
      await login(email.trim(), password);
    } catch (e: any) {
      setError(authErrorMessage(e));
    } finally {
      setLoading(false);
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

          {/* Logo + nav row */}
          <View style={styles.topRow}>
            <Image source={WC_LOGO} style={styles.logo} resizeMode="contain" />
            <TouchableOpacity onPress={() => router.push('/auth/signup')} activeOpacity={0.7} style={styles.navBtn}>
              <Text style={styles.navBtnText}>Create Account</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.title}>Welcome Back</Text>
          <Text style={styles.subtitle}>Sign in to your Westcars account</Text>

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <TouchableOpacity
            style={[styles.googleBtn, (!request || googleLoading) && styles.btnDisabled]}
            onPress={handleGoogle}
            disabled={!request || googleLoading}
            activeOpacity={0.85}
          >
            {googleLoading ? (
              <ActivityIndicator color={colors.accent} size="small" />
            ) : (
              <>
                <View style={styles.googleIcon}>
                  <Text style={styles.googleIconText}>G</Text>
                </View>
                <Text style={styles.googleBtnText}>Continue with Google</Text>
              </>
            )}
          </TouchableOpacity>

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
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="next"
            blurOnSubmit={false}
            editable={!loading}
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
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="done"
              editable={!loading}
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
  container: { flex: 1, backgroundColor: colors.background },
  scroll: { flexGrow: 1, justifyContent: 'center', paddingHorizontal: 20, paddingVertical: 32 },

  card: {
    backgroundColor: colors.card, borderRadius: 28,
    paddingHorizontal: 24, paddingTop: 28, paddingBottom: 28,
    shadowColor: '#0A1628', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.10, shadowRadius: 20, elevation: 6,
  },

  topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 },
  logo:   { width: 100, height: 40 },
  navBtn: { paddingHorizontal: 16, paddingVertical: 7, borderRadius: 20, borderWidth: 1.5, borderColor: colors.accent },
  navBtnText: { fontSize: 13, fontFamily: 'Inter_600SemiBold', color: colors.accent },

  title:    { fontSize: 32, fontFamily: 'Manrope_800ExtraBold', color: colors.text, letterSpacing: -0.8, marginBottom: 4 },
  subtitle: { fontSize: 14, fontFamily: 'Inter_400Regular', color: colors.textSecondary, marginBottom: 20 },

  error: { color: colors.danger, fontSize: 13, textAlign: 'center', marginBottom: 12, fontFamily: 'Inter_500Medium' },

  googleBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
    width: '100%', height: 52, backgroundColor: colors.card,
    borderRadius: 16, borderWidth: 1.5, borderColor: colors.skeleton,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 6, elevation: 2, marginBottom: 16,
  },
  googleIcon: {
    width: 24, height: 24, borderRadius: 12,
    backgroundColor: colors.card, borderWidth: 1, borderColor: colors.skeleton,
    alignItems: 'center', justifyContent: 'center',
  },
  googleIconText: { fontSize: 14, fontFamily: 'Inter_700Bold', color: '#4285F4' },
  googleBtnText:  { fontSize: 15, fontFamily: 'Inter_600SemiBold', color: colors.text },
  dividerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16, gap: 10 },
  dividerLine: { flex: 1, height: 1, backgroundColor: colors.skeleton },
  dividerText: { fontSize: 12, fontFamily: 'Inter_500Medium', color: colors.textTertiary },

  label: {
    alignSelf: 'flex-start', fontSize: 11, fontFamily: 'Inter_600SemiBold',
    color: colors.textSecondary, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 7, marginTop: 4,
  },
  input: {
    width: '100%', height: 52, backgroundColor: colors.inputBg,
    borderRadius: 16, paddingHorizontal: 18, fontSize: 15, color: colors.text,
    marginBottom: 14, borderWidth: 1.5, borderColor: colors.skeleton, fontFamily: 'Inter_400Regular',
  },

  primaryBtn: {
    width: '100%', height: 52, backgroundColor: colors.accent, borderRadius: 16,
    alignItems: 'center', justifyContent: 'center', marginTop: 8,
    shadowColor: colors.accent, shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35, shadowRadius: 12, elevation: 8,
  },
  btnDisabled:    { opacity: 0.55 },
  primaryBtnText: { color: '#fff', fontSize: 16, fontFamily: 'Inter_700Bold', letterSpacing: 0.3 },

  guestBtn: { alignItems: 'center', marginTop: 22, paddingVertical: 6 },
  guestText:{ color: colors.textTertiary, fontSize: 13, fontFamily: 'Inter_500Medium' },

  passwordRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: colors.inputBg, borderRadius: 16,
    borderWidth: 1.5, borderColor: colors.skeleton,
    marginBottom: 14, paddingRight: 12, overflow: 'hidden',
  },
  eyeBtn: { paddingHorizontal: 8 },
  eyeText:{ color: colors.accent, fontSize: 13, fontFamily: 'Inter_600SemiBold' },
});
