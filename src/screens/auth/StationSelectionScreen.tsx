// src/screens/auth/StationSelectionScreen.tsx
import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  SafeAreaView,
  FlatList,
  Alert,
  RefreshControl,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { StatusBar } from "expo-status-bar";

import { useAuth } from "@/hooks/useAuth";
import { useAppTheme } from "@/hooks/useAppTheme";
import { stationApi, TramCan } from "@/api/station";
import Button from "@/components/common/Button";
import Loading from "@/components/common/Loading";

interface StationSelectionScreenProps {
  route?: {
    params?: {
      sessionToken: string;
      khachHang: {
        maKhachHang: string;
        tenKhachHang: string;
      };
      tramCans: TramCan[];
    };
  };
}

const StationSelectionScreen: React.FC<StationSelectionScreenProps> = ({
  route,
}) => {
  const navigation = useNavigation();
  const { selectStation, tenantSessionData, authLevel, logout } = useAuth();
  const { colors, isDarkMode } = useAppTheme();

  // Get data from route params OR from auth context (for app reopen)
  const sessionToken =
    route?.params?.sessionToken || tenantSessionData?.sessionToken || "";
  const khachHang = route?.params?.khachHang ||
    tenantSessionData?.khachHang || {
      maKhachHang: "",
      tenKhachHang: "N/A",
    };
  const initialStations =
    route?.params?.tramCans || tenantSessionData?.tramCans || [];

  const [selectedStationId, setSelectedStationId] = useState<number | null>(
    null,
  );
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [stations, setStations] = useState<TramCan[]>(initialStations);
  const [initialLoading, setInitialLoading] = useState(
    initialStations.length === 0,
  );

  // Load stations if we don't have them (app reopen case)
  useEffect(() => {
    if (initialStations.length === 0 && sessionToken) {
      loadStations();
    }
  }, []);

  const loadStations = async () => {
    try {
      setInitialLoading(true);
      const response = await stationApi.getMyStations();
      if (response?.tramCans) {
        setStations(response.tramCans);
      }
    } catch (error) {
      console.error("Load stations error:", error);
    } finally {
      setInitialLoading(false);
    }
  };

  // Validate session on mount
  useEffect(() => {
    if (!sessionToken) {
      Alert.alert(
        "Lỗi",
        "Thông tin đăng nhập không hợp lệ. Vui lòng đăng nhập lại.",
        [
          {
            text: "OK",
            onPress: () => {
              if (authLevel === "none") {
                navigation.navigate("Login" as never);
              } else {
                logout();
              }
            },
          },
        ],
      );
    }
  }, [sessionToken, navigation]);

  // Auto-select if only 1 station
  useEffect(() => {
    if (stations.length === 1) {
      setSelectedStationId(stations[0].id);
    }
  }, [stations]);

  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      const response = await stationApi.getMyStations();

      if (response?.tramCans) {
        setStations(response.tramCans);
      } else {
        Alert.alert("Lỗi", "Không thể tải lại danh sách trạm cân");
      }
    } catch (error) {
      console.error("Refresh stations error:", error);
      Alert.alert("Lỗi", "Có lỗi xảy ra khi tải lại danh sách");
    } finally {
      setRefreshing(false);
    }
  };

  const handleContinue = async () => {
    if (!selectedStationId) {
      Alert.alert("Thông báo", "Vui lòng chọn trạm cân để tiếp tục");
      return;
    }

    try {
      setLoading(true);
      const success = await selectStation(sessionToken, selectedStationId);

      if (!success) {
        Alert.alert("Lỗi", "Không thể chọn trạm cân. Vui lòng thử lại.");
      }
      // Navigation will be handled by AuthContext → authLevel changes to "station"
    } catch (error) {
      console.error("Station selection error:", error);
      Alert.alert("Lỗi", "Có lỗi xảy ra khi chọn trạm cân. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    if (authLevel === "tenant") {
      // If at tenant level (app reopen), go back to login = full logout
      Alert.alert("Đăng xuất", "Bạn có muốn quay về màn hình đăng nhập?", [
        { text: "Hủy", style: "cancel" },
        {
          text: "Đăng xuất",
          style: "destructive",
          onPress: () => {
            logout().catch((e) => console.error("Logout error:", e));
          },
        },
      ]);
    } else {
      navigation.goBack();
    }
  };

  const renderStationItem = ({ item }: { item: TramCan }) => (
    <TouchableOpacity
      style={[
        styles.stationItem,
        {
          backgroundColor: colors.surface,
          borderColor:
            selectedStationId === item.id ? colors.primary : colors.border,
        },
      ]}
      onPress={() => setSelectedStationId(item.id)}
    >
      <View style={styles.stationItemLeft}>
        <View
          style={[
            styles.radioButton,
            {
              borderColor:
                selectedStationId === item.id ? colors.primary : colors.border,
              backgroundColor:
                selectedStationId === item.id ? colors.primary : "transparent",
            },
          ]}
        >
          {selectedStationId === item.id && (
            <View style={styles.radioButtonInner} />
          )}
        </View>
        <View style={styles.stationInfo}>
          <Text style={[styles.stationName, { color: colors.text }]}>
            {item.tenTramCan}
          </Text>
          <Text style={[styles.stationCode, { color: colors.textSecondary }]}>
            Mã: {item.maTramCan}
          </Text>
          <Text
            style={[styles.stationAddress, { color: colors.textSecondary }]}
          >
            {item.diaChi}
          </Text>
        </View>
      </View>
      <Ionicons
        name="location"
        size={24}
        color={
          selectedStationId === item.id ? colors.primary : colors.textSecondary
        }
      />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: colors.background }]}
    >
      <StatusBar style={isDarkMode ? "light" : "dark"} />

      {/* ✅ FIXED: Header with proper spacing from status bar */}
      <View style={[styles.header, { backgroundColor: colors.surface }]}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>
            Chọn trạm cân
          </Text>
          <Text
            style={[styles.headerSubtitle, { color: colors.textSecondary }]}
          >
            {khachHang.tenKhachHang}
          </Text>
        </View>
        {/* ✅ Refresh button */}
        <TouchableOpacity
          onPress={handleRefresh}
          style={styles.refreshButton}
          disabled={refreshing}
        >
          <Ionicons
            name="refresh"
            size={20}
            color={refreshing ? colors.textSecondary : colors.primary}
          />
        </TouchableOpacity>
      </View>

      {/* Content */}
      <View style={styles.content}>
        <Text style={[styles.instruction, { color: colors.textSecondary }]}>
          Vui lòng chọn trạm cân để tiếp tục làm việc
        </Text>

        {initialLoading ? (
          <View style={styles.loadingContainer}>
            <Loading loading message="Đang tải danh sách trạm cân..." />
          </View>
        ) : (
          <FlatList
            data={stations}
            renderItem={renderStationItem}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={styles.stationsList}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={handleRefresh}
                colors={[colors.primary]}
              />
            }
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Ionicons
                  name="business-outline"
                  size={48}
                  color={colors.gray400}
                />
                <Text
                  style={[styles.emptyText, { color: colors.textSecondary }]}
                >
                  Không tìm thấy trạm cân nào
                </Text>
                <TouchableOpacity
                  onPress={handleRefresh}
                  style={styles.retryButton}
                >
                  <Text style={[styles.retryText, { color: colors.primary }]}>
                    Thử lại
                  </Text>
                </TouchableOpacity>
              </View>
            }
          />
        )}
      </View>

      {/* ✅ FIXED: Button container moved outside content, fixed at bottom */}
      <View
        style={[styles.buttonContainer, { backgroundColor: colors.background }]}
      >
        <Button
          title="Tiếp tục"
          onPress={handleContinue}
          loading={loading}
          disabled={loading || !selectedStationId}
          style={styles.continueButton}
          fullWidth
        />
      </View>

      {/* Loading overlay */}
      {loading && <Loading loading />}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  // ✅ FIXED: Header với khoảng cách hợp lý từ status bar
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 16, // ✅ Tăng padding cho đẹp hơn
    paddingTop: Platform.OS === "ios" ? 16 : 35, // ✅ Thêm padding top riêng cho status bar
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5E5",
    elevation: 2, // ✅ Thêm shadow cho Android
    shadowColor: "#000", // ✅ Thêm shadow cho iOS
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  backButton: {
    padding: 8,
    marginRight: 12, // ✅ Tăng margin cho spacing tốt hơn
    borderRadius: 8, // ✅ Thêm border radius cho đẹp
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 2, // ✅ Thêm margin bottom nhỏ
  },
  headerSubtitle: {
    fontSize: 14,
  },
  refreshButton: {
    padding: 8,
    marginLeft: 12, // ✅ Tăng margin cho spacing tốt hơn
    borderRadius: 8, // ✅ Thêm border radius cho đẹp
  },
  content: {
    flex: 1,
    padding: 16,
  },
  instruction: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 22, // ✅ Thêm line height cho đọc dễ hơn
  },
  stationsList: {
    flexGrow: 1,
    paddingBottom: 16, // ✅ Thêm padding bottom
  },
  stationItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    marginBottom: 12,
    borderRadius: 12,
    borderWidth: 2,
    // ✅ Thêm shadow cho item
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  stationItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  radioButtonInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "white",
  },
  stationInfo: {
    flex: 1,
  },
  stationName: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  stationCode: {
    fontSize: 14,
    marginBottom: 2,
  },
  stationAddress: {
    fontSize: 13,
    lineHeight: 18,
  },
  buttonContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 24, // ✅ Extra padding for safe area
    borderTopWidth: 1,
    borderTopColor: "#E5E5E5",
  },
  continueButton: {
    marginTop: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 15,
    marginTop: 12,
    textAlign: "center",
  },
  retryButton: {
    marginTop: 16,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  retryText: {
    fontSize: 15,
    fontWeight: "500",
  },
});

export default StationSelectionScreen;
