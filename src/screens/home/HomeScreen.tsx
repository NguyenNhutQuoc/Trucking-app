// src/screens/home/HomeScreen.tsx - Updated with AppHeader
import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  RefreshControl,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";

import { useAuth } from "@/hooks/useAuth";
import { useAppTheme } from "@/hooks/useAppTheme";
import { useNavigationHandler } from "@/hooks/useNavigationHandler";
import { weighingApi } from "@/api/weighing";
// ✅ THAY ĐỔI: Import AppHeader thay vì Header cũ
import AppHeader from "@/components/layout/AppHeader";
import Card from "@/components/common/Card";
import Loading from "@/components/common/Loading";
import ThemedView from "@/components/common/ThemedView";
import ThemedText from "@/components/common/ThemedText";
import SlideMenu from "@/components/common/SliceMenu";
import UnderDevelopmentModal from "@/components/common/UnderDevelopmentModal";
import { Phieucan } from "@/types/api.types";

const HomeScreen: React.FC = () => {
  const { userInfo, tenantInfo, getStationDisplayName } = useAuth();
  const { colors } = useAppTheme();
  const {
    safeNavigate,
    showModalVersion,
    showModal,
    currentFeature,
    currentMessage,
    closeModal,
  } = useNavigationHandler();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [pendingWeighings, setPendingWeighings] = useState<Phieucan[]>([]);
  const [todayStats, setTodayStats] = useState({
    totalVehicles: 0,
    totalWeight: 0,
  });
  const [menuVisible, setMenuVisible] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  // ✅ THAY ĐỔI: Reload data khi station thay đổi
  useEffect(() => {
    if (tenantInfo?.selectedStation) {
      loadData();
    }
  }, [tenantInfo?.selectedStation?.id]);

  const loadData = async () => {
    try {
      setLoading(true);
      await Promise.all([loadPendingWeighings(), loadTodayStats()]);
    } catch (error) {
      console.error("Load data error:", error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    try {
      setRefreshing(true);
      await Promise.all([loadPendingWeighings(), loadTodayStats()]);
    } catch (error) {
      console.error("Refresh data error:", error);
    } finally {
      setRefreshing(false);
    }
  };

  const loadPendingWeighings = async () => {
    try {
      const response = await weighingApi.getPendingWeighings();
      if (response.success) {
        setPendingWeighings(response.data);
      }
    } catch (error) {
      console.error("Load pending weighings error:", error);
      setPendingWeighings([]);
    }
  };

  const loadTodayStats = async () => {
    try {
      const today = new Date().toISOString().split("T")[0];
      const response = await weighingApi.getWeighingsByDateRange(today, today);
      if (response.success) {
        const data = response.data;
        setTodayStats({
          totalVehicles: data.length,
          totalWeight: data.reduce((sum, item) => {
            const netWeight = (item.tlcan2 || 0) - item.tlcan1;
            return sum + Math.max(0, netWeight);
          }, 0),
        });
      }
    } catch (error) {
      console.error("Load today stats error:", error);
      setTodayStats({ totalVehicles: 0, totalWeight: 0 });
    }
  };

  const handleCompleteWeighing = async (phieu: Phieucan) => {
    showModalVersion("Hoàn thành cân lần 2", "Tính năng đang phát triển");
  };

  const handleNewWeighing = () => {
    safeNavigate("NewWeighing");
  };

  const handleViewAllPending = () => {
    safeNavigate("WeighingList", { filter: "pending" });
  };

  const handleViewAllWeighings = () => {
    safeNavigate("WeighingList");
  };

  const handleStatsPress = () => {
    safeNavigate("Statistics");
  };

  const toggleMenu = () => {
    setMenuVisible(!menuVisible);
  };

  const closeMenu = () => {
    setMenuVisible(false);
  };

  const renderPendingWeighingItem = ({ item }: { item: Phieucan }) => (
    <Card style={styles.pendingWeighingCard}>
      <View style={styles.pendingWeighingContent}>
        <View style={styles.vehicleInfoRow}>
          <Ionicons
            name="car"
            size={20}
            color={colors.primary}
            style={styles.icon}
          />
          <ThemedText style={styles.vehicleNumber}>{item.soxe}</ThemedText>
          <ThemedText
            style={[styles.weighTicketNumber, { color: colors.textSecondary }]}
          >
            #{item.sophieu}
          </ThemedText>
        </View>

        <View style={styles.infoRow}>
          <View style={styles.infoItem}>
            <ThemedText
              style={[styles.infoLabel, { color: colors.textSecondary }]}
            >
              Cân 1:
            </ThemedText>
            <ThemedText style={[styles.infoValue, { color: colors.text }]}>
              {item.tlcan1.toLocaleString()} kg
            </ThemedText>
          </View>
          <View style={styles.infoItem}>
            <ThemedText
              style={[styles.infoLabel, { color: colors.textSecondary }]}
            >
              KH:
            </ThemedText>
            <ThemedText style={[styles.infoValue, { color: colors.text }]}>
              {item.khachhang || "N/A"}
            </ThemedText>
          </View>
        </View>

        <View style={styles.bottomRow}>
          <ThemedText
            style={[styles.productName, { color: colors.textSecondary }]}
          >
            {item.loaihang || "Chưa xác định"}
          </ThemedText>
          <TouchableOpacity
            style={styles.completeButton}
            onPress={() => handleCompleteWeighing(item)}
          >
            <Ionicons
              name="checkmark-circle"
              size={24}
              color={colors.success}
            />
          </TouchableOpacity>
        </View>
      </View>
    </Card>
  );

  const renderEmptyPendingState = () => (
    <Card style={styles.emptyStateCard}>
      <View style={styles.emptyState}>
        <Ionicons name="scale" size={48} color={colors.textSecondary} />
        <ThemedText
          style={[styles.emptyStateText, { color: colors.textSecondary }]}
        >
          Không có phiếu cân nào đang chờ hoàn thành
        </ThemedText>
      </View>
    </Card>
  );

  const renderActivityChart = () => {
    const days = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];
    const data = [45, 52, 38, 48, 56, 42, 35];
    const maxValue = Math.max(...data);

    return (
      <View style={styles.chartPlaceholder}>
        <View style={styles.barChart}>
          {days.map((day, index) => (
            <View key={day} style={styles.barContainer}>
              <View
                style={[
                  styles.bar,
                  {
                    backgroundColor: colors.primary,
                    height: `${(data[index] / maxValue) * 100}%`,
                  },
                ]}
              />
            </View>
          ))}
        </View>
      </View>
    );
  };

  if (loading && !refreshing) {
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: colors.background }]}
      >
        {/* ✅ THAY ĐỔI: Sử dụng AppHeader */}
        <AppHeader
          title="Trang chủ"
          showStationSwitcher={true}
          rightComponent={
            <TouchableOpacity onPress={toggleMenu}>
              <Ionicons name="menu" size={20} color={colors.text} />
            </TouchableOpacity>
          }
        />
        <Loading loading={true} />
      </SafeAreaView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      {/* ✅ THAY ĐỔI: Sử dụng AppHeader với Station Switcher */}
      <AppHeader
        title="Trang chủ"
        showStationSwitcher={true}
        rightComponent={
          <TouchableOpacity onPress={toggleMenu}>
            <Ionicons name="menu" size={20} color={colors.text} />
          </TouchableOpacity>
        }
      />

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* ✅ THAY ĐỔI: Hiển thị thông tin trạm cân hiện tại */}
        <Card style={styles.stationInfoCard}>
          <View style={styles.stationInfoContent}>
            <Ionicons name="location" size={20} color={colors.primary} />
            <View style={styles.stationInfoText}>
              <ThemedText
                style={[styles.stationLabel, { color: colors.textSecondary }]}
              >
                Đang làm việc tại
              </ThemedText>
              <ThemedText style={[styles.stationName, { color: colors.text }]}>
                {getStationDisplayName()}
              </ThemedText>
            </View>
          </View>
        </Card>

        {/* Quick Stats */}
        <View style={styles.quickStatsContainer}>
          <TouchableOpacity onPress={handleStatsPress}>
            <Card style={styles.statCard}>
              <ThemedText
                style={[styles.statNumber, { color: colors.primary }]}
              >
                {todayStats.totalVehicles}
              </ThemedText>
              <ThemedText
                style={[styles.statLabel, { color: colors.textSecondary }]}
              >
                Xe hôm nay
              </ThemedText>
            </Card>
          </TouchableOpacity>

          <TouchableOpacity onPress={handleStatsPress}>
            <Card style={styles.statCard}>
              <ThemedText
                style={[styles.statNumber, { color: colors.success }]}
              >
                {todayStats.totalWeight.toFixed(1)}
              </ThemedText>
              <ThemedText
                style={[styles.statLabel, { color: colors.textSecondary }]}
              >
                Tấn hôm nay
              </ThemedText>
            </Card>
          </TouchableOpacity>

          <TouchableOpacity onPress={handleNewWeighing}>
            <Card style={(styles.newWeighingCard, styles.statCard)}>
              <Ionicons name="add-circle" size={32} color={colors.primary} />
              <ThemedText style={[styles.statLabel, { color: colors.primary }]}>
                Cân mới
              </ThemedText>
            </Card>
          </TouchableOpacity>
        </View>

        {/* Pending Weighings */}
        <View style={styles.pendingWeighingsContainer}>
          <View style={styles.sectionHeader}>
            <ThemedText style={[styles.sectionTitle, { color: colors.text }]}>
              Phiếu cân chờ hoàn thành
            </ThemedText>
            {pendingWeighings.length > 0 && (
              <TouchableOpacity onPress={handleViewAllPending}>
                <ThemedText
                  style={[styles.viewAllText, { color: colors.primary }]}
                >
                  Xem tất cả
                </ThemedText>
              </TouchableOpacity>
            )}
          </View>

          {pendingWeighings.length > 0 ? (
            <FlatList
              data={pendingWeighings.slice(0, 3)}
              renderItem={renderPendingWeighingItem}
              keyExtractor={(item) => item.stt.toString()}
              scrollEnabled={false}
            />
          ) : (
            renderEmptyPendingState()
          )}
        </View>

        {/* Activity Chart */}
        <View style={styles.activityContainer}>
          <View style={styles.sectionHeader}>
            <ThemedText style={[styles.sectionTitle, { color: colors.text }]}>
              Hoạt động 7 ngày
            </ThemedText>
            <TouchableOpacity onPress={handleViewAllWeighings}>
              <ThemedText
                style={[styles.viewAllText, { color: colors.primary }]}
              >
                Chi tiết
              </ThemedText>
            </TouchableOpacity>
          </View>

          <Card style={styles.activityChartCard}>{renderActivityChart()}</Card>
        </View>
      </ScrollView>

      {/* Slide Menu */}
      <SlideMenu visible={menuVisible} onClose={closeMenu} />

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
    flex: 1,
    padding: 16,
  },
  // ✅ THAY ĐỔI: Thêm styles cho station info
  stationInfoCard: {
    marginBottom: 16,
    padding: 0,
  },
  stationInfoContent: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
  },
  stationInfoText: {
    marginLeft: 12,
    flex: 1,
  },
  stationLabel: {
    fontSize: 12,
    marginBottom: 2,
  },
  stationName: {
    fontSize: 14,
    fontWeight: "600",
  },
  quickStatsContainer: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
  },
  newWeighingCard: {
    borderColor: "#5C7CFA",
    borderWidth: 1,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    textAlign: "center",
  },
  pendingWeighingsContainer: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
  },
  viewAllText: {
    fontSize: 14,
  },
  pendingWeighingCard: {
    marginBottom: 12,
    padding: 0,
  },
  pendingWeighingContent: {
    padding: 16,
  },
  vehicleInfoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  icon: {
    marginRight: 8,
  },
  vehicleNumber: {
    fontSize: 16,
    fontWeight: "600",
    flex: 1,
  },
  weighTicketNumber: {
    fontSize: 14,
  },
  infoRow: {
    flexDirection: "row",
    marginBottom: 8,
  },
  infoItem: {
    flexDirection: "row",
    marginRight: 16,
  },
  infoLabel: {
    fontSize: 14,
    marginRight: 4,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: "500",
  },
  bottomRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  productName: {
    fontSize: 14,
    flex: 1,
  },
  completeButton: {
    padding: 8,
  },
  emptyStateCard: {
    padding: 0,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  emptyStateText: {
    marginTop: 8,
    fontSize: 14,
    textAlign: "center",
  },
  activityContainer: {
    marginBottom: 20,
  },
  activityChartCard: {
    padding: 16,
  },
  chartPlaceholder: {
    height: 150,
    justifyContent: "flex-end",
  },
  barChart: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    height: "100%",
  },
  barContainer: {
    width: "12%",
    justifyContent: "flex-end",
  },
  bar: {
    width: "100%",
    height: "100%",
    borderRadius: 4,
  },
});

export default HomeScreen;
