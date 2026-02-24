// app/(main)/_layout.tsx
// Main group layout - Material Design 3 bottom tab navigator
import React from "react";
import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Platform, View, StyleSheet } from "react-native";

import { useAppTheme } from "@/hooks/useAppTheme";

interface TabIconProps {
  name: keyof typeof Ionicons.glyphMap;
  focusedName: keyof typeof Ionicons.glyphMap;
  focused: boolean;
  color: string;
  size: number;
  activeColor: string;
  indicatorColor: string;
}

const TabBarIcon: React.FC<TabIconProps> = ({
  name,
  focusedName,
  focused,
  color,
  size,
  activeColor,
  indicatorColor,
}) => (
  <View style={styles.iconContainer}>
    {focused && (
      <View style={[styles.pillIndicator, { backgroundColor: indicatorColor }]} />
    )}
    <Ionicons
      name={focused ? focusedName : name}
      size={focused ? size + 2 : size}
      color={focused ? activeColor : color}
      style={styles.icon}
    />
  </View>
);

export default function MainLayout() {
  const { colors, isDarkMode } = useAppTheme();

  const surfaceContainer =
    colors.surfaceContainer || (isDarkMode ? "#1D1B20" : "#F3EDF7");
  const indicatorColor = colors.primaryContainer || colors.primary + "25";
  const activeColor = colors.primary;
  const inactiveColor = colors.textSecondary || colors.gray600;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: activeColor,
        tabBarInactiveTintColor: inactiveColor,
        tabBarStyle: {
          backgroundColor: colors.surface || colors.card,
          borderTopWidth: 0,
          height: Platform.OS === "ios" ? 88 : 80,
          paddingTop: 12,
          paddingBottom: Platform.OS === "ios" ? 28 : 12,
          elevation: 3,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "500",
          marginTop: 4,
          letterSpacing: 0.5,
        },
        tabBarItemStyle: {
          paddingTop: 0,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarLabel: "Trang chủ",
          tabBarIcon: ({ color, size, focused }) => (
            <TabBarIcon
              name="home-outline"
              focusedName="home"
              focused={focused}
              color={color}
              size={size}
              activeColor={activeColor}
              indicatorColor={indicatorColor}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="(weighing)"
        options={{
          tabBarLabel: "Danh sách",
          tabBarIcon: ({ color, size, focused }) => (
            <TabBarIcon
              name="list-outline"
              focusedName="list"
              focused={focused}
              color={color}
              size={size}
              activeColor={activeColor}
              indicatorColor={indicatorColor}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="(reports)"
        options={{
          tabBarLabel: "Báo cáo",
          tabBarIcon: ({ color, size, focused }) => (
            <TabBarIcon
              name="bar-chart-outline"
              focusedName="bar-chart"
              focused={focused}
              color={color}
              size={size}
              activeColor={activeColor}
              indicatorColor={indicatorColor}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="(management)"
        options={{
          tabBarLabel: "Quản lý",
          tabBarIcon: ({ color, size, focused }) => (
            <TabBarIcon
              name="grid-outline"
              focusedName="grid"
              focused={focused}
              color={color}
              size={size}
              activeColor={activeColor}
              indicatorColor={indicatorColor}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="(settings)"
        options={{
          tabBarLabel: "Cài đặt",
          tabBarIcon: ({ color, size, focused }) => (
            <TabBarIcon
              name="settings-outline"
              focusedName="settings"
              focused={focused}
              color={color}
              size={size}
              activeColor={activeColor}
              indicatorColor={indicatorColor}
            />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  iconContainer: {
    alignItems: "center",
    justifyContent: "center",
    width: 64,
    height: 32,
    position: "relative",
  },
  pillIndicator: {
    position: "absolute",
    width: 64,
    height: 32,
    borderRadius: 16,
    top: 0,
    left: 0,
  },
  icon: {
    zIndex: 1,
  },
});
