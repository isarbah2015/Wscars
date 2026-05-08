import React, { useState } from 'react';
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
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../../lib/firebase-persistence';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);

  const handleReset = async () => {
    setError('');
    if (!email.trim()) {
      setError('Please enter your email address');
      return;
    }
    try {
      setLoading(true);
      await sendPasswordResetEmail(auth!, email.trim());
      setSent(true);
    } catch (e: any) {
      const msg = e.code === 'auth/user-not-found'
        ? 'No account found with this email'
        : e.code === 'auth/invalid-email'
        ? 'Please enter a valid email address'
        : 'Failed to send reset email. Please try again';
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
        <Text style={styles.title}>Reset Password</Text>
        <Text style={styles.subtitle}>
          {sent
            ? 'Check your email for a reset link.'
            : 'Enter your email and we\'ll send a reset link.'}
        </Text>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        {!sent && (
          <>
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
              returnKeyType="done"
              editable={!loading}
              textAlign="left"
              onSubmitEditing={handleReset}
            />

            <TouchableOpacity
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={handleReset}
              disabled={loading}
              activeOpacity={0.8}
            >
              {loading
                ? <ActivityIndicator color="#fff" />
                : <Text style={styles.buttonText}>Send Reset Link</Text>
              }
            </TouchableOpacity>
          </>
        )}

        <TouchableOpacity
          onPress={() => router.back()}
          activeOpacity={0.7}
          style={styles.link}
        >
          <Text style={styles.linkText}>
            <Text style={styles.linkBold}>Back to Sign In</Text>
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
  link: { marginTop: 24, alignItems: 'center' },
  linkText: { color: '#aaa', fontSize: 14 },
  linkBold: { color: '#00C897', fontWeight: '700' },
});
