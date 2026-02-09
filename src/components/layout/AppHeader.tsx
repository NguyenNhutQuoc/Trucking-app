// =====================================================
// src/components/layout/AppHeader.tsx - COMPLETE Dark Mode Fix
// =====================================================

import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Platform,
  StatusBar,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "@/hooks/useAuth";
import { useAppTheme } from "@/hooks/useAppTheme";
import StationSwitcher from "@/components/station/StationSwitcher";

interface AppHeaderProps {
  title?: string;
  showBack?: boolean;
  onBackPress?: () => void;
  showStationSwitcher?: boolean;
  rightComponent?: React.ReactNode;
}

const AppHeader: React.FC<AppHeaderProps> = ({
  title,
  showBack = false,
  onBackPress,
  showStationSwitcher = true,
  rightComponent,
}) => {
  const { tenantInfo, logout, logoutStationUser, getTenantDisplayName } =
    useAuth();
  const { colors, isDarkMode } = useAppTheme();

  const handleLogout = () => {
    Alert.alert(
      "Đăng xuất",
      "Bạn muốn đăng xuất ở mức nào?",
      [
        { text: "Hủy", style: "cancel" },
        {
          text: "Đăng xuất",
          onPress: () => {
            logoutStationUser().catch((error) =>
              console.error("Logout error:", error),
            );
          },
        },
        {
          text: "Đăng xuất hoàn toàn",
          style: "destructive",
          onPress: () => {
            logout().catch((error) => console.error("Logout error:", error));
          },
        },
      ],
      {
        userInterfaceStyle: isDarkMode ? "dark" : "light",
      },
    );
  };

  // ✅ FIXED: Ensure we're using the correct surface color
  const headerBackgroundColor =
    colors.surface || (isDarkMode ? "#1E1E1E" : "#FFFFFF");
  const headerTextColor = colors.text || (isDarkMode ? "#E9ECEF" : "#212529");
  const secondaryTextColor =
    colors.textSecondary || (isDarkMode ? "#ADB5BD" : "#868E96");
  const borderColor = colors.border || (isDarkMode ? "#343A40" : "#E9ECEF");

  return (
    <>
      {/* ✅ FIXED: Proper status bar handling */}
      <StatusBar
        backgroundColor={headerBackgroundColor}
        barStyle={isDarkMode ? "light-content" : "dark-content"}
        translucent={false}
      />

      <View
        style={[
          styles.container,
          {
            backgroundColor: headerBackgroundColor,
            borderBottomWidth: 1,
            borderBottomColor: borderColor,
            shadowColor: isDarkMode ? "#000" : "#000",
            shadowOpacity: isDarkMode ? 0.3 : 0.1,
          },
        ]}
      >
        {/* ✅ FIXED: Top row with explicit colors */}
        <View style={styles.topRow}>
          <View style={styles.leftSection}>
            <View style={styles.companyInfo}>
              <Text
                style={[styles.companyName, { color: headerTextColor }]}
                numberOfLines={1}
              >
                {getTenantDisplayName()}
              </Text>
              <Text
                style={[styles.companyCode, { color: secondaryTextColor }]}
                numberOfLines={1}
              >
                {tenantInfo?.khachHang?.maKhachHang}
              </Text>
            </View>
          </View>

          <View style={styles.rightSection}>
            {rightComponent && (
              <View style={styles.rightComponentContainer}>
                {rightComponent}
              </View>
            )}
            <TouchableOpacity
              style={[
                styles.logoutButton,
                {
                  backgroundColor: isDarkMode
                    ? colors.error + "20"
                    : colors.error + "10",
                },
              ]}
              onPress={handleLogout}
            >
              <Ionicons name="log-out-outline" size={20} color={colors.error} />
            </TouchableOpacity>
          </View>
        </View>

        {/* ✅ FIXED: Bottom row with explicit colors */}
        <View style={styles.bottomRow}>
          <View style={styles.navSection}>
            {showBack && (
              <TouchableOpacity
                style={[
                  styles.backButton,
                  {
                    backgroundColor: isDarkMode
                      ? "rgba(255,255,255,0.1)"
                      : "rgba(0,0,0,0.05)",
                  },
                ]}
                onPress={onBackPress}
              >
                <Ionicons name="arrow-back" size={20} color={headerTextColor} />
              </TouchableOpacity>
            )}

            {title && (
              <Text style={[styles.title, { color: headerTextColor }]}>
                {title}
              </Text>
            )}
          </View>

          {showStationSwitcher && (
            <View style={styles.stationSection}>
              <StationSwitcher showStationName={true} isActivated={true} />
            </View>
          )}
        </View>

        {/* ✅ FIXED: Divider with explicit color */}
        <View
          style={[
            styles.divider,
            {
              backgroundColor: borderColor,
              opacity: 0.5,
            },
          ]}
        />
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    // ✅ FIXED: Better status bar handling
    paddingTop:
      Platform.OS === "ios" ? 44 : (StatusBar.currentHeight || 24) + 8,
    paddingBottom: 8,
    elevation: 3,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 3,
    zIndex: 1000, // ✅ FIXED: Ensure header is above other content
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    minHeight: 56, // ✅ FIXED: Ensure consistent height
  },
  leftSection: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  companyInfo: {
    flex: 1,
  },
  companyName: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 2,
  },
  companyCode: {
    fontSize: 12,
    fontWeight: "500",
    opacity: 0.8,
  },
  rightSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  rightComponentContainer: {
    marginRight: 8,
  },
  logoutButton: {
    padding: 8,
    borderRadius: 8,
    minWidth: 36,
    minHeight: 36,
    justifyContent: "center",
    alignItems: "center",
  },
  bottomRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 10,
    minHeight: 48, // ✅ FIXED: Ensure consistent height
  },
  navSection: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  backButton: {
    padding: 8,
    marginRight: 8,
    borderRadius: 8,
    minWidth: 36,
    minHeight: 36,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    flex: 1,
  },
  stationSection: {
    marginLeft: 16,
  },
  divider: {
    height: 1,
    marginHorizontal: 16,
    marginTop: 8,
  },
});

export default AppHeader;
