import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, KeyboardAvoidingView, Platform,
  ScrollView, ActivityIndicator,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuth } from '@/context/AuthContext';

export default function SignUpScreen() {
  const router = useRouter();
  const { signUp } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSignUp = async () => {
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
      await signUp(email, password, name);
      router.replace('/(tabs)');
    } catch (e: any) {
      const msg =
        e.code === 'auth/email-already-in-use' ? 'An account with this email already exists' :
        e.code === 'auth/invalid-email'         ? 'Invalid email address' :
        e.code === 'auth/weak-password'         ? 'Password must be at least 6 characters' :
        e.code === 'auth/network-request-failed' ? 'Check your internet connection' :
        'Registration failed. Please try again';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <Text style={styles.brand}>WestCars</Text>
          <Text style={styles.tagline}>Create your account</Text>
        </View>

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <TextInput style={styles.input} placeholder="Full name" placeholderTextColor="rgba(255,255,255,0.55)" value={name} onChangeText={setName} autoCapitalize="words" />
        <TextInput style={styles.input} placeholder="Email address" placeholderTextColor="rgba(255,255,255,0.55)" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" autoCorrect={false} />
        <View style={styles.inputRow}>
          <TextInput style={styles.inputFlex} placeholder="Password (min 6 characters)" placeholderTextColor="rgba(255,255,255,0.55)" value={password} onChangeText={setPassword} secureTextEntry={!showPassword} />
          <TouchableOpacity onPress={() => setShowPassword(v => !v)} style={styles.eyeBtn}>
            <Feather name={showPassword ? 'eye-off' : 'eye'} size={20} color="rgba(255,255,255,0.55)" />
          </TouchableOpacity>
        </View>
        <View style={styles.inputRow}>
          <TextInput style={styles.inputFlex} placeholder="Confirm password" placeholderTextColor="rgba(255,255,255,0.55)" value={confirm} onChangeText={setConfirm} secureTextEntry={!showConfirm} />
          <TouchableOpacity onPress={() => setShowConfirm(v => !v)} style={styles.eyeBtn}>
            <Feather name={showConfirm ? 'eye-off' : 'eye'} size={20} color="rgba(255,255,255,0.55)" />
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.button} onPress={handleSignUp} disabled={loading}>
          {loading
            ? <ActivityIndicator color="#004D5A" />
            : <Text style={styles.buttonText}>Create Account</Text>}
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.push('/auth/login')}>
          <Text style={styles.linkText}>Already have an account? <Text style={styles.linkBold}>Sign In</Text></Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#004D5A' },
  scroll: { flexGrow: 1, padding: 28, justifyContent: 'center' },
  header: { alignItems: 'center', marginBottom: 40 },
  brand: { fontSize: 38, fontWeight: '800', color: '#0EB5CA', letterSpacing: 1 },
  tagline: { color: 'rgba(255,255,255,0.7)', marginTop: 8, fontSize: 15 },
  errorText: {
    backgroundColor: 'rgba(255,80,80,0.15)',
    color: '#FF6B6B',
    padding: 12,
    borderRadius: 10,
    marginBottom: 16,
    textAlign: 'center',
    fontSize: 14,
  },
  input: {
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
    borderRadius: 12,
    paddingHorizontal: 18,
    paddingVertical: 14,
    color: '#FFFFFF',
    fontSize: 16,
    marginBottom: 16,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
    borderRadius: 12,
    marginBottom: 16,
  },
  inputFlex: {
    flex: 1,
    paddingHorizontal: 18,
    paddingVertical: 14,
    color: '#FFFFFF',
    fontSize: 16,
  },
  eyeBtn: {
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  button: {
    backgroundColor: '#0EB5CA',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 24,
  },
  buttonText: { color: '#004D5A', fontSize: 17, fontWeight: '700' },
  linkText: { color: 'rgba(255,255,255,0.65)', textAlign: 'center', fontSize: 14, marginTop: 12 },
  linkBold: { color: '#0EB5CA', fontWeight: '700' },
});
