// src/screens/settings/SettingsHomeScreen.tsx
import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Alert,
  Switch,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

import { useAuth } from "@/hooks/useAuth";
import { useAppTheme } from "@/hooks/useAppTheme";
import Header from "@/components/common/Header";
import Card from "@/components/common/Card";
import Button from "@/components/common/Button";
import colors from "@/constants/colors";
import { APP_VERSION, BUILD_NUMBER } from "@/constants/config";
import { SettingsStackScreenProps } from "@/types/navigation.types";

type NavigationProp = SettingsStackScreenProps<"SettingsHome">["navigation"];

const SettingsHomeScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const { userInfo, logout } = useAuth();
  const { colors, isDarkMode, toggleTheme } = useAppTheme();

  const [notificationsEnabled, setNotificationsEnabled] = React.useState(true);
  const [syncEnabled, setSyncEnabled] = React.useState(true);

  const renderSettingItem = (
    icon: string,
    title: string,
    screen: string,
    description?: string,
  ) => (
    <TouchableOpacity
      style={styles.settingItem}
      onPress={() => navigation.navigate(screen as any)}
    >
      <View
        style={[
          styles.settingIconContainer,
          { backgroundColor: colors.gray100 },
        ]}
      >
        <Ionicons name={icon as any} size={24} color={colors.primary} />
      </View>

      <View style={styles.settingContent}>
        <Text style={[styles.settingTitle, { color: colors.text }]}>
          {title}
        </Text>
        {description && (
          <Text
            style={[styles.settingDescription, { color: colors.textSecondary }]}
          >
            {description}
          </Text>
        )}
      </View>

      <Ionicons name="chevron-forward" size={20} color={colors.gray500} />
    </TouchableOpacity>
  );

  const renderSwitchItem = (
    icon: string,
    title: string,
    value: boolean,
    onValueChange: (value: boolean) => void,
    description?: string,
  ) => (
    <View style={styles.settingItem}>
      <View
        style={[
          styles.settingIconContainer,
          { backgroundColor: colors.gray100 },
        ]}
      >
        <Ionicons name={icon as any} size={24} color={colors.primary} />
      </View>

      <View style={styles.settingContent}>
        <Text style={[styles.settingTitle, { color: colors.text }]}>
          {title}
        </Text>
        {description && (
          <Text
            style={[styles.settingDescription, { color: colors.textSecondary }]}
          >
            {description}
          </Text>
        )}
      </View>

      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: colors.gray300, true: colors.primary + "70" }}
        thumbColor={value ? colors.primary : colors.gray100}
      />
    </View>
  );

  const handleLogout = () => {
    Alert.alert("Đăng xuất", "Bạn có chắc chắn muốn đăng xuất?", [
      { text: "Hủy", style: "cancel" },
      {
        text: "Đăng xuất",
        style: "destructive",
        onPress: () => logout(),
      },
    ]);
  };

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: colors.background }]}
    >
      <Header title="Cài Đặt" />

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
      >
        <Card style={styles.profileCard}>
          <View style={styles.profileSection}>
            <View
              style={[
                styles.profileAvatar,
                { backgroundColor: colors.primary + "15" },
              ]}
            >
              <Ionicons name="person" size={40} color={colors.primary} />
            </View>

            <View style={styles.profileInfo}>
              <Text style={[styles.profileName, { color: colors.text }]}>
                {userInfo?.tenNV || "User"}
              </Text>
              <Text
                style={[styles.profileRole, { color: colors.textSecondary }]}
              >
                {userInfo?.type === 1 ? "Quản trị viên" : "Nhân viên"}
              </Text>
            </View>
          </View>

          <Button
            title="Quản lý tài khoản"
            variant="outline"
            onPress={() => navigation.navigate("AccountSettings")}
            icon={
              <Ionicons
                name="settings-outline"
                size={18}
                color={colors.primary}
              />
            }
          />
        </Card>

        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Cài đặt ứng dụng
        </Text>

        <Card style={styles.settingsCard}>
          {renderSettingItem(
            "print-outline",
            "Cài đặt máy in",
            "PrintSettings",
            "Kết nối và cấu hình máy in",
          )}

          {renderSettingItem(
            "hardware-chip-outline",
            "Cài đặt thiết bị cân",
            "DeviceSettings",
            "Kết nối và cấu hình thiết bị cân",
          )}

          {renderSettingItem(
            "sync-outline",
            "Đồng bộ dữ liệu",
            "SyncSettings",
            "Quản lý đồng bộ hóa dữ liệu",
          )}

          {renderSettingItem(
            "color-palette-outline",
            "Giao diện",
            "UISettings",
            "Cài đặt giao diện người dùng",
          )}

          {renderSettingItem(
            "notifications-outline",
            "Thông báo",
            "Notifications",
            "Quản lý thông báo",
          )}
        </Card>

        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Tùy chọn nhanh
        </Text>

        <Card style={styles.settingsCard}>
          {renderSwitchItem(
            "notifications-outline",
            "Thông báo",
            notificationsEnabled,
            setNotificationsEnabled,
            "Bật/tắt thông báo từ ứng dụng",
          )}

          {renderSwitchItem(
            "sync-outline",
            "Tự động đồng bộ",
            syncEnabled,
            setSyncEnabled,
            "Đồng bộ dữ liệu tự động khi có kết nối mạng",
          )}

          {renderSwitchItem(
            "moon-outline",
            "Chế độ tối",
            isDarkMode,
            toggleTheme,
            "Thay đổi chế độ hiển thị sang tối",
          )}
        </Card>

        <Text style={[styles.sectionTitle, { color: colors.text }]}>Khác</Text>

        <Card style={styles.settingsCard}>
          <TouchableOpacity style={styles.settingItem} onPress={() => {}}>
            <View
              style={[
                styles.settingIconContainer,
                { backgroundColor: colors.gray100 },
              ]}
            >
              <Ionicons
                name="help-circle-outline"
                size={24}
                color={colors.primary}
              />
            </View>

            <View style={styles.settingContent}>
              <Text style={[styles.settingTitle, { color: colors.text }]}>
                Trợ giúp & Hỗ trợ
              </Text>
            </View>

            <Ionicons name="chevron-forward" size={20} color={colors.gray500} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingItem} onPress={() => {}}>
            <View
              style={[
                styles.settingIconContainer,
                { backgroundColor: colors.gray100 },
              ]}
            >
              <Ionicons
                name="document-text-outline"
                size={24}
                color={colors.primary}
              />
            </View>

            <View style={styles.settingContent}>
              <Text style={[styles.settingTitle, { color: colors.text }]}>
                Điều khoản & Quy định
              </Text>
            </View>

            <Ionicons name="chevron-forward" size={20} color={colors.gray500} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingItem} onPress={() => {}}>
            <View
              style={[
                styles.settingIconContainer,
                { backgroundColor: colors.gray100 },
              ]}
            >
              <Ionicons
                name="information-circle-outline"
                size={24}
                color={colors.primary}
              />
            </View>

            <View style={styles.settingContent}>
              <Text style={[styles.settingTitle, { color: colors.text }]}>
                Thông tin ứng dụng
              </Text>
              <Text
                style={[
                  styles.settingDescription,
                  { color: colors.textSecondary },
                ]}
              >
                Phiên bản {APP_VERSION} (Build {BUILD_NUMBER})
              </Text>
            </View>
          </TouchableOpacity>
        </Card>

        <View style={styles.logoutButtonContainer}>
          <Button
            title="Đăng xuất"
            variant="outline"
            contentStyle={{ ...styles.logoutButton, borderColor: colors.error }}
            onPress={handleLogout}
            icon={
              <Ionicons name="log-out-outline" size={18} color={colors.error} />
            }
            textStyle={{ color: colors.error }}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  profileCard: {
    marginBottom: 20,
  },
  profileSection: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  profileAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 4,
  },
  profileRole: {
    fontSize: 14,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginTop: 8,
    marginBottom: 12,
  },
  settingsCard: {
    padding: 0,
    marginBottom: 20,
    overflow: "hidden",
  },
  settingItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.1)", // This will be managed by Card component
  },
  settingIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 14,
    fontWeight: "500",
  },
  settingDescription: {
    fontSize: 12,
    marginTop: 2,
  },
  logoutButtonContainer: {
    marginTop: 8,
  },
  logoutButton: {
    borderColor: colors.error,
  },
});

export default SettingsHomeScreen;
