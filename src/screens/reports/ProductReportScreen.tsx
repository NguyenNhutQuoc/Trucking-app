// src/screens/reports/ProductReportScreen.tsx
import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  RefreshControl,
  Alert,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { BarChart } from "react-native-chart-kit";

import { productApi } from "@/api/product";
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
import { formatWeight, formatCurrency } from "@/utils/formatters";
import { Hanghoa } from "@/types/api.types";
import { ReportsStackScreenProps } from "@/types/navigation.types";

type NavigationProp = ReportsStackScreenProps<"ProductReports">["navigation"];
type ViewMode = "list" | "grid";

const screenWidth = Dimensions.get("window").width;

const ProductReportScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const { colors, isDarkMode } = useAppTheme();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [products, setProducts] = useState<Hanghoa[]>([]);
  const [productStats, setProductStats] = useState<any[]>([]);
  const [startDate, setStartDate] = useState<Date>(
    new Date(new Date().setDate(new Date().getDate() - 30)),
  );
  const [endDate, setEndDate] = useState<Date>(new Date());
  const [totalWeight, setTotalWeight] = useState(0);
  const [totalVehicles, setTotalVehicles] = useState(0);
  const [totalValue, setTotalValue] = useState(0);
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

  useEffect(() => {
    loadData();
  }, [startDate, endDate]);

  const loadData = async () => {
    try {
      setLoading(true);
      await Promise.all([loadProducts(), loadWeightStatistics()]);
    } catch (error) {
      console.error("Load data error:", error);
      Alert.alert("Lỗi", "Không thể tải dữ liệu. Vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  };

  const loadProducts = async () => {
    try {
      const response = await productApi.getAllProducts();
      if (response.success) {
        setProducts(response.data.data);
      }
    } catch (error) {
      console.error("Load products error:", error);
    }
  };

  const loadWeightStatistics = async () => {
    try {
      const formattedStartDate = startDate.toISOString();
      const formattedEndDate = endDate.toISOString();

      let productData = products;
      if (productData.length === 0) {
        const productResponse = await productApi.getAllProducts();
        if (productResponse.success) {
          productData = productResponse.data.data;
          setProducts(productData);
        }
      }

      const response = await weighingApi.getWeightStatistics(
        formattedStartDate,
        formattedEndDate,
      );

      if (response.success) {
        const stats = response.data.data;
        setTotalWeight(stats.totalWeight);
        setTotalVehicles(stats.totalVehicles);

        const sortedProductStats = [...stats.byProduct].sort(
          (a, b) => b.totalWeight - a.totalWeight,
        );

        const totalValue = sortedProductStats.reduce((acc, item) => {
          return acc + item.totalPrice;
        }, 0);
        setProductStats(sortedProductStats);
        setTotalValue(totalValue);
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

  // Grid Item Component
  const renderGridItem = ({ item, index }: { item: any; index: number }) => {
    const product = products.find((p) => p.ten === item.productName);
    const percentageOfTotal =
      totalWeight > 0
        ? ((item.totalWeight / totalWeight) * 100).toFixed(1)
        : "0";

    const unitPrice = product ? product.dongia : 0;
    const totalValue = item.totalWeight * unitPrice;

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
                name="cube"
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
            <View style={styles.gridStatItem}>
              <ThemedText type="caption" style={styles.gridStatLabel}>
                Trọng lượng
              </ThemedText>
              <ThemedText style={styles.gridStatValue} numberOfLines={1}>
                {formatWeight(item.totalWeight, true)}
              </ThemedText>
            </View>
            {product && unitPrice > 0 && (
              <View style={styles.gridStatItem}>
                <ThemedText type="caption" style={styles.gridStatLabel}>
                  Thành tiền
                </ThemedText>
                <ThemedText
                  style={styles.gridValueText}
                  color={colors.success}
                  numberOfLines={1}
                >
                  {formatCurrency(totalValue)}
                </ThemedText>
              </View>
            )}
          </View>

          {product && (
            <ThemedText type="caption" style={styles.gridProductCode}>
              Mã: {product.ma}
            </ThemedText>
          )}
        </Card>
      </View>
    );
  };

  // List Item Component
  const renderListItem = ({ item, index }: { item: any; index: number }) => {
    const product = products.find((p) => p.ten === item.productName);
    const percentageOfTotal =
      totalWeight > 0
        ? ((item.totalWeight / totalWeight) * 100).toFixed(1)
        : "0";

    const unitPrice = product ? product.dongia : 0;
    const totalValue = item.totalWeight * unitPrice;

    return (
      <Card style={styles.productCard}>
        <View style={styles.productHeader}>
          <View
            style={[
              styles.productIconContainer,
              {
                backgroundColor: chartColors[index % chartColors.length] + "15",
              },
            ]}
          >
            <Ionicons
              name="cube"
              size={20}
              color={chartColors[index % chartColors.length]}
            />
          </View>
          <ThemedText style={styles.productName} numberOfLines={1}>
            {item.productName}
          </ThemedText>
          <ThemedText style={styles.percentageText} color={colors.primary}>
            {percentageOfTotal}%
          </ThemedText>
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statRow}>
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
                Trọng lượng:
              </ThemedText>
              <ThemedText style={styles.statValue}>
                {formatWeight(item.totalWeight)}
              </ThemedText>
            </View>
          </View>

          {product && unitPrice > 0 && (
            <View style={styles.statRow}>
              <View style={styles.statItem}>
                <ThemedText type="subtitle" style={styles.statLabel}>
                  Đơn giá:
                </ThemedText>
                <ThemedText style={styles.statValue}>
                  {formatCurrency(product.dongia)}/kg
                </ThemedText>
              </View>
              <View style={styles.statItem}>
                <ThemedText type="subtitle" style={styles.statLabel}>
                  Thành tiền:
                </ThemedText>
                <ThemedText style={styles.valueText} color={colors.success}>
                  {formatCurrency(totalValue)}
                </ThemedText>
              </View>
            </View>
          )}
        </View>

        {product && (
          <View
            style={[styles.productInfo, { borderTopColor: colors.gray200 }]}
          >
            <ThemedText type="caption" style={styles.productCode}>
              Mã: {product.ma}
            </ThemedText>
          </View>
        )}
      </Card>
    );
  };

  const getBarChartData = () => {
    const topProducts = productStats.slice(0, 7);

    return {
      labels: topProducts.map((item) =>
        item.productName.length > 6
          ? item.productName.substring(0, 6) + "..."
          : item.productName,
      ),
      datasets: [
        {
          data: topProducts.map((item) => item.totalWeight),
          colors: topProducts.map(
            (_, index) => () => chartColors[index % chartColors.length],
          ),
        },
      ],
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

        <View
          style={[
            styles.totalValueContainer,
            { borderTopColor: colors.gray200 },
          ]}
        >
          <ThemedText type="subtitle" style={styles.totalValueLabel}>
            Tổng giá trị:
          </ThemedText>
          <ThemedText style={styles.totalValueText} color={colors.success}>
            {formatCurrency(totalValue)}
          </ThemedText>
        </View>
      </Card>

      {/* Chart Card */}
      {productStats.length > 0 && (
        <Card style={styles.chartCard}>
          <ThemedText style={styles.chartTitle}>
            Phân bố trọng lượng theo hàng hóa (kg)
          </ThemedText>
          <View style={styles.chartContainer}>
            <BarChart
              data={getBarChartData()}
              width={screenWidth - 40}
              height={200}
              yAxisLabel=""
              yAxisSuffix="t"
              chartConfig={{
                backgroundColor: colors.card,
                backgroundGradientFrom: colors.card,
                backgroundGradientTo: colors.card,
                decimalPlaces: 1,
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
                barPercentage: 0.8,
              }}
              style={{
                marginVertical: 8,
                borderRadius: 16,
              }}
              fromZero
            />
          </View>
        </Card>
      )}

      {/* Section Title */}
      <ThemedText type="title" style={styles.sectionTitle}>
        Chi tiết theo hàng hóa ({productStats.length})
      </ThemedText>
    </>
  );

  if (loading) {
    return (
      <ThemedView useSafeArea>
        <Header
          title="Báo Cáo Theo Hàng Hóa"
          showBack
          rightComponent={
            <ViewModeToggle viewMode={viewMode} onToggle={toggleViewMode} />
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
        title="Báo Cáo Theo Hàng Hóa"
        showBack
        rightComponent={
          <ViewModeToggle viewMode={viewMode} onToggle={toggleViewMode} />
        }
      />

      <FlatList
        key={viewMode}
        data={productStats}
        renderItem={viewMode === "grid" ? renderGridItem : renderListItem}
        keyExtractor={(item, index) => `${viewMode}-${index}`}
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
    paddingBottom: 100,
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
  totalValueContainer: {
    borderTopWidth: 1,
    paddingVertical: 12,
    alignItems: "center",
  },
  totalValueLabel: {
    fontSize: 14,
    marginBottom: 4,
  },
  totalValueText: {
    fontSize: 20,
    fontWeight: "700",
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
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12,
  },

  // List Item Styles
  productCard: {
    marginBottom: 12,
  },
  productHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  productIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  productName: {
    fontSize: 16,
    fontWeight: "600",
    flex: 1,
  },
  percentageText: {
    fontSize: 16,
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
  valueText: {
    fontWeight: "600",
  },
  productInfo: {
    borderTopWidth: 1,
    paddingTop: 10,
  },
  productCode: {
    fontSize: 12,
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
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  gridIconContainer: {
    width: 30,
    height: 30,
    borderRadius: 15,
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
  gridProductName: {
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
  gridValueText: {
    fontSize: 12,
    fontWeight: "600",
  },
  gridProductCode: {
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

export default ProductReportScreen;
