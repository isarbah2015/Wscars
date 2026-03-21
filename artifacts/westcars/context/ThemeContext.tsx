import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useCallback, useContext, useEffect, useState } from "react";

export const LIGHT = {
  text: "#1A1A1A",
  textSecondary: "#4A4A4A",
  textTertiary: "#9E9E9E",
  background: "#F2F4F8",
  backgroundSecondary: "#FFFFFF",
  card: "#FFFFFF",
  border: "#E4E4E7",
  shadow: "rgba(0,0,0,0.07)",
  tabBar: "#FFFFFF",
  inputBg: "#F9F9F9",
  skeleton: "#EEEEEE",
  accent: "#0066CC",
  accentLight: "#EDF4FF",
  danger: "#E53935",
  success: "#22C55E",
  warning: "#FB8C00",
};

export const DARK = {
  text: "#F0F0F0",
  textSecondary: "#BBBBBB",
  textTertiary: "#777777",
  background: "#111827",
  backgroundSecondary: "#1F2937",
  card: "#1E293B",
  border: "#2D3748",
  shadow: "rgba(0,0,0,0.35)",
  tabBar: "#1A2438",
  inputBg: "#243044",
  skeleton: "#2D3748",
  accent: "#3B9EFF",
  accentLight: "#1A2D44",
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
