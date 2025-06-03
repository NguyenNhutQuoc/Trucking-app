// src/screens/reports/CompanyReportScreen.tsx
import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  RefreshControl,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { PieChart } from "react-native-chart-kit";
import { Dimensions } from "react-native";

import { customerApi } from "@/api/customer";
import { weighingApi } from "@/api/weighing";
import Header from "@/components/common/Header";
import Card from "@/components/common/Card";
import Button from "@/components/common/Button";
import Loading from "@/components/common/Loading";
import DateRangeSelector from "@/components/reports/DateRangeSelector";
import ThemedView from "@/components/common/ThemedView";
import ThemedText from "@/components/common/ThemedText";
import { useAppTheme } from "@/hooks/useAppTheme";
import { formatWeight, formatDate } from "@/utils/formatters";
import { Khachhang } from "@/types/api.types";
import { ReportsStackScreenProps } from "@/types/navigation.types";

type NavigationProp = ReportsStackScreenProps<"CompanyReports">["navigation"];

const screenWidth = Dimensions.get("window").width;

const CompanyReportScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const { colors, isDarkMode } = useAppTheme();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [companies, setCompanies] = useState<Khachhang[]>([]);
  const [companyStats, setCompanyStats] = useState<any[]>([]);
  const [startDate, setStartDate] = useState<Date>(
    new Date(new Date().setDate(new Date().getDate() - 30)),
  );
  const [endDate, setEndDate] = useState<Date>(new Date());
  const [totalWeight, setTotalWeight] = useState(0);
  const [totalVehicles, setTotalVehicles] = useState(0);

  // Chart data
  const chartColors = [
    colors.chartBlue,
    colors.chartGreen,
    colors.chartYellow,
    colors.chartOrange,
    colors.chartRed,
    colors.chartPurple,
    colors.chartCyan,
    colors.chartPink,
  ];

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [startDate, endDate]),
  );

  const loadData = async () => {
    try {
      setLoading(true);
      await Promise.all([loadCompanies(), loadWeightStatistics()]);
    } catch (error) {
      console.error("Load data error:", error);
      Alert.alert("Lỗi", "Không thể tải dữ liệu. Vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  };

  const loadCompanies = async () => {
    try {
      const response = await customerApi.getAllCustomers();
      if (response.success) {
        setCompanies(response.data);
      }
    } catch (error) {
      console.error("Load companies error:", error);
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

        // Sort companies by weight in descending order
        const sortedCompanyStats = [...stats.byCompany].sort(
          (a, b) => b.totalWeight - a.totalWeight,
        );

        // Process for chart - take top 5, group the rest as "Others"
        const topCompanies = sortedCompanyStats.slice(0, 5);
        const otherCompanies = sortedCompanyStats.slice(5);

        if (otherCompanies.length > 0) {
          const otherWeight = otherCompanies.reduce(
            (sum, company) => sum + company.totalWeight,
            0,
          );
          const otherCount = otherCompanies.reduce(
            (sum, company) => sum + company.weighCount,
            0,
          );

          topCompanies.push({
            companyName: "Khác",
            totalWeight: otherWeight,
            weighCount: otherCount,
          });
        }

        setCompanyStats(sortedCompanyStats);
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

  const renderCompanyItem = ({ item, index }: { item: any; index: number }) => {
    const company = companies.find((c) => c.ten === item.companyName);
    const percentageOfTotal =
      totalWeight > 0
        ? ((item.totalWeight / totalWeight) * 100).toFixed(1)
        : "0";

    return (
      <Card style={styles.companyCard}>
        <View style={styles.companyHeader}>
          <View
            style={[
              styles.companyIconContainer,
              { backgroundColor: colors.gray100 },
            ]}
          >
            <Ionicons
              name="business"
              size={20}
              color={chartColors[index % chartColors.length]}
            />
          </View>
          <ThemedText style={styles.companyName} numberOfLines={1}>
            {item.companyName}
          </ThemedText>
          <ThemedText style={styles.percentageText} color={colors.primary}>
            {percentageOfTotal}%
          </ThemedText>
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <ThemedText type="subtitle" style={styles.statLabel}>
              Số lượt cân:
            </ThemedText>
            <ThemedText style={styles.statValue}>
              {item.weighCount} xe
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

        {company && (
          <View
            style={[styles.companyInfo, { borderTopColor: colors.gray200 }]}
          >
            {company.diachi && (
              <ThemedText type="caption" style={styles.companyDetail}>
                <Ionicons
                  name="location-outline"
                  size={12}
                  color={colors.gray600}
                />{" "}
                {company.diachi}
              </ThemedText>
            )}
            {company.dienthoai && (
              <ThemedText type="caption" style={styles.companyDetail}>
                <Ionicons
                  name="call-outline"
                  size={12}
                  color={colors.gray600}
                />{" "}
                {company.dienthoai}
              </ThemedText>
            )}
          </View>
        )}
      </Card>
    );
  };

  const getPieChartData = () => {
    if (companyStats.length === 0) return [];

    // Take top 5 for the chart
    const data = companyStats.slice(0, 6).map((item, index) => {
      return {
        name: item.companyName,
        // Don't include weight value in the name
        legendFontColor: isDarkMode ? "#f1f1f1" : "#333",
        legendFontSize: 12,
        weight: item.totalWeight,
        count: item.weighCount,
        color: chartColors[index % chartColors.length],
      };
    });

    return data;
  };

  return (
    <ThemedView useSafeArea>
      <Header title="Báo Cáo Theo Khách hàng" showBack />

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
            data={companyStats}
            renderItem={renderCompanyItem}
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
                </Card>

                {companyStats.length > 0 && (
                  <Card style={styles.chartCard}>
                    <ThemedText style={styles.chartTitle}>
                      Phân bố trọng lượng theo Khách Hàng
                    </ThemedText>
                    <View style={styles.chartContainer}>
                      <PieChart
                        data={getPieChartData()}
                        width={screenWidth - 60}
                        height={180}
                        chartConfig={{
                          backgroundGradientFrom: colors.card,
                          backgroundGradientTo: colors.card,
                          color: (opacity = 1) =>
                            isDarkMode
                              ? `rgba(255, 255, 255, ${opacity})`
                              : `rgba(0, 0, 0, ${opacity})`,
                        }}
                        accessor="weight"
                        backgroundColor="transparent"
                        paddingLeft="0"
                        absolute
                      />
                    </View>

                    {/* Custom legend */}
                    <View style={styles.customLegendContainer}>
                      {getPieChartData().map((item, index) => (
                        <View key={index} style={styles.legendItem}>
                          <View
                            style={[
                              styles.legendColorBox,
                              { backgroundColor: item.color },
                            ]}
                          />
                          <ThemedText style={styles.legendText}>
                            {item.name}
                          </ThemedText>
                        </View>
                      ))}
                    </View>
                  </Card>
                )}

                <ThemedText type="title" style={styles.sectionTitle}>
                  Chi tiết theo Khách Hàng
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
    marginBottom: 8,
  },
  chartContainer: {
    alignItems: "center",
    marginVertical: 8,
  },
  customLegendContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    marginTop: 10,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 16,
    marginBottom: 8,
  },
  legendColorBox: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 6,
  },
  legendText: {
    fontSize: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12,
  },
  companyCard: {
    marginBottom: 12,
  },
  companyHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  companyIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  companyName: {
    fontSize: 16,
    fontWeight: "600",
    flex: 1,
  },
  percentageText: {
    fontSize: 16,
    fontWeight: "600",
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
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
  companyInfo: {
    borderTopWidth: 1,
    paddingTop: 10,
  },
  companyDetail: {
    fontSize: 12,
    marginTop: 2,
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

export default CompanyReportScreen;
