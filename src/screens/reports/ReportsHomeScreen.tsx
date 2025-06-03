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
import { ReportsStackScreenProps } from "@/types/navigation.types";
import { PhieucanStatistics } from "@/types/api.types";

type NavigationProp = ReportsStackScreenProps<"ReportsHome">["navigation"];

const ReportsHomeScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const { colors } = useAppTheme();

  const [loading, setLoading] = useState(true);
  const [statistics, setStatistics] = useState<PhieucanStatistics | null>(null);
  const [timeframe, setTimeframe] = useState<"today" | "week" | "month">(
    "week",
  );

  useEffect(() => {
    loadStatistics();
  }, []);

  const loadStatistics = async () => {
    try {
      setLoading(true);
      const response = await weighingApi.getTodayStatistics();
      if (response.success) {
        setStatistics(response.data);
      }
    } catch (error) {
      console.error("Load statistics error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleTimeframeChange = (newTimeframe: "today" | "week" | "month") => {
    setTimeframe(newTimeframe);
    // In a real app, you would load data for the selected timeframe
  };

  const renderTimeframeButtons = () => (
    <View style={styles.timeframeContainer}>
      <TouchableOpacity
        style={[
          styles.timeframeButton,
          { backgroundColor: colors.gray100 },
          timeframe === "today" && [
            styles.activeTimeframeButton,
            { backgroundColor: colors.primary },
          ],
        ]}
        onPress={() => handleTimeframeChange("today")}
      >
        <ThemedText
          style={[
            styles.timeframeButtonText,
            { color: colors.gray700 },
            ...(timeframe === "today"
              ? [styles.activeTimeframeButtonText, { color: "white" }]
              : []),
          ]}
        >
          Hôm nay
        </ThemedText>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.timeframeButton,
          { backgroundColor: colors.gray100 },
          timeframe === "week" && [
            styles.activeTimeframeButton,
            { backgroundColor: colors.primary },
          ],
        ]}
        onPress={() => handleTimeframeChange("week")}
      >
        <ThemedText
          style={[
            styles.timeframeButtonText,
            { color: colors.gray700 },
            ...(timeframe === "week"
              ? [styles.activeTimeframeButtonText, { color: "white" }]
              : []),
          ]}
        >
          Tuần này
        </ThemedText>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.timeframeButton,
          { backgroundColor: colors.gray100 },
          timeframe === "month" && [
            styles.activeTimeframeButton,
            { backgroundColor: colors.primary },
          ],
        ]}
        onPress={() => handleTimeframeChange("month")}
      >
        <ThemedText
          style={[
            styles.timeframeButtonText,
            { color: colors.gray700 },
            ...(timeframe === "month"
              ? [styles.activeTimeframeButtonText, { color: "white" }]
              : []),
          ]}
        >
          Tháng này
        </ThemedText>
      </TouchableOpacity>
    </View>
  );

  const renderReportItem = (title: string, icon: string, screen: string) => (
    <TouchableOpacity
      style={[styles.reportItem, { borderBottomColor: colors.gray200 }]}
      onPress={() => navigation.navigate(screen as any)}
    >
      <View
        style={[
          styles.reportIconContainer,
          { backgroundColor: colors.gray100 },
        ]}
      >
        <Ionicons name={icon as any} size={24} color={colors.primary} />
      </View>
      <ThemedText style={styles.reportItemText}>{title}</ThemedText>
      <Ionicons name="chevron-forward" size={20} color={colors.gray600} />
    </TouchableOpacity>
  );

  return (
    <ThemedView useSafeArea>
      <Header title="Báo Cáo & Thống Kê" />

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
      >
        {renderTimeframeButtons()}

        {loading ? (
          <Loading loading />
        ) : (
          statistics && (
            <>
              <Card style={styles.summaryCard}>
                <View style={styles.summaryRow}>
                  <View style={styles.summaryItem}>
                    <ThemedText type="subtitle" style={styles.summaryLabel}>
                      Tổng xe:
                    </ThemedText>
                    <ThemedText style={styles.summaryValue}>
                      {statistics.totalVehicles}
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
                      {formatWeight(statistics.totalWeight, true)}
                    </ThemedText>
                  </View>
                </View>
              </Card>

              <Card style={styles.chartCard}>
                <ThemedText style={styles.chartTitle}>
                  Phân bố theo loại hàng
                </ThemedText>

                <PieChart
                  data={statistics.byProduct.map((item) => ({
                    name: item.productName,
                    value: item.totalWeight,
                  }))}
                  height={150}
                />
              </Card>

              <Card style={styles.chartCard}>
                <ThemedText style={styles.chartTitle}>
                  Hoạt động theo ngày
                </ThemedText>

                <BarChart
                  data={statistics.byDay.map((day) => ({
                    label: day.date.split("-")[2], // Day of month
                    value: day.weighCount,
                  }))}
                  height={150}
                  barColor={colors.primary}
                />
              </Card>

              <ThemedText type="title" style={styles.reportsTitle}>
                Báo cáo chi tiết
              </ThemedText>

              <Card style={styles.reportsCard}>
                {renderReportItem(
                  "Theo khách hàng",
                  "business-outline",
                  "CompanyReports",
                )}
                {renderReportItem(
                  "Theo hàng hóa",
                  "cube-outline",
                  "ProductReports",
                )}
                {renderReportItem("Theo xe", "car-outline", "VehicleReports")}
                {renderReportItem(
                  "Theo khoảng thời gian",
                  "calendar-outline",
                  "DateRangeReports",
                )}
                {renderReportItem(
                  "Báo cáo tùy chỉnh",
                  "options-outline",
                  "CustomReport",
                )}
              </Card>

              <View style={styles.exportContainer}>
                <Button
                  title="Xuất báo cáo"
                  variant="primary"
                  icon={
                    <Ionicons name="download-outline" size={20} color="white" />
                  }
                  fullWidth
                />
              </View>
            </>
          )
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
  timeframeContainer: {
    flexDirection: "row",
    borderRadius: 8,
    padding: 4,
    marginBottom: 16,
  },
  timeframeButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: "center",
    borderRadius: 6,
  },
  activeTimeframeButton: {
    // Handled dynamically
  },
  timeframeButtonText: {
    fontSize: 14,
    fontWeight: "500",
  },
  activeTimeframeButtonText: {
    // Handled dynamically
  },
  summaryCard: {
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: "row",
    alignItems: "center",
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
  chartCard: {
    marginBottom: 16,
    padding: 16,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 16,
  },
  reportsTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginTop: 8,
    marginBottom: 12,
  },
  reportsCard: {
    padding: 0,
    marginBottom: 16,
    overflow: "hidden",
  },
  reportItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
  },
  reportIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  reportItemText: {
    flex: 1,
    fontSize: 14,
    fontWeight: "500",
  },
  exportContainer: {
    marginTop: 4,
  },
});

export default ReportsHomeScreen;
