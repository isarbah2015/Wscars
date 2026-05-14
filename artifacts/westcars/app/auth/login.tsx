import React, { useRef, useState } from 'react';
import {
  Text, TextInput, TouchableOpacity, ActivityIndicator,
  Platform, KeyboardAvoidingView, StyleSheet, View, Image,
} from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { useRouter } from 'expo-router';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../lib/firebase-persistence';

const WC_LOGO = require('../../assets/images/wc-logo.png');

export default function LoginScreen() {
  const router = useRouter();
  const passwordRef = useRef<TextInput>(null);
  const [email,        setEmail]        = useState('');
  const [password,     setPassword]     = useState('');
  const [loading,      setLoading]      = useState(false);
  const [error,        setError]        = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    setError('');
    if (!email.trim() || !password.trim()) {
      setError('Please fill in all fields');
      return;
    }
    try {
      setLoading(true);
      await signInWithEmailAndPassword(auth!, email.trim(), password);
    } catch (e: any) {
      const msg =
        e.code === 'auth/invalid-credential'  ? 'Incorrect email or password' :
        e.code === 'auth/too-many-requests'   ? 'Too many attempts. Please try again later' :
        e.code === 'auth/user-not-found'      ? 'No account found with this email' :
        e.code === 'auth/wrong-password'      ? 'Incorrect password' :
                                                'Login failed. Please try again';
      setError(msg);
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

const TEAL = '#0EB5CA';

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#EDF4F7' },
  scroll: { flexGrow: 1, justifyContent: 'center', paddingHorizontal: 20, paddingVertical: 32 },

  card: {
    backgroundColor: '#FFFFFF', borderRadius: 28,
    paddingHorizontal: 24, paddingTop: 28, paddingBottom: 28,
    shadowColor: '#0A1628', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.10, shadowRadius: 20, elevation: 6,
  },

  topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 },
  logo:   { width: 100, height: 40 },
  navBtn: { paddingHorizontal: 16, paddingVertical: 7, borderRadius: 20, borderWidth: 1.5, borderColor: TEAL },
  navBtnText: { fontSize: 13, fontFamily: 'Inter_600SemiBold', color: TEAL },

  title:    { fontSize: 32, fontFamily: 'Manrope_800ExtraBold', color: '#0F172A', letterSpacing: -0.8, marginBottom: 4 },
  subtitle: { fontSize: 14, fontFamily: 'Inter_400Regular', color: '#64748B', marginBottom: 20 },

  error: { color: '#EF4444', fontSize: 13, textAlign: 'center', marginBottom: 12, fontFamily: 'Inter_500Medium' },

  label: {
    alignSelf: 'flex-start', fontSize: 11, fontFamily: 'Inter_600SemiBold',
    color: '#475569', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 7, marginTop: 4,
  },
  input: {
    width: '100%', height: 52, backgroundColor: '#F5FBFC',
    borderRadius: 16, paddingHorizontal: 18, fontSize: 15, color: '#0F172A',
    marginBottom: 14, borderWidth: 1.5, borderColor: '#E2E8F0', fontFamily: 'Inter_400Regular',
  },

  primaryBtn: {
    width: '100%', height: 52, backgroundColor: TEAL, borderRadius: 16,
    alignItems: 'center', justifyContent: 'center', marginTop: 8,
    shadowColor: TEAL, shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35, shadowRadius: 12, elevation: 8,
  },
  btnDisabled:    { opacity: 0.55 },
  primaryBtnText: { color: '#fff', fontSize: 16, fontFamily: 'Inter_700Bold', letterSpacing: 0.3 },

  guestBtn: { alignItems: 'center', marginTop: 22, paddingVertical: 6 },
  guestText:{ color: '#94A3B8', fontSize: 13, fontFamily: 'Inter_500Medium' },

  passwordRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#F5FBFC', borderRadius: 16,
    borderWidth: 1.5, borderColor: '#E2E8F0',
    marginBottom: 14, paddingRight: 12, overflow: 'hidden',
  },
  eyeBtn: { paddingHorizontal: 8 },
  eyeText:{ color: TEAL, fontSize: 13, fontFamily: 'Inter_600SemiBold' },
});
