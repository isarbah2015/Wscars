import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { useRef } from 'react';
import {
  Animated,
  Dimensions,
  Image,
  PanResponder,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

const { width, height } = Dimensions.get('window');
const PORSCHE = require('@/assets/images/welcome-car-porsche.png');
const SWIPE_THRESHOLD = width * 0.28;

export default function WelcomeScreen() {
  const router = useRouter();
  const translateX = useRef(new Animated.Value(0)).current;

  const goToLogin = async () => {
    await AsyncStorage.setItem('hasSeenWelcome', 'true');
    Animated.timing(translateX, {
      toValue: -width,
      duration: 320,
      useNativeDriver: true,
    }).start(() => router.replace('/auth/login'));
  };

  const panResponder = useRef(
    PanResponder.create({
      // Capture phase — intercept horizontal swipes before child views consume them
      onMoveShouldSetPanResponder: (_, g) =>
        Math.abs(g.dx) > 8 && Math.abs(g.dx) > Math.abs(g.dy),
      onMoveShouldSetPanResponderCapture: (_, g) =>
        Math.abs(g.dx) > 8 && Math.abs(g.dx) > Math.abs(g.dy),
      onPanResponderMove: (_, g) => {
        if (g.dx < 0) translateX.setValue(g.dx);
      },
      onPanResponderRelease: (_, g) => {
        if (g.dx < -SWIPE_THRESHOLD || g.vx < -0.5) {
          goToLogin();
        } else {
          Animated.spring(translateX, {
            toValue: 0,
            useNativeDriver: true,
            bounciness: 6,
          }).start();
        }
      },
    })
  ).current;

  return (
    <Animated.View
      style={[styles.container, { transform: [{ translateX }] }]}
      {...panResponder.panHandlers}
    >
      {/* Full Porsche PNG — no cropping */}
      <View style={styles.imageWrap}>
        <Image source={PORSCHE} style={styles.image} resizeMode="contain" />
      </View>

      {/* Bottom card */}
      <View style={styles.card}>
        <Text style={styles.title}>{"Ghana's Finest.\nEndless Choices!"}</Text>
        <Text style={styles.subtitle}>
          Verified listings, secure messaging, and fair prices — all in one place.
        </Text>

        {/* Stats row */}
        <View style={styles.statsRow}>
          {[
            { value: '12K+', label: 'Listings' },
            { value: '98%',  label: 'Verified' },
            { value: '4.9★', label: 'Rated' },
          ].map((s, i, arr) => (
            <React.Fragment key={s.label}>
              <View style={styles.stat}>
                <Text style={styles.statValue}>{s.value}</Text>
                <Text style={styles.statLabel}>{s.label}</Text>
              </View>
              {i < arr.length - 1 && <View style={styles.statDivider} />}
            </React.Fragment>
          ))}
        </View>

        {/* Slide button */}
        <TouchableOpacity style={styles.slideBtn} onPress={goToLogin} activeOpacity={0.85}>
          <View style={styles.slideCircle}>
            <Text style={styles.arrow}>→</Text>
          </View>
          <Text style={styles.slideTxt}>Swipe to Get Started</Text>
          <Text style={styles.chevrons}>{'>>'}</Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0d3d4a',
  },
  imageWrap: {
    width,
    height: height * 0.52,
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    width: width,
    height: height * 0.52,
  },
  card: {
    flex: 1,
    paddingHorizontal: 28,
    paddingTop: 10,
    paddingBottom: 36,
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 30,
    fontWeight: '800',
    color: '#ffffff',
    lineHeight: 38,
  },
  subtitle: {
    fontSize: 14,
    color: '#aacdd3',
    lineHeight: 21,
    marginTop: 8,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.12)',
  },
  stat: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 22,
    fontWeight: '800',
    color: '#2ec4c4',
  },
  statLabel: {
    fontSize: 12,
    color: '#aacdd3',
    marginTop: 3,
  },
  statDivider: {
    width: 1,
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  slideBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 50,
    paddingRight: 20,
    height: 60,
    overflow: 'hidden',
    marginTop: 8,
  },
  slideCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#2ec4c4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  arrow: {
    fontSize: 22,
    color: '#0d3d4a',
    fontWeight: '700',
  },
  slideTxt: {
    flex: 1,
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
    letterSpacing: 0.3,
  },
  chevrons: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.5)',
    letterSpacing: 2,
  },
});
