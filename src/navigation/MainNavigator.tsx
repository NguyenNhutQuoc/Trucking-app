// src/navigation/MainNavigator.tsx
// Material Design 3 Navigation Bar
import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import { Platform, View, StyleSheet } from "react-native";

import HomeScreen from "@/screens/home/HomeScreen";
import WeighingNavigator from "./WeighingNavigator";
import ReportsNavigator from "./ReportsNavigator";
import SettingsNavigator from "./SettingsNavigator";
import ManagementNavigator from "./ManagementNavigator";
import { useAppTheme } from "@/hooks/useAppTheme";
import { MainTabParamList } from "@/types/navigation.types";

const Tab = createBottomTabNavigator<MainTabParamList>();

// M3 Tab Bar Icon with Pill Indicator
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
    {/* M3 Pill Indicator */}
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

const MainNavigator: React.FC = () => {
  const { colors, isDarkMode } = useAppTheme();
  
  // M3 Navigation Bar colors
  const surfaceContainer = colors.surfaceContainer || (isDarkMode ? '#1D1B20' : '#F3EDF7');
  const indicatorColor = colors.primaryContainer || colors.primary + '25';
  const activeColor = colors.primary;
  const inactiveColor = colors.textSecondary || colors.gray600;

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: activeColor,
        tabBarInactiveTintColor: inactiveColor,
        tabBarStyle: {
          backgroundColor: colors.surface || colors.card,
          borderTopWidth: 0,
          // M3 Navigation Bar: 80dp height
          height: Platform.OS === "ios" ? 88 : 80,
          paddingTop: 12,
          paddingBottom: Platform.OS === "ios" ? 28 : 12,
          // M3 elevation
          elevation: 3,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
        },
        tabBarLabelStyle: {
          // M3 Label Medium
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
      <Tab.Screen
        name="Home"
        component={HomeScreen}
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

      <Tab.Screen
        name="WeighingList"
        component={WeighingNavigator}
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

      <Tab.Screen
        name="Reports"
        component={ReportsNavigator}
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

      <Tab.Screen
        name="Management"
        component={ManagementNavigator}
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

      <Tab.Screen
        name="Settings"
        component={SettingsNavigator}
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
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  iconContainer: {
    alignItems: "center",
    justifyContent: "center",
    width: 64,
    height: 32,
    position: "relative",
  },
  // M3 Pill Indicator: 64x32dp with 16dp corner radius
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

export default MainNavigator;
