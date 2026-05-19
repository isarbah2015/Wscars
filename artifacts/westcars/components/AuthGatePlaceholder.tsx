import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

interface AuthGatePlaceholderProps {
  icon?: keyof typeof Feather.glyphMap;
  title: string;
  subtitle: string;
  topPad?: number;
  backgroundColor?: string;
}

export function AuthGatePlaceholder({
  icon = 'lock',
  title,
  subtitle,
  topPad = 0,
  backgroundColor = '#F8FAFC',
}: AuthGatePlaceholderProps) {
  return (
    <View style={[styles.root, { paddingTop: topPad + 40, backgroundColor }]}>
      <View style={styles.iconRing}>
        <Feather name={icon} size={32} color="#0EB5CA" />
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>
      <Pressable style={styles.btn} onPress={() => router.push('/auth/login')}>
        <Text style={styles.btnText}>Sign In</Text>
      </Pressable>
      <Pressable onPress={() => router.push('/auth/signup')}>
        <Text style={styles.link}>
          New here? <Text style={styles.linkBold}>Create Account</Text>
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 14, padding: 40 },
  iconRing: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: 'rgba(14,181,202,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { fontSize: 22, fontFamily: 'Manrope_800ExtraBold', color: '#0F172A', textAlign: 'center' },
  subtitle: { fontSize: 14, fontFamily: 'Inter_400Regular', color: '#64748B', textAlign: 'center', lineHeight: 20 },
  btn: {
    marginTop: 8,
    backgroundColor: '#0EB5CA',
    borderRadius: 14,
    paddingHorizontal: 40,
    paddingVertical: 14,
    minWidth: 200,
    alignItems: 'center',
  },
  btnText: { fontSize: 15, fontFamily: 'Inter_600SemiBold', color: '#FFFFFF' },
  link: { marginTop: 8, fontSize: 14, color: '#64748B' },
  linkBold: { color: '#0EB5CA', fontFamily: 'Inter_700Bold' },
});
