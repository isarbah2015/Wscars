import { BlurView } from "expo-blur";
import { Feather } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { SymbolView } from "expo-symbols";
import React from "react";
import { Platform, StyleSheet, View } from "react-native";
import { useTheme } from "@/context/ThemeContext";

function TabIcon({
  name,
  focused,
  color,
  activeColor,
  activeBg,
}: {
  name: any;
  focused: boolean;
  color: string;
  activeColor: string;
  activeBg: string;
}) {
  return (
    <View
      style={[
        tabIconStyles.wrap,
        focused && { backgroundColor: activeBg, borderRadius: 14, paddingHorizontal: 14, paddingVertical: 5 },
      ]}
    >
      <Feather name={name} size={21} color={focused ? activeColor : color} />
    </View>
  );
}

const tabIconStyles = StyleSheet.create({
  wrap: { alignItems: "center", justifyContent: "center", minWidth: 44 },
});

function SellTabIcon({ focused }: { focused: boolean }) {
  return (
    <View style={[sellStyles.box, focused && sellStyles.boxActive]}>
      <Feather name="plus" size={15} color="#1A4000" />
    </View>
  );
}

const sellStyles = StyleSheet.create({
  box: {
    width: 30,
    height: 24,
    borderRadius: 8,
    backgroundColor: "#BFFF00",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#7EC800",
    shadowOpacity: 0.4,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },
  boxActive: {
    shadowOpacity: 0.7,
    shadowRadius: 10,
    elevation: 7,
  },
});

export default function TabLayout() {
  const { isDark, colors } = useTheme();
  const isIOS = Platform.OS === "ios";
  const isWeb = Platform.OS === "web";

  const inactiveColor = isDark ? "#4A5E7A" : "#8A9AB5";

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: inactiveColor,
        headerShown: false,
        tabBarStyle: {
          position: "absolute",
          backgroundColor: "transparent",
          borderTopWidth: 0,
          elevation: 0,
          shadowOpacity: 0,
          height: isWeb ? 88 : 72,
        },
        tabBarBackground: () =>
          isIOS ? (
            <View
              style={[
                StyleSheet.absoluteFill,
                tabBgStyles.bg,
                {
                  backgroundColor: isDark ? "rgba(10,20,40,0.85)" : "rgba(255,255,255,0.9)",
                  borderTopLeftRadius: 26,
                  borderTopRightRadius: 26,
                },
              ]}
            >
              <BlurView
                intensity={80}
                tint={isDark ? "dark" : "light"}
                style={StyleSheet.absoluteFill}
              />
            </View>
          ) : (
            <View
              style={[
                StyleSheet.absoluteFill,
                tabBgStyles.bg,
                {
                  backgroundColor: isDark ? "#0C1829" : "#FFFFFF",
                  borderTopLeftRadius: 26,
                  borderTopRightRadius: 26,
                },
              ]}
            />
          ),
        tabBarLabelStyle: {
          fontFamily: "Manrope_600SemiBold",
          fontSize: 10,
          marginBottom: 4,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ focused, color }) =>
            isIOS ? (
              <SymbolView name="house" tintColor={focused ? colors.accent : color} size={21} />
            ) : (
              <TabIcon name="home" focused={focused} color={color} activeColor={colors.accent} activeBg={colors.accentLight} />
            ),
        }}
      />
      <Tabs.Screen
        name="favourites"
        options={{
          title: "Saved",
          tabBarIcon: ({ focused, color }) =>
            isIOS ? (
              <SymbolView name="heart" tintColor={focused ? "#E8192C" : color} size={21} />
            ) : (
              <TabIcon name="heart" focused={focused} color={color} activeColor="#E8192C" activeBg="#FFEDEE" />
            ),
        }}
      />
      <Tabs.Screen
        name="sell"
        options={{
          title: "Sell",
          tabBarIcon: ({ focused }) => <SellTabIcon focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="messages"
        options={{
          title: "Messages",
          tabBarIcon: ({ focused, color }) =>
            isIOS ? (
              <SymbolView name="message" tintColor={focused ? "#7C3AED" : color} size={21} />
            ) : (
              <TabIcon name="message-circle" focused={focused} color={color} activeColor="#7C3AED" activeBg="#F3EEFF" />
            ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ focused, color }) =>
            isIOS ? (
              <SymbolView name="person" tintColor={focused ? "#059669" : color} size={21} />
            ) : (
              <TabIcon name="user" focused={focused} color={color} activeColor="#059669" activeBg="#ECFDF5" />
            ),
        }}
      />
      <Tabs.Screen name="search" options={{ href: null }} />
    </Tabs>
  );
}

const tabBgStyles = StyleSheet.create({
  bg: {
    shadowColor: "#0A1628",
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.14,
    shadowRadius: 24,
    elevation: 22,
    overflow: "hidden",
  },
});
