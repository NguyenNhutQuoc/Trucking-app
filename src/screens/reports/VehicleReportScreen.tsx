// src/screens/reports/VehicleReportsScreen.tsx
import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { LineChart } from "react-native-chart-kit";
import { Dimensions } from "react-native";

import { vehicleApi } from "@/api/vehicle";
import { weighingApi } from "@/api/weighing";
import Header from "@/components/common/Header";
import Card from "@/components/common/Card";
import Button from "@/components/common/Button";
import Loading from "@/components/common/Loading";
import DateRangeSelector from "@/components/reports/DateRangeSelector";
import ThemedView from "@/components/common/ThemedView";
import ThemedText from "@/components/common/ThemedText";
import { useAppTheme } from "@/hooks/useAppTheme";
import { formatWeight } from "@/utils/formatters";
import { Soxe } from "@/types/api.types";
import { ReportsStackScreenProps } from "@/types/navigation.types";

type NavigationProp = ReportsStackScreenProps<"VehicleReports">["navigation"];
const screenWidth = Dimensions.get("window").width;

const VehicleReportsScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const { colors, isDarkMode } = useAppTheme();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [vehicles, setVehicles] = useState<Soxe[]>([]);
  const [vehicleStats, setVehicleStats] = useState<any[]>([]);
  const [startDate, setStartDate] = useState<Date>(
    new Date(new Date().setDate(new Date().getDate() - 30)),
  );
  const [endDate, setEndDate] = useState<Date>(new Date());
  const [totalWeight, setTotalWeight] = useState(0);
  const [totalVehicles, setTotalVehicles] = useState(0);
  const [averageWeight, setAverageWeight] = useState(0);

  // Sort options
  const [sortBy, setSortBy] = useState<"count" | "weight">("weight");

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [startDate, endDate]),
  );

  const loadData = async () => {
    try {
      setLoading(true);
      await Promise.all([loadVehicles(), loadWeightStatistics()]);
    } catch (error) {
      console.error("Load data error:", error);
      Alert.alert("Lỗi", "Không thể tải dữ liệu. Vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  };

  const loadVehicles = async () => {
    try {
      const response = await vehicleApi.getAllVehicles();
      if (response.success) {
        setVehicles(response.data);
      }
    } catch (error) {
      console.error("Load vehicles error:", error);
    }
  };

  const loadWeightStatistics = async () => {
    try {
      // Format dates for API
      const formattedStartDate = startDate.toISOString();
      const formattedEndDate = endDate.toISOString();

      const response = await weighingApi.getWeightStatistics(
        formattedStartDate,
        formattedEndDate,
      );

      if (response.success) {
        const stats = response.data;
        setTotalWeight(stats.totalWeight);
        setTotalVehicles(stats.totalVehicles);

        // Sort vehicles based on selected criteria
        const sortedVehicleStats =
          sortBy === "weight"
            ? [...stats.byVehicle].sort((a, b) => b.totalWeight - a.totalWeight)
            : [...stats.byVehicle].sort((a, b) => b.weighCount - a.weighCount);

        setVehicleStats(sortedVehicleStats);

        // Calculate overall average weight per vehicle
        if (stats.totalVehicles > 0) {
          setAverageWeight(stats.totalWeight / stats.totalVehicles);
        }
      }
    } catch (error) {
      console.error("Load weight statistics error:", error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleDateRangeChange = (start: Date, end: Date) => {
    setStartDate(start);
    setEndDate(end);
  };

  const toggleSortBy = () => {
    setSortBy(sortBy === "weight" ? "count" : "weight");

    // Re-sort the data
    const newSorted = [...vehicleStats].sort((a, b) => {
      if (sortBy === "weight") {
        return b.weighCount - a.weighCount;
      } else {
        return b.totalWeight - a.totalWeight;
      }
    });

    setVehicleStats(newSorted);
  };

  const renderVehicleItem = ({ item, index }: { item: any; index: number }) => {
    const vehicle = vehicles.find((v) => v.soxe === item.vehicleNumber);
    const percentageOfTotal =
      totalWeight > 0
        ? ((item.totalWeight / totalWeight) * 100).toFixed(1)
        : "0";

    // Calculate efficiency compared to average
    const efficiencyPercentage =
      averageWeight > 0 ? (item.averageWeight / averageWeight) * 100 : 100;

    const efficiencyColor =
      efficiencyPercentage > 110
        ? colors.success
        : efficiencyPercentage < 90
          ? colors.error
          : colors.primary;

    return (
      <Card style={styles.vehicleCard}>
        <View style={styles.vehicleHeader}>
          <View style={styles.vehicleHeaderLeft}>
            <View
              style={[
                styles.vehicleIconContainer,
                { backgroundColor: colors.primary + "15" },
              ]}
            >
              <Ionicons name="car" size={20} color={colors.primary} />
            </View>
            <ThemedText style={styles.vehicleNumber}>
              {item.vehicleNumber}
            </ThemedText>
          </View>
          <View
            style={[
              styles.percentageContainer,
              { backgroundColor: colors.gray100 },
            ]}
          >
            <ThemedText style={styles.percentageText} color={colors.primary}>
              {percentageOfTotal}%
            </ThemedText>
          </View>
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statRow}>
            <View style={styles.statItem}>
              <ThemedText type="subtitle" style={styles.statLabel}>
                Số lượt cân:
              </ThemedText>
              <ThemedText style={styles.statValue}>
                {item.weighCount} lượt
              </ThemedText>
            </View>
            <View style={styles.statItem}>
              <ThemedText type="subtitle" style={styles.statLabel}>
                Tổng trọng lượng:
              </ThemedText>
              <ThemedText style={styles.statValue}>
                {formatWeight(item.totalWeight)}
              </ThemedText>
            </View>
          </View>

          <View style={styles.statRow}>
            <View style={styles.statItem}>
              <ThemedText type="subtitle" style={styles.statLabel}>
                Trọng lượng TB/lượt:
              </ThemedText>
              <ThemedText style={styles.statValue}>
                {formatWeight(item.averageWeight)}
              </ThemedText>
            </View>
            <View style={styles.statItem}>
              <ThemedText type="subtitle" style={styles.statLabel}>
                Hiệu suất:
              </ThemedText>
              <ThemedText
                style={[styles.statValue, { color: efficiencyColor }]}
              >
                {Math.round(efficiencyPercentage)}%
              </ThemedText>
            </View>
          </View>
        </View>

        {vehicle && (
          <View
            style={[styles.vehicleInfo, { borderTopColor: colors.gray200 }]}
          >
            <ThemedText type="caption" style={styles.vehicleInfoText}>
              Trọng lượng xe: {formatWeight(vehicle.trongluong)}
            </ThemedText>
          </View>
        )}
      </Card>
    );
  };

  const getVehicleTrendData = () => {
    // Get top 5 vehicles by weight
    const topVehicles = vehicleStats.slice(0, 5);

    // For a line chart, use the count for each of the top vehicles
    return {
      labels: topVehicles.map((item) => item.vehicleNumber.substring(0, 7)),
      datasets: [
        {
          data: topVehicles.map((item) => item.averageWeight / 1000), // Convert to tons
          color: () => colors.primary,
          strokeWidth: 2,
        },
      ],
      legend: ["Trọng lượng TB (tấn)"],
    };
  };

  return (
    <ThemedView useSafeArea>
      <Header title="Báo Cáo Theo Xe" showBack />

      <View style={styles.container}>
        <DateRangeSelector
          allowFutureDates={true}
          startDate={startDate}
          endDate={endDate}
          onDateRangeChange={handleDateRangeChange}
          style={styles.dateRangeSelector}
        />

        {loading ? (
          <View style={styles.loadingContainer}>
            <Loading loading={true} />
            <ThemedText style={styles.loadingText}>
              Đang tải dữ liệu...
            </ThemedText>
          </View>
        ) : (
          <FlatList
            data={vehicleStats}
            renderItem={renderVehicleItem}
            keyExtractor={(item, index) => index.toString()}
            ListHeaderComponent={
              <View>
                <Card style={styles.summaryCard}>
                  <View style={styles.summaryRow}>
                    <View style={styles.summaryItem}>
                      <ThemedText type="subtitle" style={styles.summaryLabel}>
                        Tổng xe:
                      </ThemedText>
                      <ThemedText style={styles.summaryValue}>
                        {totalVehicles}
                      </ThemedText>
                    </View>

                    <View
                      style={[
                        styles.summaryDivider,
                        { backgroundColor: colors.gray200 },
                      ]}
                    />

                    <View style={styles.summaryItem}>
                      <ThemedText type="subtitle" style={styles.summaryLabel}>
                        Tổng trọng lượng:
                      </ThemedText>
                      <ThemedText style={styles.summaryValue}>
                        {formatWeight(totalWeight, true)}
                      </ThemedText>
                    </View>
                  </View>

                  <View
                    style={[
                      styles.averageContainer,
                      { borderTopColor: colors.gray200 },
                    ]}
                  >
                    <ThemedText type="subtitle" style={styles.averageLabel}>
                      Trọng lượng TB/xe:
                    </ThemedText>
                    <ThemedText
                      style={styles.averageValue}
                      color={colors.primary}
                    >
                      {formatWeight(averageWeight)}
                    </ThemedText>
                  </View>
                </Card>

                {vehicleStats.length > 0 && (
                  <Card style={styles.chartCard}>
                    <ThemedText style={styles.chartTitle}>
                      Trọng lượng trung bình theo xe (tấn)
                    </ThemedText>
                    <View style={styles.chartContainer}>
                      <LineChart
                        data={getVehicleTrendData()}
                        width={screenWidth - 40}
                        height={200}
                        yAxisSuffix="t"
                        chartConfig={{
                          backgroundColor: colors.card,
                          backgroundGradientFrom: colors.card,
                          backgroundGradientTo: colors.card,
                          decimalPlaces: 1,
                          color: (opacity = 1) =>
                            `rgba(92, 124, 250, ${opacity})`,
                          labelColor: (opacity = 1) =>
                            isDarkMode
                              ? `rgba(255, 255, 255, ${opacity})`
                              : `rgba(0, 0, 0, ${opacity})`,
                          style: {
                            borderRadius: 16,
                          },
                          propsForDots: {
                            r: "6",
                            strokeWidth: "2",
                            stroke: colors.primary,
                          },
                        }}
                        style={{
                          marginVertical: 8,
                          borderRadius: 16,
                        }}
                        bezier
                      />
                    </View>
                  </Card>
                )}

                <View style={styles.sortContainer}>
                  <ThemedText type="title" style={styles.sectionTitle}>
                    Chi tiết theo xe
                  </ThemedText>
                  <TouchableOpacity
                    style={[
                      styles.sortButton,
                      { backgroundColor: colors.gray100 },
                    ]}
                    onPress={toggleSortBy}
                  >
                    <ThemedText
                      style={styles.sortButtonText}
                      color={colors.primary}
                    >
                      Sắp xếp theo:{" "}
                      {sortBy === "weight" ? "Trọng lượng" : "Số lượt cân"}
                    </ThemedText>
                    <Ionicons
                      name="swap-vertical"
                      size={18}
                      color={colors.primary}
                    />
                  </TouchableOpacity>
                </View>
              </View>
            }
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Ionicons
                  name="analytics-outline"
                  size={48}
                  color={colors.gray400}
                />
                <ThemedText style={styles.emptyText}>
                  Không có dữ liệu trong khoảng thời gian này
                </ThemedText>
              </View>
            }
            contentContainerStyle={styles.listContent}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={[colors.primary]}
                tintColor={colors.primary}
                progressBackgroundColor={colors.card}
              />
            }
          />
        )}
      </View>

      <View
        style={[
          styles.exportContainer,
          {
            backgroundColor: colors.background,
            borderTopColor: colors.gray200,
          },
        ]}
      >
        <Button
          title="Xuất báo cáo"
          variant="primary"
          icon={<Ionicons name="download-outline" size={20} color="white" />}
          fullWidth
        />
      </View>
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  dateRangeSelector: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
  },
  listContent: {
    padding: 16,
    paddingBottom: 80,
  },
  summaryCard: {
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  summaryItem: {
    flex: 1,
    padding: 12,
    alignItems: "center",
  },
  summaryDivider: {
    width: 1,
    height: "70%",
  },
  summaryLabel: {
    fontSize: 14,
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: "600",
  },
  averageContainer: {
    borderTopWidth: 1,
    paddingVertical: 12,
    alignItems: "center",
  },
  averageLabel: {
    fontSize: 14,
    marginBottom: 4,
  },
  averageValue: {
    fontSize: 18,
    fontWeight: "600",
  },
  chartCard: {
    marginBottom: 16,
    padding: 16,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
  },
  chartContainer: {
    alignItems: "center",
    marginVertical: 8,
  },
  sortContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sortButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 20,
  },
  sortButtonText: {
    fontSize: 12,
    marginRight: 4,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
  },
  vehicleCard: {
    marginBottom: 12,
  },
  vehicleHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  vehicleHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  vehicleIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  vehicleNumber: {
    fontSize: 16,
    fontWeight: "600",
  },
  percentageContainer: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  percentageText: {
    fontSize: 14,
    fontWeight: "600",
  },
  statsContainer: {
    marginBottom: 12,
  },
  statRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  statItem: {
    flex: 1,
  },
  statLabel: {
    fontSize: 14,
  },
  statValue: {
    fontSize: 14,
    fontWeight: "500",
  },
  vehicleInfo: {
    borderTopWidth: 1,
    paddingTop: 10,
  },
  vehicleInfoText: {
    fontSize: 12,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 48,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 14,
    textAlign: "center",
  },
  exportContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    borderTopWidth: 1,
  },
});

export default VehicleReportsScreen;
