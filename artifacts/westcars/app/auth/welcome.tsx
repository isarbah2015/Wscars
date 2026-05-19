import React, { useRef, useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, Dimensions,
  TouchableOpacity, StatusBar, Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useRouter } from 'expo-router';

const { width, height } = Dimensions.get('window');
const TEAL = '#0EB5CA';
const DARK = '#004D5A';
const THUMB_SIZE = 60;
const TRACK_WIDTH = width - 80;
const MAX_SLIDE = TRACK_WIDTH - THUMB_SIZE - 4;

export default function WelcomeScreen() {
  const router = useRouter();
  const translateX = useRef(new Animated.Value(0)).current;
  const [unlocked, setUnlocked] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;
  const scaleAnim = useRef(new Animated.Value(0.92)).current;
  const cardFade = useRef(new Animated.Value(0)).current;
  const cardSlide = useRef(new Animated.Value(30)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
        Animated.timing(slideAnim, { toValue: 0, duration: 600, useNativeDriver: true }),
        Animated.spring(scaleAnim, { toValue: 1, friction: 6, useNativeDriver: true }),
      ]),
      Animated.parallel([
        Animated.timing(cardFade, { toValue: 1, duration: 500, useNativeDriver: true }),
        Animated.timing(cardSlide, { toValue: 0, duration: 500, useNativeDriver: true }),
      ]),
    ]).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 0.5, duration: 900, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 900, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const handleSlide = () => {
    if (unlocked) return;
    Animated.spring(translateX, {
      toValue: MAX_SLIDE,
      useNativeDriver: true,
      bounciness: 4,
    }).start(() => {
      setUnlocked(true);
      router.replace('/auth/login');
    });
  };

  return (
    <LinearGradient
      colors={['#0A3D47', '#005F6E', '#0EB5CA']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />

      {/* Glow orbs */}
      <View style={styles.orb1} />
      <View style={styles.orb2} />

      {/* Brand */}
      <Animated.View
        style={[
          styles.brandContainer,
          { opacity: fadeAnim, transform: [{ translateY: slideAnim }, { scale: scaleAnim }] },
        ]}
      >
        <Text style={styles.brandText}>WestCars</Text>
        <View style={styles.badgeRow}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>🇬🇭  Ghana's #1 Car Marketplace</Text>
          </View>
        </View>
      </Animated.View>

      {/* Glass card */}
      <Animated.View
        style={[
          styles.cardWrapper,
          { opacity: cardFade, transform: [{ translateY: cardSlide }] },
        ]}
      >
        <BlurView intensity={18} tint="light" style={styles.glassCard}>
          <View style={styles.cardInner}>
            <View style={styles.cardAccent} />
            <Text style={styles.carEmoji}>🚗</Text>
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>12K+</Text>
                <Text style={styles.statLabel}>Listings</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>98%</Text>
                <Text style={styles.statLabel}>Verified</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>4.9★</Text>
                <Text style={styles.statLabel}>Rated</Text>
              </View>
            </View>
          </View>
        </BlurView>
      </Animated.View>

      {/* Tagline */}
      <Animated.View style={[styles.taglineContainer, { opacity: cardFade }]}>
        <Text style={styles.tagline}>Find Your Perfect Car</Text>
        <Text style={styles.taglineSub}>Trusted listings · Secure messaging · Fair prices</Text>
      </Animated.View>

      {/* CTA */}
      <Animated.View style={[styles.btnWrapper, { opacity: cardFade }]}>
        <TouchableOpacity
          style={styles.btn}
          onPress={() => router.replace('/auth/login')}
          activeOpacity={0.82}
        >
          <LinearGradient
            colors={['#0EB5CA', '#007A8C']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.btnGradient}
          >
            <Text style={styles.btnText}>Get Started</Text>
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>

      {/* Sign up */}
      <TouchableOpacity onPress={() => router.push('/auth/signup')} style={styles.signupLink}>
        <Text style={styles.signupText}>
          New here?{'  '}
          <Text style={styles.signupBold}>Create Account</Text>
        </Text>
      </TouchableOpacity>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'space-between', paddingVertical: 64, overflow: 'hidden' },
  orb1: { position: 'absolute', width: 280, height: 280, borderRadius: 140, backgroundColor: 'rgba(14,181,202,0.18)', top: -60, right: -80 },
  orb2: { position: 'absolute', width: 220, height: 220, borderRadius: 110, backgroundColor: 'rgba(14,181,202,0.10)', bottom: 80, left: -60 },
  brandContainer: { alignItems: 'center', marginTop: 12 },
  brandText: {
    fontSize: 46, fontWeight: '800', color: '#FFFFFF', letterSpacing: 2,
    textShadowColor: 'rgba(14,181,202,0.6)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 20,
  },
  badgeRow: { marginTop: 10 },
  badge: {
    backgroundColor: 'rgba(255,255,255,0.14)',
    borderRadius: 20, borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
    paddingHorizontal: 16, paddingVertical: 6,
  },
  badgeText: { color: '#FFFFFF', fontSize: 13, fontWeight: '600' },
  cardWrapper: { width: width - 48, borderRadius: 24, overflow: 'hidden' },
  glassCard: { borderRadius: 24, overflow: 'hidden' },
  cardInner: {
    backgroundColor: 'rgba(255,255,255,0.10)',
    borderRadius: 24, borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.22)',
    alignItems: 'center',
    paddingVertical: 28, paddingHorizontal: 24,
  },
  cardAccent: { width: 48, height: 4, borderRadius: 2, backgroundColor: '#0EB5CA', marginBottom: 20 },
  carEmoji: { fontSize: 90, marginBottom: 24 },
  statsRow: { flexDirection: 'row', alignItems: 'center', width: '100%', justifyContent: 'center' },
  statItem: { flex: 1, alignItems: 'center' },
  statNumber: { fontSize: 20, fontWeight: '800', color: '#FFFFFF' },
  statLabel: { fontSize: 12, color: 'rgba(255,255,255,0.6)', marginTop: 2 },
  statDivider: { width: 1, height: 32, backgroundColor: 'rgba(255,255,255,0.2)' },
  taglineContainer: { alignItems: 'center', paddingHorizontal: 32 },
  tagline: { fontSize: 22, fontWeight: '700', color: '#FFFFFF', textAlign: 'center' },
  taglineSub: { color: 'rgba(255,255,255,0.60)', fontSize: 13, marginTop: 6, textAlign: 'center' },
  btnWrapper: { width: '100%', paddingHorizontal: 40 },
  btn: {
    width: '100%',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#0EB5CA',
    shadowOpacity: 0.5,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  btnGradient: { paddingVertical: 18, alignItems: 'center' },
  btnText: { fontSize: 17, fontWeight: '800', color: '#FFFFFF', letterSpacing: 0.4 },
  signupLink: { marginBottom: 4 },
  signupText: { color: 'rgba(255,255,255,0.60)', fontSize: 14 },
  signupBold: { color: '#FFFFFF', fontWeight: '700' },
});
