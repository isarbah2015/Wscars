import { BlurView } from "expo-blur";
import { Feather } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { SymbolView } from "expo-symbols";
import React from "react";
import { Platform, StyleSheet, Text, View } from "react-native";
import { useTheme } from "@/context/ThemeContext";

function TabIcon({
  name,
  label,
  focused,
  color,
  activeColor,
  activeBg,
}: {
  name: any;
  label: string;
  focused: boolean;
  color: string;
  activeColor: string;
  activeBg: string;
}) {
  return (
    <View style={[tabIconStyles.wrap, focused && { backgroundColor: activeBg, paddingHorizontal: 16 }]}>
      <Feather name={name} size={22} color={focused ? activeColor : color} />
    </View>
  );
}

const tabIconStyles = StyleSheet.create({
  wrap: {
    alignItems: "center",
    justifyContent: "center",
    minWidth: 44,
    borderRadius: 50,
  },
});

function SellTabIcon({ focused }: { focused: boolean }) {
  return (
    <View style={[sellStyles.outer, focused && sellStyles.outerActive]}>
      <View style={sellStyles.box}>
        <Feather name="plus" size={18} color="#FFFFFF" />
      </View>
    </View>
  );
}

const sellStyles = StyleSheet.create({
  outer: {
    width: 50,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(14,181,202,0.15)",
    alignItems: "center",
    justifyContent: "center",
    marginTop: -2,
  },
  outerActive: {
    backgroundColor: "rgba(14,181,202,0.22)",
  },
  box: {
    width: 40,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#0EB5CA",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#0EB5CA",
    shadowOpacity: 0.55,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
    elevation: 6,
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
        tabBarActiveTintColor: "#0098AA",
        tabBarInactiveTintColor: inactiveColor,
        headerShown: false,
        tabBarShowLabel: true,
        tabBarStyle: {
          position: "absolute",
          backgroundColor: "transparent",
          borderTopWidth: 0,
          elevation: 0,
          shadowOpacity: 0,
          height: isWeb ? 88 : 74,
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
        tabBarLabelStyle: {
          fontFamily: "Manrope_600SemiBold",
          fontSize: 10,
          marginBottom: 5,
          marginTop: -2,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ focused, color }) =>
            isIOS ? (
              <SymbolView name="house.fill" tintColor={focused ? colors.accent : color} size={22} />
            ) : (
              <TabIcon name="home" label="Home" focused={focused} color={color} activeColor={colors.accent} activeBg={colors.accentLight} />
            ),
        }}
      />
      <Tabs.Screen
        name="favourites"
        options={{
          title: "Saved",
          tabBarIcon: ({ focused, color }) =>
            isIOS ? (
              <SymbolView name="heart.fill" tintColor={focused ? "#E8192C" : color} size={22} />
            ) : (
              <TabIcon name="heart" label="Saved" focused={focused} color={color} activeColor="#E8192C" activeBg="#FFEDEE" />
            ),
        }}
      />
      <Tabs.Screen
        name="sell"
        options={{
          title: "Sell",
          tabBarIcon: ({ focused }) => <SellTabIcon focused={focused} />,
          tabBarLabelStyle: {
            fontFamily: "Manrope_700Bold",
            fontSize: 10,
            color: "#0098AA",
            marginBottom: 5,
            marginTop: -2,
          },
        }}
      />
      <Tabs.Screen
        name="messages"
        options={{
          title: "Messages",
          tabBarIcon: ({ focused, color }) =>
            isIOS ? (
              <SymbolView name="message.fill" tintColor={focused ? "#7C3AED" : color} size={22} />
            ) : (
              <TabIcon name="message-circle" label="Messages" focused={focused} color={color} activeColor="#7C3AED" activeBg="#F3EEFF" />
            ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ focused, color }) =>
            isIOS ? (
              <SymbolView name="person.fill" tintColor={focused ? colors.accent : color} size={22} />
            ) : (
              <TabIcon name="user" label="Profile" focused={focused} color={color} activeColor={colors.accent} activeBg={colors.accentLight} />
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
