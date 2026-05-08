import React, { useRef, useState } from 'react';
import {
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
  KeyboardAvoidingView,
  StyleSheet,
} from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { useRouter } from 'expo-router';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { auth } from '../../lib/firebase-persistence';

export default function SignupScreen() {
  const router = useRouter();
  const emailRef = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);
  const confirmRef = useRef<TextInput>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSignup = async () => {
    setError('');
    if (!name.trim() || !email.trim() || !password || !confirm) {
      setError('Please fill in all fields');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    if (password !== confirm) {
      setError('Passwords do not match');
      return;
    }
    try {
      setLoading(true);
      const cred = await createUserWithEmailAndPassword(auth!, email.trim(), password);
      await updateProfile(cred.user, { displayName: name.trim() });
      router.replace('/(tabs)');
    } catch (e: any) {
      const msg = e.code === 'auth/email-already-in-use'
        ? 'An account with this email already exists'
        : e.code === 'auth/invalid-email'
        ? 'Please enter a valid email address'
        : e.code === 'auth/weak-password'
        ? 'Password is too weak — use at least 6 characters'
        : 'Sign up failed. Please try again';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="always"
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Create Account</Text>
        <Text style={styles.subtitle}>Join Westcars today</Text>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <TextInput
          style={styles.input}
          placeholder="Full name"
          placeholderTextColor="#999"
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

        <TextInput
          ref={emailRef}
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
          editable={!loading}
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
          autoComplete="new-password"
          returnKeyType="next"
          blurOnSubmit={false}
          editable={!loading}
          textAlign="left"
          onSubmitEditing={() => confirmRef.current?.focus()}
        />

        <TextInput
          ref={confirmRef}
          style={styles.input}
          placeholder="Confirm password"
          placeholderTextColor="#999"
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
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleSignup}
          disabled={loading}
          activeOpacity={0.8}
        >
          {loading
            ? <ActivityIndicator color="#fff" />
            : <Text style={styles.buttonText}>Create Account</Text>
          }
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => router.push('/auth/login')}
          activeOpacity={0.7}
          style={styles.link}
        >
          <Text style={styles.linkText}>
            Already have an account?{' '}
            <Text style={styles.linkBold}>Sign in</Text>
          </Text>
        </TouchableOpacity>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A1628' },
  scroll: { flexGrow: 1, padding: 24, justifyContent: 'center' },
  title: { fontSize: 28, fontWeight: '700', color: '#fff', marginBottom: 8 },
  subtitle: { fontSize: 16, color: '#aaa', marginBottom: 32 },
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
  link: { marginTop: 16, alignItems: 'center' },
  linkText: { color: '#aaa', fontSize: 14 },
  linkBold: { color: '#00C897', fontWeight: '700' },
});
