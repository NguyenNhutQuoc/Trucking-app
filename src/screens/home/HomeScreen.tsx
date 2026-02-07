// src/screens/home/HomeScreen.tsx - Updated with full dark mode support
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
import AppHeader from "@/components/layout/AppHeader";
import Card from "@/components/common/Card";
import Loading from "@/components/common/Loading";
import ThemedView from "@/components/common/ThemedView";
import ThemedText from "@/components/common/ThemedText";
import SlideMenu from "@/components/common/SliceMenu";
import UnderDevelopmentModal from "@/components/common/UnderDevelopmentModal";
import { Phieucan } from "@/types/api.types";
import spacing from "@/styles/spacing";

// Smart weight formatter with abbreviations
const formatWeightAbbr = (weightInKg: number): string => {
  if (weightInKg >= 1000000) {
    // 1 million kg+ = show in thousands of tons
    return `${(weightInKg / 1000000).toFixed(1)}K T`;
  } else if (weightInKg >= 1000) {
    // 1000 kg+ = show in tons
    return `${(weightInKg / 1000).toFixed(1)} T`;
  } else {
    // Less than 1000 kg = show in kg
    return `${Math.round(weightInKg)} kg`;
  }
};

const HomeScreen: React.FC = () => {
  const { userInfo, tenantInfo, getStationDisplayName } = useAuth();
  const { colors, isDarkMode } = useAppTheme();
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
  const [weeklyActivity, setWeeklyActivity] = useState<{ day: string; count: number; date: string }[]>([]);
  const [menuVisible, setMenuVisible] = useState(false);

  useEffect(() => {
    loadData();
    console.log("HomeScreen mounted");
  }, []);

  useEffect(() => {
    if (tenantInfo?.selectedStation) {
      loadData();
    }
    console.log("Selected station changed:", tenantInfo?.selectedStation?.id);
  }, [tenantInfo?.selectedStation?.id]);

  const loadData = async () => {
    try {
      setLoading(true);
      await Promise.all([loadPendingWeighings(), loadTodayStats(), loadWeeklyActivity()]);
    } catch (error) {
      console.error("Load data error:", error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    try {
      setRefreshing(true);
      await Promise.all([loadPendingWeighings(), loadTodayStats(), loadWeeklyActivity()]);
    } catch (error) {
      console.error("Refresh data error:", error);
    } finally {
      setRefreshing(false);
    }
  };

  const loadPendingWeighings = async () => {
    try {
      const response = await weighingApi.getPendingWeighings({
        page: 1,
        pageSize: 20,
      });
      if (response) {
        setPendingWeighings(response.items);
      }
    } catch (error) {
      console.error("Load pending weighings error:", error);
      setPendingWeighings([]);
    }
  };

  const loadTodayStats = async () => {
    try {
      const today = new Date().toISOString().split("T")[0];
      const startDate = `${today} 00:00:00`;
      const endDate = `${today} 23:59:59`;

      const response = await weighingApi.getWeightStatistics(
        startDate,
        endDate,
      );

      if (response) {
        setTodayStats({
          totalVehicles: response.data.totalVehicles,
          totalWeight: response.data.totalWeight,
        });
      }
    } catch (error) {
      console.error("Load today stats error:", error);
    }
  };


  const loadWeeklyActivity = async () => {
    try {
      // Get last 7 days
      const today = new Date();
      const dayNames = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];

      // Calculate date range for last 7 days
      const endDate = new Date(today);
      const startDate = new Date(today);
      startDate.setDate(startDate.getDate() - 6); // 7 days including today

      const formattedStartDate = startDate.toISOString().split("T")[0];
      const formattedEndDate = endDate.toISOString().split("T")[0] + "T23:59:59";

      // Use new lightweight daily counts API
      const response = await weighingApi.getDailyCountStatistics(
        formattedStartDate,
        formattedEndDate
      );

      // Create a map from API response
      const countsByDate: { [key: string]: number } = {};
      
      if (response && response.data) {
        response.data.forEach(item => {
          countsByDate[item.date] = item.count;
        });
      }

      // Build data for last 7 days
      const weekData: { day: string; count: number; date: string }[] = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        // Use local date format to match API response
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const dateKey = `${year}-${month}-${day}`;
        const dayOfWeek = date.getDay(); // 0 = Sunday, 1 = Monday, ...
        
        weekData.push({
          day: dayNames[dayOfWeek],
          count: countsByDate[dateKey] || 0,
          date: dateKey,
        });
      }

      setWeeklyActivity(weekData);
    } catch (error) {
      console.error("Load weekly activity error:", error);
      // Set empty data on error
      setWeeklyActivity([]);
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
    // Use real data from weeklyActivity or fallback to zeros
    const data = weeklyActivity.length > 0 
      ? weeklyActivity 
      : [{ day: "T2", count: 0 }, { day: "T3", count: 0 }, { day: "T4", count: 0 }, { day: "T5", count: 0 }, { day: "T6", count: 0 }, { day: "T7", count: 0 }, { day: "CN", count: 0 }];
    
    const maxValue = Math.max(...data.map(d => d.count), 1); // At least 1 to avoid division by zero
    const totalWeekCount = data.reduce((sum, d) => sum + d.count, 0);

    return (
      <View style={styles.chartPlaceholder}>
        {/* Total count summary */}
        <View style={{ marginBottom: 12, alignItems: "center" }}>
          <ThemedText style={{ fontSize: 14, color: colors.textSecondary }}>
            Tổng: <ThemedText style={{ fontWeight: "bold", color: colors.primary }}>{totalWeekCount}</ThemedText> lượt cân
          </ThemedText>
        </View>
        <View style={styles.barChart}>
          {data.map((item, index) => (
            <View key={`${item.day}-${index}`} style={styles.barContainer}>
              <View style={{ alignItems: "center", marginBottom: 4 }}>
                <ThemedText style={{ fontSize: 10, color: colors.textSecondary }}>
                  {item.count > 0 ? item.count : ""}
                </ThemedText>
              </View>
              <View
                style={[
                  styles.bar,
                  {
                    height: item.count > 0 ? `${(item.count / maxValue) * 60}%` : 4,
                    backgroundColor: item.count > 0 ? colors.primary : colors.gray300,
                    opacity: isDarkMode ? 0.8 : 0.7,
                  },
                ]}
              />
              <ThemedText
                style={[
                  styles.dayLabel,
                  {
                    color: colors.textSecondary,
                    marginTop: 8,
                    fontSize: 12,
                    textAlign: "center",
                  },
                ]}
              >
                {item.day}
              </ThemedText>
            </View>
          ))}
        </View>
      </View>
    );
  };

  if (loading) {
    return <Loading loading />;
  }

  return (
    <ThemedView style={styles.container}>
      <AppHeader
        title="Trang chủ"
        showBack={false}
        rightComponent={
          <TouchableOpacity onPress={toggleMenu}>
            <Ionicons name="menu" size={24} color={colors.text} />
          </TouchableOpacity>
        }
      />

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
            progressBackgroundColor={colors.card}
          />
        }
      >
        {/* Station Info Card - Enhanced Dark Mode Support */}
        {tenantInfo?.selectedStation && (
          <Card
            style={{
              ...styles.stationInfoCard,
              backgroundColor: colors.card,
              borderColor: isDarkMode ? colors.border : "transparent",
              borderWidth: isDarkMode ? 1 : 0,
            }}
          >
            <View style={styles.stationInfoContent}>
              <View
                style={[
                  styles.stationIconContainer,
                  { backgroundColor: colors.primary + "15" },
                ]}
              >
                <Ionicons name="business" size={24} color={colors.primary} />
              </View>
              <View style={styles.stationInfoText}>
                <ThemedText
                  style={[styles.stationLabel, { color: colors.textSecondary }]}
                >
                  Trạm cân hiện tại
                </ThemedText>
                <ThemedText
                  style={[styles.stationName, { color: colors.text }]}
                >
                  {getStationDisplayName()}
                </ThemedText>
              </View>
            </View>
          </Card>
        )}

        {/* Quick Stats Grid - Fixed Layout */}
        <View style={styles.quickStatsGrid}>
          <View style={styles.quickStatsRow}>
            <TouchableOpacity
              style={styles.statCardContainer}
              onPress={handleStatsPress}
            >
              <Card style={styles.statCard}>
                <ThemedText
                  style={[styles.statNumber, { color: colors.success }]}
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

            <TouchableOpacity
              style={styles.statCardContainer}
              onPress={handleStatsPress}
            >
              <Card style={styles.statCard}>
                <ThemedText
                  style={[styles.statNumber, { color: colors.warning }]}
                  numberOfLines={1}
                  adjustsFontSizeToFit
                >
                  {formatWeightAbbr(todayStats.totalWeight)}
                </ThemedText>
                <ThemedText
                  style={[styles.statLabel, { color: colors.textSecondary }]}
                >
                  Tổng trọng lượng
                </ThemedText>
              </Card>
            </TouchableOpacity>
          </View>
        </View>

        {/* Pending Weighings - Enhanced Dark Mode Support */}
        <View style={styles.pendingWeighingsContainer}>
          <View style={styles.sectionHeader}>
            <ThemedText style={[styles.sectionTitle, { color: colors.text }]}>
              Chờ hoàn thành ({pendingWeighings.length})
            </ThemedText>
            <TouchableOpacity onPress={handleViewAllPending}>
              <ThemedText
                style={[styles.viewAllText, { color: colors.primary }]}
              >
                Xem tất cả
              </ThemedText>
            </TouchableOpacity>
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

        {/* Activity Chart - Enhanced Dark Mode Support */}
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

          <Card
            style={{
              ...styles.activityChartCard,
              backgroundColor: colors.card,
              borderColor: isDarkMode ? colors.border : "transparent",
              borderWidth: isDarkMode ? 1 : 0,
            }}
          >
            {renderActivityChart()}
          </Card>
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
    padding: spacing.md,
  },
  // Station Info Styles
  stationInfoCard: {
    marginBottom: spacing.md,
    padding: 0,
  },
  stationInfoContent: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.md,
  },
  stationIconContainer: {
    width: 48,
    height: 48,
    borderRadius: spacing.radiusFull,
    justifyContent: "center",
    alignItems: "center",
    marginRight: spacing.sm,
  },
  stationInfoText: {
    flex: 1,
  },
  stationLabel: {
    fontSize: 12,
    marginBottom: 2,
    fontWeight: "500",
  },
  stationName: {
    fontSize: 14,
    fontWeight: "600",
  },
  // Quick Stats Grid Styles
  quickStatsGrid: {
    marginBottom: 20,
  },
  quickStatsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "stretch", // Ensure all cards have same height
  },
  statCardContainer: {
    flex: 1,
    marginHorizontal: 4, // Small gap between cards
  },
  statCard: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 12,
    paddingHorizontal: 8,
    minHeight: 100,
    marginHorizontal: 0,
  },
  newWeighingCard: {
    borderWidth: 1,
  },
  statNumber: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 4,
    textAlign: "center",
  },
  statLabel: {
    fontSize: 12,
    textAlign: "center",
    fontWeight: "500",
  },
  // Pending Weighings Styles
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
    fontWeight: "500",
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
    fontWeight: "500",
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
    fontWeight: "500",
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
    fontStyle: "italic",
  },
  completeButton: {
    padding: 8,
  },
  // Empty State Styles
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
    fontStyle: "italic",
  },
  // Activity Chart Styles
  activityContainer: {
    marginBottom: 20,
  },
  activityChartCard: {
    padding: 16,
  },
  chartPlaceholder: {
    height: 200,
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
    alignItems: "center",
  },
  bar: {
    width: "100%",
    borderRadius: 4,
    minHeight: 4,
  },
  dayLabel: {
    fontSize: 12,
    textAlign: "center",
    marginTop: 4,
  },
});

export default HomeScreen;
