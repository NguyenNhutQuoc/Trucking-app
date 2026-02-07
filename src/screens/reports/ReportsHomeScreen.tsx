// src/screens/reports/ReportsHomeScreen.tsx
import React, { useState, useEffect } from "react";
import { View, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

import { weighingApi } from "@/api/weighing";
import Header from "@/components/common/Header";
import Card from "@/components/common/Card";
import Button from "@/components/common/Button";
import Loading from "@/components/common/Loading";
import ThemedView from "@/components/common/ThemedView";
import ThemedText from "@/components/common/ThemedText";
import PieChart from "@/components/charts/PieChart";
import BarChart from "@/components/charts/BarChart";
import { useAppTheme } from "@/hooks/useAppTheme";
import { formatWeight } from "@/utils/formatters";
import {
  getTodayRange,
  getThisWeekRange,
  getThisMonthRange,
  formatDateForApi,
} from "@/utils/date";
import { ReportsStackScreenProps } from "@/types/navigation.types";
import { PhieucanStatistics } from "@/types/api.types";

type NavigationProp = ReportsStackScreenProps<"ReportsHome">["navigation"];

const ReportsHomeScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const { colors } = useAppTheme();

  const [loading, setLoading] = useState(true);
  const [statistics, setStatistics] = useState<PhieucanStatistics | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [timeframe, setTimeframe] = useState<"today" | "week" | "month">(
    "today",
  );

  useEffect(() => {
    loadStatistics();
  }, [timeframe]);

  const loadStatistics = async () => {
    try {
      setLoading(true);
      setError(null);

      let range;
      switch (timeframe) {
        case "week":
          range = getThisWeekRange();
          break;
        case "month":
          range = getThisMonthRange();
          break;
        case "today":
        default:
          range = getTodayRange();
          break;
      }

      const startDate = formatDateForApi(range.start);
      const endDate = formatDateForApi(range.end);

      console.log(`Loading stats for ${timeframe}: ${startDate} - ${endDate}`);

      const response = await weighingApi.getWeightStatistics(
        startDate,
        endDate,
      );
      
      if (response) {
        setStatistics(response.data);
      } else {
        setError("Không thể tải dữ liệu thống kê");
      }
    } catch (error) {
      console.error("Load statistics error:", error);
      setError("Lỗi kết nối. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  const handleTimeframeChange = (newTimeframe: "today" | "week" | "month") => {
    setTimeframe(newTimeframe);
  };

  const renderSegmentedControl = () => (
    <View style={[styles.segmentedContainer, { backgroundColor: colors.surfaceContainer }]}>
      {(["today", "week", "month"] as const).map((t) => {
        const isSelected = timeframe === t;
        const label =
          t === "today" ? "Hôm nay" : t === "week" ? "Tuần này" : "Tháng này";
        return (
          <TouchableOpacity
            key={t}
            style={[
              styles.segmentButton,
              isSelected && { backgroundColor: colors.secondaryContainer },
            ]}
            onPress={() => handleTimeframeChange(t)}
          >
            {isSelected && (
              <Ionicons name="checkmark" size={16} color={colors.onSecondaryContainer} style={styles.checkIcon} />
            )}
            <ThemedText
              style={[
                styles.segmentLabel,
                isSelected && { color: colors.onSecondaryContainer, fontWeight: "600" },
              ]}
            >
              {label}
            </ThemedText>
          </TouchableOpacity>
        );
      })}
    </View>
  );

  const renderReportItem = (
    title: string,
    icon: string,
    screen: string,
    description: string
  ) => (
    <TouchableOpacity
      style={[
        styles.reportItem,
        { backgroundColor: colors.surface, borderColor: colors.outlineVariant },
      ]}
      onPress={() => navigation.navigate(screen as any)}
    >
      <View
        style={[
          styles.reportIconContainer,
          { backgroundColor: colors.primaryContainer },
        ]}
      >
        <Ionicons name={icon as any} size={24} color={colors.onPrimaryContainer} />
      </View>
      <View style={styles.reportContent}>
        <ThemedText style={styles.reportItemTitle}>{title}</ThemedText>
        <ThemedText type="caption" style={{ color: colors.onSurfaceVariant }}>
          {description}
        </ThemedText>
      </View>
      <Ionicons name="chevron-forward" size={20} color={colors.onSurfaceVariant} />
    </TouchableOpacity>
  );

  return (
    <ThemedView useSafeArea>
      <Header title="Báo Cáo & Thống Kê" />

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {renderSegmentedControl()}

        {loading ? (
          <Loading loading />
        ) : (
          <>
            {error && (
              <Card style={styles.errorCard}>
                <View style={styles.errorContainer}>
                  <Ionicons
                    name="alert-circle-outline"
                    size={48}
                    color={colors.error}
                  />
                  <ThemedText style={[styles.errorText, { color: colors.error }]}>
                    {error}
                  </ThemedText>
                  <Button
                    title="Thử lại"
                    variant="tonal"
                    onPress={loadStatistics}
                    style={{ marginTop: 12 }}
                  />
                </View>
              </Card>
            )}

            {statistics && (
              <>
                <View style={styles.summaryContainer}>
                  <Card style={[styles.summaryCard, { backgroundColor: colors.primaryContainer }]}>
                    <View style={styles.summaryIconContainer}>
                      <Ionicons name="car-sport" size={24} color={colors.onPrimaryContainer} />
                    </View>
                    <ThemedText style={[styles.summaryLabel, { color: colors.onPrimaryContainer }]}>
                      Tổng số xe
                    </ThemedText>
                    <ThemedText style={[styles.summaryValue, { color: colors.onPrimaryContainer }]}>
                      {statistics.totalVehicles}
                    </ThemedText>
                  </Card>

                  <Card style={[styles.summaryCard, { backgroundColor: colors.secondaryContainer }]}>
                    <View style={styles.summaryIconContainer}>
                      <Ionicons name="scale" size={24} color={colors.onSecondaryContainer} />
                    </View>
                    <ThemedText style={[styles.summaryLabel, { color: colors.onSecondaryContainer }]}>
                      Tổng trọng lượng
                    </ThemedText>
                    <ThemedText style={[styles.summaryValue, { color: colors.onSecondaryContainer }]}>
                      {formatWeight(statistics.totalWeight, true)}
                    </ThemedText>
                  </Card>
                </View>

                {statistics.byProduct.length > 0 && (
                  <Card style={styles.chartCard}>
                    <View style={styles.cardHeader}>
                      <Ionicons name="pie-chart" size={20} color={colors.primary} />
                      <ThemedText style={styles.chartTitle}>
                        Phân bố theo loại hàng
                      </ThemedText>
                    </View>

                    <PieChart
                      data={statistics.byProduct.map((item) => ({
                        name: item.productName,
                        value: item.totalWeight,
                      }))}
                      height={200}
                    />
                  </Card>
                )}

                {statistics.byDay.length > 0 && (
                  <Card style={styles.chartCard}>
                    <View style={styles.cardHeader}>
                      <Ionicons name="bar-chart" size={20} color={colors.primary} />
                      <ThemedText style={styles.chartTitle}>
                        Hoạt động theo ngày
                      </ThemedText>
                    </View>

                    <BarChart
                      data={statistics.byDay.map((day) => ({
                        label: day.date.split("-")[2],
                        value: day.weighCount,
                      }))}
                      height={200}
                      barColor={colors.primary}
                    />
                  </Card>
                )}
              </>
            )}

            <ThemedText type="title" style={styles.sectionTitle}>
              Báo cáo chi tiết
            </ThemedText>

            <View style={styles.reportList}>
              {renderReportItem(
                "Theo khách hàng",
                "business-outline",
                "CompanyReports",
                "Thống kê theo đối tác, khách hàng"
              )}
              {renderReportItem(
                "Theo hàng hóa",
                "cube-outline",
                "ProductReports",
                "Chi tiết theo loại hàng, sản phẩm"
              )}
              {renderReportItem(
                "Theo xe",
                "car-outline",
                "VehicleReports",
                "Hoạt động của từng phương tiện"
              )}
              {renderReportItem(
                "Theo khoảng thời gian",
                "calendar-outline",
                "DateRangeReports",
                "Tùy chỉnh khoảng thời gian báo cáo"
              )}
              {renderReportItem(
                "Báo cáo tùy chỉnh",
                "options-outline",
                "CustomReport",
                "Bộ lọc nâng cao và xuất Excel"
              )}
            </View>

            <View style={styles.exportContainer}>
              <Button
                title="Xuất báo cáo tổng hợp"
                variant="primary"
                icon={<Ionicons name="download-outline" size={20} color="white" />}
                fullWidth
              />
            </View>
          </>
        )}
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
  segmentedContainer: {
    flexDirection: "row",
    borderRadius: 24, // Pill shape
    padding: 4,
    marginBottom: 24,
    height: 48,
    borderWidth: 1,
    borderColor: "transparent", 
  },
  segmentButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 20,
  },
  checkIcon: {
    marginRight: 6,
  },
  segmentLabel: {
    fontSize: 14,
    fontWeight: "500",
  },
  summaryContainer: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 24,
  },
  summaryCard: {
    flex: 1,
    padding: 16,
    alignItems: "flex-start",
    borderRadius: 16,
    elevation: 2,
  },
  summaryIconContainer: {
    marginBottom: 12,
    opacity: 0.8,
  },
  summaryLabel: {
    fontSize: 12,
    fontWeight: "500",
    marginBottom: 4,
    opacity: 0.9,
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: "700",
  },
  chartCard: {
    marginBottom: 24,
    padding: 16,
    borderRadius: 16,
    elevation: 1,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    gap: 8,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: "600",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginTop: 8,
    marginBottom: 16,
  },
  reportList: {
    gap: 12,
    marginBottom: 24,
  },
  reportItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    elevation: 0,
  },
  reportIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  reportContent: {
    flex: 1,
  },
  reportItemTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 2,
  },
  exportContainer: {
    marginBottom: 16,
  },
  errorCard: {
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: "#B00020",
  },
  errorContainer: {
    alignItems: "center",
    paddingVertical: 16,
  },
  errorText: {
    marginTop: 8,
    marginBottom: 16,
    textAlign: "center",
  },
});

export default ReportsHomeScreen;
