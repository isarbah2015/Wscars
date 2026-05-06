import { Feather, Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useRef, useState } from "react";
import {
  Animated,
  Easing,
  Image,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { CarCard } from "@/components/CarCard";
import { useApp } from "@/context/AppContext";
import { useTheme } from "@/context/ThemeContext";
import { CAR_BRANDS, formatPrice } from "@/utils/ghanaData";
import { BRAND_LOGOS } from "@/utils/brandLogos";

const WC_LOGO      = require("@/assets/images/wc-logo.png");
const WC_LOGO_FULL = require("@/assets/images/wc-logo-full.png");
const CAR_NEW     = require("@/assets/images/car-new.png");
const CAR_USED    = require("@/assets/images/car-used.png");
const CAR_MOTO    = require("@/assets/images/car-moto.png");
const CAT_SUV     = require("@/assets/images/cat-suv.png");
const CAT_SEDAN   = require("@/assets/images/cat-sedan.png");
const CAT_PICKUP  = require("@/assets/images/cat-pickup.png");
const CAT_VAN     = require("@/assets/images/cat-van.png");
const CAT_COUPE   = require("@/assets/images/cat-coupe.png");
const CAT_HATCH   = require("@/assets/images/cat-hatchback.png");
const CAT_MOTO        = require("@/assets/images/cat-motorcycle.png");
const CAT_SCOOTER     = require("@/assets/images/cat-scooter.png");
const CAT_ATV         = require("@/assets/images/cat-atv.png");
const CAT_DIRTBIKE    = require("@/assets/images/cat-dirtbike.png");
const CAT_CARGO_TRUCK = require("@/assets/images/cat-cargo-truck.png");
const CAT_TIPPER      = require("@/assets/images/cat-tipper-truck.png");
const CAT_TANKER      = require("@/assets/images/cat-tanker-truck.png");
const CAT_FLATBED     = require("@/assets/images/cat-flatbed-truck.png");
const CAT_BOX_TRUCK   = require("@/assets/images/cat-box-truck.png");
const CAT_BUS         = require("@/assets/images/cat-bus.png");
const CAT_MINIBUS     = require("@/assets/images/cat-minibus.png");
const CAT_COACH       = require("@/assets/images/cat-coach-bus.png");
const CAT_EXCAVATOR   = require("@/assets/images/cat-excavator.png");
const CAT_BULLDOZER   = require("@/assets/images/cat-bulldozer.png");
const CAT_CRANE       = require("@/assets/images/cat-crane.png");
const CAT_FORKLIFT    = require("@/assets/images/cat-forklift.png");
const CAT_FRONTLOADER = require("@/assets/images/cat-front-loader.png");
const CAT_GRADER      = require("@/assets/images/cat-grader.png");
const CAT_COMPACTOR   = require("@/assets/images/cat-compactor.png");
const CAT_MIXER       = require("@/assets/images/cat-concrete-mixer.png");
const CAT_TRACTOR     = require("@/assets/images/cat-tractor.png");
const CAT_COMBINE     = require("@/assets/images/cat-combine.png");
const CAT_AMBULANCE   = require("@/assets/images/cat-ambulance.png");
const CAT_FIRETRUCK   = require("@/assets/images/cat-firetruck.png");
const BANNER_CAR      = require("@/assets/images/banner-car.png");

type Condition = "new" | "used" | "moto";

const CONDITION_TABS: { id: Condition; label: string; img: any }[] = [
  { id: "new",  label: "New",  img: CAR_NEW  },
  { id: "used", label: "Used", img: CAR_USED },
  { id: "moto", label: "Moto", img: CAR_MOTO },
];

const ALL_VEHICLE_TYPES: { label: string; img: any; imgScale?: number }[] = [
  { label: "SUV / 4×4",        img: CAT_SUV,         imgScale: 0.78 },
  { label: "Sedan",             img: CAT_SEDAN      },
  { label: "Hatchback",         img: CAT_HATCH      },
  { label: "Pickup Truck",      img: CAT_PICKUP     },
  { label: "Van",               img: CAT_VAN        },
  { label: "Coupe",             img: CAT_COUPE      },
  { label: "Station Wagon",     img: CAT_SEDAN      },
  { label: "Cargo Truck",       img: CAT_CARGO_TRUCK },
  { label: "Tipper Truck",      img: CAT_TIPPER     },
  { label: "Tanker Truck",      img: CAT_TANKER     },
  { label: "Flatbed Truck",     img: CAT_FLATBED    },
  { label: "Box Truck",         img: CAT_BOX_TRUCK  },
  { label: "Bus",               img: CAT_BUS        },
  { label: "Minibus",           img: CAT_MINIBUS    },
  { label: "Coach Bus",         img: CAT_COACH      },
  { label: "Excavator",         img: CAT_EXCAVATOR  },
  { label: "Bulldozer",         img: CAT_BULLDOZER  },
  { label: "Crane",             img: CAT_CRANE      },
  { label: "Forklift",          img: CAT_FORKLIFT   },
  { label: "Front Loader",      img: CAT_FRONTLOADER },
  { label: "Grader",            img: CAT_GRADER     },
  { label: "Compactor",         img: CAT_COMPACTOR  },
  { label: "Concrete Mixer",    img: CAT_MIXER      },
  { label: "Tractor",           img: CAT_TRACTOR    },
  { label: "Combine Harvester", img: CAT_COMBINE    },
  { label: "Ambulance",         img: CAT_AMBULANCE  },
  { label: "Fire Truck",        img: CAT_FIRETRUCK  },
];

const MOTO_TYPES: { label: string; img: any; imgScale?: number }[] = [
  { label: "Motorcycle",  img: CAT_MOTO     },
  { label: "Scooter",     img: CAT_SCOOTER  },
  { label: "ATV / Quad",  img: CAT_ATV      },
  { label: "Dirt Bike",   img: CAT_DIRTBIKE },
];

export default function HomeScreen() {
  const { cars, currentUser, conversations } = useApp();
  const { colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 4 : (insets.top || 0);
  const [condition, setCondition] = useState<Condition>("used");
  const [refreshing, setRefreshing] = useState(false);

  const totalUnread = conversations?.reduce((s: number, c: any) => s + (c.unreadCount || 0), 0) ?? 0;

  const onRefresh = () => {
    setRefreshing(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setTimeout(() => setRefreshing(false), 1000);
  };

  // catMaxH: controls the height collapse of the categories section (JS thread)
  // catOpacity: smooth fade of categories content (native thread)
  // scrollPad: animated spacer in the ScrollView that tracks header height (JS thread)
  const CAT_DEFAULT_H  = 155;    // ~80px tabs + ~75px subcats
  const STICKY_DEFAULT = 152;    // ~topPad+8 + ~55px profile + ~10px gap + ~72px search
  // Extra gap between the glass header and the first content card
  const EXTRA_PAD = 6;
  const catMaxH    = useRef(new Animated.Value(CAT_DEFAULT_H)).current;
  const catOpacity = useRef(new Animated.Value(1)).current;
  const lastScrollY = useRef(0);
  const catOpen     = useRef(true);
  const [stickyH,  setStickyH]  = useState(0);
  const [catMeasH, setCatMeasH] = useState(0);

  // Stop animated values immediately so direction can reverse mid-animation
  const stopAll = () => {
    catMaxH.stopAnimation();
    catOpacity.stopAnimation();
  };

  const showCat = () => {
    if (catOpen.current) return;   // already open
    catOpen.current = true;
    stopAll();
    const catH = catMeasH || CAT_DEFAULT_H;
    Animated.parallel([
      Animated.timing(catMaxH, {
        toValue: catH,
        duration: 300,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false,
      }),
      Animated.timing(catOpacity, {
        toValue: 1,
        duration: 240,
        easing: Easing.out(Easing.quad),
        useNativeDriver: false,
      }),
    ]).start();
  };

  const hideCat = () => {
    if (!catOpen.current) return;  // already closed
    catOpen.current = false;
    stopAll();
    Animated.parallel([
      Animated.timing(catMaxH, {
        toValue: 0,
        duration: 260,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: false,
      }),
      Animated.timing(catOpacity, {
        toValue: 0,
        duration: 150,
        easing: Easing.in(Easing.quad),
        useNativeDriver: false,
      }),
    ]).start();
  };

  const handleScroll = (e: any) => {
    const y  = e.nativeEvent.contentOffset.y;
    const dy = y - lastScrollY.current;
    lastScrollY.current = y;

    if (y < 20) {
      // Near the very top — always restore categories
      if (!catOpen.current) showCat();
    } else if (dy > 8 && catOpen.current) {
      hideCat();
    } else if (dy < -8 && !catOpen.current) {
      showCat();
    }
  };

  // "Just for you" always shows all non-moto cars regardless of which condition tab is selected.
  // The condition tabs only control which subcategory tiles are displayed below.
  const displayCars = cars.filter(
    (c) => c.category !== "motorcycle" && c.category !== "moto"
  );
  const totalCount   = cars.length;

  // Featured = top cars by views + sponsored cars, mixed randomly (stable per render)
  const featuredCars = React.useMemo(() => {
    const sponsoredOnes = cars.filter((c) => c.isSponsored);
    const topByViews = [...cars]
      .filter((c) => !c.isSponsored)
      .sort((a, b) => (b.views || 0) - (a.views || 0))
      .slice(0, 4);
    const sponsoredPick = sponsoredOnes.slice(0, 3);
    const merged = [...topByViews, ...sponsoredPick];
    // Stable Fisher-Yates shuffle by id hash so order doesn't jitter on re-render
    const seeded = merged.map((c) => ({
      c,
      k: [...c.id].reduce((s, ch) => (s * 31 + ch.charCodeAt(0)) >>> 0, 7),
    }));
    seeded.sort((a, b) => a.k - b.k);
    return seeded.map((x) => x.c).slice(0, 6);
  }, [cars]);

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>

      {/* ── Sticky search bar — covers from top of screen so nothing peeks above ── */}
      <View
        style={[
          styles.stickySearchBar,
          {
            top: 0,
            paddingTop: topPad + 8,
            backgroundColor: isDark
              ? "rgba(17,24,39,0.97)"
              : "rgba(255,255,255,0.97)",
            borderBottomColor: isDark
              ? "rgba(255,255,255,0.07)"
              : "rgba(14,181,202,0.12)",
            ...(Platform.OS === "web"
              ? ({ backdropFilter: "blur(18px)", WebkitBackdropFilter: "blur(18px)" } as any)
              : {}),
          },
        ]}
        onLayout={(e) => {
          const h = e.nativeEvent.layout.height;
          if (h > 0 && stickyH === 0) setStickyH(h);
        }}
      >
        <Pressable
          style={[styles.searchBox, {
            backgroundColor: isDark ? "#1E293B" : "#F1F5F9",
            borderColor: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)",
          }]}
          onPress={() => router.push("/(tabs)/search")}
        >
          <Ionicons name="car-sport-outline" size={26} color={isDark ? "#0EB5CA" : "#0098AA"} />
          <View style={styles.searchBoxText}>
            <Text style={[styles.searchBoxLabel, { color: isDark ? "#CBD5E1" : "#334155" }]}>Brand, model, location…</Text>
            <Text style={[styles.searchBoxCount, { color: isDark ? "#64748B" : "#94A3B8" }]}>
              {totalCount.toLocaleString()} listings available
            </Text>
          </View>
          <View style={[styles.filterBtn, { backgroundColor: "#0EB5CA" }]}>
            <Feather name="sliders" size={17} color="#FFFFFF" />
          </View>
        </Pressable>
      </View>

      {/* ── Scrollable body ── */}
      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        contentContainerStyle={{ paddingBottom: 100 + (insets.bottom || 0) }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#0EB5CA"
            colors={["#0EB5CA"]}
          />
        }
      >
        {/* Spacer — clears the sticky search bar */}
        <View style={{ height: (stickyH || 70) + 10 }} />


        {/* ── Collapsible: condition tabs + sub-categories ── */}
        <Animated.View style={{ maxHeight: catMaxH, overflow: "hidden" }}>
        <Animated.View
          style={{ opacity: catOpacity }}
          onLayout={(e) => {
            const h = e.nativeEvent.layout.height;
            if (h > 0 && catMeasH === 0) {
              setCatMeasH(h);
              catMaxH.setValue(h);
            }
          }}
        >
          {/* Row 3: 3 condition tabs */}
          <View style={styles.mainTabsRow}>
            {CONDITION_TABS.map((tab) => {
              const active = condition === tab.id;
              return (
                <Pressable
                  key={tab.id}
                  style={[
                    styles.mainTab,
                    active
                      ? { backgroundColor: "#0EB5CA", borderColor: "#0DCAE6" }
                      : {
                          backgroundColor: isDark ? "rgba(255,255,255,0.06)" : "#F1F5F9",
                          borderColor: isDark ? "rgba(255,255,255,0.1)" : "#E2E8F0",
                        },
                  ]}
                  onPress={() => setCondition(tab.id)}
                >
                  <Text style={[
                    styles.mainTabLabel,
                    active
                      ? { color: "#FFFFFF", fontFamily: "Inter_600SemiBold" }
                      : { color: isDark ? "#94A3B8" : "#64748B", fontFamily: "Inter_600SemiBold" },
                  ]}>
                    {tab.label}
                  </Text>
                  <View style={styles.mainTabImgWrap}>
                    <Image source={tab.img} style={styles.mainTabImg} resizeMode="contain" />
                  </View>
                </Pressable>
              );
            })}
          </View>

          {/* Row 4: Sub-categories horizontal strip */}
          <View style={[styles.subCatsSection, { backgroundColor: isDark ? "#111827" : "#FFFFFF" }]}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.subCatsRow}
            >
              {(condition === "moto" ? MOTO_TYPES : ALL_VEHICLE_TYPES).map((cat) => (
                <Pressable
                  key={cat.label}
                  style={[
                    styles.subTab,
                    {
                      backgroundColor: isDark ? "#1E293B" : "#F7F8FA",
                      borderColor: isDark ? "#2D3A4F" : "#E4E8EF",
                    },
                  ]}
                  onPress={() =>
                    router.push({
                      pathname: "/(tabs)/search",
                      params: { category: cat.label },
                    })
                  }
                >
                  <Text style={[styles.subTabLabel, { color: isDark ? "#CBD5E1" : "#1E293B" }]} numberOfLines={1}>
                    {cat.label}
                  </Text>
                  <View style={styles.subTabImgWrap}>
                    <Image
                      source={cat.img}
                      style={[
                        styles.subTabImg,
                        cat.imgScale != null ? {
                          width: 62 * cat.imgScale,
                          height: 40 * cat.imgScale,
                        } : null,
                      ]}
                      resizeMode="contain"
                    />
                  </View>
                </Pressable>

              ))}
            </ScrollView>
          </View>
        </Animated.View>{/* end inner opacity Animated.View */}
        </Animated.View>{/* end outer maxHeight Animated.View */}
        {/* ── Browse by Brand ── */}
        <View style={[styles.brandSection, { backgroundColor: isDark ? "#111827" : "#FFFFFF" }]}>
          <View style={styles.brandSectionHeader}>
            <Image source={WC_LOGO} style={styles.brandStripBadge} resizeMode="contain" tintColor="#0EB5CA" />
            <Text style={[styles.brandSectionTitle, { color: isDark ? "#CBD5E1" : "#334155" }]}>Car Brands</Text>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.brandRow}>
            {CAR_BRANDS.map((brand) => {
              const logoUrl = BRAND_LOGOS[brand];
              return (
                <Pressable
                  key={brand}
                  style={[styles.brandPill, { backgroundColor: isDark ? "#1E293B" : "#F7F8FA", borderColor: isDark ? "#2D3A4F" : "#E4E8EF" }]}
                  onPress={() => router.push({ pathname: "/(tabs)/search", params: { brand } })}
                >
                  {logoUrl ? (
                    <View style={styles.brandPillLogoWrap}>
                      <Image source={{ uri: logoUrl }} style={styles.brandPillLogo} resizeMode="contain" />
                    </View>
                  ) : (
                    <View style={[styles.brandPillLogoPlaceholder, { backgroundColor: isDark ? "#2D3A4F" : "#E2E8F0" }]}>
                      <Text style={[styles.brandPillLogoInitial, { color: isDark ? "#94A3B8" : "#475569" }]}>
                        {brand.charAt(0)}
                      </Text>
                    </View>
                  )}
                  <Text style={[styles.brandPillLabel, { color: isDark ? "#CBD5E1" : "#334155" }]} numberOfLines={1}>
                    {brand}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>

        {/* ── Sponsored Banner → leads to Advertise ── */}
        <Pressable onPress={() => router.push("/advertise")} style={styles.promoBannerWrap}>
          <LinearGradient
            colors={["#006F80", "#0EB5CA", "#38D1E5"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.promoBanner}
          >
            <View style={styles.promoBannerLeft}>
              <View style={styles.promoBadge}>
                <Text style={styles.promoBadgeText}>SPONSORED</Text>
              </View>
              <Text style={styles.promoBannerTitle}>Toyota Certified Pre-Owned</Text>
              <Text style={styles.promoBannerSub}>0% Interest · 12-month Warranty · Nationwide</Text>
              <View style={styles.promoCta}>
                <View style={styles.promoCtaBtn}>
                  <Text style={styles.promoCtaText}>View Offer</Text>
                  <Feather name="arrow-right" size={11} color="#FFFFFF" />
                </View>
              </View>
            </View>
            <Image source={BANNER_CAR} style={styles.bannerCarImg} resizeMode="contain" />
          </LinearGradient>
        </Pressable>

        {/* ── Featured Listings (1×1 full-width grid) ── */}
        {featuredCars.length > 0 && (
          <View style={[styles.section, { backgroundColor: colors.card }]}>
            <View style={styles.sectionRow}>
              <View style={styles.sectionTitleRow}>
                <View style={[styles.sectionAccentBar, { backgroundColor: "#22C55E" }]} />
                <Text style={[styles.sectionTitle, { color: colors.text }]}>Featured Listings</Text>
              </View>
              <Pressable onPress={() => router.push("/(tabs)/search")}>
                <Text style={[styles.seeAll, { color: colors.accent }]}>See all</Text>
              </Pressable>
            </View>
            <View style={styles.featuredList}>
              {featuredCars.map((car) => (
                <Pressable
                  key={`feat_${car.id}`}
                  style={[styles.featCard, { backgroundColor: colors.card, borderColor: isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.07)" }]}
                  onPress={() => router.push({ pathname: "/car/[id]", params: { id: car.id } })}
                >
                  {/* Image with price overlay */}
                  <View style={styles.featImgWrap}>
                    <Image source={{ uri: car.images[0] }} style={styles.featImg} resizeMode="cover" />
                    <LinearGradient
                      colors={["transparent", "rgba(0,0,0,0.70)"]}
                      style={styles.featScrim}
                      pointerEvents="none"
                    />
                    {car.isSponsored ? (
                      <LinearGradient
                        colors={["#FF8C00", "#FFB347"]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.featSponsoredBadge}
                      >
                        <Text style={styles.featSponsoredStar}>★</Text>
                        <Text style={styles.featSponsoredText}>SPONSORED</Text>
                      </LinearGradient>
                    ) : (car.condition === "New" || car.condition === "Foreign Used") && (
                      <View style={[styles.featCondBadge, { backgroundColor: car.condition === "New" ? "#FF6B00" : "#1565C0" }]}>
                        <Text style={styles.featCondText}>{car.condition === "New" ? "New" : "Foreign"}</Text>
                      </View>
                    )}
                    <View style={styles.featPriceBadge}>
                      <Text style={styles.featPriceText}>{formatPrice(car.price)}</Text>
                    </View>
                    {car.views !== undefined && car.views > 0 && (
                      <View style={styles.featViewsTag}>
                        <Feather name="eye" size={10} color="rgba(255,255,255,0.88)" />
                        <Text style={styles.featViewsText}>
                          {car.views >= 1000 ? `${(car.views / 1000).toFixed(1)}k` : car.views}
                        </Text>
                      </View>
                    )}
                  </View>
                  {/* Info block */}
                  <View style={styles.featInfo}>
                    <Text style={[styles.featName, { color: colors.text }]} numberOfLines={1}>
                      {car.brand} {car.model}
                    </Text>
                    {/* Year · Mileage · Location — all on one row */}
                    <View style={styles.featMetaRow}>
                      <View style={[styles.featChip, { backgroundColor: isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.06)" }]}>
                        <Text style={[styles.featChipText, { color: colors.textSecondary }]}>{car.year}</Text>
                      </View>
                      {car.mileage > 0 && (
                        <View style={[styles.featChip, { backgroundColor: isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.06)" }]}>
                          <Feather name="activity" size={10} color={colors.textTertiary} />
                          <Text style={[styles.featChipText, { color: colors.textSecondary }]}>
                            {(car.mileage / 1000).toFixed(0)}k km
                          </Text>
                        </View>
                      )}
                      {car.location && (
                        <View style={[styles.featChip, { backgroundColor: isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.06)" }]}>
                          <Feather name="map-pin" size={10} color={colors.textTertiary} />
                          <Text style={[styles.featChipText, { color: colors.textSecondary }]} numberOfLines={1}>
                            {car.location.split(",")[0]}
                          </Text>
                        </View>
                      )}
                    </View>
                    {/* Seller name */}
                    {car.seller?.name && (
                      <View style={styles.featSellerRow}>
                        <Feather name="user" size={11} color={colors.textTertiary} />
                        <Text style={[styles.featSellerName, { color: colors.textSecondary }]} numberOfLines={1}>
                          {car.seller.name}
                        </Text>
                        {car.seller?.isVerified && (
                          <Feather name="check-circle" size={11} color="#1565C0" />
                        )}
                      </View>
                    )}
                  </View>
                </Pressable>
              ))}
            </View>
          </View>
        )}

        <View style={[styles.sep, { backgroundColor: colors.background }]} />

        {/* ── "Just for you" section ── */}
        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <View style={styles.sectionRow}>
            <View style={styles.sectionTitleRow}>
              <View style={[styles.sectionAccentBar, { backgroundColor: colors.accent }]} />
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Just for you</Text>
            </View>
          </View>
          <View style={styles.gridBreakout}>
            {Array.from({ length: Math.ceil(displayCars.length / 2) }, (_, i) => {
              const left = displayCars[i * 2];
              const right = displayCars[i * 2 + 1];
              return (
                <View key={i} style={styles.cardRow}>
                  <CarCard car={left} style={styles.halfCard} />
                  {right
                    ? <CarCard car={right} style={styles.halfCard} />
                    : <View style={styles.halfCard} />
                  }
                </View>
              );
            })}
          </View>
        </View>

        <View style={[styles.sep, { backgroundColor: colors.background }]} />

        {/* ── Advertise Banner ── */}
        <Pressable onPress={() => router.push("/advertise")} style={styles.adBannerWrap}>
          <LinearGradient
            colors={["#005F6E", "#0098AA", "#0EB5CA"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.adBanner}
          >
            <View style={styles.adBannerLeft}>
              <View style={styles.adBannerIconBox}>
                <Feather name="trending-up" size={16} color="#fff" />
              </View>
              <View>
                <Text style={styles.adBannerTitle}>Advertise on Westcars</Text>
                <Text style={styles.adBannerSub}>Reach 50,000+ buyers · From GHS 50</Text>
              </View>
            </View>
            <View style={styles.adBannerArrow}>
              <Feather name="arrow-right" size={16} color="#fff" />
            </View>
          </LinearGradient>
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },

  header: {
    paddingHorizontal: 14,
    paddingBottom: 12,
    gap: 14,
    borderBottomWidth: 1,
    shadowColor: "#0EB5CA",
    shadowOpacity: 0.12,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
    zIndex: 10,
  },

  stickySearchBar: {
    position: "absolute",
    left: 0,
    right: 0,
    zIndex: 100,
    elevation: 10,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderBottomWidth: 1,
    shadowColor: "#0EB5CA",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.07,
    shadowRadius: 10,
  },

  profileScrollRow: {
    paddingHorizontal: 14,
    paddingTop: 10,
    paddingBottom: 10,
  },

  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  profileLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  avatarRoundedSq: {
    width: 34,
    height: 34,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { fontSize: 15, fontFamily: "Inter_700Bold" },
  profileTextBlock: { gap: 0 },
  userName: { fontSize: 14, fontFamily: "Inter_700Bold", lineHeight: 17 },
  userSub: { fontSize: 11, fontFamily: "Inter_500Medium", lineHeight: 14 },

  notifBellBtn: {
    width: 42,
    height: 42,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  notifBellBadge: {
    position: "absolute",
    top: 6,
    right: 6,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 3,
    borderWidth: 1.5,
    borderColor: "#fff",
  },
  notifBellBadgeText: { fontSize: 9, fontFamily: "Inter_700Bold", color: "#fff" },

  logoBadgeRight: { width: 36, height: 36, borderRadius: 8 },

  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderRadius: 14,
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderWidth: 1,
  },
  searchBoxText: { flex: 1 },
  searchBoxLabel: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
  },
  searchBoxCount: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    marginTop: 1,
  },
  filterBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  searchCarIcon: { width: 40, height: 40 },

  mainTabsRow: {
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: 12,
    paddingTop: 4,
    paddingBottom: 4,
  },
  mainTab: {
    flex: 1,
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 7,
    paddingBottom: 5,
    paddingHorizontal: 4,
    borderRadius: 16,
    borderWidth: 1,
    overflow: "hidden",
  },
  mainTabLabel: {
    fontSize: 12,
    fontFamily: "Inter_700Bold",
    textAlign: "center",
  },
  mainTabImgWrap: {
    width: 80,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 1,
  },
  mainTabImg: { width: 78, height: 44 },

  subCatsSection: {
    paddingVertical: 8,
  },
  subCatsRow: {
    flexDirection: "row",
    gap: 8,
    paddingLeft: 14,
    paddingRight: 14,
    alignItems: "center",
  },
  subTab: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: 140,
    borderRadius: 14,
    borderWidth: 1,
    paddingLeft: 10,
    paddingRight: 0,
    paddingVertical: 8,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
    overflow: "hidden",
  },
  subTabImgWrap: {
    width: 64,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  subTabImg: { width: 62, height: 40 },
  subTabLabel: {
    fontSize: 11,
    fontFamily: "Inter_700Bold",
    flex: 1,
    letterSpacing: 0.1,
  },

  scroll: { flex: 1 },

  brandStrip: {
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 2,
    paddingBottom: 0,
  },
  brandStripBadge: { width: 28, height: 28 },

  brandStripName: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 3.5,
    marginTop: -20,
    textAlign: "center",
    width: 180,
  },

  brandStripSub: {
    fontSize: 9.5,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 1.1,
    marginTop: 0,
    textAlign: "center",
  },

  promoBannerWrap: {
    marginHorizontal: 10,
    marginTop: 10,
    borderRadius: 20,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
  },
  promoBanner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 18,
    paddingVertical: 16,
    gap: 8,
  },
  promoBannerLeft: { flex: 1, gap: 5 },
  promoBadge: {
    backgroundColor: "#E8192C",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    alignSelf: "flex-start",
  },
  promoBadgeText: {
    fontSize: 9,
    fontFamily: "Inter_700Bold",
    color: "#fff",
    letterSpacing: 1.5,
  },
  promoBannerTitle: {
    fontSize: 16,
    fontFamily: "Inter_700Bold",
    color: "#fff",
  },
  promoBannerSub: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    color: "rgba(255,255,255,0.65)",
  },
  promoCta: { marginTop: 4 },
  promoCtaBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(255,255,255,0.22)",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 5,
    alignSelf: "flex-start",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.45)",
  },
  promoCtaText: {
    fontSize: 12,
    fontFamily: "Inter_700Bold",
    color: "#FFFFFF",
  },
  bannerCarImg: {
    width: 130,
    height: 76,
  },

  section: {
    paddingHorizontal: 10,
    paddingTop: 12,
    paddingBottom: 4,
    marginHorizontal: 6,
    marginTop: 6,
    borderRadius: 16,
    shadowColor: "#0A1628",
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  sectionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  sectionTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  sectionAccentBar: {
    width: 4,
    height: 20,
    borderRadius: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: "Manrope_800ExtraBold",
    letterSpacing: -0.2,
  },
  seeAll: { fontSize: 13, fontFamily: "Inter_600SemiBold" },

  gridBreakout: {
    marginHorizontal: -10,
  },
  cardRow: {
    flexDirection: "row",
    paddingHorizontal: 8,
    gap: 8,
  },
  halfCard: {
    flex: 1,
    marginBottom: 10,
  },

  sep: { height: 6 },

  /* sponsored badge inside Featured cards */
  featSponsoredBadge: {
    position: "absolute",
    top: 12,
    left: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    borderRadius: 20,
    paddingHorizontal: 11,
    paddingVertical: 5,
    shadowColor: "#FF6B00",
    shadowOpacity: 0.4,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },
  featSponsoredStar: { color: "#fff", fontSize: 10, lineHeight: 13 },
  featSponsoredText: { color: "#fff", fontSize: 10, fontFamily: "Inter_600SemiBold", letterSpacing: 1.0 },

  /* ── Featured Listings (1×1) ── */
  featuredList: { gap: 12 },
  featCard: {
    borderRadius: 18,
    overflow: "hidden",
    borderWidth: 1,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  featImgWrap: { height: 230, position: "relative" },
  featImg: { width: "100%", height: "100%" },
  featScrim: { position: "absolute", bottom: 0, left: 0, right: 0, height: 100 },
  featCondBadge: {
    position: "absolute", top: 12, left: 12,
    borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4,
  },
  featCondText: { color: "#fff", fontSize: 11, fontFamily: "Inter_700Bold" },
  featPriceBadge: {
    position: "absolute", bottom: 12, left: 12,
    backgroundColor: "#0EB5CA",
    borderRadius: 10, paddingHorizontal: 12, paddingVertical: 5,
    shadowColor: "#0EB5CA", shadowOpacity: 0.6, shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 }, elevation: 4,
  },
  featPriceText: { color: "#fff", fontSize: 16, fontFamily: "Inter_600SemiBold", letterSpacing: -0.3 },
  featViewsTag: {
    position: "absolute", bottom: 14, right: 12,
    flexDirection: "row", alignItems: "center", gap: 4,
    backgroundColor: "rgba(0,0,0,0.45)",
    paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6,
  },
  featViewsText: { color: "rgba(255,255,255,0.9)", fontSize: 10, fontFamily: "Inter_500Medium" },
  featInfo: { padding: 14, gap: 7 },
  featName: { fontSize: 16, fontFamily: "Inter_700Bold" },
  featMetaRow: { flexDirection: "row", gap: 6, flexWrap: "wrap" },
  featChip: {
    flexDirection: "row", alignItems: "center", gap: 4,
    borderRadius: 8, paddingHorizontal: 9, paddingVertical: 4,
  },
  featChipText: { fontSize: 12, fontFamily: "Inter_500Medium" },
  featSellerRow: { flexDirection: "row", alignItems: "center", gap: 5 },
  featSellerName: { fontSize: 12, fontFamily: "Inter_500Medium", flex: 1 },

  adBannerWrap: {
    marginHorizontal: 10,
    marginTop: 10,
    marginBottom: 6,
    borderRadius: 18,
    overflow: "hidden",
    shadowColor: "#0EB5CA",
    shadowOpacity: 0.22,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 5 },
    elevation: 7,
  },
  adBanner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  adBannerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  adBannerIconBox: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  adBannerTitle: {
    fontSize: 14,
    fontFamily: "Inter_700Bold",
    color: "#fff",
  },
  adBannerSub: {
    fontSize: 12,
    color: "rgba(255,255,255,0.75)",
    fontFamily: "Inter_400Regular",
    marginTop: 2,
  },
  adBannerArrow: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },

  brandSection: {
    paddingVertical: 8,
    marginTop: 6,
  },
  brandSectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 14,
    marginBottom: 8,
  },
  brandSectionTitle: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
  },
  brandRow: {
    flexDirection: "row",
    gap: 8,
    paddingLeft: 14,
    paddingRight: 14,
    alignItems: "center",
  },
  brandPill: {
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
    borderWidth: 1,
    paddingVertical: 8,
    paddingHorizontal: 10,
    width: 80,
    gap: 5,
  },
  brandPillLogoWrap: {
    width: 56,
    height: 38,
    borderRadius: 8,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    padding: 4,
  },
  brandPillLogo: {
    width: 48,
    height: 30,
  },
  brandPillLogoPlaceholder: {
    width: 56,
    height: 38,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  brandPillLogoInitial: {
    fontSize: 18,
    fontFamily: "Manrope_800ExtraBold",
  },
  brandPillLabel: {
    fontSize: 10,
    fontFamily: "Inter_600SemiBold",
    textAlign: "center",
  },
});
