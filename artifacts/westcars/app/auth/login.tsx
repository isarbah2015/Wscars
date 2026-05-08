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
  Dimensions,
} from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { useRouter } from 'expo-router';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../lib/firebase-persistence';

const CAR_IMAGE = require('../../assets/images/car-hero.png');
const { width: SCREEN_W } = Dimensions.get('window');

export default function LoginScreen() {
  const router = useRouter();
  const passwordRef = useRef<TextInput>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
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

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="always"
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
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
            autoComplete="password"
            returnKeyType="done"
            editable={!loading}
            textAlign="left"
            onSubmitEditing={handleLogin}
          />

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleLogin}
            disabled={loading}
            activeOpacity={0.8}
          >
            {loading
              ? <ActivityIndicator color="#fff" />
              : <Text style={styles.buttonText}>Sign In</Text>
            }
          </TouchableOpacity>

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
    marginBottom: -16,
  },

  formCard: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 24,
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
  link: { marginTop: 16, alignItems: 'center' },
  linkText: { color: '#aaa', fontSize: 14 },
  linkBold: { color: '#00C897', fontWeight: '700' },
});
