import React, { useRef, useState } from 'react';
import {
  View, Text, StyleSheet, Dimensions,
  TouchableOpacity, StatusBar, Animated,
  PanResponder,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';

const { width } = Dimensions.get('window');
const TEAL = '#0EB5CA';
const DARK = '#004D5A';
const THUMB_SIZE = 56;
const TRACK_WIDTH = width - 80;
const MAX_SLIDE = TRACK_WIDTH - THUMB_SIZE - 4;

export default function WelcomeScreen() {
  const router = useRouter();
  const translateX = useRef(new Animated.Value(0)).current;
  const [unlocked, setUnlocked] = useState(false);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (_, gs) => {
        const x = Math.max(0, Math.min(gs.dx, MAX_SLIDE));
        translateX.setValue(x);
      },
      onPanResponderRelease: (_, gs) => {
        if (gs.dx >= MAX_SLIDE * 0.85) {
          Animated.spring(translateX, { toValue: MAX_SLIDE, useNativeDriver: true }).start(() => {
            setUnlocked(true);
            router.replace('/auth/login');
          });
        } else {
          Animated.spring(translateX, { toValue: 0, useNativeDriver: true }).start();
        }
      },
    })
  ).current;

  return (
    <LinearGradient colors={['#0EB5CA', '#007A8C', DARK]} style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />

      <View style={styles.brandContainer}>
        <Text style={styles.brandText}>WestCars</Text>
        <Text style={styles.brandSub}>Ghana's Car Marketplace</Text>
      </View>

      <View style={styles.carContainer}>
        <View style={styles.carPlaceholder}>
          <Text style={styles.carEmoji}>🚗</Text>
        </View>
      </View>

      <View style={styles.taglineContainer}>
        <Text style={styles.tagline}>Buy & Sell Cars</Text>
        <Text style={styles.taglineSub}>Trusted listings across Ghana</Text>
      </View>

      <View style={styles.sliderWrapper}>
        <View style={styles.track}>
          <Text style={styles.trackLabel}>Slide to Get Started →</Text>
          <Animated.View
            style={[styles.thumb, { transform: [{ translateX }] }]}
            {...panResponder.panHandlers}
          >
            <Text style={styles.thumbArrow}>›</Text>
          </Animated.View>
        </View>
      </View>

      <TouchableOpacity onPress={() => router.push('/auth/signup')} style={styles.signupLink}>
        <Text style={styles.signupText}>New here? <Text style={styles.signupBold}>Create Account</Text></Text>
      </TouchableOpacity>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'space-between', paddingVertical: 60 },
  brandContainer: { alignItems: 'center', marginTop: 20 },
  brandText: { fontSize: 42, fontWeight: '800', color: '#FFFFFF', letterSpacing: 1.5 },
  brandSub: { color: 'rgba(255,255,255,0.75)', fontSize: 15, marginTop: 6 },
  carContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  carPlaceholder: {
    width: width * 0.75,
    height: width * 0.4,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  carEmoji: { fontSize: 80 },
  taglineContainer: { alignItems: 'center', marginBottom: 32 },
  tagline: { fontSize: 26, fontWeight: '700', color: '#FFFFFF' },
  taglineSub: { color: 'rgba(255,255,255,0.65)', fontSize: 14, marginTop: 6 },
  sliderWrapper: { width: '100%', paddingHorizontal: 40, marginBottom: 24 },
  track: {
    height: THUMB_SIZE + 4,
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderRadius: (THUMB_SIZE + 4) / 2,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.40)',
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  trackLabel: {
    position: 'absolute',
    width: '100%',
    textAlign: 'center',
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  thumb: {
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    borderRadius: THUMB_SIZE / 2,
    backgroundColor: TEAL,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
  },
  thumbArrow: { color: '#FFFFFF', fontSize: 28, fontWeight: '700' },
  signupLink: { marginBottom: 8 },
  signupText: { color: 'rgba(255,255,255,0.65)', fontSize: 14 },
  signupBold: { color: '#FFFFFF', fontWeight: '700' },
});
