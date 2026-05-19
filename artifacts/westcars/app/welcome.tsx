import React, { useRef } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Animated,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width, height } = Dimensions.get('window');

const PORSCHE = require('@/assets/images/welcome-car-porsche.png');

const SLIDES = [
  {
    id: 0,
    title: "Ghana's Finest.\nEndless Choices!",
    subtitle:
      'Experience the perfect blend of quality, trust, and affordability with thousands of verified car listings.',
  },
  {
    id: 1,
    title: 'Buy & Sell Cars\nWith Confidence',
    subtitle: 'Verified listings, secure messaging, and fair prices — all in one place.',
    stats: [
      { value: '12K+', label: 'Listings' },
      { value: '98%', label: 'Verified' },
      { value: '4.9★', label: 'Rated' },
    ],
  },
];

export default function WelcomeScreen() {
  const router = useRouter();
  const scrollX = useRef(new Animated.Value(0)).current;
  const scrollRef = useRef<ScrollView>(null);
  const currentIndex = useRef(0);

  const handleDone = async () => {
    await AsyncStorage.setItem('hasSeenWelcome', 'true');
    router.replace('/auth/login');
  };

  const goNext = () => {
    if (currentIndex.current < SLIDES.length - 1) {
      currentIndex.current += 1;
      (scrollRef.current as any)?.scrollTo({ x: width * currentIndex.current, animated: true });
    } else {
      handleDone();
    }
  };

  return (
    <View style={styles.container}>
      <Animated.ScrollView
        ref={scrollRef as any}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: false }
        )}
        onMomentumScrollEnd={(e) => {
          currentIndex.current = Math.round(e.nativeEvent.contentOffset.x / width);
        }}
      >
        {SLIDES.map((slide, i) => (
          <View key={slide.id} style={[styles.slide, { width }]}>
            {/* Full-width Porsche PNG — same hero size on both slides */}
            <View style={styles.imageContainer}>
              <Image
                source={PORSCHE}
                style={styles.heroImage}
                resizeMode="contain"
              />
            </View>

            {/* Text + optional stats below the image */}
            <View style={styles.textBlock}>
              <Text style={styles.title}>{slide.title}</Text>
              <Text style={styles.subtitle}>{slide.subtitle}</Text>

              {i === 1 && slide.stats && (
                <View style={styles.statsRow}>
                  {slide.stats.map((s, idx) => (
                    <React.Fragment key={s.label}>
                      {idx > 0 && <View style={styles.statDivider} />}
                      <View style={styles.stat}>
                        <Text style={styles.statValue}>{s.value}</Text>
                        <Text style={styles.statLabel}>{s.label}</Text>
                      </View>
                    </React.Fragment>
                  ))}
                </View>
              )}
            </View>
          </View>
        ))}
      </Animated.ScrollView>

      {/* Dot indicators */}
      <View style={styles.dots}>
        {SLIDES.map((_, i) => {
          const opacity = scrollX.interpolate({
            inputRange: [(i - 1) * width, i * width, (i + 1) * width],
            outputRange: [0.35, 1, 0.35],
            extrapolate: 'clamp',
          });
          const scale = scrollX.interpolate({
            inputRange: [(i - 1) * width, i * width, (i + 1) * width],
            outputRange: [0.8, 1.3, 0.8],
            extrapolate: 'clamp',
          });
          return (
            <Animated.View key={i} style={[styles.dot, { opacity, transform: [{ scale }] }]} />
          );
        })}
      </View>

      {/* Slide-to-get-started button */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.slideButton} onPress={goNext}>
          <View style={styles.slideCircle}>
            <Text style={styles.arrow}>→</Text>
          </View>
          <Text style={styles.slideText}>
            {currentIndex.current < SLIDES.length - 1 ? 'Slide to Get Started' : 'Get Started'}
          </Text>
          <Text style={styles.slideChevrons}>{'>>'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0d3d4a',
  },
  slide: {
    flex: 1,
    alignItems: 'center',
  },
  imageContainer: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  heroImage: {
    width: width * 1.15,
    height: height * 0.56,
    marginLeft: -(width * 0.075),
  },
  textBlock: {
    flex: 1,
    paddingHorizontal: 28,
    paddingTop: 12,
    paddingBottom: 8,
    width: '100%',
    justifyContent: 'flex-start',
  },
  title: {
    fontSize: 30,
    fontWeight: '800',
    color: '#ffffff',
    marginBottom: 10,
    lineHeight: 38,
  },
  subtitle: {
    fontSize: 14,
    color: '#aacdd3',
    lineHeight: 21,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginTop: 18,
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
    height: '100%',
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 16,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#2ec4c4',
  },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  slideButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 50,
    paddingRight: 20,
    height: 60,
    overflow: 'hidden',
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
  slideText: {
    flex: 1,
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
    letterSpacing: 0.3,
  },
  slideChevrons: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.5)',
    letterSpacing: 2,
  },
});
