import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Dimensions,
  TouchableOpacity,
  ImageBackground,
  StatusBar,
} from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width, height } = Dimensions.get('window');

const slides = [
  {
    id: '1',
    title: 'Find Your Perfect Car',
    subtitle: 'Browse thousands of verified listings from trusted sellers across Ghana.',
    bg: 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=800',
    accent: '#E8B84B',
  },
  {
    id: '2',
    title: 'Buy & Sell With Confidence',
    subtitle: 'Every listing is reviewed. Secure messaging, fair prices, real people.',
    bg: 'https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=800',
    accent: '#E8B84B',
  },
  {
    id: '3',
    title: 'Your Next Car Is Here',
    subtitle: 'New and used cars. Any budget. Any make. All in one place.',
    bg: 'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=800',
    accent: '#E8B84B',
  },
];

export default function Onboarding() {
  const router = useRouter();
  const flatListRef = useRef<FlatList>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleNext = async () => {
    if (currentIndex < slides.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1 });
      setCurrentIndex(currentIndex + 1);
    } else {
      await AsyncStorage.setItem('onboarding_complete', 'true');
      router.replace('/(tabs)');
    }
  };

  const handleSkip = async () => {
    await AsyncStorage.setItem('onboarding_complete', 'true');
    router.replace('/(tabs)');
  };

  const renderSlide = ({ item }: { item: typeof slides[0] }) => (
    <ImageBackground
      source={{ uri: item.bg }}
      style={styles.slide}
      resizeMode="cover"
    >
      <View style={styles.overlay} />
      <View style={styles.content}>
        <View style={styles.textContainer}>
          <View style={[styles.accentLine, { backgroundColor: item.accent }]} />
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.subtitle}>{item.subtitle}</Text>
        </View>
      </View>
    </ImageBackground>
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
        onMomentumScrollEnd={(e) => {
          const index = Math.round(e.nativeEvent.contentOffset.x / width);
          setCurrentIndex(index);
        }}
      />

      <View style={styles.footer}>
        <View style={styles.dots}>
          {slides.map((_, i) => (
            <View
              key={i}
              style={[
                styles.dot,
                i === currentIndex ? styles.dotActive : styles.dotInactive,
              ]}
            />
          ))}
        </View>

        <TouchableOpacity style={styles.button} onPress={handleNext}>
          <Text style={styles.buttonText}>
            {currentIndex === slides.length - 1 ? 'Explore Cars' : 'Next'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  slide: { width, height },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.52)',
  },
  content: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingBottom: 160,
    paddingHorizontal: 32,
  },
  textContainer: { gap: 12 },
  accentLine: {
    width: 48,
    height: 4,
    borderRadius: 2,
    marginBottom: 8,
  },
  title: {
    fontSize: 36,
    fontWeight: '800',
    color: '#FFFFFF',
    lineHeight: 42,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.78)',
    lineHeight: 24,
    fontWeight: '400',
  },
  skipButton: {
    position: 'absolute',
    top: 56,
    right: 28,
    zIndex: 10,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  skipText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  footer: {
    position: 'absolute',
    bottom: 48,
    left: 0,
    right: 0,
    paddingHorizontal: 32,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dots: { flexDirection: 'row', gap: 8 },
  dot: { height: 8, borderRadius: 4 },
  dotActive: { width: 28, backgroundColor: '#E8B84B' },
  dotInactive: { width: 8, backgroundColor: 'rgba(255,255,255,0.4)' },
  button: {
    backgroundColor: '#E8B84B',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 14,
  },
  buttonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});
