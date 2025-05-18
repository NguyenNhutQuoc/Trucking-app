// src/screens/home/HomeScreen.tsx
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  SafeAreaView,
  RefreshControl,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

import { useAuth } from "@/hooks/useAuth";
import { weighingApi } from "@/api/weighing";
import Header from "@/components/common/Header";
import Card from "@/components/common/Card";
import Button from "@/components/common/Button";
import Loading from "@/components/common/Loading";
import colors from "@/constants/colors";
import { Phieucan } from "@/types/api.types";

const HomeScreen: React.FC = () => {
  const navigation = useNavigation();
  const { userInfo } = useAuth();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [pendingWeighings, setPendingWeighings] = useState<Phieucan[]>([]);
  const [todayStats, setTodayStats] = useState({
    totalVehicles: 0,
    totalWeight: 0,
  });

  useEffect(() => {
    loadData();
  }, []);

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
    }
  };

  const loadTodayStats = async () => {
    try {
      const response = await weighingApi.getTodayStatistics();
      if (response.success) {
        setTodayStats({
          totalVehicles: response.data.totalVehicles,
          totalWeight: response.data.totalWeight,
        });
      }
    } catch (error) {
      console.error("Load today stats error:", error);
    }
  };

  const formatWeight = (weight: number) => {
    return `${(weight / 1000).toFixed(1)} tấn`;
  };

  const handleNewWeighing = () => {
    // @ts-ignore
    navigation.navigate("AddEditWeighing");
  };

  const handleViewAllWeighings = () => {
    // @ts-ignore
    navigation.navigate("WeighingList");
  };

  const handleWeighingPress = (weighing: Phieucan) => {
    // @ts-ignore
    navigation.navigate("WeighingDetail", { weighing });
  };

  const handleViewReports = () => {
    // @ts-ignore
    navigation.navigate("Reports");
  };

  const handleCompleteWeighing = (weighingId: number) => {
    // @ts-ignore
    navigation.navigate("Weighing", {
      screen: "CompleteWeighing",
      params: { weighingId },
    });
  };

  const renderPendingWeighingItem = ({ item }: { item: Phieucan }) => {
    return (
      <Card
        status="pending"
        onPress={() => handleWeighingPress(item)}
        style={styles.pendingWeighingCard}
        rightContent={
          <TouchableOpacity
            style={styles.completeButton}
            onPress={() => handleCompleteWeighing(item.stt)}
          >
            <Ionicons
              name="checkmark-circle"
              size={24}
              color={colors.success}
            />
          </TouchableOpacity>
        }
      >
        <View style={styles.pendingWeighingContent}>
          <View style={styles.vehicleInfoRow}>
            <Ionicons
              name="car-outline"
              size={20}
              color={colors.gray700}
              style={styles.icon}
            />
            <Text style={styles.vehicleNumber}>{item.soxe}</Text>
            <Text style={styles.weighTicketNumber}>#{item.sophieu}</Text>
          </View>

          <View style={styles.infoRow}>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Vào:</Text>
              <Text style={styles.infoValue}>
                {new Date(item.ngaycan1).toLocaleTimeString("vi-VN", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </Text>
            </View>

            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Trọng lượng:</Text>
              <Text style={styles.infoValue}>{item.tlcan1} kg</Text>
            </View>
          </View>

          <View style={styles.bottomRow}>
            <Text style={styles.productName}>{item.loaihang}</Text>
          </View>
        </View>
      </Card>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header
        title="Trạm A"
        showMenu={true}
        rightComponent={
          <TouchableOpacity style={styles.headerButton}>
            <Ionicons name="notifications-outline" size={24} color="white" />
          </TouchableOpacity>
        }
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.todayStatsContainer}>
          <Card style={styles.todayStatsCard} elevated>
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Hôm nay:</Text>
                <Text style={styles.statValue}>
                  {todayStats.totalVehicles} xe
                </Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Tổng trọng lượng:</Text>
                <Text style={styles.statValue}>
                  {formatWeight(todayStats.totalWeight)}
                </Text>
              </View>
            </View>
          </Card>
        </View>

        <View style={styles.actionButtonsContainer}>
          <View style={styles.actionButtonRow}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleViewAllWeighings}
            >
              <View
                style={[
                  styles.actionIconContainer,
                  { backgroundColor: colors.secondary },
                ]}
              >
                <Ionicons name="list" size={28} color="white" />
              </View>
              <Text style={styles.actionText}>Danh Sách Cân</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.actionButtonRow}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleViewReports}
            >
              <View
                style={[
                  styles.actionIconContainer,
                  { backgroundColor: colors.chartBlue },
                ]}
              >
                <Ionicons name="bar-chart" size={28} color="white" />
              </View>
              <Text style={styles.actionText}>Báo Cáo</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => {
                // @ts-ignore
                navigation.navigate("Management");
              }}
            >
              <View
                style={[
                  styles.actionIconContainer,
                  { backgroundColor: colors.chartPurple },
                ]}
              >
                <Ionicons name="settings" size={28} color="white" />
              </View>
              <Text style={styles.actionText}>Quản Lý</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.pendingWeighingsContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              Đang chờ cân ra ({pendingWeighings.length})
            </Text>
            {pendingWeighings.length > 0 && (
              <TouchableOpacity onPress={handleViewAllWeighings}>
                <Text style={styles.viewAllText}>Xem tất cả</Text>
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
            <Card style={styles.emptyStateCard}>
              <View style={styles.emptyState}>
                <Ionicons
                  name="checkmark-circle"
                  size={48}
                  color={colors.gray400}
                />
                <Text style={styles.emptyStateText}>
                  Không có xe đang chờ cân ra
                </Text>
              </View>
            </Card>
          )}
        </View>

        <View style={styles.activityContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Hoạt động cân trong ngày</Text>
          </View>

          <Card style={styles.activityChartCard}>
            <View style={styles.chartPlaceholder}>
              <View style={styles.barChart}>
                {[0.4, 0.2, 0.6, 0.3, 0.8, 0.5, 0.2].map((height, index) => (
                  <View
                    key={index}
                    style={[styles.barContainer, { height: 100 * height }]}
                  >
                    <View style={styles.bar} />
                  </View>
                ))}
              </View>
            </View>
          </Card>
        </View>
      </ScrollView>

      <Loading loading={loading} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    padding: 16,
  },
  headerButton: {
    padding: 4,
  },
  todayStatsContainer: {
    marginBottom: 20,
  },
  todayStatsCard: {
    padding: 0,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 12,
  },
  statItem: {
    flex: 1,
    paddingHorizontal: 16,
    alignItems: "center",
  },
  statDivider: {
    width: 1,
    backgroundColor: colors.gray200,
  },
  statLabel: {
    color: colors.gray600,
    fontSize: 14,
    marginBottom: 4,
  },
  statValue: {
    color: colors.text,
    fontSize: 20,
    fontWeight: "600",
  },
  actionButtonsContainer: {
    marginBottom: 20,
  },
  actionButtonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  actionButton: {
    alignItems: "center",
    width: "48%",
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  actionIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  actionText: {
    fontSize: 14,
    fontWeight: "500",
    color: colors.text,
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
    color: colors.text,
  },
  viewAllText: {
    fontSize: 14,
    color: colors.primary,
  },
  pendingWeighingCard: {
    marginBottom: 12,
    padding: 0,
  },
  pendingWeighingContent: {
    padding: 0,
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
    color: colors.text,
    flex: 1,
  },
  weighTicketNumber: {
    fontSize: 14,
    color: colors.gray600,
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
    color: colors.gray600,
    marginRight: 4,
  },
  infoValue: {
    fontSize: 14,
    color: colors.text,
    fontWeight: "500",
  },
  bottomRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  productName: {
    fontSize: 14,
    color: colors.gray700,
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
    color: colors.gray600,
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
    backgroundColor: colors.primary,
    borderRadius: 4,
  },
});

export default HomeScreen;
