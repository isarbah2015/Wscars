// app/advertise.tsx

import React, { useState } from 'react'
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView, Pressable,
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Feather } from '@expo/vector-icons'
import { useRouter } from 'expo-router'

// ─── WestCars palette ─────────────────────────────────────────────────────────
const TEAL       = '#0EB5CA'
const TEAL_LIGHT = '#E8F9FC'
const TEAL_DARK  = '#0A9BB0'

// ─── Packages ─────────────────────────────────────────────────────────────────
const AD_PACKAGES = [
  {
    id: 'basic',
    name: 'Basic',
    price: 'GHS 50',
    duration: '7 days',
    highlight: false,
    features: [
      'Featured in search results',
      'Bold listing title',
      'Up to 10 photos',
      'Standard placement',
    ],
  },
  {
    id: 'featured',
    name: 'Featured',
    price: 'GHS 120',
    duration: '14 days',
    highlight: true,
    badge: 'Most Popular',
    features: [
      'Top of search results',
      'Featured homepage banner',
      'Bold + highlighted listing',
      'Up to 20 photos',
      'WhatsApp enquiry button',
      'View count analytics',
    ],
  },
  {
    id: 'premium',
    name: 'Premium',
    price: 'GHS 250',
    duration: '30 days',
    highlight: false,
    features: [
      'Pinned top placement — 30 days',
      'Homepage hero slot',
      'Priority support',
      'Unlimited photos',
      'WhatsApp + Call buttons',
      'Full analytics dashboard',
      'Social media boost',
    ],
  },
]

export default function AdvertisePage() {
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const [selected, setSelected] = useState<string>('featured')

  const selectedPkg = AD_PACKAGES.find(p => p.id === selected)!

  const handleBook = () => {
    router.push({
      pathname: '/advertise-book',
      params: {
        packageId:   selectedPkg.id,
        packageName: selectedPkg.name,
        price:       selectedPkg.price,
        duration:    selectedPkg.duration,
      },
    })
  }

  return (
    <View style={s.safe}>

      {/* ── Header ── */}
      <View style={[s.header, { paddingTop: insets.top + 14 }]}>
        <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
          <Feather name="arrow-left" size={22} color={TEAL_DARK} />
        </TouchableOpacity>
        <Text style={s.headerTitle}>Advertise on WestCars</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>

        {/* ── Hero blurb ── */}
        <View style={s.hero}>
          <View style={s.heroIcon}>
            <Feather name="trending-up" size={28} color={TEAL} />
          </View>
          <Text style={s.heroTitle}>Sell faster with a boost</Text>
          <Text style={s.heroSub}>
            Get your listing seen by thousands of buyers across Ghana.
            Choose the plan that fits your budget.
          </Text>
        </View>

        {/* ── Package cards ── */}
        {AD_PACKAGES.map(pkg => {
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

              <View style={s.cardTop}>
                <View>
                  <Text style={[s.pkgName, pkg.highlight && s.pkgNameHero]}>{pkg.name}</Text>
                  <Text style={[s.pkgDuration, pkg.highlight && s.pkgDurationHero]}>{pkg.duration}</Text>
                </View>
                <View style={s.priceWrap}>
                  <Text style={[s.price, pkg.highlight && s.priceHero]}>{pkg.price}</Text>
                </View>
              </View>

              <View style={s.featureList}>
                {pkg.features.map(f => (
                  <View key={f} style={s.featureRow}>
                    <Feather
                      name="check-circle"
                      size={15}
                      color={pkg.highlight ? '#fff' : TEAL}
                    />
                    <Text style={[s.featureTxt, pkg.highlight && s.featureTxtHero]}>{f}</Text>
                  </View>
                ))}
              </View>

              <View style={s.selectRow}>
                <View style={[s.radio, active && s.radioActive, pkg.highlight && s.radioHero]}>
                  {active && <View style={s.radioDot} />}
                </View>
                <Text style={[s.selectTxt, pkg.highlight && s.featureTxtHero]}>
                  {active ? 'Selected' : 'Select this plan'}
                </Text>
              </View>
            </TouchableOpacity>
          )
        })}

        {/* ── How it works ── */}
        <Text style={s.howTitle}>How it works</Text>
        {[
          { icon: 'check-square', text: 'Choose a plan above' },
          { icon: 'edit-3',       text: 'Fill in your listing details' },
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

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* ── Sticky book bar ── */}
      <View style={s.bookBar}>
        <View>
          <Text style={s.bookBarPkg}>{selectedPkg.name} Plan</Text>
          <Text style={s.bookBarPrice}>{selectedPkg.price} · {selectedPkg.duration}</Text>
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
  safe:   { flex: 1, backgroundColor: '#f7fafa' },
  scroll: { padding: 16, paddingBottom: 40 },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 14,
    backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#eaf4f4',
  },
  backBtn:     { width: 36 },
  headerTitle: { fontSize: 17, fontWeight: '800', color: TEAL_DARK },

  hero: {
    alignItems: 'center', paddingVertical: 24, marginBottom: 8,
  },
  heroIcon: {
    width: 60, height: 60, borderRadius: 30,
    backgroundColor: TEAL_LIGHT, alignItems: 'center', justifyContent: 'center',
    marginBottom: 12,
  },
  heroTitle: { fontSize: 22, fontWeight: '800', color: '#111', marginBottom: 6, textAlign: 'center' },
  heroSub:   { fontSize: 14, color: '#666', textAlign: 'center', lineHeight: 20, paddingHorizontal: 16 },

  card: {
    backgroundColor: '#fff', borderRadius: 18, padding: 18, marginBottom: 14,
    borderWidth: 2, borderColor: 'transparent',
    shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 }, elevation: 2,
  },
  cardHighlight: {
    backgroundColor: TEAL,
    shadowColor: TEAL, shadowOpacity: 0.3, shadowRadius: 12, elevation: 6,
  },
  cardActive: { borderColor: TEAL },

  badge: {
    alignSelf: 'flex-start', backgroundColor: '#fff',
    paddingHorizontal: 10, paddingVertical: 3, borderRadius: 20, marginBottom: 10,
  },
  badgeTxt: { fontSize: 11, fontWeight: '800', color: TEAL },

  cardTop:        { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 },
  pkgName:        { fontSize: 20, fontWeight: '800', color: '#111' },
  pkgNameHero:    { color: '#fff' },
  pkgDuration:    { fontSize: 13, color: '#888', fontWeight: '600', marginTop: 2 },
  pkgDurationHero:{ color: 'rgba(255,255,255,0.75)' },
  priceWrap:      { alignItems: 'flex-end' },
  price:          { fontSize: 22, fontWeight: '800', color: TEAL_DARK },
  priceHero:      { color: '#fff' },

  featureList: { gap: 8, marginBottom: 14 },
  featureRow:  { flexDirection: 'row', alignItems: 'center', gap: 8 },
  featureTxt:  { fontSize: 13, color: '#444', fontWeight: '500', flex: 1 },
  featureTxtHero: { color: 'rgba(255,255,255,0.92)' },

  selectRow:    { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 },
  radio: {
    width: 20, height: 20, borderRadius: 10,
    borderWidth: 2, borderColor: '#ccc',
    alignItems: 'center', justifyContent: 'center',
  },
  radioActive: { borderColor: TEAL },
  radioHero:   { borderColor: '#fff' },
  radioDot:    { width: 10, height: 10, borderRadius: 5, backgroundColor: TEAL },
  selectTxt:   { fontSize: 13, fontWeight: '600', color: '#888' },

  howTitle: { fontSize: 16, fontWeight: '800', color: '#111', marginBottom: 12, marginTop: 8 },
  howRow:   { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
  howIcon: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: TEAL_LIGHT, alignItems: 'center', justifyContent: 'center',
  },
  howTxt: { fontSize: 14, color: '#444', fontWeight: '600' },

  bookBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 18, paddingVertical: 14,
    backgroundColor: '#fff',
    borderTopWidth: 1, borderTopColor: '#eaf4f4',
    shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8,
    shadowOffset: { width: 0, height: -2 }, elevation: 4,
  },
  bookBarPkg:   { fontSize: 15, fontWeight: '800', color: '#111' },
  bookBarPrice: { fontSize: 13, color: '#666', fontWeight: '600', marginTop: 1 },
  bookBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: TEAL, paddingHorizontal: 22, paddingVertical: 13,
    borderRadius: 14,
  },
  bookBtnTxt: { fontSize: 15, fontWeight: '800', color: '#fff' },
})
