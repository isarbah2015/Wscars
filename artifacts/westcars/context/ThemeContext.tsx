import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useCallback, useContext, useEffect, useState } from "react";

export const LIGHT = {
  text: "#0F172A",
  textSecondary: "#475569",
  textTertiary: "#94A3B8",
  background: "#EEF2F6",
  backgroundSecondary: "#FFFFFF",
  card: "#FFFFFF",
  border: "rgba(0,0,0,0.07)",
  shadow: "rgba(15,23,42,0.08)",
  tabBar: "#FFFFFF",
  inputBg: "#F8FAFC",
  skeleton: "#E2E8F0",
  accent: "#BFFF00",
  accentText: "#3B5200",
  accentLight: "rgba(191,255,0,0.16)",
  danger: "#EF4444",
  success: "#16A34A",
  warning: "#F59E0B",
};

export const DARK = {
  text: "#F1F5F9",
  textSecondary: "#94A3B8",
  textTertiary: "#475569",
  background: "#0B1120",
  backgroundSecondary: "#111827",
  card: "#1E293B",
  border: "rgba(255,255,255,0.06)",
  shadow: "rgba(0,0,0,0.5)",
  tabBar: "#0F172A",
  inputBg: "#1E293B",
  skeleton: "#1E293B",
  accent: "#BFFF00",
  accentText: "#3B5200",
  accentLight: "rgba(191,255,0,0.12)",
  danger: "#F87171",
  success: "#4ADE80",
  warning: "#FBBF24",
};

export type ThemeColors = typeof LIGHT;

interface ThemeContextType {
  isDark: boolean;
  colors: ThemeColors;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | null>(null);
const THEME_KEY = "@westcars_theme";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(THEME_KEY).then((v) => {
      if (v === "dark") setIsDark(true);
    });
  }, []);

  const toggleTheme = useCallback(() => {
    setIsDark((prev) => {
      const next = !prev;
      AsyncStorage.setItem(THEME_KEY, next ? "dark" : "light");
      return next;
    });
  }, []);

  return (
    <ThemeContext.Provider value={{ isDark, colors: isDark ? DARK : LIGHT, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}
