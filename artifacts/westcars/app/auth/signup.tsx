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
import { LinearGradient } from 'expo-linear-gradient';
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
  const [name,    setName]    = useState('');
  const [email,   setEmail]   = useState('');
  const [password, setPassword] = useState('');
  const [confirm,  setConfirm]  = useState('');
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState('');

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
      router.replace('/(tabs)');
    } catch (e: any) {
      const msg = e.code === 'auth/email-already-in-use' ? 'An account with this email already exists'
                : e.code === 'auth/invalid-email'         ? 'Please enter a valid email address'
                : e.code === 'auth/weak-password'         ? 'Password is too weak — use at least 6 characters'
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
        {/* ── White wave top ── */}
        <View style={styles.waveSection}>
          <View style={styles.waveHeader}>
            <Image source={WC_LOGO} style={styles.waveLogo} resizeMode="contain" tintColor="#FF6B00" />
            <TouchableOpacity onPress={() => router.push('/auth/login')} activeOpacity={0.7} style={styles.waveSignInBtn}>
              <Text style={styles.waveSignInText}>Sign In</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.waveTitle}>Create Account</Text>
          <Text style={styles.waveSub}>Join Westcars today</Text>
        </View>

        {/* ── Dark form section ── */}
        <View style={styles.darkSection}>
          {error ? <Text style={styles.error}>{error}</Text> : null}

          <Text style={styles.label}>Full Name</Text>
          <TextInput
            style={styles.darkInput}
            placeholder="John Mensah"
            placeholderTextColor="rgba(255,255,255,0.22)"
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
            autoCorrect={false}
            autoComplete="name"
            returnKeyType="next"
            blurOnSubmit={false}
            editable={!loading}
            textAlign="left"
            onSubmitEditing={() => emailRef.current?.focus()}
          />

          <Text style={styles.label}>Email</Text>
          <TextInput
            ref={emailRef}
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
            editable={!loading}
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
            autoComplete="new-password"
            returnKeyType="next"
            blurOnSubmit={false}
            editable={!loading}
            textAlign="left"
            onSubmitEditing={() => confirmRef.current?.focus()}
          />

          <Text style={styles.label}>Confirm Password</Text>
          <TextInput
            ref={confirmRef}
            style={styles.darkInput}
            placeholder="••••••••••"
            placeholderTextColor="rgba(255,255,255,0.22)"
            value={confirm}
            onChangeText={setConfirm}
            secureTextEntry
            autoCapitalize="none"
            autoCorrect={false}
            autoComplete="new-password"
            returnKeyType="done"
            editable={!loading}
            textAlign="left"
            onSubmitEditing={handleSignup}
          />

          <TouchableOpacity
            style={[styles.button, loading && styles.btnDisabled]}
            onPress={handleSignup}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading ? <ActivityIndicator color="#fff" /> : (
              <>
                <View style={styles.btnArrow}>
                  <Text style={styles.btnArrowIcon}>→</Text>
                </View>
                <Text style={styles.buttonText}>Create Account</Text>
              </>
            )}
          </TouchableOpacity>

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

  waveSection: {
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: 56,
    borderBottomRightRadius: 56,
    paddingTop: Platform.OS === 'ios' ? 60 : 48,
    paddingBottom: 32,
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
    marginBottom: 16,
  },
  waveLogo: { width: 100, height: 36 },
  waveSignInBtn: {
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#FF6B00',
  },
  waveSignInText: { fontSize: 13, fontFamily: 'Inter_600SemiBold', color: '#FF6B00' },
  waveTitle: {
    fontSize: 34,
    fontFamily: 'Manrope_800ExtraBold',
    color: '#0D0D1A',
    letterSpacing: -0.8,
    marginBottom: 4,
  },
  waveSub: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    color: '#64748B',
  },

  darkSection: {
    flex: 1,
    paddingHorizontal: 26,
    paddingTop: 24,
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
    height: 50,
    backgroundColor: '#1C1C2E',
    borderRadius: 25,
    paddingHorizontal: 20,
    fontSize: 15,
    color: '#fff',
    marginBottom: 12,
    textAlign: 'left',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
  },
  error: { color: '#FF6B6B', fontSize: 13, textAlign: 'center', marginBottom: 12, fontFamily: 'Inter_500Medium' },

  button: {
    width: '100%',
    height: 52,
    backgroundColor: '#FF6B00',
    borderRadius: 26,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    gap: 12,
    shadowColor: '#FF6B00',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.45,
    shadowRadius: 14,
    elevation: 8,
  },
  btnDisabled: { opacity: 0.55 },
  btnArrow: {
    width: 30, height: 30, borderRadius: 15,
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center', justifyContent: 'center',
  },
  btnArrowIcon: { color: '#fff', fontSize: 18, lineHeight: 22 },
  buttonText: { color: '#fff', fontSize: 16, fontFamily: 'Inter_700Bold', letterSpacing: 0.3 },

  guestBtn: { alignItems: 'center', marginTop: 22, paddingVertical: 6 },
  guestText: { color: 'rgba(255,255,255,0.32)', fontSize: 13, fontFamily: 'Inter_500Medium' },
});
