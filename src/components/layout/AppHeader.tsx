// src/components/layout/AppHeader.tsx
import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
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
  const { tenantInfo, logout, getTenantDisplayName, getStationDisplayName } =
    useAuth();
  const { colors } = useAppTheme();

  const handleLogout = () => {
    Alert.alert("Đăng xuất", "Bạn có chắc chắn muốn đăng xuất không?", [
      {
        text: "Hủy",
        style: "cancel",
      },
      {
        text: "Đăng xuất",
        style: "destructive",
        onPress: async () => {
          try {
            await logout();
          } catch (error) {
            console.error("Logout error:", error);
          }
        },
      },
    ]);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.surface }]}>
      {/* Top row - Company and logout */}
      <View style={styles.topRow}>
        <View style={styles.leftSection}>
          <View style={styles.companyInfo}>
            <Text
              style={[styles.companyName, { color: colors.text }]}
              numberOfLines={1}
            >
              {getTenantDisplayName()}
            </Text>
            <Text
              style={[styles.companyCode, { color: colors.textSecondary }]}
              numberOfLines={1}
            >
              {tenantInfo?.khachHang?.maKhachHang}
            </Text>
          </View>
        </View>

        <View style={styles.rightSection}>
          {rightComponent && (
            <View style={styles.rightComponentContainer}>{rightComponent}</View>
          )}
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={20} color={colors.error} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Bottom row - Navigation and station */}
      <View style={styles.bottomRow}>
        <View style={styles.navSection}>
          {showBack && (
            <TouchableOpacity style={styles.backButton} onPress={onBackPress}>
              <Ionicons name="arrow-back" size={20} color={colors.text} />
            </TouchableOpacity>
          )}

          {title && (
            <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
          )}
        </View>

        {showStationSwitcher && (
          <View style={styles.stationSection}>
            <StationSwitcher showStationName={true} />
          </View>
        )}
      </View>

      {/* Divider */}
      <View style={[styles.divider, { backgroundColor: colors.border }]} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingTop: 8,
    paddingBottom: 8,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  leftSection: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  logo: {
    width: 32,
    height: 32,
    marginRight: 12,
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
  },
  bottomRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 8,
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
