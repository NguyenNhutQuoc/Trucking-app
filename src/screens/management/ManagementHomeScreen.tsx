// src/screens/management/ManagementHomeScreen.tsx
import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

import { useAppTheme } from "@/hooks/useAppTheme";
import Header from "@/components/common/Header";
import ThemedView from "@/components/common/ThemedView";
import ThemedText from "@/components/common/ThemedText";
import { ManagementStackScreenProps } from "@/types/navigation.types";

type NavigationProp =
  ManagementStackScreenProps<"ManagementHome">["navigation"];

const ManagementHomeScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const { colors } = useAppTheme();

  const menuItems = [
    {
      id: "vehicles",
      title: "Quản lý xe",
      icon: "car-outline",
      color: colors.primary,
      screen: "VehicleList",
    },
    {
      id: "companies",
      title: "Quản lý công ty",
      icon: "business-outline",
      color: colors.chartBlue,
      screen: "CompanyList",
    },
    {
      id: "products",
      title: "Quản lý hàng hóa",
      icon: "cube-outline",
      color: colors.chartGreen,
      screen: "ProductList",
    },
    {
      id: "users",
      title: "Quản lý người dùng",
      icon: "people-outline",
      color: colors.chartOrange,
      screen: "UserList",
    },
    {
      id: "permissions",
      title: "Phân quyền",
      icon: "lock-closed-outline",
      color: colors.chartRed,
      screen: "PermissionList",
    },
    {
      id: "backups",
      title: "Sao lưu & Phục hồi",
      icon: "cloud-upload-outline",
      color: colors.chartCyan,
      screen: "BackupRestore",
    },
    {
      id: "system",
      title: "Cấu hình hệ thống",
      icon: "settings-outline",
      color: colors.chartTeal,
      screen: "SystemConfig",
    },
  ];

  const handleMenuPress = (screenName: string) => {
    // @ts-ignore
    navigation.navigate(screenName);
  };

  const renderMenuItem = (item: (typeof menuItems)[0], index: number) => (
    <TouchableOpacity
      key={item.id}
      style={[styles.menuItem, { backgroundColor: colors.card }]}
      onPress={() => handleMenuPress(item.screen)}
    >
      <View
        style={[styles.iconContainer, { backgroundColor: item.color + "15" }]}
      >
        <Ionicons name={item.icon as any} size={28} color={item.color} />
      </View>
      <ThemedText style={styles.menuItemText}>{item.title}</ThemedText>
    </TouchableOpacity>
  );

  return (
    <ThemedView useSafeArea>
      <Header title="Quản Lý" />

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
      >
        <ThemedText type="title" style={styles.sectionTitle}>
          Chọn mục quản lý
        </ThemedText>

        <View style={styles.menuGrid}>
          {menuItems.map((item, index) => renderMenuItem(item, index))}
        </View>
      </ScrollView>
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
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  menuItemText: {
    fontSize: 14,
    fontWeight: "500",
    textAlign: "center",
  },
});

export default ManagementHomeScreen;
