// ===============================================================
// src/screens/settings/SettingsHomeScreen.tsx - Fixed Layout
// ===============================================================

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

import { useAuth } from "@/hooks/useAuth";
import { useAppTheme } from "@/hooks/useAppTheme";
import { useNavigationHandler } from "@/hooks/useNavigationHandler";
import Header from "@/components/common/Header";
import Card from "@/components/common/Card";
import Button from "@/components/common/Button";
import UnderDevelopmentModal from "@/components/common/UnderDevelopmentModal";
import { APP_VERSION, BUILD_NUMBER } from "@/constants/config";
import ThemedView from "@components/common/ThemedView";

const SettingsHomeScreen: React.FC = () => {
  const { userInfo, logout } = useAuth();
  const { colors, isDarkMode, toggleTheme } = useAppTheme();
  const {
    safeNavigate,
    showModalVersion,
    showModal,
    currentFeature,
    currentMessage,
    closeModal,
  } = useNavigationHandler();

  const [notificationsEnabled, setNotificationsEnabled] = React.useState(true);
  const [syncEnabled, setSyncEnabled] = React.useState(true);

  const settingItems = [
    {
      icon: "print-outline",
      title: "Cài đặt máy in",
      screen: "PrintSettings",
      development: true,
      description: "Kết nối và cấu hình máy in",
      detailDescription:
        "Module cài đặt máy in đang được phát triển:\n\n• Kết nối với máy in nhiệt\n• Cấu hình template in phiếu\n• Thiết lập kích thước giấy\n• In thử và kiểm tra chất lượng\n• Quản lý hàng đợi in\n\nTính năng sẽ hỗ trợ đa dạng loại máy in trong bản cập nhật tiếp theo.",
    },
    {
      icon: "hardware-chip-outline",
      title: "Cài đặt thiết bị cân",
      screen: "DeviceSettings",
      development: true,
      description: "Kết nối và cấu hình thiết bị cân",
      detailDescription:
        "Hệ thống kết nối thiết bị cân đang được xây dựng:\n\n• Kết nối serial/ethernet với cân\n• Hiệu chuẩn và kiểm định cân\n• Cài đặt thông số kỹ thuật\n• Giám sát trạng thái thiết bị\n• Cảnh báo lỗi và bảo trì\n\nHỗ trợ nhiều loại cân điện tử khác nhau.",
    },
    {
      icon: "sync-outline",
      title: "Đồng bộ dữ liệu",
      screen: "SyncSettings",
      development: true,
      description: "Quản lý đồng bộ hóa dữ liệu",
      detailDescription:
        "Tính năng đồng bộ dữ liệu tiên tiến:\n\n• Đồng bộ tự động với cloud\n• Backup dữ liệu định kỳ\n• Khôi phục dữ liệu khi cần\n• Đồng bộ đa thiết bị\n• Conflict resolution\n• Offline mode support\n\nĐảm bảo dữ liệu luôn được an toàn và đồng nhất.",
    },
    {
      icon: "color-palette-outline",
      title: "Giao diện",
      screen: "UISettings",
      development: true,
      description: "Cài đặt giao diện người dùng",
      detailDescription:
        "Module tùy chỉnh giao diện đang phát triển:\n\n• Thay đổi theme màu sắc\n• Tùy chỉnh font size\n• Layout preferences\n• Widget customization\n• Accessibility options\n• Language settings\n\nCho phép người dùng cá nhân hóa trải nghiệm sử dụng.",
    },
    {
      icon: "notifications-outline",
      title: "Thông báo",
      screen: "Notifications",
      development: true,
      description: "Quản lý thông báo",
      detailDescription:
        "Hệ thống thông báo thông minh:\n\n• Push notifications\n• Email alerts\n• SMS notifications\n• Thông báo theo thời gian\n• Phân loại mức độ ưu tiên\n• Lọc và tùy chỉnh nội dung\n\nGiúp người dùng không bỏ lỡ thông tin quan trọng.",
    },
  ];

  const renderSettingItem = (item: (typeof settingItems)[0]) => {
    const isDevelopment = item.development;

    return (
      <TouchableOpacity
        key={item.screen}
        style={[
          styles.settingItem,
          isDevelopment && {
            backgroundColor: colors.warning + "05",
            borderLeftWidth: 3,
            borderLeftColor: colors.warning + "50",
          },
        ]}
        onPress={() => {
          if (isDevelopment) {
            showModalVersion(
              item.title,
              item.detailDescription || item.description,
            );
          } else {
            safeNavigate(item.screen, undefined, true, item.title);
          }
        }}
      >
        <View
          style={[
            styles.settingIconContainer,
            {
              backgroundColor: isDevelopment
                ? colors.warning + "15"
                : colors.gray100,
            },
          ]}
        >
          <Ionicons
            name={item.icon as any}
            size={24}
            color={isDevelopment ? colors.warning : colors.primary}
          />

          {isDevelopment && (
            <View style={styles.devOverlay}>
              <Ionicons name="construct" size={10} color={colors.warning} />
            </View>
          )}
        </View>

        <View style={styles.settingContent}>
          <View style={styles.titleRow}>
            <Text
              style={[
                styles.settingTitle,
                {
                  color: isDevelopment ? colors.text + "80" : colors.text,
                },
              ]}
            >
              {item.title}
            </Text>
            {isDevelopment && (
              <View
                style={[styles.devBadge, { backgroundColor: colors.warning }]}
              >
                <Text style={styles.devBadgeText}>DEV</Text>
              </View>
            )}
          </View>
          <Text
            style={[
              styles.settingDescription,
              { color: isDevelopment ? colors.warning : colors.textSecondary },
            ]}
          >
            {isDevelopment ? "Đang phát triển" : item.description}
          </Text>
        </View>

        <Ionicons
          name="chevron-forward"
          size={16}
          color={colors.gray500}
        />
      </TouchableOpacity>
    );
  };

  const renderSwitchItem = (
    icon: string,
    title: string,
    value: boolean,
    onValueChange: (value: boolean) => void,
    description: string,
  ) => {
    return (
      <View style={styles.switchItem}>
        <View style={styles.switchLeft}>
          <View style={[styles.switchIcon, { backgroundColor: colors.primary + "15" }]}>
            <Ionicons name={icon as any} size={20} color={colors.primary} />
          </View>
          <View style={styles.switchContent}>
            <Text style={[styles.switchTitle, { color: colors.text }]}>
              {title}
            </Text>
            <Text style={[styles.switchDescription, { color: colors.textSecondary }]}>
              {description}
            </Text>
          </View>
        </View>
        <Switch
          value={value}
          onValueChange={onValueChange}
          trackColor={{ false: colors.gray300, true: colors.primary + "40" }}
          thumbColor={value ? colors.primary : colors.gray100}
        />
      </View>
    );
  };

  const handleAccountSettings = () => {
    showModalVersion(
      "Quản lý tài khoản",
      "Tính năng quản lý tài khoản cá nhân đang được phát triển:\n\n• Thay đổi thông tin cá nhân\n• Đổi mật khẩu\n• Cài đặt bảo mật\n• Lịch sử hoạt động\n• Quản lý phiên đăng nhập\n• Two-factor authentication\n\nGiúp người dùng quản lý tài khoản một cách an toàn và tiện lợi.",
    );
  };

  const handleHelp = () => {
    showModalVersion(
      "Trợ giúp & Hỗ trợ",
      "Hệ thống trợ giúp tích hợp đang được xây dựng:\n\n• FAQ tương tác\n• Video hướng dẫn\n• Chat support trực tuyến\n• Ticket hỗ trợ kỹ thuật\n• Knowledge base\n• Community forum\n\nCung cấp hỗ trợ toàn diện cho người dùng 24/7.",
    );
  };

  const handleTerms = () => {
    showModalVersion(
      "Điều khoản & Quy định",
      "Trang điều khoản và quy định đang được chuẩn bị:\n\n• Điều khoản sử dụng\n• Chính sách bảo mật\n• Quy định về dữ liệu\n• Bản quyền và sở hữu trí tuệ\n• Chính sách cookie\n• Quy trình khiếu nại\n\nĐảm bảo tuân thủ các quy định pháp lý hiện hành.",
    );
  };

  const handleAppInfo = () => {
    showModalVersion(
      "Thông tin ứng dụng",
      "Trang thông tin chi tiết về ứng dụng:\n\n• Lịch sử phiên bản\n• Release notes\n• Credits và acknowledgments\n• Open source licenses\n• Thống kê sử dụng\n• Feedback và đánh giá\n\nHiện tại đang chạy phiên bản " +
        APP_VERSION +
        " (Build " +
        BUILD_NUMBER +
        ")",
    );
  };

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
    <ThemedView style={styles.safeArea} useSafeArea>
      <Header title="Cài đặt" showBack />

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Card */}
        <Card style={styles.profileCard}>
          <View style={styles.profileSection}>
            <View style={[styles.profileAvatar, { backgroundColor: colors.primary + "15" }]}>
              <Ionicons name="person" size={40} color={colors.primary} />
            </View>

            <View style={styles.profileInfo}>
              <Text style={[styles.profileName, { color: colors.text }]}>
                {userInfo?.hoTen || "User"}
              </Text>
              <Text style={[styles.profileRole, { color: colors.textSecondary }]}>
                {userInfo?.vaiTro === "QUAN_TRI" ? "Quản trị viên" : "Nhân viên"}
              </Text>
            </View>
          </View>

          <TouchableOpacity
            style={[
              styles.accountButton,
              {
                backgroundColor: colors.warning + "08",
                borderColor: colors.warning + "30",
                borderWidth: 1,
                borderStyle: "dashed" as const,
              },
            ]}
            onPress={handleAccountSettings}
          >
            <View style={styles.accountButtonContent}>
              <View style={[styles.devBadge, { backgroundColor: colors.warning }]}>
                <Text style={styles.devBadgeText}>DEV</Text>
              </View>
              <Ionicons
                name="settings-outline"
                size={18}
                color={colors.warning}
                style={styles.accountButtonIcon}
              />
              <Text style={[styles.accountButtonText, { color: colors.warning }]}>
                Quản lý tài khoản
              </Text>
            </View>
          </TouchableOpacity>
        </Card>

        {/* App Settings */}
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Cài đặt ứng dụng
        </Text>
        <Card style={styles.settingsCard}>
          {settingItems.map(renderSettingItem)}
        </Card>

        {/* Quick Settings */}
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
            isDarkMode ? "sunny-outline" : "moon-outline",
            "Chế độ tối",
            isDarkMode,
            toggleTheme,
            "Thay đổi chế độ hiển thị sang tối",
          )}
        </Card>

        {/* Other Settings */}
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Khác
        </Text>
        <Card style={styles.settingsCard}>
          <TouchableOpacity
            style={[
              styles.settingItem,
              {
                backgroundColor: colors.warning + "05",
                borderLeftWidth: 3,
                borderLeftColor: colors.warning + "50",
              },
            ]}
            onPress={handleHelp}
          >
            <View style={[styles.settingIconContainer, { backgroundColor: colors.warning + "15" }]}>
              <Ionicons name="help-circle-outline" size={24} color={colors.warning} />
            </View>
            <View style={styles.settingContent}>
              <View style={styles.titleRow}>
                <Text style={[styles.settingTitle, { color: colors.text + "80" }]}>
                  Trợ giúp & Hỗ trợ
                </Text>
                <View style={[styles.devBadge, { backgroundColor: colors.warning }]}>
                  <Text style={styles.devBadgeText}>DEV</Text>
                </View>
              </View>
              <Text style={[styles.settingDescription, { color: colors.warning }]}>
                Đang phát triển
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={colors.gray500} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.settingItem,
              {
                backgroundColor: colors.warning + "05",
                borderLeftWidth: 3,
                borderLeftColor: colors.warning + "50",
              },
            ]}
            onPress={handleTerms}
          >
            <View style={[styles.settingIconContainer, { backgroundColor: colors.warning + "15" }]}>
              <Ionicons name="document-text-outline" size={24} color={colors.warning} />
            </View>
            <View style={styles.settingContent}>
              <View style={styles.titleRow}>
                <Text style={[styles.settingTitle, { color: colors.text + "80" }]}>
                  Điều khoản & Quy định
                </Text>
                <View style={[styles.devBadge, { backgroundColor: colors.warning }]}>
                  <Text style={styles.devBadgeText}>DEV</Text>
                </View>
              </View>
              <Text style={[styles.settingDescription, { color: colors.warning }]}>
                Đang phát triển
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={colors.gray500} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.settingItem,
              {
                backgroundColor: colors.warning + "05",
                borderLeftWidth: 3,
                borderLeftColor: colors.warning + "50",
              },
            ]}
            onPress={handleAppInfo}
          >
            <View style={[styles.settingIconContainer, { backgroundColor: colors.warning + "15" }]}>
              <Ionicons name="information-circle-outline" size={24} color={colors.warning} />
            </View>
            <View style={styles.settingContent}>
              <View style={styles.titleRow}>
                <Text style={[styles.settingTitle, { color: colors.text + "80" }]}>
                  Thông tin ứng dụng
                </Text>
                <View style={[styles.devBadge, { backgroundColor: colors.warning }]}>
                  <Text style={styles.devBadgeText}>DEV</Text>
                </View>
              </View>
              <Text style={[styles.settingDescription, { color: colors.textSecondary + "80" }]}>
                Phiên bản {APP_VERSION} (Build {BUILD_NUMBER})
              </Text>
              <Text style={[styles.devStatus, { color: colors.warning }]}>
                Đang phát triển
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={colors.gray500} />
          </TouchableOpacity>
        </Card>

        {/* Logout Button */}
        <View style={styles.logoutButtonContainer}>
          <Button
            title="Đăng xuất"
            variant="outline"
            contentStyle={{ ...styles.logoutButton, borderColor: colors.error }}
            onPress={handleLogout}
            icon={<Ionicons name="log-out-outline" size={18} color={colors.error} />}
            textStyle={{ color: colors.error }}
          />
        </View>
      </ScrollView>

      <UnderDevelopmentModal
        visible={showModal}
        onClose={closeModal}
        featureName={currentFeature}
        message={currentMessage}
      />
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  // ✅ FIXED: Better content spacing to account for fixed header
  content: {
    padding: 16,
    paddingTop: 8, // Reduced since header now has proper spacing
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
  accountButton: {
    borderRadius: 8,
    padding: 12,
  },
  accountButtonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  accountButtonIcon: {
    marginRight: 8,
  },
  accountButtonText: {
    fontSize: 14,
    fontWeight: "500",
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
    borderBottomColor: "rgba(0,0,0,0.1)",
  },
  settingIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
    position: "relative",
  },
  devOverlay: {
    position: "absolute",
    bottom: -2,
    right: -2,
    backgroundColor: "white",
    borderRadius: 6,
    padding: 1,
  },
  settingContent: {
    flex: 1,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  settingTitle: {
    fontSize: 14,
    fontWeight: "500",
    flex: 1,
  },
  settingDescription: {
    fontSize: 12,
    marginTop: 2,
  },
  devBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    marginLeft: 8,
  },
  devBadgeText: {
    fontSize: 9,
    fontWeight: "700",
    color: "white",
    letterSpacing: 0.5,
  },
  devStatus: {
    fontSize: 10,
    fontWeight: "500",
    marginTop: 2,
  },

  // ✅ IMPROVED: Switch items styling
  switchItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.1)",
  },
  switchLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  switchIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  switchContent: {
    flex: 1,
  },
  switchTitle: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 2,
  },
  switchDescription: {
    fontSize: 12,
  },

  logoutButtonContainer: {
    marginTop: 8,
  },
  logoutButton: {
    // borderColor will be set dynamically
  },
});

export default SettingsHomeScreen;