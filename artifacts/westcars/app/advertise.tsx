// app/advertise.tsx
// ✅ Ad types split: Flyer vs Video — each with exact dimensions shown
// ✅ Brand teal (#0EB5CA) applied throughout — no more CSS #008080
// ✅ useSafeAreaInsets for Android notch (replaces SafeAreaView)
// ✅ "View exact size" visible and not hidden for both ad types

import React, { useState } from 'react'
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView, Platform,
} from 'react-native'
import { Feather } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import {
  AD_SLOT_LABELS,
  FEATURED_HERO_H,
  FEATURED_HERO_W,
  GRID_CARD_W,
  GRID_CARD_TOTAL_H,
  LISTING_GRID,
} from '@/constants/listingGrid'

// ─── WestCars brand palette ───────────────────────────────────────────────────
const TEAL       = '#0EB5CA'
const TEAL_LIGHT = '#E8F9FC'
const TEAL_DARK  = '#0A9BB0'
const NAVY       = '#0A1628'

// ─── Ad type definitions ──────────────────────────────────────────────────────
type AdType = 'flyer' | 'video'

const AD_TYPES: { id: AdType; label: string; icon: string; tag: string }[] = [
  { id: 'flyer', label: 'Flyer Ad',    icon: 'image',  tag: 'Static image banner' },
  { id: 'video', label: 'Video Ad',    icon: 'film',   tag: 'Animated / video banner' },
]

// ─── Flyer packages ───────────────────────────────────────────────────────────
const FLYER_PACKAGES = [
  {
    id: 'flyer_basic',
    name: 'Basic Flyer',
    price: 'GHS 29',
    duration: '7 days',
    highlight: false,
    dimensions: { w: GRID_CARD_W, h: GRID_CARD_TOTAL_H, label: AD_SLOT_LABELS.gridCard },
    features: [
      'Single slot in the 2×2 browse grid',
      'Same size as a listing card',
      'Shown when your boost is active',
      'Up to 10 photos in listing',
    ],
  },
  {
    id: 'flyer_featured',
    name: 'Featured Flyer',
    price: 'GHS 69',
    duration: '14 days',
    highlight: true,
    badge: 'Most Popular',
    dimensions: { w: FEATURED_HERO_W, h: FEATURED_HERO_H, label: AD_SLOT_LABELS.featuredHero },
    features: [
      'Full-width featured hero in feed',
      'Featured Listings section placement',
      'Same size as homepage featured cards',
      'Up to 20 photos',
      'WhatsApp enquiry button',
      'View count analytics',
    ],
  },
  {
    id: 'flyer_premium',
    name: 'Premium Flyer',
    price: 'GHS 139',
    duration: '30 days',
    highlight: false,
    dimensions: { w: FEATURED_HERO_W, h: FEATURED_HERO_H, label: AD_SLOT_LABELS.featuredHero },
    features: [
      'Top priority featured hero rotation',
      'Pinned in Featured Listings section',
      'Full-width — matches featured card size',
      'Unlimited photos',
      'WhatsApp + Call buttons',
      'Full analytics dashboard',
    ],
  },
]

// ─── Video packages ───────────────────────────────────────────────────────────
const VIDEO_PACKAGES = [
  {
    id: 'video_basic',
    name: 'Short Clip',
    price: 'GHS 79',
    duration: '7 days',
    highlight: false,
    dimensions: { w: GRID_CARD_W, h: GRID_CARD_TOTAL_H, label: `${AD_SLOT_LABELS.gridImage} · Up to 15 sec MP4` },
    features: [
      'Fits the 2×2 grid card slot',
      'Same dimensions as listing cards',
      'Auto-plays muted in grid',
      'Up to 15 seconds',
    ],
  },
  {
    id: 'video_featured',
    name: 'Feature Reel',
    price: 'GHS 149',
    duration: '14 days',
    highlight: true,
    badge: 'Best Value',
    dimensions: { w: FEATURED_HERO_W, h: FEATURED_HERO_H, label: `${AD_SLOT_LABELS.featuredImage} · Up to 30 sec HD MP4` },
    features: [
      'Full-width featured hero video',
      'Matches Featured Listings card size',
      'Up to 30 seconds',
      'Priority placement in browse feed',
      'WhatsApp enquiry button',
      'View + play analytics',
    ],
  },
  {
    id: 'video_premium',
    name: 'Cinematic',
    price: 'GHS 249',
    duration: '30 days',
    highlight: false,
    dimensions: { w: FEATURED_HERO_W, h: FEATURED_HERO_H, label: `${AD_SLOT_LABELS.featuredImage} · Up to 60 sec Full HD MP4` },
    features: [
      'Full HD — hero homepage autoplay',
      'Up to 60 seconds',
      'Pinned top placement — 30 days',
      'Unlimited listing photos',
      'WhatsApp + Call buttons',
      'Full analytics dashboard',
      'Social media boost package',
    ],
  },
]

// ─── Component ────────────────────────────────────────────────────────────────

export default function AdvertisePage() {
  const router  = useRouter()
  const insets  = useSafeAreaInsets()

  const [adType,   setAdType]   = useState<AdType>('flyer')
  const [selected, setSelected] = useState<string>('flyer_featured')

  const switchType = (t: AdType) => {
    setAdType(t)
    setSelected(t === 'flyer' ? 'flyer_featured' : 'video_featured')
  }

  const packages = adType === 'flyer' ? FLYER_PACKAGES : VIDEO_PACKAGES
  const selectedPkg = packages.find(p => p.id === selected)!

  const handleBook = () => {
    router.push({
      pathname: '/advertise-book',
      params: {
        packageId:   selectedPkg.id,
        packageName: selectedPkg.name,
        adType,
        price:       selectedPkg.price,
        duration:    selectedPkg.duration,
        dimensions:  selectedPkg.dimensions.label,
      },
    })
  }

  return (
    <View style={[s.root, { paddingTop: insets.top }]}>

      {/* ── Header ── */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
          <Feather name="arrow-left" size={22} color={NAVY} />
        </TouchableOpacity>
        <Text style={s.headerTitle}>Advertise on WestCars</Text>
        <View style={{ width: 36 }} />
      </View>

      {/* ── Ad type tabs ── */}
      <View style={s.tabRow}>
        {AD_TYPES.map(t => {
          const active = adType === t.id
          return (
            <TouchableOpacity
              key={t.id}
              style={[s.tab, active && s.tabActive]}
              onPress={() => switchType(t.id)}
              activeOpacity={0.8}
            >
              <Feather name={t.icon as any} size={16} color={active ? '#fff' : TEAL_DARK} />
              <View>
                <Text style={[s.tabLabel, active && s.tabLabelActive]}>{t.label}</Text>
                <Text style={[s.tabTag, active && s.tabTagActive]}>{t.tag}</Text>
              </View>
            </TouchableOpacity>
          )
        })}
      </View>

      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>

        {/* ── Hero blurb ── */}
        <View style={s.hero}>
          <View style={s.heroIcon}>
            <Feather name={adType === 'flyer' ? 'trending-up' : 'play-circle'} size={28} color={TEAL} />
          </View>
          <Text style={s.heroTitle}>
            {adType === 'flyer' ? 'Reach buyers with a banner' : 'Stand out with video'}
          </Text>
          <Text style={s.heroSub}>
            {adType === 'flyer'
              ? `Upload sizes match the app grid — 2×2 cards (${GRID_CARD_W}×${GRID_CARD_TOTAL_H}px) or featured heroes (${FEATURED_HERO_W}×${FEATURED_HERO_H}px). Slots only appear after you book.`
              : `Video ads use the same grid sizes — grid slot ${GRID_CARD_W}×${LISTING_GRID.imageHeight}px or featured hero ${FEATURED_HERO_W}×${FEATURED_HERO_H}px.`}
          </Text>
        </View>

        {/* ── Package cards ── */}
        {packages.map(pkg => {
          const active = selected === pkg.id
          return (
            <TouchableOpacity
              key={pkg.id}
              style={[s.card, pkg.highlight && s.cardHighlight, active && s.cardActive]}
              onPress={() => setSelected(pkg.id)}
              activeOpacity={0.85}
            >
              {pkg.badge && (
                <View style={s.badge}>
                  <Text style={s.badgeTxt}>{pkg.badge}</Text>
                </View>
              )}

              {/* Name + price */}
              <View style={s.cardTop}>
                <View style={{ flex: 1 }}>
                  <Text style={[s.pkgName, pkg.highlight && s.textWhite]}>{pkg.name}</Text>
                  <Text style={[s.pkgDuration, pkg.highlight && s.textWhiteDim]}>{pkg.duration}</Text>
                </View>
                <Text style={[s.price, pkg.highlight && s.textWhite]}>{pkg.price}</Text>
              </View>

              {/* ── Exact dimensions chip — always visible ── */}
              <View style={[s.dimChip, pkg.highlight && s.dimChipHero]}>
                <Feather name="maximize-2" size={12} color={pkg.highlight ? '#fff' : TEAL_DARK} />
                <Text style={[s.dimTxt, pkg.highlight && s.textWhite]} numberOfLines={2}>
                  {pkg.dimensions.label}
                </Text>
              </View>

              {/* Features */}
              <View style={s.featureList}>
                {pkg.features.map(f => (
                  <View key={f} style={s.featureRow}>
                    <Feather
                      name="check-circle"
                      size={14}
                      color={pkg.highlight ? '#fff' : TEAL}
                    />
                    <Text style={[s.featureTxt, pkg.highlight && s.textWhiteDim]}>{f}</Text>
                  </View>
                ))}
              </View>

              {/* Select radio */}
              <View style={s.selectRow}>
                <View style={[s.radio, active && s.radioActive, pkg.highlight && s.radioHero]}>
                  {active && <View style={[s.radioDot, pkg.highlight && s.radioDotHero]} />}
                </View>
                <Text style={[s.selectTxt, pkg.highlight && s.textWhiteDim]}>
                  {active ? 'Selected' : 'Select this plan'}
                </Text>
              </View>
            </TouchableOpacity>
          )
        })}

        {/* ── How it works ── */}
        <Text style={s.howTitle}>How it works</Text>
        {[
          { icon: 'check-square', text: 'Choose an ad type and plan above' },
          { icon: 'edit-3',       text: 'Fill in your ad details and upload creative' },
          { icon: 'credit-card',  text: 'Pay via Mobile Money or card' },
          { icon: 'zap',          text: 'Your ad goes live instantly' },
        ].map(({ icon, text }) => (
          <View key={text} style={s.howRow}>
            <View style={s.howIcon}>
              <Feather name={icon as any} size={16} color={TEAL} />
            </View>
            <Text style={s.howTxt}>{text}</Text>
          </View>
        ))}

        <View style={{ height: 110 }} />
      </ScrollView>

      {/* ── Sticky book bar ── */}
      <View style={[s.bookBar, { paddingBottom: insets.bottom + 10 }]}>
        <View style={{ flex: 1 }}>
          <Text style={s.bookBarPkg}>{selectedPkg.name}</Text>
          <Text style={s.bookBarPrice}>{selectedPkg.price} · {selectedPkg.duration}</Text>
          <Text style={s.bookBarDim} numberOfLines={1}>{selectedPkg.dimensions.label}</Text>
        </View>
        <TouchableOpacity style={s.bookBtn} onPress={handleBook} activeOpacity={0.85}>
          <Text style={s.bookBtnTxt}>Book Now</Text>
          <Feather name="arrow-right" size={16} color="#fff" />
        </TouchableOpacity>
      </View>

    </View>
  )
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  root:   { flex: 1, backgroundColor: '#F0FAFB' },
  scroll: { padding: 16, paddingBottom: 40 },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 14,
    backgroundColor: '#fff',
    borderBottomWidth: 1, borderBottomColor: '#D9F3F7',
  },
  backBtn:     { width: 36, alignItems: 'flex-start' },
  headerTitle: { fontSize: 17, fontWeight: '800', color: NAVY },

  tabRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 10,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#D9F3F7',
  },
  tab: {
    flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingVertical: 10, paddingHorizontal: 12,
    borderRadius: 14, borderWidth: 1.5, borderColor: '#D9F3F7',
    backgroundColor: '#F0FAFB',
  },
  tabActive: {
    backgroundColor: TEAL, borderColor: TEAL,
    shadowColor: TEAL, shadowOpacity: 0.3, shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 }, elevation: 4,
  },
  tabLabel:       { fontSize: 13, fontWeight: '800', color: TEAL_DARK },
  tabLabelActive: { color: '#fff' },
  tabTag:         { fontSize: 10, color: '#888', fontWeight: '500', marginTop: 1 },
  tabTagActive:   { color: 'rgba(255,255,255,0.8)' },

  hero: { alignItems: 'center', paddingVertical: 20, marginBottom: 4 },
  heroIcon: {
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: TEAL_LIGHT, alignItems: 'center', justifyContent: 'center',
    marginBottom: 10,
  },
  heroTitle: { fontSize: 20, fontWeight: '800', color: NAVY, marginBottom: 6, textAlign: 'center' },
  heroSub:   { fontSize: 13, color: '#555', textAlign: 'center', lineHeight: 19, paddingHorizontal: 12 },

  card: {
    backgroundColor: '#fff', borderRadius: 20, padding: 18, marginBottom: 14,
    borderWidth: 2, borderColor: 'transparent',
    shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 }, elevation: 2,
  },
  cardHighlight: {
    backgroundColor: TEAL,
    shadowColor: TEAL, shadowOpacity: 0.35, shadowRadius: 14, elevation: 7,
  },
  cardActive: { borderColor: TEAL },

  badge: {
    alignSelf: 'flex-start', backgroundColor: '#fff',
    paddingHorizontal: 10, paddingVertical: 3, borderRadius: 20, marginBottom: 10,
  },
  badgeTxt: { fontSize: 11, fontWeight: '800', color: TEAL },

  cardTop: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'flex-start', marginBottom: 10,
  },
  pkgName:    { fontSize: 18, fontWeight: '800', color: NAVY },
  pkgDuration:{ fontSize: 12, color: '#888', fontWeight: '600', marginTop: 2 },
  price:      { fontSize: 20, fontWeight: '800', color: TEAL_DARK },

  dimChip: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 6,
    backgroundColor: TEAL_LIGHT, borderRadius: 10,
    paddingHorizontal: 10, paddingVertical: 7,
    marginBottom: 12,
  },
  dimChipHero: { backgroundColor: 'rgba(255,255,255,0.20)' },
  dimTxt: { fontSize: 12, fontWeight: '700', color: TEAL_DARK, flex: 1, flexWrap: 'wrap' },

  featureList: { gap: 7, marginBottom: 12 },
  featureRow:  { flexDirection: 'row', alignItems: 'center', gap: 8 },
  featureTxt:  { fontSize: 13, color: '#444', fontWeight: '500', flex: 1 },

  selectRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 2 },
  radio: {
    width: 20, height: 20, borderRadius: 10,
    borderWidth: 2, borderColor: '#ccc',
    alignItems: 'center', justifyContent: 'center',
  },
  radioActive:    { borderColor: TEAL },
  radioHero:      { borderColor: '#fff' },
  radioDot:       { width: 10, height: 10, borderRadius: 5, backgroundColor: TEAL },
  radioDotHero:   { backgroundColor: '#fff' },
  selectTxt:      { fontSize: 13, fontWeight: '600', color: '#999' },

  textWhite:    { color: '#fff' },
  textWhiteDim: { color: 'rgba(255,255,255,0.85)' },

  howTitle: { fontSize: 16, fontWeight: '800', color: NAVY, marginBottom: 12, marginTop: 4 },
  howRow:   { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
  howIcon: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: TEAL_LIGHT, alignItems: 'center', justifyContent: 'center',
  },
  howTxt: { fontSize: 14, color: '#444', fontWeight: '600' },

  bookBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 18, paddingTop: 14,
    backgroundColor: '#fff',
    borderTopWidth: 1, borderTopColor: '#D9F3F7',
    shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 10,
    shadowOffset: { width: 0, height: -3 }, elevation: 6,
  },
  bookBarPkg:   { fontSize: 15, fontWeight: '800', color: NAVY },
  bookBarPrice: { fontSize: 13, color: '#555', fontWeight: '600', marginTop: 1 },
  bookBarDim:   { fontSize: 11, color: TEAL_DARK, fontWeight: '600', marginTop: 2 },
  bookBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: TEAL, paddingHorizontal: 22, paddingVertical: 13,
    borderRadius: 14,
    shadowColor: TEAL, shadowOpacity: 0.4, shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 }, elevation: 4,
  },
  bookBtnTxt: { fontSize: 15, fontWeight: '800', color: '#fff' },
})
