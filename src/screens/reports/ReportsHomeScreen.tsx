// src/screens/reports/ReportsHomeScreen.tsx
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

import { weighingApi } from "@/api/weighing";
import Header from "@/components/common/Header";
import Card from "@/components/common/Card";
import Button from "@/components/common/Button";
import Loading from "@/components/common/Loading";
import colors from "@/constants/colors";
import { formatWeight } from "@/utils/formatters";
import { ReportsStackScreenProps } from "@/types/navigation.types";
import { PhieucanStatistics } from "@/types/api.types";

type NavigationProp = ReportsStackScreenProps<"ReportsHome">["navigation"];

const ReportsHomeScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();

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
          timeframe === "today" && styles.activeTimeframeButton,
        ]}
        onPress={() => handleTimeframeChange("today")}
      >
        <Text
          style={[
            styles.timeframeButtonText,
            timeframe === "today" && styles.activeTimeframeButtonText,
          ]}
        >
          Hôm nay
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.timeframeButton,
          timeframe === "week" && styles.activeTimeframeButton,
        ]}
        onPress={() => handleTimeframeChange("week")}
      >
        <Text
          style={[
            styles.timeframeButtonText,
            timeframe === "week" && styles.activeTimeframeButtonText,
          ]}
        >
          Tuần này
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.timeframeButton,
          timeframe === "month" && styles.activeTimeframeButton,
        ]}
        onPress={() => handleTimeframeChange("month")}
      >
        <Text
          style={[
            styles.timeframeButtonText,
            timeframe === "month" && styles.activeTimeframeButtonText,
          ]}
        >
          Tháng này
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderReportItem = (title: string, icon: string, screen: string) => (
    <TouchableOpacity
      style={styles.reportItem}
      onPress={() => navigation.navigate(screen as any)}
    >
      <View style={styles.reportIconContainer}>
        <Ionicons name={icon as any} size={24} color={colors.primary} />
      </View>
      <Text style={styles.reportItemText}>{title}</Text>
      <Ionicons name="chevron-forward" size={20} color={colors.gray600} />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
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
                    <Text style={styles.summaryLabel}>Tổng xe:</Text>
                    <Text style={styles.summaryValue}>
                      {statistics.totalVehicles}
                    </Text>
                  </View>

                  <View style={styles.summaryDivider} />

                  <View style={styles.summaryItem}>
                    <Text style={styles.summaryLabel}>Tổng trọng lượng:</Text>
                    <Text style={styles.summaryValue}>
                      {formatWeight(statistics.totalWeight, true)}
                    </Text>
                  </View>
                </View>
              </Card>

              <View style={styles.chartCard}>
                <Text style={styles.chartTitle}>Phân bố theo loại hàng</Text>

                <View style={styles.pieChartPlaceholder}>
                  <View style={styles.pieChart}>
                    {/* Placeholder for pie chart */}
                    <View
                      style={[
                        styles.pieSlice,
                        {
                          backgroundColor: colors.chartBlue,
                          transform: [{ rotate: "0deg" }],
                          zIndex: 5,
                        },
                      ]}
                    />
                    <View
                      style={[
                        styles.pieSlice,
                        {
                          backgroundColor: colors.chartGreen,
                          transform: [{ rotate: "90deg" }],
                          zIndex: 4,
                        },
                      ]}
                    />
                    <View
                      style={[
                        styles.pieSlice,
                        {
                          backgroundColor: colors.chartYellow,
                          transform: [{ rotate: "180deg" }],
                          zIndex: 3,
                        },
                      ]}
                    />
                    <View
                      style={[
                        styles.pieSlice,
                        {
                          backgroundColor: colors.chartPurple,
                          transform: [{ rotate: "270deg" }],
                          zIndex: 2,
                        },
                      ]}
                    />
                  </View>

                  <View style={styles.pieChartLegend}>
                    {statistics.byProduct.slice(0, 4).map((item, index) => (
                      <View key={index} style={styles.legendItem}>
                        <View
                          style={[
                            styles.legendColor,
                            {
                              backgroundColor: [
                                colors.chartBlue,
                                colors.chartGreen,
                                colors.chartYellow,
                                colors.chartPurple,
                              ][index % 4],
                            },
                          ]}
                        />
                        <Text style={styles.legendText}>
                          {item.productName}
                        </Text>
                      </View>
                    ))}
                  </View>
                </View>
              </View>

              <View style={styles.chartCard}>
                <Text style={styles.chartTitle}>Hoạt động theo ngày</Text>

                <View style={styles.barChartPlaceholder}>
                  <View style={styles.barChart}>
                    {statistics.byDay.map((day, index) => (
                      <View key={index} style={styles.barContainer}>
                        <Text style={styles.barLabel}>
                          {day.date.split("-")[2]}
                        </Text>
                        <View
                          style={[
                            styles.bar,
                            {
                              height: `${(day.weighCount / Math.max(...statistics.byDay.map((d) => d.weighCount))) * 100}%`,
                            },
                          ]}
                        />
                        <Text style={styles.barValue}>{day.weighCount}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              </View>

              <Text style={styles.reportsTitle}>Báo cáo chi tiết</Text>

              <Card style={styles.reportsCard}>
                {renderReportItem(
                  "Theo công ty",
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
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  timeframeContainer: {
    flexDirection: "row",
    backgroundColor: colors.card,
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
    backgroundColor: colors.primary,
  },
  timeframeButtonText: {
    fontSize: 14,
    fontWeight: "500",
    color: colors.gray700,
  },
  activeTimeframeButtonText: {
    color: "white",
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
    backgroundColor: colors.gray200,
  },
  summaryLabel: {
    fontSize: 14,
    color: colors.gray600,
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.text,
  },
  chartCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text,
    marginBottom: 16,
  },
  pieChartPlaceholder: {
    flexDirection: "row",
    height: 150,
    alignItems: "center",
  },
  pieChart: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.gray200,
    position: "relative",
    overflow: "hidden",
  },
  pieSlice: {
    position: "absolute",
    width: "100%",
    height: "100%",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    transformOrigin: "center",
  },
  pieChartLegend: {
    flex: 1,
    paddingLeft: 20,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  legendColor: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: 8,
  },
  legendText: {
    fontSize: 12,
    color: colors.text,
  },
  barChartPlaceholder: {
    height: 150,
  },
  barChart: {
    flexDirection: "row",
    height: "100%",
    justifyContent: "space-between",
    alignItems: "flex-end",
    paddingBottom: 20,
  },
  barContainer: {
    alignItems: "center",
    width: "12%",
    height: "100%",
  },
  bar: {
    width: "80%",
    backgroundColor: colors.primary,
    borderRadius: 4,
  },
  barLabel: {
    position: "absolute",
    bottom: 0,
    fontSize: 10,
    color: colors.gray600,
  },
  barValue: {
    fontSize: 10,
    color: colors.gray700,
    position: "absolute",
    bottom: "100%",
    textAlign: "center",
  },
  reportsTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text,
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
    borderBottomColor: colors.gray200,
  },
  reportIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.gray100,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  reportItemText: {
    flex: 1,
    fontSize: 14,
    fontWeight: "500",
    color: colors.text,
  },
  exportContainer: {
    marginTop: 4,
  },
});

export default ReportsHomeScreen;
