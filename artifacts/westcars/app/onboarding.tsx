import React, { useRef, useState } from 'react';
import {
  View, Text, StyleSheet, FlatList,
  Dimensions, TouchableOpacity, StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width, height } = Dimensions.get('window');
const TEAL = '#0EB5CA';
const DARK = '#004D5A';

const slides = [
  {
    id: '1',
    emoji: '🔍',
    title: 'Find Your Perfect Car',
    subtitle: 'Browse thousands of verified listings from trusted sellers across Ghana.',
  },
  {
    id: '2',
    emoji: '🤝',
    title: 'Buy & Sell With Confidence',
    subtitle: 'Every listing is reviewed. Secure messaging, fair prices, real people.',
  },
  {
    id: '3',
    emoji: '🚗',
    title: 'Your Next Car Is Here',
    subtitle: 'New and used cars. Any budget. Any make. All in one place.',
  },
];

export default function OnboardingScreen() {
  const router = useRouter();
  const flatListRef = useRef<FlatList>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleNext = async () => {
    if (currentIndex < slides.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1, animated: true });
      setCurrentIndex(currentIndex + 1);
    } else {
      await AsyncStorage.setItem('onboarding_complete', 'true');
      router.replace('/auth/welcome');
    }
  };

  const handleSkip = async () => {
    await AsyncStorage.setItem('onboarding_complete', 'true');
    router.replace('/auth/welcome');
  };

  const renderSlide = ({ item }: { item: typeof slides[0] }) => (
    <LinearGradient colors={[TEAL, '#007A8C', DARK]} style={styles.slide}>
      <View style={styles.slideContent}>
        <Text style={styles.emoji}>{item.emoji}</Text>
        <View style={styles.accentLine} />
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.subtitle}>{item.subtitle}</Text>
      </View>
    </LinearGradient>
  );

  return (
    <View style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />

      <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
        <Text style={styles.skipText}>Skip</Text>
      </TouchableOpacity>

      <FlatList
        ref={flatListRef}
        data={slides}
        renderItem={renderSlide}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        scrollEnabled={false}
        showsHorizontalScrollIndicator={false}
      />

      <View style={styles.footer}>
        <View style={styles.dots}>
          {slides.map((_, i) => (
            <View key={i} style={[styles.dot, i === currentIndex ? styles.dotActive : styles.dotInactive]} />
          ))}
        </View>
        <TouchableOpacity style={styles.button} onPress={handleNext}>
          <Text style={styles.buttonText}>
            {currentIndex === slides.length - 1 ? 'Get Started' : 'Next'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: DARK },
  slide: { width, height },
  slideContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingBottom: 120,
  },
  emoji: { fontSize: 80, marginBottom: 32 },
  accentLine: { width: 48, height: 4, backgroundColor: '#FFFFFF', borderRadius: 2, marginBottom: 24 },
  title: { fontSize: 32, fontWeight: '800', color: '#FFFFFF', textAlign: 'center', lineHeight: 38, marginBottom: 16 },
  subtitle: { fontSize: 16, color: 'rgba(255,255,255,0.78)', textAlign: 'center', lineHeight: 24 },
  skipButton: {
    position: 'absolute', top: 56, right: 28, zIndex: 10,
    paddingHorizontal: 16, paddingVertical: 8,
    borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.15)',
  },
  skipText: { color: '#FFFFFF', fontSize: 14, fontWeight: '600' },
  footer: {
    position: 'absolute', bottom: 48, left: 0, right: 0,
    paddingHorizontal: 32, flexDirection: 'row',
    alignItems: 'center', justifyContent: 'space-between',
  },
  dots: { flexDirection: 'row', gap: 8 },
  dot: { height: 8, borderRadius: 4 },
  dotActive: { width: 28, backgroundColor: '#FFFFFF' },
  dotInactive: { width: 8, backgroundColor: 'rgba(255,255,255,0.35)' },
  button: {
    backgroundColor: '#FFFFFF', paddingHorizontal: 32,
    paddingVertical: 16, borderRadius: 14,
  },
  buttonText: { color: DARK, fontSize: 16, fontWeight: '700' },
});
