import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useCallback, useContext, useEffect, useState } from "react";

export const LIGHT = {
  text: "#0A1628",
  textSecondary: "#3D4F6A",
  textTertiary: "#8A9AB5",
  background: "#EEF2F9",
  backgroundSecondary: "#FFFFFF",
  card: "#FFFFFF",
  border: "#DDE3EF",
  shadow: "rgba(10,22,40,0.09)",
  tabBar: "#FFFFFF",
  inputBg: "#F4F7FD",
  skeleton: "#E4EAF5",
  accent: "#0055CC",
  accentLight: "#E0ECFF",
  danger: "#E53935",
  success: "#16A34A",
  warning: "#D97706",
};

export const DARK = {
  text: "#EEF2FF",
  textSecondary: "#A8B8D0",
  textTertiary: "#5E7291",
  background: "#080F1E",
  backgroundSecondary: "#111827",
  card: "#141E33",
  border: "#1E2E47",
  shadow: "rgba(0,0,0,0.45)",
  tabBar: "#0E1929",
  inputBg: "#192338",
  skeleton: "#1E2E47",
  accent: "#4D9EFF",
  accentLight: "#0E1E36",
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
