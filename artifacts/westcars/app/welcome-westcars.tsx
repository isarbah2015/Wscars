import React, { useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, Dimensions,
  TouchableOpacity, StatusBar, Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useRouter } from 'expo-router';

const { width } = Dimensions.get('window');
const NAVY = '#004D5A';
const TEAL = '#0EB5CA';
const GOLD = '#F59E0B';

export default function WelcomeWestCarsScreen() {
  const router = useRouter();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 700, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 700, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <LinearGradient
      colors={[NAVY, '#0A3D47', TEAL]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />

      <View style={styles.orb1} />
      <View style={styles.orb2} />

      <Animated.View style={[styles.content, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
        <Text style={styles.brand}>WestCars</Text>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>🇬🇭  Ghana's Trusted Car Marketplace</Text>
        </View>

        <BlurView intensity={20} tint="light" style={styles.glassCard}>
          <View style={styles.cardInner}>
            <Text style={styles.carEmoji}>🚗</Text>
            <Text style={styles.headline}>Buy & Sell Cars With Confidence</Text>
            <Text style={styles.subheadline}>
              Verified listings, secure messaging, and fair prices — all in one place.
            </Text>
            <View style={styles.statsRow}>
              <View style={styles.stat}>
                <Text style={styles.statNum}>12K+</Text>
                <Text style={styles.statLabel}>Listings</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.stat}>
                <Text style={styles.statNum}>98%</Text>
                <Text style={styles.statLabel}>Verified</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.stat}>
                <Text style={styles.statNum}>4.9★</Text>
                <Text style={styles.statLabel}>Rated</Text>
              </View>
            </View>
          </View>
        </BlurView>

        <TouchableOpacity style={styles.signInBtn} onPress={() => router.push('/auth/login')}>
          <Text style={styles.signInText}>Sign In</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.signUpBtn} onPress={() => router.push('/auth/signup')}>
          <LinearGradient colors={[GOLD, '#E8B84B']} style={styles.signUpGradient}>
            <Text style={styles.signUpText}>Create Account</Text>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.replace('/(tabs)')}>
          <Text style={styles.browseLink}>Browse listings without signing in</Text>
        </TouchableOpacity>
      </Animated.View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, overflow: 'hidden' },
  orb1: {
    position: 'absolute', width: 260, height: 260, borderRadius: 130,
    backgroundColor: 'rgba(14,181,202,0.15)', top: -40, right: -70,
  },
  orb2: {
    position: 'absolute', width: 200, height: 200, borderRadius: 100,
    backgroundColor: 'rgba(245,158,11,0.12)', bottom: 60, left: -50,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
    paddingVertical: 48,
    gap: 16,
  },
  brand: {
    fontSize: 44,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 2,
    textShadowColor: 'rgba(14,181,202,0.55)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 18,
  },
  badge: {
    backgroundColor: 'rgba(255,255,255,0.14)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
    paddingHorizontal: 16,
    paddingVertical: 6,
    marginBottom: 8,
  },
  badgeText: { color: '#FFFFFF', fontSize: 13, fontWeight: '600' },
  glassCard: { width: width - 56, borderRadius: 24, overflow: 'hidden' },
  cardInner: {
    backgroundColor: 'rgba(255,255,255,0.10)',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.22)',
    paddingVertical: 28,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  carEmoji: { fontSize: 72, marginBottom: 16 },
  headline: { fontSize: 20, fontWeight: '700', color: '#FFFFFF', textAlign: 'center', marginBottom: 8 },
  subheadline: { fontSize: 14, color: 'rgba(255,255,255,0.72)', textAlign: 'center', lineHeight: 21, marginBottom: 20 },
  statsRow: { flexDirection: 'row', alignItems: 'center', width: '100%', justifyContent: 'center' },
  stat: { flex: 1, alignItems: 'center' },
  statNum: { fontSize: 18, fontWeight: '800', color: '#FFFFFF' },
  statLabel: { fontSize: 11, color: 'rgba(255,255,255,0.6)', marginTop: 2 },
  statDivider: { width: 1, height: 28, backgroundColor: 'rgba(255,255,255,0.2)' },
  signInBtn: {
    width: '100%',
    backgroundColor: TEAL,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  signInText: { color: NAVY, fontSize: 17, fontWeight: '700' },
  signUpBtn: { width: '100%', borderRadius: 14, overflow: 'hidden' },
  signUpGradient: { paddingVertical: 16, alignItems: 'center' },
  signUpText: { color: NAVY, fontSize: 17, fontWeight: '700' },
  browseLink: { color: 'rgba(255,255,255,0.55)', fontSize: 13, marginTop: 4, textDecorationLine: 'underline' },
});
