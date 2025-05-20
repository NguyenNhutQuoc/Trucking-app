// src/screens/home/HomeScreen.tsx
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
import { useNavigation } from "@react-navigation/native";

import { useAuth } from "@/hooks/useAuth";
import { useAppTheme } from "@/hooks/useAppTheme";
import { weighingApi } from "@/api/weighing";
import Header from "@/components/common/Header";
import Card from "@/components/common/Card";
import Button from "@/components/common/Button";
import Loading from "@/components/common/Loading";
import ThemedView from "@/components/common/ThemedView";
import ThemedText from "@/components/common/ThemedText";
import { Phieucan } from "@/types/api.types";

const HomeScreen: React.FC = () => {
  const navigation = useNavigation();
  const { userInfo } = useAuth();
  const { colors } = useAppTheme();

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
            <ThemedText style={styles.vehicleNumber}>{item.soxe}</ThemedText>
            <ThemedText type="subtitle" style={styles.weighTicketNumber}>
              #{item.sophieu}
            </ThemedText>
          </View>

          <View style={styles.infoRow}>
            <View style={styles.infoItem}>
              <ThemedText type="subtitle" style={styles.infoLabel}>
                Vào:
              </ThemedText>
              <ThemedText style={styles.infoValue}>
                {new Date(item.ngaycan1).toLocaleTimeString("vi-VN", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </ThemedText>
            </View>

            <View style={styles.infoItem}>
              <ThemedText type="subtitle" style={styles.infoLabel}>
                Trọng lượng:
              </ThemedText>
              <ThemedText style={styles.infoValue}>{item.tlcan1} kg</ThemedText>
            </View>
          </View>

          <View style={styles.bottomRow}>
            <ThemedText type="subtitle" style={styles.productName}>
              {item.loaihang}
            </ThemedText>
          </View>
        </View>
      </Card>
    );
  };

  return (
    <ThemedView useSafeArea>
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
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
      >
        <View style={styles.todayStatsContainer}>
          <Card style={styles.todayStatsCard} elevated>
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <ThemedText type="subtitle" style={styles.statLabel}>
                  Hôm nay:
                </ThemedText>
                <ThemedText style={styles.statValue}>
                  {todayStats.totalVehicles} xe
                </ThemedText>
              </View>
              <View
                style={[
                  styles.statDivider,
                  { backgroundColor: colors.gray200 },
                ]}
              />
              <View style={styles.statItem}>
                <ThemedText type="subtitle" style={styles.statLabel}>
                  Tổng trọng lượng:
                </ThemedText>
                <ThemedText style={styles.statValue}>
                  {formatWeight(todayStats.totalWeight)}
                </ThemedText>
              </View>
            </View>
          </Card>
        </View>

        <View style={styles.actionButtonsContainer}>
          <View style={styles.actionButtonRow}>
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: colors.card }]}
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
              <ThemedText style={styles.actionText}>Danh Sách Cân</ThemedText>
            </TouchableOpacity>
          </View>

          <View style={styles.actionButtonRow}>
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: colors.card }]}
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
              <ThemedText style={styles.actionText}>Báo Cáo</ThemedText>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: colors.card }]}
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
              <ThemedText style={styles.actionText}>Quản Lý</ThemedText>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.pendingWeighingsContainer}>
          <View style={styles.sectionHeader}>
            <ThemedText style={styles.sectionTitle}>
              Đang chờ cân ra ({pendingWeighings.length})
            </ThemedText>
            {pendingWeighings.length > 0 && (
              <TouchableOpacity onPress={handleViewAllWeighings}>
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
            <Card style={styles.emptyStateCard}>
              <View style={styles.emptyState}>
                <Ionicons
                  name="checkmark-circle"
                  size={48}
                  color={colors.gray400}
                />
                <ThemedText type="subtitle" style={styles.emptyStateText}>
                  Không có xe đang chờ cân ra
                </ThemedText>
              </View>
            </Card>
          )}
        </View>

        <View style={styles.activityContainer}>
          <View style={styles.sectionHeader}>
            <ThemedText style={styles.sectionTitle}>
              Hoạt động cân trong ngày
            </ThemedText>
          </View>

          <Card style={styles.activityChartCard}>
            <View style={styles.chartPlaceholder}>
              <View style={styles.barChart}>
                {[0.4, 0.2, 0.6, 0.3, 0.8, 0.5, 0.2].map((height, index) => (
                  <View
                    key={index}
                    style={[styles.barContainer, { height: 100 * height }]}
                  >
                    <View
                      style={[styles.bar, { backgroundColor: colors.primary }]}
                    />
                  </View>
                ))}
              </View>
            </View>
          </Card>
        </View>
      </ScrollView>

      <Loading loading={loading} />
    </ThemedView>
  );
};

const styles = StyleSheet.create({
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
  },
  statLabel: {
    fontSize: 14,
    marginBottom: 4,
  },
  statValue: {
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
  },
  productName: {
    fontSize: 14,
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
