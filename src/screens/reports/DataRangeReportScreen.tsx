import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  RefreshControl,
  Alert,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { LineChart } from "react-native-chart-kit";

import { weighingApi } from "@/api/weighing";
import Header from "@/components/common/Header";
import Card from "@/components/common/Card";
import Button from "@/components/common/Button";
import DateRangeSelector from "@/components/reports/DateRangeSelector";
import ViewModeToggle from "@/components/common/ViewModeToogle";
import ThemedView from "@/components/common/ThemedView";
import ThemedText from "@/components/common/ThemedText";
import { useAppTheme } from "@/hooks/useAppTheme";
import { formatWeight, formatDate } from "@/utils/formatters";
import { ReportsStackScreenProps } from "@/types/navigation.types";

type NavigationProp = ReportsStackScreenProps<"DateRangeReports">["navigation"];
type ViewMode = "list" | "grid";

const screenWidth = Dimensions.get("window").width;

interface DailyData {
  date: string;
  weighCount: number;
  totalWeight: number;
  formattedDate: string;
}

const DateRangeReportsScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const { colors, isDarkMode } = useAppTheme();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [dailyData, setDailyData] = useState<DailyData[]>([]);
  const [startDate, setStartDate] = useState<Date>(
    new Date(new Date().setDate(new Date().getDate() - 30)),
  );
  const [endDate, setEndDate] = useState<Date>(new Date());
  const [totalWeight, setTotalWeight] = useState(0);
  const [totalVehicles, setTotalVehicles] = useState(0);
  const [averageDailyWeight, setAverageDailyWeight] = useState(0);
  const [averageDailyVehicles, setAverageDailyVehicles] = useState(0);
  const [viewMode, setViewMode] = useState<ViewMode>("list");

  // Chart view options
  const [chartType, setChartType] = useState<"weight" | "count">("weight");

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [startDate, endDate]),
  );

  const loadData = async () => {
    try {
      setLoading(true);
      await loadWeightStatistics();
    } catch (error) {
      console.error("Load data error:", error);
      Alert.alert("Lỗi", "Không thể tải dữ liệu. Vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  };

  const loadWeightStatistics = async () => {
    try {
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

        const processedDailyData = stats.byDay.map((day: any) => {
          const dateObj = new Date(day.date);
          const formattedDate = formatDate(day.date);

          return {
            ...day,
            formattedDate,
          };
        });

        processedDailyData.sort((a: any, b: any) => {
          return new Date(a.date).getTime() - new Date(b.date).getTime();
        });

        setDailyData(processedDailyData);

        if (processedDailyData.length > 0) {
          setAverageDailyWeight(stats.totalWeight / processedDailyData.length);
          setAverageDailyVehicles(
            stats.totalVehicles / processedDailyData.length,
          );
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

  const toggleViewMode = () => {
    setViewMode(viewMode === "list" ? "grid" : "list");
  };

  const toggleChartType = () => {
    setChartType(chartType === "weight" ? "count" : "weight");
  };

  // Grid Item Component
  const renderGridItem = ({ item }: { item: DailyData }) => {
    const weightPercentage =
      averageDailyWeight > 0
        ? (item.totalWeight / averageDailyWeight) * 100
        : 0;

    const countPercentage =
      averageDailyVehicles > 0
        ? (item.weighCount / averageDailyVehicles) * 100
        : 0;

    const getPerformanceColor = (percentage: number) => {
      if (percentage >= 120) return colors.success;
      if (percentage <= 80) return colors.error;
      return colors.text;
    };

    const averageWeightPerTrip =
      item.weighCount > 0 ? item.totalWeight / item.weighCount : 0;

    return (
      <View style={styles.gridItem}>
        <Card style={styles.gridCard}>
          <View style={styles.gridHeader}>
            <View
              style={[
                styles.gridIconContainer,
                { backgroundColor: colors.primary + "15" },
              ]}
            >
              <Ionicons name="calendar" size={16} color={colors.primary} />
            </View>
          </View>

          <ThemedText style={styles.gridDateText} numberOfLines={1}>
            {item.formattedDate}
          </ThemedText>

          <View style={styles.gridStats}>
            <View style={styles.gridStatItem}>
              <ThemedText type="caption" style={styles.gridStatLabel}>
                Số lượt cân
              </ThemedText>
              <ThemedText
                style={styles.gridStatValue}
                color={getPerformanceColor(countPercentage)}
              >
                {item.weighCount}
              </ThemedText>
              <ThemedText type="caption" style={styles.gridPercentageText}>
                {countPercentage > 0 ? Math.round(countPercentage) : 0}% TB
              </ThemedText>
            </View>

            <View style={styles.gridStatItem}>
              <ThemedText type="caption" style={styles.gridStatLabel}>
                Trọng lượng
              </ThemedText>
              <ThemedText
                style={styles.gridStatValue}
                color={getPerformanceColor(weightPercentage)}
                numberOfLines={1}
              >
                {formatWeight(item.totalWeight, true)}
              </ThemedText>
              <ThemedText type="caption" style={styles.gridPercentageText}>
                {weightPercentage > 0 ? Math.round(weightPercentage) : 0}% TB
              </ThemedText>
            </View>

            <View style={styles.gridStatItem}>
              <ThemedText type="caption" style={styles.gridStatLabel}>
                TB/lượt cân
              </ThemedText>
              <ThemedText style={styles.gridStatValue} numberOfLines={1}>
                {formatWeight(averageWeightPerTrip, true)}
              </ThemedText>
            </View>
          </View>
        </Card>
      </View>
    );
  };

  // List Item Component
  const renderListItem = ({ item }: { item: DailyData }) => {
    const weightPercentage =
      averageDailyWeight > 0
        ? (item.totalWeight / averageDailyWeight) * 100
        : 0;

    const countPercentage =
      averageDailyVehicles > 0
        ? (item.weighCount / averageDailyVehicles) * 100
        : 0;

    const getPerformanceColor = (percentage: number) => {
      if (percentage >= 120) return colors.success;
      if (percentage <= 80) return colors.error;
      return colors.text;
    };

    return (
      <Card style={styles.dayCard}>
        <View style={styles.dayHeader}>
          <View style={styles.dateContainer}>
            <Ionicons name="calendar" size={18} color={colors.primary} />
            <ThemedText style={styles.dateText}>
              {item.formattedDate}
            </ThemedText>
          </View>
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statRow}>
            <View style={styles.statItem}>
              <ThemedText type="subtitle" style={styles.statLabel}>
                Số lượt cân:
              </ThemedText>
              <ThemedText
                style={styles.statValue}
                color={getPerformanceColor(countPercentage)}
              >
                {item.weighCount} lượt
              </ThemedText>
              <ThemedText type="caption" style={styles.percentageText}>
                {countPercentage > 0 ? Math.round(countPercentage) : 0}% TB
              </ThemedText>
            </View>
            <View style={styles.statItem}>
              <ThemedText type="subtitle" style={styles.statLabel}>
                Tổng trọng lượng:
              </ThemedText>
              <ThemedText
                style={styles.statValue}
                color={getPerformanceColor(weightPercentage)}
              >
                {formatWeight(item.totalWeight)}
              </ThemedText>
              <ThemedText type="caption" style={styles.percentageText}>
                {weightPercentage > 0 ? Math.round(weightPercentage) : 0}% TB
              </ThemedText>
            </View>
          </View>

          <View style={styles.averageWeightContainer}>
            <ThemedText type="subtitle" style={styles.averageWeightLabel}>
              Trọng lượng trung bình / lượt cân:
            </ThemedText>
            <ThemedText style={styles.averageWeightValue}>
              {item.weighCount > 0
                ? formatWeight(item.totalWeight / item.weighCount)
                : "0 kg"}
            </ThemedText>
          </View>
        </View>
      </Card>
    );
  };

  const getChartData = () => {
    const chartData = dailyData.slice(-14);

    const dataValues =
      chartType === "weight"
        ? chartData.map((item) => item.totalWeight)
        : chartData.map((item) => item.weighCount);

    const chartTitle =
      chartType === "weight"
        ? "Tổng trọng lượng theo ngày (kg)"
        : "Số lượt cân theo ngày";

    const yAxisSuffix = chartType === "weight" ? "t" : "";

    return {
      chartData: {
        labels: chartData.map((item) => {
          const date = new Date(item.date);
          return `${date.getDate()}/${date.getMonth() + 1}`;
        }),
        datasets: [
          {
            data: dataValues,
            color: (opacity = 1) =>
              chartType === "weight" ? colors.chartBlue : colors.chartGreen,
            strokeWidth: 2,
          },
        ],
        legend: [chartType === "weight" ? "Trọng lượng (kg)" : "Số lượt cân"],
      },
      chartTitle,
      yAxisSuffix,
    };
  };

  const renderEmptyComponent = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="analytics-outline" size={48} color={colors.gray400} />
      <ThemedText style={styles.emptyText}>
        Không có dữ liệu trong khoảng thời gian này
      </ThemedText>
    </View>
  );

  const renderListHeader = () => (
    <>
      {/* Date Range Selector */}
      <View style={styles.dateRangeSelectorContainer}>
        <DateRangeSelector
          allowFutureDates={false}
          startDate={startDate}
          endDate={endDate}
          onDateRangeChange={handleDateRangeChange}
        />
      </View>

      {/* Summary Card */}
      <Card style={styles.summaryCard}>
        <View style={styles.summaryRow}>
          <View style={styles.summaryItem}>
            <ThemedText type="subtitle" style={styles.summaryLabel}>
              Tổng xe:
            </ThemedText>
            <ThemedText style={styles.summaryValue}>{totalVehicles}</ThemedText>
          </View>

          <View
            style={[styles.summaryDivider, { backgroundColor: colors.gray200 }]}
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
          style={[styles.averagesContainer, { borderTopColor: colors.gray200 }]}
        >
          <View style={styles.averageItem}>
            <ThemedText type="subtitle" style={styles.averageLabel}>
              TB xe/ngày:
            </ThemedText>
            <ThemedText style={styles.averageValue} color={colors.primary}>
              {averageDailyVehicles.toFixed(1)}
            </ThemedText>
          </View>

          <View
            style={[styles.summaryDivider, { backgroundColor: colors.gray200 }]}
          />

          <View style={styles.averageItem}>
            <ThemedText type="subtitle" style={styles.averageLabel}>
              TB trọng lượng/ngày:
            </ThemedText>
            <ThemedText style={styles.averageValue} color={colors.primary}>
              {formatWeight(averageDailyWeight, true)}
            </ThemedText>
          </View>
        </View>
      </Card>

      {/* Chart Card */}
      {dailyData.length > 0 && (
        <Card style={styles.chartCard}>
          <View style={styles.chartHeader}>
            <ThemedText style={styles.chartTitle}>
              {getChartData().chartTitle}
            </ThemedText>
            <TouchableOpacity
              style={[
                styles.chartToggleButton,
                { backgroundColor: colors.gray100 },
              ]}
              onPress={toggleChartType}
            >
              <Ionicons
                name={chartType === "weight" ? "bar-chart" : "scale"}
                size={20}
                color={colors.primary}
              />
            </TouchableOpacity>
          </View>
          <View style={styles.chartContainer}>
            <LineChart
              data={getChartData().chartData}
              width={screenWidth - 40}
              height={220}
              yAxisSuffix={getChartData().yAxisSuffix}
              chartConfig={{
                backgroundColor: colors.card,
                backgroundGradientFrom: colors.card,
                backgroundGradientTo: colors.card,
                decimalPlaces: chartType === "weight" ? 1 : 0,
                color: (opacity = 1) =>
                  isDarkMode
                    ? `rgba(255, 255, 255, ${opacity})`
                    : `rgba(0, 0, 0, ${opacity})`,
                labelColor: (opacity = 1) =>
                  isDarkMode
                    ? `rgba(255, 255, 255, ${opacity})`
                    : `rgba(0, 0, 0, ${opacity})`,
                style: {
                  borderRadius: 16,
                },
                propsForDots: {
                  r: "5",
                  strokeWidth: "2",
                  stroke:
                    chartType === "weight"
                      ? colors.chartBlue
                      : colors.chartGreen,
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

      {/* Section Title */}
      <ThemedText type="title" style={styles.sectionTitle}>
        Chi tiết theo ngày ({dailyData.length})
      </ThemedText>
    </>
  );

  if (loading) {
    return (
      <ThemedView useSafeArea>
        <Header
          title="Báo Cáo Theo Thời Gian"
          showBack
          rightComponent={
            <ViewModeToggle viewMode={viewMode} onToggle={toggleViewMode} />
          }
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <ThemedText style={styles.loadingText}>
            Đang tải dữ liệu...
          </ThemedText>
        </View>
      </ThemedView>
    );
  }

  return (
    <ThemedView useSafeArea>
      <Header
        title="Báo Cáo Theo Thời Gian"
        showBack
        rightComponent={
          <ViewModeToggle viewMode={viewMode} onToggle={toggleViewMode} />
        }
      />

      <FlatList
        key={viewMode} // Force re-render when switching view modes
        data={dailyData}
        renderItem={viewMode === "grid" ? renderGridItem : renderListItem}
        keyExtractor={(item) => `${viewMode}-${item.date}`}
        numColumns={viewMode === "grid" ? 2 : 1}
        columnWrapperStyle={viewMode === "grid" ? styles.gridRow : undefined}
        ListHeaderComponent={renderListHeader}
        ListEmptyComponent={renderEmptyComponent}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
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

      {/* Export Button */}
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
    paddingHorizontal: 16,
    paddingBottom: 100, // Extra space for export button
  },
  dateRangeSelectorContainer: {
    paddingVertical: 12,
  },

  // Summary Card Styles
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
  averagesContainer: {
    flexDirection: "row",
    borderTopWidth: 1,
    paddingVertical: 12,
  },
  averageItem: {
    flex: 1,
    alignItems: "center",
  },
  averageLabel: {
    fontSize: 14,
    marginBottom: 4,
    textAlign: "center",
  },
  averageValue: {
    fontSize: 16,
    fontWeight: "600",
  },

  // Chart Card Styles
  chartCard: {
    marginBottom: 16,
    padding: 16,
  },
  chartHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: "600",
  },
  chartToggleButton: {
    padding: 8,
    borderRadius: 20,
  },
  chartContainer: {
    alignItems: "center",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12,
  },

  // List Item Styles
  dayCard: {
    marginBottom: 12,
  },
  dayHeader: {
    marginBottom: 12,
  },
  dateContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  dateText: {
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  statsContainer: {
    marginBottom: 4,
  },
  statRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  statItem: {
    flex: 1,
  },
  statLabel: {
    fontSize: 14,
    marginBottom: 2,
  },
  statValue: {
    fontSize: 15,
    fontWeight: "500",
  },
  percentageText: {
    fontSize: 12,
  },
  averageWeightContainer: {
    marginTop: 4,
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.1)",
    paddingTop: 10,
  },
  averageWeightLabel: {
    fontSize: 14,
  },
  averageWeightValue: {
    fontSize: 15,
    fontWeight: "600",
    marginTop: 4,
  },

  // Grid Styles
  gridRow: {
    justifyContent: "space-between",
  },
  gridItem: {
    width: "48%",
    marginBottom: 12,
  },
  gridCard: {
    height: 180,
  },
  gridHeader: {
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center",
    marginBottom: 8,
  },
  gridIconContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  gridDateText: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
  },
  gridStats: {
    flex: 1,
    justifyContent: "space-between",
  },
  gridStatItem: {
    marginBottom: 6,
  },
  gridStatLabel: {
    fontSize: 11,
    marginBottom: 2,
  },
  gridStatValue: {
    fontSize: 13,
    fontWeight: "600",
  },
  gridPercentageText: {
    fontSize: 10,
    marginTop: 1,
  },

  // Common Styles
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

export default DateRangeReportsScreen;
