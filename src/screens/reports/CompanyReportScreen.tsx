// src/screens/reports/CompanyReportScreen.tsx
import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Alert,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { PieChart } from "react-native-chart-kit";

import { customerApi } from "@/api/customer";
import { weighingApi } from "@/api/weighing";
import Header from "@/components/common/Header";
import Card from "@/components/common/Card";
import Button from "@/components/common/Button";
import Loading from "@/components/common/Loading";
import DateRangeSelector from "@/components/reports/DateRangeSelector";
import ViewModeToggle from "@/components/common/ViewModeToogle";
import ThemedView from "@/components/common/ThemedView";
import ThemedText from "@/components/common/ThemedText";
import { useAppTheme } from "@/hooks/useAppTheme";
import { formatWeight } from "@/utils/formatters";
import { Khachhang } from "@/types/api.types";
import { ReportsStackScreenProps } from "@/types/navigation.types";

type NavigationProp = ReportsStackScreenProps<"CompanyReports">["navigation"];
type ViewMode = "list" | "grid" | "table";

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
  const [viewMode, setViewMode] = useState<ViewMode>("list");

  // Chart colors
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
        setCompanies(response.data.data);
      }
    } catch (error) {
      console.error("Load companies error:", error);
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
        const stats = response.data.data;
        setTotalWeight(stats.totalWeight);
        setTotalVehicles(stats.totalVehicles);

        const sortedCompanyStats = [...stats.byCompany].sort(
          (a, b) => b.totalWeight - a.totalWeight,
        );

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

  const toggleViewMode = () => {
    if (viewMode === "list") {
      setViewMode("grid");
    } else if (viewMode === "grid") {
      setViewMode("table");
    } else {
      setViewMode("list");
    }
  };

  // Table Header Component
  const TableHeader = () => (
    <View style={[styles.tableHeader, { backgroundColor: colors.gray100 }]}>
      <ThemedText style={[styles.tableHeaderCell, styles.companyColumn]}>
        Khách hàng
      </ThemedText>
      <ThemedText style={[styles.tableHeaderCell, styles.countColumn]}>
        Lượt cân
      </ThemedText>
      <ThemedText style={[styles.tableHeaderCell, styles.weightColumn]}>
        Tổng TL
      </ThemedText>
      <ThemedText style={[styles.tableHeaderCell, styles.percentColumn]}>
        Tỷ lệ %
      </ThemedText>
    </View>
  );

  // Table Row Component
  const renderTableRow = ({ item, index }: { item: any; index: number }) => {
    const company = companies.find((c) => c.ten === item.companyName);
    const percentageOfTotal =
      totalWeight > 0
        ? ((item.totalWeight / totalWeight) * 100).toFixed(1)
        : "0";

    return (
      <View
        style={[
          styles.tableRow,
          {
            backgroundColor: index % 2 === 0 ? colors.card : colors.gray50,
          },
        ]}
      >
        <View style={[styles.tableCell, styles.companyColumn]}>
          <ThemedText numberOfLines={2} style={styles.tableCellText}>
            {item.companyName}
          </ThemedText>
          {company?.diachi && (
            <ThemedText numberOfLines={1} style={styles.tableAddressText}>
              {company.diachi}
            </ThemedText>
          )}
        </View>
        <ThemedText
          style={[styles.tableCell, styles.countColumn, styles.tableCellText]}
          numberOfLines={1}
        >
          {item.weighCount}
        </ThemedText>
        <ThemedText
          style={[styles.tableCell, styles.weightColumn, styles.tableCellText]}
          numberOfLines={1}
        >
          {formatWeight(item.totalWeight, true)}
        </ThemedText>
        <ThemedText
          style={[
            styles.tableCell,
            styles.percentColumn,
            styles.tableCellText,
            { color: colors.primary },
          ]}
          numberOfLines={1}
        >
          {percentageOfTotal}%
        </ThemedText>
      </View>
    );
  };

  // Grid Item Component
  const renderGridItem = ({ item, index }: { item: any; index: number }) => {
    const company = companies.find((c) => c.ten === item.companyName);
    const percentageOfTotal =
      totalWeight > 0
        ? ((item.totalWeight / totalWeight) * 100).toFixed(1)
        : "0";

    return (
      <View style={styles.gridItem}>
        <Card style={styles.gridCard}>
          <View style={styles.gridHeader}>
            <View
              style={[
                styles.gridIconContainer,
                {
                  backgroundColor:
                    chartColors[index % chartColors.length] + "20",
                },
              ]}
            >
              <Ionicons
                name="business"
                size={18}
                color={chartColors[index % chartColors.length]}
              />
            </View>
            <View style={styles.gridPercentageContainer}>
              <ThemedText
                style={styles.gridPercentageText}
                color={colors.primary}
              >
                {percentageOfTotal}%
              </ThemedText>
            </View>
          </View>

          <ThemedText style={styles.gridCompanyName} numberOfLines={2}>
            {item.companyName}
          </ThemedText>

          <View style={styles.gridStats}>
            <View style={styles.gridStatItem}>
              <ThemedText type="caption" style={styles.gridStatLabel}>
                Số lượt cân
              </ThemedText>
              <ThemedText style={styles.gridStatValue}>
                {item.weighCount}
              </ThemedText>
            </View>
            <View style={styles.gridStatItem}>
              <ThemedText type="caption" style={styles.gridStatLabel}>
                Trọng lượng
              </ThemedText>
              <ThemedText style={styles.gridStatValue} numberOfLines={1}>
                {formatWeight(item.totalWeight, true)}
              </ThemedText>
            </View>
          </View>

          {company?.diachi && (
            <ThemedText
              type="caption"
              style={styles.gridAddress}
              numberOfLines={1}
            >
              <Ionicons
                name="location-outline"
                size={10}
                color={colors.gray600}
              />{" "}
              {company.diachi}
            </ThemedText>
          )}
        </Card>
      </View>
    );
  };

  // List Item Component
  const renderListItem = ({ item, index }: { item: any; index: number }) => {
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

    const data = companyStats.slice(0, 6).map((item, index) => {
      return {
        name:
          item.companyName.length > 12
            ? item.companyName.substring(0, 12) + "..."
            : item.companyName,
        legendFontColor: isDarkMode ? "#f1f1f1" : "#333",
        legendFontSize: 12,
        weight: item.totalWeight,
        count: item.weighCount,
        color: chartColors[index % chartColors.length],
      };
    });

    return data;
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
          allowFutureDates={true}
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
      </Card>

      {/* Chart Card */}
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

          <View style={styles.customLegendContainer}>
            {getPieChartData().map((item, index) => (
              <View key={index} style={styles.legendItem}>
                <View
                  style={[
                    styles.legendColorBox,
                    { backgroundColor: item.color },
                  ]}
                />
                <ThemedText style={styles.legendText}>{item.name}</ThemedText>
              </View>
            ))}
          </View>
        </Card>
      )}

      {/* Section Title */}
      <ThemedText type="title" style={styles.sectionTitle}>
        Chi tiết theo Khách Hàng ({companyStats.length})
      </ThemedText>
    </>
  );

  const getViewModeIcon = () => {
    switch (viewMode) {
      case "list":
        return "grid-outline";
      case "grid":
        return "list-outline";
      case "table":
        return "apps-outline";
      default:
        return "grid-outline";
    }
  };

  if (loading) {
    return (
      <ThemedView useSafeArea>
        <Header
          title="Báo Cáo Theo Khách hàng"
          showBack
          rightComponent={
            <TouchableOpacity onPress={toggleViewMode}>
              <Ionicons name={getViewModeIcon()} size={24} color="white" />
            </TouchableOpacity>
          }
        />
        <View style={styles.loadingContainer}>
          <Loading loading={true} />
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
        title="Báo Cáo Theo Khách hàng"
        showBack
        rightComponent={
          <TouchableOpacity onPress={toggleViewMode}>
            <Ionicons name={getViewModeIcon()} size={24} color="white" />
          </TouchableOpacity>
        }
      />

      <FlatList
        key={viewMode}
        data={companyStats}
        renderItem={
          viewMode === "table"
            ? renderTableRow
            : viewMode === "grid"
              ? renderGridItem
              : renderListItem
        }
        keyExtractor={(item, index) => `${viewMode}-${index}`}
        numColumns={viewMode === "grid" ? 2 : 1}
        columnWrapperStyle={viewMode === "grid" ? styles.gridRow : undefined}
        ListHeaderComponent={
          viewMode === "table" ? (
            <>
              {renderListHeader()}
              <TableHeader />
            </>
          ) : (
            renderListHeader
          )
        }
        ListEmptyComponent={renderEmptyComponent}
        contentContainerStyle={
          viewMode === "table" ? styles.tableContent : styles.listContent
        }
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
    paddingBottom: 100,
  },
  dateRangeSelectorContainer: {
    paddingVertical: 12,
  },

  // Table Styles
  tableContent: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  tableHeader: {
    flexDirection: "row",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    backgroundColor: "transparent",
  },
  tableHeaderCell: {
    fontWeight: "600",
    fontSize: 14,
    textAlign: "center",
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 0.5,
    alignItems: "center",
    minHeight: 60,
  },
  tableCell: {
    fontSize: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  tableCellText: {
    fontSize: 14,
    fontWeight: "500",
    textAlign: "center",
  },
  tableAddressText: {
    fontSize: 12,
    marginTop: 2,
    opacity: 0.7,
    textAlign: "center",
  },
  companyColumn: {
    flex: 3,
    justifyContent: "center",
  },
  countColumn: {
    flex: 1.5,
    justifyContent: "center",
    alignItems: "center",
  },
  weightColumn: {
    flex: 2,
    justifyContent: "center",
    alignItems: "center",
  },
  percentColumn: {
    flex: 1.5,
    justifyContent: "center",
    alignItems: "center",
  },

  // Summary Card Styles
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

  // Chart Card Styles
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

  // List Item Styles
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

  // Grid Styles
  gridRow: {
    justifyContent: "space-between",
  },
  gridItem: {
    width: "48%",
    marginBottom: 12,
  },
  gridCard: {
    height: 160,
  },
  gridHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  gridIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  gridPercentageContainer: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  gridPercentageText: {
    fontSize: 12,
    fontWeight: "600",
  },
  gridCompanyName: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
    minHeight: 32,
  },
  gridStats: {
    flex: 1,
    justifyContent: "space-between",
  },
  gridStatItem: {
    marginBottom: 4,
  },
  gridStatLabel: {
    fontSize: 11,
    marginBottom: 2,
  },
  gridStatValue: {
    fontSize: 13,
    fontWeight: "600",
  },
  gridAddress: {
    fontSize: 10,
    marginTop: 4,
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

export default CompanyReportScreen;
