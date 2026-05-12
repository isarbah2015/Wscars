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
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { auth } from '../../lib/firebase-persistence';

const WC_LOGO = require('../../assets/images/wc-logo.png');

export default function SignupScreen() {
  const router = useRouter();
  const emailRef    = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);
  const confirmRef  = useRef<TextInput>(null);
  const [name,     setName]     = useState('');
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [confirm,  setConfirm]  = useState('');
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm,  setShowConfirm]  = useState(false);

  const handleSignup = async () => {
    setError('');
    if (!name.trim() || !email.trim() || !password || !confirm) {
      setError('Please fill in all fields'); return;
    }
    if (password.length < 6) { setError('Password must be at least 6 characters'); return; }
    if (password !== confirm) { setError('Passwords do not match'); return; }
    try {
      setLoading(true);
      const cred = await createUserWithEmailAndPassword(auth!, email.trim(), password);
      await updateProfile(cred.user, { displayName: name.trim() });
      setTimeout(() => { router.replace('/(tabs)'); }, 100);
    } catch (e: any) {
      const msg = e.code === 'auth/email-already-in-use'  ? 'An account with this email already exists'
                : e.code === 'auth/invalid-email'          ? 'Please enter a valid email address'
                : e.code === 'auth/weak-password'          ? 'Password is too weak — use at least 6 characters'
                : e.code === 'auth/unauthorized-domain'    ? 'Sign-in is not enabled for this preview URL. Please open the app in Expo Go on your phone instead.'
                : 'Sign up failed. Please try again';
      setError(msg);
    } finally { setLoading(false); }
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
            <TouchableOpacity onPress={() => router.push('/auth/login')} activeOpacity={0.7} style={styles.navBtn}>
              <Text style={styles.navBtnText}>Sign In</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Join Westcars today</Text>

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <Text style={styles.label}>Full Name</Text>
          <TextInput
            style={styles.input}
            placeholder="John Mensah"
            placeholderTextColor="#94A3B8"
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
            autoCorrect={false}
            autoComplete="name"
            returnKeyType="next"
            blurOnSubmit={false}
            editable={!loading}
            onSubmitEditing={() => emailRef.current?.focus()}
          />

          <Text style={styles.label}>Email</Text>
          <TextInput
            ref={emailRef}
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
            editable={!loading}
            onSubmitEditing={() => passwordRef.current?.focus()}
          />

          <Text style={styles.label}>Password</Text>
          <View style={styles.passwordRow}>
            <TextInput
              ref={passwordRef}
              style={[styles.input, { marginBottom: 0, flex: 1, borderWidth: 0 }]}
              placeholder="••••••••••"
              placeholderTextColor="#94A3B8"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete="new-password"
              returnKeyType="next"
              blurOnSubmit={false}
              editable={!loading}
              onSubmitEditing={() => confirmRef.current?.focus()}
            />
            <TouchableOpacity onPress={() => setShowPassword(v => !v)} hitSlop={8} style={styles.eyeBtn}>
              <Text style={styles.eyeText}>{showPassword ? 'Hide' : 'Show'}</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.label}>Confirm Password</Text>
          <View style={styles.passwordRow}>
            <TextInput
              ref={confirmRef}
              style={[styles.input, { marginBottom: 0, flex: 1, borderWidth: 0 }]}
              placeholder="••••••••••"
              placeholderTextColor="#94A3B8"
              value={confirm}
              onChangeText={setConfirm}
              secureTextEntry={!showConfirm}
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete="new-password"
              returnKeyType="done"
              editable={!loading}
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

const TEAL = '#0EB5CA';

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
  logo: { width: 100, height: 40 },
  navBtn: {
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: TEAL,
  },
  navBtnText: { fontSize: 13, fontFamily: 'Inter_600SemiBold', color: TEAL },

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
    backgroundColor: TEAL,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    gap: 12,
    shadowColor: TEAL,
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

  guestBtn: { alignItems: 'center', marginTop: 22, paddingVertical: 6 },
  guestText: { color: '#94A3B8', fontSize: 13, fontFamily: 'Inter_500Medium' },
  passwordRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5FBFC',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    marginBottom: 14,
    paddingRight: 12,
    overflow: 'hidden',
  },
  eyeBtn: { paddingHorizontal: 8 },
  eyeText: { color: '#0EB5CA', fontSize: 13, fontFamily: 'Inter_600SemiBold' },
});
