// src/screens/management/ManagementHomeScreen.tsx - Updated with Dev Badges
import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { useAppTheme } from "@/hooks/useAppTheme";
import { useNavigationHandler } from "@/hooks/useNavigationHandler";
import Header from "@/components/common/Header";
import ThemedView from "@/components/common/ThemedView";
import ThemedText from "@/components/common/ThemedText";
import UnderDevelopmentModal from "@/components/common/UnderDevelopmentModal";
import { ManagementStackScreenProps } from "@/types/navigation.types";

type NavigationProp =
  ManagementStackScreenProps<"ManagementHome">["navigation"];

const ManagementHomeScreen: React.FC = () => {
  const { colors } = useAppTheme();
  const {
    safeNavigate,
    showModalVersion,
    showModal,
    currentFeature,
    currentMessage,
    closeModal,
  } = useNavigationHandler();

  const menuItems = [
    {
      id: "vehicles",
      title: "Quản lý xe",
      icon: "car-outline",
      color: colors.primary,
      screen: "VehicleList",
      description: "Quản lý danh sách xe và thông tin trọng lượng",
    },
    {
      id: "companies",
      title: "Quản lý Khách Hàng",
      icon: "business-outline",
      color: colors.chartBlue,
      screen: "CompanyList",
      description: "Quản lý thông tin khách hàng và đối tác",
    },
    {
      id: "products",
      title: "Quản lý hàng hóa",
      icon: "cube-outline",
      color: colors.chartGreen,
      screen: "ProductList",
      description: "Quản lý danh mục hàng hóa và đơn giá",
    },
    {
      id: "users",
      title: "Quản lý người dùng",
      icon: "people-outline",
      color: colors.chartOrange,
      screen: "UserList",
      description:
        "Quản lý tài khoản người dùng hệ thống đang được phát triển. Bao gồm tạo, sửa, xóa và phân quyền người dùng.",
    },
    {
      id: "permissions",
      title: "Phân quyền",
      icon: "lock-closed-outline",
      color: colors.chartRed,
      screen: "PermissionList",
      development: true,
      description:
        "Hệ thống phân quyền chi tiết đang được xây dựng. Cho phép thiết lập quyền truy cập theo từng chức năng và module.",
    },
    {
      id: "backups",
      title: "Sao lưu & Phục hồi",
      icon: "cloud-upload-outline",
      color: colors.chartCyan,
      screen: "BackupRestore",
      development: true,
      description:
        "Tính năng sao lưu tự động và phục hồi dữ liệu đang được phát triển. Hỗ trợ backup theo lịch và cloud storage.",
    },
    {
      id: "system",
      title: "Cấu hình hệ thống",
      icon: "settings-outline",
      color: colors.chartTeal,
      screen: "SystemConfig",
      development: true,
      description:
        "Module cấu hình hệ thống tổng thể đang được hoàn thiện. Bao gồm cài đặt máy in, thiết bị cân và tham số hệ thống.",
    },
    {
      id: "reports",
      title: "Báo cáo quản trị",
      icon: "bar-chart-outline",
      color: colors.chartPurple,
      screen: "Reports",
      description:
        "Báo cáo dành cho quản trị viên đang được phát triển. Thống kê hoạt động người dùng, hiệu suất hệ thống và audit logs.",
    },
    {
      id: "maintenance",
      title: "Bảo trì hệ thống",
      icon: "construct-outline",
      color: colors.warning,
      screen: "SystemMaintenance",
      development: true,
      description:
        "Công cụ bảo trì và kiểm tra sức khỏe hệ thống đang được xây dựng. Bao gồm cleanup data, optimize performance.",
    },
  ];

  const handleMenuPress = (item: (typeof menuItems)[0]) => {
    if (item.development) {
      showModalVersion(item.title, item.description);
    } else {
      safeNavigate(item.screen, undefined, true, item.title);
    }
  };

  const renderMenuItem = (item: (typeof menuItems)[0], index: number) => {
    const isDevelopment = item.development;

    return (
      <TouchableOpacity
        key={item.id}
        style={[
          styles.menuItem,
          {
            backgroundColor: isDevelopment
              ? colors.warning + "08"
              : colors.card,
          },
          isDevelopment && {
            borderWidth: 1,
            borderColor: colors.warning + "30",
            borderStyle: "dashed",
          },
        ]}
        onPress={() => handleMenuPress(item)}
      >
        {/* Development Badge */}
        {isDevelopment && (
          <View style={[styles.devBadge, { backgroundColor: colors.warning }]}>
            <Text style={styles.devBadgeText}>DEV</Text>
          </View>
        )}

        <View
          style={[
            styles.iconContainer,
            {
              backgroundColor: isDevelopment
                ? item.color + "20"
                : item.color + "15",
            },
          ]}
        >
          <Ionicons
            name={item.icon as any}
            size={28}
            color={isDevelopment ? item.color + "80" : item.color}
          />

          {/* Development overlay icon */}
          {isDevelopment && (
            <View style={styles.devOverlay}>
              <Ionicons name="construct" size={12} color={colors.warning} />
            </View>
          )}
        </View>

        <View style={styles.textContainer}>
          <ThemedText
            style={[
              styles.menuItemText,
              isDevelopment
                ? { color: colors.text + "80" }
                : { color: colors.text },
            ]}
          >
            {item.title}
          </ThemedText>

          {isDevelopment && (
            <Text style={[styles.devStatus, { color: colors.warning }]}>
              Đang phát triển
            </Text>
          )}
        </View>

        {/* Arrow indicator */}
        <View style={styles.arrowContainer}>
          <Ionicons
            name={
              isDevelopment ? "information-circle-outline" : "chevron-forward"
            }
            size={16}
            color={isDevelopment ? colors.warning : colors.gray500}
          />
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <ThemedView useSafeArea>
      <Header title="Quản Lý" showBack />

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
      >
        <ThemedText type="title" style={styles.sectionTitle}>
          Chọn mục quản lý
        </ThemedText>

        <View style={styles.infoCard}>
          <View style={styles.legendContainer}>
            <View style={styles.legendItem}>
              <View
                style={[styles.legendIcon, { backgroundColor: colors.success }]}
              />
              <Text
                style={[styles.legendText, { color: colors.textSecondary }]}
              >
                Sẵn sàng sử dụng
              </Text>
            </View>
            <View style={styles.legendItem}>
              <View
                style={[styles.legendIcon, { backgroundColor: colors.warning }]}
              />
              <Text
                style={[styles.legendText, { color: colors.textSecondary }]}
              >
                Đang phát triển
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.menuGrid}>
          {menuItems.map((item, index) => renderMenuItem(item, index))}
        </View>
      </ScrollView>

      {/* Under Development Modal */}
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
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 16,
  },
  infoCard: {
    backgroundColor: "rgba(92, 124, 250, 0.05)",
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
  },
  legendContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  legendIcon: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  legendText: {
    fontSize: 12,
    fontWeight: "500",
  },
  menuGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  menuItem: {
    width: "48%",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    position: "relative",
  },
  devBadge: {
    position: "absolute",
    top: 8,
    right: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    zIndex: 1,
  },
  devBadgeText: {
    fontSize: 9,
    fontWeight: "700",
    color: "white",
    letterSpacing: 0.5,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
    position: "relative",
  },
  devOverlay: {
    position: "absolute",
    bottom: -2,
    right: -2,
    backgroundColor: "white",
    borderRadius: 8,
    padding: 2,
  },
  textContainer: {
    alignItems: "center",
    minHeight: 40,
  },
  menuItemText: {
    fontSize: 14,
    fontWeight: "500",
    textAlign: "center",
    lineHeight: 18,
  },
  devStatus: {
    fontSize: 10,
    fontWeight: "500",
    marginTop: 2,
    textAlign: "center",
  },
  arrowContainer: {
    position: "absolute",
    bottom: 8,
    right: 8,
  },
});

export default ManagementHomeScreen;
