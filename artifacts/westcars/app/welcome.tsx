import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { useRef } from 'react';
import {
  Animated,
  Dimensions,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

const { width, height } = Dimensions.get('window');
const PORSCHE = require('@/assets/images/welcome-car-porsche.png');

export default function WelcomeScreen() {
  const router = useRouter();
  const translateX = useRef(new Animated.Value(0)).current;

  const goToLogin = async () => {
    await AsyncStorage.setItem('hasSeenWelcome', 'true');
    Animated.timing(translateX, {
      toValue: -width,
      duration: 340,
      useNativeDriver: true,
    }).start(() => router.replace('/auth/login'));
  };

  return (
    <Animated.View style={[styles.container, { transform: [{ translateX }] }]}>
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

        <TouchableOpacity style={styles.btn} onPress={goToLogin} activeOpacity={0.82}>
          <Text style={styles.btnText}>Get Started</Text>
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
    width,
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
  btn: {
    backgroundColor: '#2ec4c4',
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
    marginTop: 8,
    shadowColor: '#2ec4c4',
    shadowOpacity: 0.45,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  btnText: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0d3d4a',
    letterSpacing: 0.4,
  },
});
