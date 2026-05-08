import { Feather } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { Tabs } from "expo-router";
import React from "react";
import { Platform, StyleSheet, View } from "react-native";
import { useApp } from "@/context/AppContext";
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
    <View style={[tabIconStyles.wrap, focused && { backgroundColor: activeBg, width: 52 }]}>
      <Feather name={name} size={22} color={focused ? activeColor : color} />
    </View>
  );
}

const tabIconStyles = StyleSheet.create({
  wrap: {
    alignItems: "center",
    justifyContent: "center",
    minWidth: 44,
    height: 38,
    borderRadius: 50,
  },
});

function SellTabIcon({ focused }: { focused: boolean }) {
  return (
    <View style={[sellStyles.outer, focused && sellStyles.outerActive]}>
      <View style={[sellStyles.box, focused && sellStyles.boxActive]}>
        <Feather name="plus" size={20} color="#FFFFFF" />
      </View>
    </View>
  );
}

const sellStyles = StyleSheet.create({
  outer: {
    width: 54,
    height: 38,
    borderRadius: 19,
    backgroundColor: "rgba(255,107,0,0.12)",
    alignItems: "center",
    justifyContent: "center",
    marginTop: -2,
  },
  outerActive: {
    backgroundColor: "rgba(255,107,0,0.22)",
  },
  box: {
    width: 44,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#FF6B00",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#FF6B00",
    shadowOpacity: 0.55,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
    elevation: 6,
  },
  boxActive: {
    shadowOpacity: 0.75,
  },
});

export default function TabLayout() {
  const { isDark, colors } = useTheme();
  const { conversations, favorites, isAuthenticated } = useApp();
  const totalUnread = conversations?.reduce((s, c) => s + (c.unreadCount || 0), 0) ?? 0;
  const favCount = favorites?.length ?? 0;
  const profileBadge = !isAuthenticated ? 1 : undefined;
  const isIOS = Platform.OS === "ios";

  const inactiveColor = isDark ? "#4A5E7A" : "#8A9AB5";
  const ORANGE = "#FF6B00";
  const ORANGE_BG = isDark ? "rgba(255,107,0,0.18)" : "rgba(255,107,0,0.10)";

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: ORANGE,
        tabBarInactiveTintColor: inactiveColor,
        headerShown: false,
        tabBarShowLabel: false,
        tabBarItemStyle: {
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          paddingTop: 10,
          paddingBottom: 10,
        },
        tabBarStyle: {
          position: "absolute",
          backgroundColor: "transparent",
          borderTopWidth: 0,
          elevation: 0,
          shadowOpacity: 0,
          height: 68,
        },
        tabBarBackground: () =>
          isIOS ? (
            <View
              style={[
                StyleSheet.absoluteFill,
                tabBgStyles.bg,
                {
                  backgroundColor: isDark ? "rgba(10,20,40,0.92)" : "rgba(255,255,255,0.94)",
                  borderTopLeftRadius: 28,
                  borderTopRightRadius: 28,
                },
              ]}
            >
              <BlurView
                intensity={90}
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
                  borderTopLeftRadius: 28,
                  borderTopRightRadius: 28,
                },
              ]}
            />
          ),
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ focused, color }) => (
            <TabIcon name="home" focused={focused} color={color} activeColor={ORANGE} activeBg={ORANGE_BG} />
          ),
        }}
      />
      <Tabs.Screen
        name="favourites"
        options={{
          title: "Saved",
          tabBarBadge: favCount > 0 ? favCount : undefined,
          tabBarBadgeStyle: { backgroundColor: "#E8192C", fontSize: 10, minWidth: 16, height: 16, borderRadius: 8 },
          tabBarIcon: ({ focused, color }) => (
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
          tabBarBadge: totalUnread > 0 ? totalUnread : undefined,
          tabBarBadgeStyle: { backgroundColor: "#FF4757", fontSize: 10, minWidth: 16, height: 16, borderRadius: 8 },
          tabBarIcon: ({ focused, color }) => (
            <TabIcon name="message-square" focused={focused} color={color} activeColor="#7C3AED" activeBg="#F3EEFF" />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarBadge: profileBadge,
          tabBarBadgeStyle: { backgroundColor: "#FF6B00", fontSize: 10, minWidth: 16, height: 16, borderRadius: 8 },
          tabBarIcon: ({ focused, color }) => (
            <TabIcon name="user" focused={focused} color={color} activeColor={ORANGE} activeBg={ORANGE_BG} />
          ),
        }}
      />
      <Tabs.Screen name="search" options={{ href: null }} />
    </Tabs>
  );
}

const tabBgStyles = StyleSheet.create({
  bg: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 24,
    overflow: "hidden",
  },
});
