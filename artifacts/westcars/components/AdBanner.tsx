import React, { useEffect, useRef, useState } from "react";
import {
  Dimensions,
  FlatList,
  ImageBackground,
  Pressable,
  StyleSheet,
  Text,
  View,
  ViewToken,
} from "react-native";
import { Advertisement } from "@/types";

const { width } = Dimensions.get("window");
const BANNER_WIDTH = width - 32;

interface AdBannerProps {
  ads: Advertisement[];
}

export function AdBanner({ ads }: AdBannerProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    if (ads.length <= 1) return;
    const interval = setInterval(() => {
      setActiveIndex((prev) => {
        const next = (prev + 1) % ads.length;
        flatListRef.current?.scrollToIndex({ index: next, animated: true });
        return next;
      });
    }, 3500);
    return () => clearInterval(interval);
  }, [ads.length]);

  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems.length > 0 && viewableItems[0].index !== null) {
        setActiveIndex(viewableItems[0].index);
      }
    }
  ).current;

  const viewabilityConfig = useRef({ viewAreaCoveragePercentThreshold: 50 }).current;

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={ads}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        renderItem={({ item }) => (
          <Pressable
            style={[styles.banner, { width: BANNER_WIDTH }]}
          >
            <ImageBackground
              source={{ uri: item.image }}
              style={styles.bannerBg}
              imageStyle={{ borderRadius: 16 }}
            >
              <View
                style={[
                  styles.overlay,
                  { backgroundColor: `${item.color}CC` },
                ]}
              />
              <View style={styles.bannerContent}>
                <Text style={styles.bannerTitle}>{item.title}</Text>
                <Text style={styles.bannerSubtitle}>{item.subtitle}</Text>
                <View style={styles.ctaButton}>
                  <Text style={styles.ctaText}>{item.ctaText}</Text>
                </View>
              </View>
            </ImageBackground>
          </Pressable>
        )}
        snapToInterval={BANNER_WIDTH + 12}
        decelerationRate="fast"
        contentContainerStyle={{ gap: 12 }}
      />
      {/* Dots */}
      <View style={styles.dots}>
        {ads.map((_, i) => (
          <View
            key={i}
            style={[styles.dot, i === activeIndex && styles.dotActive]}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginBottom: 4,
  },
  banner: {
    height: 140,
    borderRadius: 16,
    overflow: "hidden",
  },
  bannerBg: {
    flex: 1,
    borderRadius: 16,
    overflow: "hidden",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 16,
  },
  bannerContent: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
    gap: 4,
  },
  bannerTitle: {
    color: "#fff",
    fontSize: 18,
    fontFamily: "Manrope_700Bold",
  },
  bannerSubtitle: {
    color: "rgba(255,255,255,0.85)",
    fontSize: 12,
    fontFamily: "Manrope_400Regular",
    marginBottom: 8,
  },
  ctaButton: {
    backgroundColor: "rgba(255,255,255,0.25)",
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: "flex-start",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.5)",
  },
  ctaText: {
    color: "#fff",
    fontSize: 12,
    fontFamily: "Manrope_600SemiBold",
  },
  dots: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 5,
    marginTop: 8,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#DDD",
  },
  dotActive: {
    backgroundColor: "#0066CC",
    width: 16,
  },
});
