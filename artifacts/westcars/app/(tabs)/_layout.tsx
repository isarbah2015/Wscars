import { BlurView } from "expo-blur";
import { Feather } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { SymbolView } from "expo-symbols";
import React from "react";
import { Platform, StyleSheet, View } from "react-native";
import { useTheme } from "@/context/ThemeContext";

function SellTabIcon() {
  return (
    <View style={sellStyles.box}>
      <Feather name="plus" size={15} color="#1A4000" />
    </View>
  );
}

const sellStyles = StyleSheet.create({
  box: {
    width: 28,
    height: 22,
    borderRadius: 7,
    backgroundColor: "#BFFF00",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#7EC800",
    shadowOpacity: 0.35,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
});

export default function TabLayout() {
  const { isDark, colors } = useTheme();
  const isIOS = Platform.OS === "ios";
  const isWeb = Platform.OS === "web";

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: isDark ? "#6B7A8D" : "#9BA8BA",
        headerShown: false,
        tabBarStyle: {
          position: "absolute",
          backgroundColor: isIOS ? "transparent" : colors.tabBar,
          borderTopWidth: 1,
          borderTopColor: colors.border,
          elevation: 0,
          height: isWeb ? 84 : undefined,
        },
        tabBarBackground: () =>
          isIOS ? (
            <BlurView
              intensity={95}
              tint={isDark ? "dark" : "systemChromeMaterial"}
              style={StyleSheet.absoluteFill}
            />
          ) : (
            <View
              style={[StyleSheet.absoluteFill, { backgroundColor: colors.tabBar }]}
            />
          ),
        tabBarLabelStyle: {
          fontFamily: "Manrope_500Medium",
          fontSize: 10,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color, size }) =>
            isIOS ? (
              <SymbolView name="house" tintColor={color} size={size} />
            ) : (
              <Feather name="home" size={22} color={color} />
            ),
        }}
      />
      <Tabs.Screen
        name="favourites"
        options={{
          title: "Saved",
          tabBarIcon: ({ color, size }) =>
            isIOS ? (
              <SymbolView name="heart" tintColor={color} size={size} />
            ) : (
              <Feather name="heart" size={22} color={color} />
            ),
        }}
      />
      <Tabs.Screen
        name="sell"
        options={{
          title: "Sell",
          tabBarIcon: () => <SellTabIcon />,
        }}
      />
      <Tabs.Screen
        name="messages"
        options={{
          title: "Messages",
          tabBarIcon: ({ color, size }) =>
            isIOS ? (
              <SymbolView name="message" tintColor={color} size={size} />
            ) : (
              <Feather name="message-circle" size={22} color={color} />
            ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, size }) =>
            isIOS ? (
              <SymbolView name="person" tintColor={color} size={size} />
            ) : (
              <Feather name="user" size={22} color={color} />
            ),
        }}
      />
      <Tabs.Screen name="search" options={{ href: null }} />
    </Tabs>
  );
}
