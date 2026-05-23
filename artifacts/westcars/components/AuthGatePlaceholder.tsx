import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '@/context/ThemeContext';

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
  backgroundColor,
}: AuthGatePlaceholderProps) {
  const { colors, isDark } = useTheme();
  const bg = backgroundColor ?? colors.background;

  return (
    <View style={[styles.root, { paddingTop: topPad + 40, backgroundColor: bg }]}>
      <View style={[styles.iconRing, { backgroundColor: colors.accentLight }]}>
        <Feather name={icon} size={32} color={colors.accent} />
      </View>
      <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
      <Text style={[styles.subtitle, { color: colors.textSecondary }]}>{subtitle}</Text>
      <Pressable style={[styles.btn, { backgroundColor: colors.accent }]} onPress={() => router.push('/auth/login')}>
        <Text style={styles.btnText}>Sign In</Text>
      </Pressable>
      <Pressable onPress={() => router.push('/auth/signup')}>
        <Text style={[styles.link, { color: colors.textSecondary }]}>
          New here? <Text style={[styles.linkBold, { color: colors.accent }]}>Create Account</Text>
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
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { fontSize: 22, fontFamily: 'Manrope_800ExtraBold', textAlign: 'center' },
  subtitle: { fontSize: 14, fontFamily: 'Inter_400Regular', textAlign: 'center', lineHeight: 20 },
  btn: {
    marginTop: 8,
    borderRadius: 14,
    paddingHorizontal: 40,
    paddingVertical: 14,
    minWidth: 200,
    alignItems: 'center',
  },
  btnText: { fontSize: 15, fontFamily: 'Inter_600SemiBold', color: '#FFFFFF' },
  link: { marginTop: 8, fontSize: 14 },
  linkBold: { fontFamily: 'Inter_700Bold' },
});
