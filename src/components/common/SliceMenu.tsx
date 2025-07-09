// src/components/common/SliceMenu.tsx - Fixed Layout Issues
import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Animated,
  Dimensions,
  SafeAreaView,
  ScrollView,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { useAuth } from "@/hooks/useAuth";
import { useAppTheme } from "@/hooks/useAppTheme";
import { useNavigationHandler } from "@/hooks/useNavigationHandler";
import UnderDevelopmentModal from "@/components/common/UnderDevelopmentModal";
import { APP_NAME, APP_VERSION } from "@/constants/config";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const MENU_WIDTH = SCREEN_WIDTH * 0.8;

interface SlideMenuProps {
  visible: boolean;
  onClose: () => void;
}

interface MenuItem {
  id: string;
  title: string;
  icon: string;
  screen?: string;
  action?: () => void;
  divider?: boolean;
  developmentFeature?: boolean;
}

const SlideMenu: React.FC<SlideMenuProps> = ({ visible, onClose }) => {
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

  const slideAnim = React.useRef(new Animated.Value(-MENU_WIDTH)).current;
  const overlayOpacity = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(overlayOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: -MENU_WIDTH,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(overlayOpacity, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  const handleLogout = () => {
    Alert.alert("Đăng xuất", "Bạn có chắc chắn muốn đăng xuất?", [
      { text: "Hủy", style: "cancel" },
      {
        text: "Đăng xuất",
        style: "destructive",
        onPress: () => {
          onClose();
          logout();
        },
      },
    ]);
  };

  const navigateToScreen = (screenName: string, featureName?: string) => {
    onClose();
    safeNavigate(screenName, undefined, true, featureName);
  };

  const handleDevelopmentFeature = (
    featureName: string,
    description: string,
  ) => {
    onClose();
    showModalVersion(featureName, description);
  };

  const handleSyncData = () => {
    onClose();
    showModalVersion(
      "Đồng bộ dữ liệu",
      "Chức năng đồng bộ dữ liệu tự động với server đang được phát triển.",
    );
  };

  const handleHelp = () => {
    onClose();
    showModalVersion(
      "Trợ giúp & Hỗ trợ",
      "Hệ thống trợ giúp tích hợp đang được xây dựng.",
    );
  };

  const menuItems: MenuItem[] = [
    {
      id: "home",
      title: "Trang chủ",
      icon: "home-outline",
      screen: "Home",
    },
    {
      id: "weighing",
      title: "Danh sách cân", // ✅ FIXED: This is the "Menu Cân" you mentioned
      icon: "list-outline",
      screen: "WeighingList",
    },
    {
      id: "reports",
      title: "Báo cáo",
      icon: "bar-chart-outline",
      screen: "Reports",
    },
    {
      id: "management",
      title: "Quản lý",
      icon: "grid-outline",
      screen: "Management",
    },
    {
      id: "divider1",
      title: "",
      icon: "",
      divider: true,
    },
    {
      id: "new-weighing",
      title: "Tạo phiếu cân mới",
      icon: "add-circle-outline",
      action: () => navigateToScreen("AddEditWeighing", "Tạo phiếu cân mới"),
      developmentFeature: true,
    },
    {
      id: "sync",
      title: "Đồng bộ dữ liệu",
      icon: "sync-outline",
      action: handleSyncData,
      developmentFeature: true,
    },
    {
      id: "divider2",
      title: "",
      icon: "",
      divider: true,
    },
    {
      id: "theme",
      title: `Chế độ ${isDarkMode ? "sáng" : "tối"}`,
      icon: isDarkMode ? "sunny-outline" : "moon-outline",
      action: () => {
        toggleTheme();
      },
    },
    {
      id: "settings",
      title: "Cài đặt",
      icon: "settings-outline",
      screen: "Settings",
    },
    {
      id: "help",
      title: "Trợ giúp",
      icon: "help-circle-outline",
      action: handleHelp,
      developmentFeature: true,
    },
    {
      id: "divider3",
      title: "",
      icon: "",
      divider: true,
    },
    {
      id: "logout",
      title: "Đăng xuất",
      icon: "log-out-outline",
      action: handleLogout,
    },
  ];

  const renderMenuItem = (item: MenuItem) => {
    if (item.divider) {
      return (
        <View
          key={item.id}
          style={[styles.divider, { backgroundColor: colors.gray200 }]}
        />
      );
    }

    const isLogout = item.id === "logout";
    const isDevelopment = item.developmentFeature;

    return (
      <TouchableOpacity
        key={item.id}
        style={[
          styles.menuItem,
          isLogout && { backgroundColor: colors.error + "10" },
          isDevelopment && { backgroundColor: colors.warning + "05" },
        ]}
        onPress={() => {
          if (item.action) {
            item.action();
          } else if (item.screen) {
            navigateToScreen(item.screen, item.title);
          }
        }}
      >
        <View style={styles.menuItemLeft}>
          <Ionicons
            name={item.icon as any}
            size={24}
            color={isLogout ? colors.error : colors.text}
            style={styles.menuIcon}
          />
          <Text
            style={[
              styles.menuText,
              { color: isLogout ? colors.error : colors.text },
            ]}
          >
            {item.title}
          </Text>
        </View>

        <View style={styles.menuItemRight}>
          {isDevelopment && (
            <View
              style={[styles.devBadge, { backgroundColor: colors.warning }]}
            >
              <Text style={styles.devBadgeText}>Dev</Text>
            </View>
          )}
          {item.id !== "logout" && (
            <Ionicons
              name="chevron-forward"
              size={16}
              color={colors.gray500}
              style={isDevelopment ? styles.chevronWithBadge : undefined}
            />
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <>
      {visible && (
        <Modal
          visible={visible}
          transparent={true}
          animationType="none"
          onRequestClose={onClose}
        >
          <Animated.View
            style={[styles.overlay, { opacity: overlayOpacity }]}
          >
            <TouchableOpacity
              style={styles.overlayTouchable}
              activeOpacity={1}
              onPress={onClose}
            />
          </Animated.View>

          <Animated.View
            style={[
              styles.menu,
              { backgroundColor: colors.surface, transform: [{ translateX: slideAnim }] },
            ]}
          >
            <SafeAreaView style={styles.menuContainer}>
              {/* ✅ FIXED: Improved header spacing and alignment */}
              <View
                style={[styles.menuHeader, { backgroundColor: colors.primary, borderBottomColor: colors.gray200 }]}
              >
                <View style={styles.userInfo}>
                  <View style={[styles.avatar, { backgroundColor: colors.primaryLight }]}>
                    <Ionicons name="person" size={24} color="white" />
                  </View>
                  <View style={styles.userDetails}>
                    <Text style={styles.userName}>
                      {userInfo?.hoTen || "Người dùng"}
                    </Text>
                    <Text style={styles.userRole}>
                      {userInfo?.vaiTro === "QUAN_TRI" ? "Quản trị viên" : "Nhân viên"}
                    </Text>
                  </View>
                </View>
                <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                  <Ionicons name="close" size={24} color="white" />
                </TouchableOpacity>
              </View>

              {/* ✅ FIXED: Improved menu content with better spacing */}
              <ScrollView
                style={styles.menuContent}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.menuScrollContent}
              >
                {menuItems.map(renderMenuItem)}
              </ScrollView>

              {/* Footer */}
              <View
                style={[styles.menuFooter, { borderTopColor: colors.gray200 }]}
              >
                <Text style={[styles.appName, { color: colors.text }]}>
                  {APP_NAME}
                </Text>
                <Text style={[styles.appVersion, { color: colors.gray500 }]}>
                  Phiên bản {APP_VERSION}
                </Text>
              </View>
            </SafeAreaView>
          </Animated.View>
        </Modal>
      )}

      <UnderDevelopmentModal
        visible={showModal}
        onClose={closeModal}
        featureName={currentFeature}
        message={currentMessage}
      />
    </>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  overlayTouchable: {
    flex: 1,
  },
  menu: {
    position: "absolute",
    top: 0,
    left: 0,
    bottom: 0,
    width: MENU_WIDTH,
    elevation: 16,
    shadowColor: "#000",
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },
  menuContainer: {
    flex: 1,
  },
  // ✅ FIXED: Improved header layout and spacing
  menuHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 20,
    paddingTop: 24, // ✅ Increased top padding for better spacing
    paddingBottom: 20,
    borderBottomWidth: 1,
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: "600",
    color: "white",
    marginBottom: 2,
  },
  userRole: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.8)",
  },
  closeButton: {
    padding: 4,
  },
  // ✅ FIXED: Improved menu content spacing
  menuContent: {
    flex: 1,
  },
  menuScrollContent: {
    paddingVertical: 12, // ✅ Added vertical padding for better spacing
  },
  // ✅ FIXED: Better menu item alignment and spacing
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    paddingHorizontal: 20,
    marginHorizontal: 8,
    marginVertical: 2, // ✅ Added small vertical margin
    borderRadius: 8,
  },
  menuItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  menuItemRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  menuIcon: {
    marginRight: 16,
    width: 24,
    textAlign: "center", // ✅ Center align icons
  },
  menuText: {
    fontSize: 16,
    fontWeight: "500",
    flex: 1,
  },
  devBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    marginRight: 8,
  },
  devBadgeText: {
    fontSize: 10,
    fontWeight: "600",
    color: "white",
  },
  chevronWithBadge: {
    marginLeft: 4,
  },
  divider: {
    height: 1,
    marginVertical: 8,
    marginHorizontal: 20,
  },
  menuFooter: {
    padding: 20,
    borderTopWidth: 1,
    alignItems: "center",
  },
  appName: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 4,
  },
  appVersion: {
    fontSize: 12,
  },
});

export default SlideMenu;