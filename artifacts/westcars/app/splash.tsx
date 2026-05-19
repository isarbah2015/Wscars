import { useRouter } from 'expo-router';
import React, { useEffect, useRef } from 'react';
import { Animated, Easing, Image, StyleSheet, View } from 'react-native';
import { useAuth } from '@/context/AuthContext';

const LOGO   = require('@/assets/images/wc-logo.png');
const LOGO_W = 260;
const LOGO_H = 170;
const SPLASH_MS = 2000;

export default function SplashScreen() {
  const router    = useRouter();
  const { user, loading } = useAuth();
  const topY      = useRef(new Animated.Value(-(LOGO_H / 2 + 40))).current;
  const botY      = useRef(new Animated.Value(LOGO_H / 2 + 40)).current;
  const opacity   = useRef(new Animated.Value(0)).current;
  const shimmerX  = useRef(new Animated.Value(-LOGO_W - 60)).current;
  const shimmerOp = useRef(new Animated.Value(0)).current;
  const navigated = useRef(false);

  useEffect(() => {
    Animated.timing(opacity, {
      toValue: 1, duration: 200, useNativeDriver: false,
    }).start();

    Animated.parallel([
      Animated.timing(topY, {
        toValue: 0, duration: 600,
        easing: Easing.out(Easing.back(1.4)),
        useNativeDriver: false,
      }),
      Animated.timing(botY, {
        toValue: 0, duration: 600,
        easing: Easing.out(Easing.back(1.4)),
        useNativeDriver: false,
      }),
    ]).start(() => {
      Animated.sequence([
        Animated.timing(shimmerOp, { toValue: 1, duration: 80, useNativeDriver: false }),
        Animated.timing(shimmerX, {
          toValue: LOGO_W + 60, duration: 650,
          easing: Easing.inOut(Easing.quad), useNativeDriver: false,
        }),
        Animated.timing(shimmerOp, { toValue: 0, duration: 180, useNativeDriver: false }),
      ]).start();
    });
  }, []);

  useEffect(() => {
    if (loading || navigated.current) return;

    const timer = setTimeout(() => {
      if (navigated.current) return;
      navigated.current = true;

      if (user) {
        router.replace('/(tabs)');
      } else {
        router.replace('/welcome');
      }
    }, SPLASH_MS);

    return () => clearTimeout(timer);
  }, [user, loading]);

  return (
    <View style={styles.root}>
      <View style={styles.logoContainer}>
        <Animated.View
          style={[styles.halfWrap, styles.topHalf, { opacity, transform: [{ translateY: topY }] }]}
        >
          <Image source={LOGO} style={styles.logoImg} resizeMode="contain" tintColor="#0EB5CA" />
        </Animated.View>

        <Animated.View
          style={[styles.halfWrap, styles.botHalf, { opacity, transform: [{ translateY: botY }] }]}
        >
          <Image
            source={LOGO}
            style={[styles.logoImg, { marginTop: -(LOGO_H / 2) }]}
            resizeMode="contain"
            tintColor="#0EB5CA"
          />
        </Animated.View>

        <Animated.View
          pointerEvents="none"
          style={[
            styles.shimmer,
            { opacity: shimmerOp, transform: [{ translateX: shimmerX }] },
          ]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#0A1628',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoContainer: {
    width: LOGO_W,
    height: LOGO_H,
    overflow: 'hidden',
    position: 'relative',
  },
  halfWrap: {
    position: 'absolute',
    left: 0,
    width: LOGO_W,
    height: LOGO_H / 2,
    overflow: 'hidden',
  },
  topHalf: { top: 0 },
  botHalf: { top: LOGO_H / 2 },
  logoImg: { width: LOGO_W, height: LOGO_H },
  shimmer: {
    position: 'absolute',
    top: -10,
    left: -60,
    width: 50,
    height: LOGO_H + 20,
    backgroundColor: 'rgba(255,255,255,0.5)',
    transform: [{ skewX: '-18deg' }],
  },
});
