// src/screens/reports/DateRangeReportsScreen.tsx
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

import { weighingApi } from "@/api/weighing";
import Header from "@/components/common/Header";
import Card from "@/components/common/Card";
import Button from "@/components/common/Button";
import DateRangeSelector from "@/components/reports/DateRangeSelector";
import ThemedView from "@/components/common/ThemedView";
import ThemedText from "@/components/common/ThemedText";
import { useAppTheme } from "@/hooks/useAppTheme";
import { formatWeight, formatDate } from "@/utils/formatters";
import { ReportsStackScreenProps } from "@/types/navigation.types";

type NavigationProp = ReportsStackScreenProps<"DateRangeReports">["navigation"];
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

        // Process daily data
        const processedDailyData = stats.byDay.map((day: any) => {
          // Convert date format to display format
          const dateObj = new Date(day.date);
          const formattedDate = formatDate(day.date);

          return {
            ...day,
            formattedDate,
          };
        });

        // Sort by date ascending
        processedDailyData.sort((a: any, b: any) => {
          return new Date(a.date).getTime() - new Date(b.date).getTime();
        });

        setDailyData(processedDailyData);

        // Calculate averages
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

  const toggleChartType = () => {
    setChartType(chartType === "weight" ? "count" : "weight");
  };

  const renderDayItem = ({ item }: { item: DailyData }) => {
    // Calculate percentage of average
    const weightPercentage =
      averageDailyWeight > 0
        ? (item.totalWeight / averageDailyWeight) * 100
        : 0;

    const countPercentage =
      averageDailyVehicles > 0
        ? (item.weighCount / averageDailyVehicles) * 100
        : 0;

    // Determine color based on how far from average
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
    // Get the last 14 days (or fewer if less data available)
    const chartData = dailyData.slice(-14);

    // Determine what data to display based on chart type
    const dataValues =
      chartType === "weight"
        ? chartData.map((item) => item.totalWeight / 1000) // Convert to tons
        : chartData.map((item) => item.weighCount);

    const chartTitle =
      chartType === "weight"
        ? "Tổng trọng lượng theo ngày (tấn)"
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
        legend: [chartType === "weight" ? "Trọng lượng (tấn)" : "Số lượt cân"],
      },
      chartTitle,
      yAxisSuffix,
    };
  };

  return (
    <ThemedView useSafeArea>
      <Header title="Báo Cáo Theo Thời Gian" showBack />

      <View style={styles.container}>
        <DateRangeSelector
          allowFutureDates={true} // Không cho phép chọn ngày tương lai
          startDate={startDate}
          endDate={endDate}
          onDateRangeChange={handleDateRangeChange}
          style={styles.dateRangeSelector}
        />

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <ThemedText style={styles.loadingText}>
              Đang tải dữ liệu...
            </ThemedText>
          </View>
        ) : (
          <FlatList
            data={dailyData}
            renderItem={renderDayItem}
            keyExtractor={(item) => item.date}
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
                      styles.averagesContainer,
                      { borderTopColor: colors.gray200 },
                    ]}
                  >
                    <View style={styles.averageItem}>
                      <ThemedText type="subtitle" style={styles.averageLabel}>
                        TB xe/ngày:
                      </ThemedText>
                      <ThemedText
                        style={styles.averageValue}
                        color={colors.primary}
                      >
                        {averageDailyVehicles.toFixed(1)}
                      </ThemedText>
                    </View>

                    <View
                      style={[
                        styles.summaryDivider,
                        { backgroundColor: colors.gray200 },
                      ]}
                    />

                    <View style={styles.averageItem}>
                      <ThemedText type="subtitle" style={styles.averageLabel}>
                        TB trọng lượng/ngày:
                      </ThemedText>
                      <ThemedText
                        style={styles.averageValue}
                        color={colors.primary}
                      >
                        {formatWeight(averageDailyWeight, true)}
                      </ThemedText>
                    </View>
                  </View>
                </Card>

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

                <ThemedText type="title" style={styles.sectionTitle}>
                  Chi tiết theo ngày
                </ThemedText>
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
