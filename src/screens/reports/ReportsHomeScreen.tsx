// src/screens/reports/ReportsHomeScreen.tsx
import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";

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
import { ROUTE_PATH_MAP } from "@/constants/routes";
import { PhieucanStatistics } from "@/types/api.types";

// Per-category accent colors for report list items
const REPORT_ITEM_COLORS = {
  CompanyReports:   { bg: "#3F51B5", icon: "#3F51B5" }, // indigo
  ProductReports:   { bg: "#00897B", icon: "#00897B" }, // teal
  VehicleReports:   { bg: "#FB8C00", icon: "#FB8C00" }, // amber
  DateRangeReports: { bg: "#8E24AA", icon: "#8E24AA" }, // purple
  CustomReport:     { bg: "#E91E63", icon: "#E91E63" }, // pink
};

const ReportsHomeScreen: React.FC = () => {
  const router = useRouter();
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

  // Compute average per day (only meaningful for week/month)
  const avgPerDay = (() => {
    if (!statistics) return 0;
    if (timeframe === "week") return Math.round(statistics.totalVehicles / 7);
    if (timeframe === "month") return Math.round(statistics.totalVehicles / 30);
    return statistics.totalVehicles; // today: same value
  })();

  const statusGood = statistics ? statistics.totalVehicles > 0 : false;

  // ── Pill chips time filter ────────────────────────────────────────────────
  const renderTimeFilter = () => (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.chipRow}
    >
      {(["today", "week", "month"] as const).map((t) => {
        const isSelected = timeframe === t;
        const label =
          t === "today" ? "Hôm nay" : t === "week" ? "Tuần này" : "Tháng này";
        return (
          <TouchableOpacity
            key={t}
            activeOpacity={0.8}
            style={[
              styles.chip,
              isSelected
                ? { backgroundColor: colors.primary, borderColor: colors.primary }
                : { backgroundColor: "transparent", borderColor: colors.primary },
            ]}
            onPress={() => handleTimeframeChange(t)}
          >
            <ThemedText
              style={[
                styles.chipLabel,
                { color: isSelected ? "#FFFFFF" : colors.primary },
              ]}
            >
              {label}
            </ThemedText>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );

  // ── KPI card ──────────────────────────────────────────────────────────────
  const renderKpiCard = (
    gradientColors: [string, string],
    icon: string,
    value: string,
    label: string,
    trendUp: boolean,
  ) => (
    <LinearGradient
      colors={gradientColors}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.kpiCard}
    >
      {/* Icon circle */}
      <View style={styles.kpiIconCircle}>
        <Ionicons name={icon as any} size={20} color="#FFFFFF" />
      </View>

      {/* Value + trend */}
      <View style={styles.kpiValueRow}>
        <ThemedText style={styles.kpiValue}>{value}</ThemedText>
        <Ionicons
          name={trendUp ? "chevron-up" : "chevron-down"}
          size={16}
          color="rgba(255,255,255,0.75)"
          style={styles.kpiTrend}
        />
      </View>

      <ThemedText style={styles.kpiLabel}>{label}</ThemedText>
    </LinearGradient>
  );

  // ── KPI grid ──────────────────────────────────────────────────────────────
  const renderKpiGrid = () => {
    if (!statistics) return null;
    return (
      <View style={styles.kpiGrid}>
        <View style={styles.kpiRow}>
          {renderKpiCard(
            ["#1976D2", "#1565C0"],
            "car-sport",
            String(statistics.totalVehicles),
            "Tổng số xe",
            statistics.totalVehicles > 0,
          )}
          {renderKpiCard(
            ["#00897B", "#00695C"],
            "scale",
            formatWeight(statistics.totalWeight, true),
            "Tổng trọng lượng",
            statistics.totalWeight > 0,
          )}
        </View>
        <View style={styles.kpiRow}>
          {renderKpiCard(
            ["#0288D1", "#0277BD"],
            "stats-chart",
            timeframe === "today" ? String(statistics.totalVehicles) : String(avgPerDay),
            timeframe === "today" ? "Xe hôm nay" : "Trung bình / ngày",
            avgPerDay > 0,
          )}
          {renderKpiCard(
            statusGood ? ["#2E7D32", "#1B5E20"] : ["#E65100", "#BF360C"],
            statusGood ? "checkmark-circle" : "alert-circle",
            statusGood ? "Tốt" : "Cần chú ý",
            "Trạng thái",
            statusGood,
          )}
        </View>
      </View>
    );
  };

  // ── Section header with accent bar ────────────────────────────────────────
  const renderSectionHeader = (icon: string, title: string) => (
    <View style={styles.sectionHeader}>
      <View style={[styles.sectionAccentBar, { backgroundColor: colors.primary }]} />
      <Ionicons name={icon as any} size={18} color={colors.primary} style={styles.sectionHeaderIcon} />
      <ThemedText style={[styles.sectionTitle, { color: colors.onSurface }]}>
        {title}
      </ThemedText>
    </View>
  );

  // ── Report list item ───────────────────────────────────────────────────────
  const renderReportItem = (
    title: string,
    icon: string,
    screen: keyof typeof REPORT_ITEM_COLORS,
    description: string,
  ) => {
    const accent = REPORT_ITEM_COLORS[screen];
    return (
      <TouchableOpacity
        key={screen}
        activeOpacity={0.85}
        style={[
          styles.reportItem,
          {
            backgroundColor: colors.surface,
            borderColor: colors.outlineVariant,
            ...Platform.select({
              android: { elevation: 1 },
              ios: {
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.08,
                shadowRadius: 3,
              },
            }),
          },
        ]}
        onPress={() => {
          const path = ROUTE_PATH_MAP[screen];
          if (path) router.push(path as any);
        }}
      >
        {/* Color-coded icon container */}
        <View
          style={[
            styles.reportIconContainer,
            { backgroundColor: accent.bg + "26" }, // ~15% opacity (0x26 = 38/255)
          ]}
        >
          <Ionicons name={icon as any} size={24} color={accent.icon} />
        </View>

        <View style={styles.reportContent}>
          <ThemedText style={styles.reportItemTitle}>{title}</ThemedText>
          <ThemedText type="caption" style={{ color: colors.onSurfaceVariant }}>
            {description}
          </ThemedText>
        </View>

        {/* Arrow indicator */}
        <View style={[styles.reportArrow, { backgroundColor: accent.bg + "1A" }]}>{/* ~10% opacity (0x1A = 26/255) */}
          <Ionicons name="chevron-forward" size={16} color={accent.icon} />
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <ThemedView useSafeArea>
      <Header title="Báo Cáo & Thống Kê" />

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Time filter ── */}
        {renderTimeFilter()}

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
                {/* ── KPI cards ── */}
                {renderKpiGrid()}

                {/* ── Pie chart ── */}
                {statistics.byProduct.length > 0 && (
                  <View style={[styles.chartCard, { backgroundColor: colors.surface, borderColor: colors.outlineVariant }]}>
                    {renderSectionHeader("pie-chart", "Phân bố theo loại hàng")}
                    <PieChart
                      data={statistics.byProduct.map((item) => ({
                        name: item.productName,
                        value: item.totalWeight,
                      }))}
                      height={200}
                    />
                  </View>
                )}

                {/* ── Bar chart ── */}
                {statistics.byDay.length > 0 && (
                  <View style={[styles.chartCard, { backgroundColor: colors.surface, borderColor: colors.outlineVariant }]}>
                    {renderSectionHeader("bar-chart", "Hoạt động theo ngày")}
                    <BarChart
                      data={statistics.byDay.map((day) => ({
                        label: day.date.split("-")[2],
                        value: day.weighCount,
                      }))}
                      height={200}
                      barColor={colors.primary}
                    />
                  </View>
                )}
              </>
            )}

            {/* ── Detailed reports ── */}
            <View style={styles.detailSectionHeader}>
              {renderSectionHeader("document-text", "Báo cáo chi tiết")}
            </View>

            <View style={styles.reportList}>
              {renderReportItem(
                "Theo khách hàng",
                "business-outline",
                "CompanyReports",
                "Thống kê theo đối tác, khách hàng",
              )}
              {renderReportItem(
                "Theo hàng hóa",
                "cube-outline",
                "ProductReports",
                "Chi tiết theo loại hàng, sản phẩm",
              )}
              {renderReportItem(
                "Theo xe",
                "car-outline",
                "VehicleReports",
                "Hoạt động của từng phương tiện",
              )}
              {renderReportItem(
                "Theo khoảng thời gian",
                "calendar-outline",
                "DateRangeReports",
                "Tùy chỉnh khoảng thời gian báo cáo",
              )}
              {renderReportItem(
                "Báo cáo tùy chỉnh",
                "options-outline",
                "CustomReport",
                "Bộ lọc nâng cao và xuất Excel",
              )}
            </View>

            {/* ── Export button ── */}
            <TouchableOpacity
              activeOpacity={0.85}
              style={styles.exportButton}
              onPress={() => {/* existing export action */}}
            >
              <LinearGradient
                colors={[colors.primary, colors.primaryDark]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.exportGradient}
              >
                <Ionicons name="download-outline" size={20} color="#FFFFFF" />
                <ThemedText style={styles.exportLabel}>
                  Xuất báo cáo tổng hợp
                </ThemedText>
              </LinearGradient>
            </TouchableOpacity>
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
    paddingBottom: 40,
  },

  // ── Time filter chips ──────────────────────────────────────────────────────
  chipRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 24,
    paddingHorizontal: 2,
  },
  chip: {
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
  },
  chipLabel: {
    fontSize: 14,
    fontWeight: "600",
  },

  // ── KPI grid ──────────────────────────────────────────────────────────────
  kpiGrid: {
    gap: 12,
    marginBottom: 24,
  },
  kpiRow: {
    flexDirection: "row",
    gap: 12,
  },
  kpiCard: {
    flex: 1,
    borderRadius: 16,
    padding: 16,
  },
  kpiIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.25)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  kpiValueRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 4,
  },
  kpiValue: {
    fontSize: 20,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  kpiTrend: {
    marginTop: 2,
  },
  kpiLabel: {
    fontSize: 12,
    fontWeight: "500",
    color: "rgba(255,255,255,0.82)",
  },

  // ── Section header ─────────────────────────────────────────────────────────
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionAccentBar: {
    width: 4,
    height: 18,
    borderRadius: 2,
    marginRight: 8,
  },
  sectionHeaderIcon: {
    marginRight: 6,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
  },
  detailSectionHeader: {
    marginTop: 8,
    marginBottom: 4,
  },

  // ── Chart cards ────────────────────────────────────────────────────────────
  chartCard: {
    marginBottom: 20,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    ...Platform.select({
      android: { elevation: 1 },
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.07,
        shadowRadius: 4,
      },
    }),
  },

  // ── Report list items ──────────────────────────────────────────────────────
  reportList: {
    gap: 10,
    marginBottom: 28,
  },
  reportItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
  },
  reportIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },
  reportContent: {
    flex: 1,
  },
  reportItemTitle: {
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 2,
  },
  reportArrow: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 8,
  },

  // ── Export button ──────────────────────────────────────────────────────────
  exportButton: {
    borderRadius: 14,
    overflow: "hidden",
    ...Platform.select({
      android: { elevation: 4 },
      ios: {
        shadowColor: "#1565C0",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
    }),
  },
  exportGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    paddingHorizontal: 24,
    gap: 10,
  },
  exportLabel: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFFFFF",
  },

  // ── Error state ────────────────────────────────────────────────────────────
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
