// src/screens/reports/ProductReportScreen.tsx
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
import { BarChart } from "react-native-chart-kit";
import { Dimensions } from "react-native";

import { productApi } from "@/api/product";
import { weighingApi } from "@/api/weighing";
import Header from "@/components/common/Header";
import Card from "@/components/common/Card";
import Button from "@/components/common/Button";
import Loading from "@/components/common/Loading";
import DateRangeSelector from "@/components/reports/DateRangeSelector";
import ThemedView from "@/components/common/ThemedView";
import ThemedText from "@/components/common/ThemedText";
import { useAppTheme } from "@/hooks/useAppTheme";
import { formatWeight, formatCurrency } from "@/utils/formatters";
import { Hanghoa } from "@/types/api.types";
import { ReportsStackScreenProps } from "@/types/navigation.types";

type NavigationProp = ReportsStackScreenProps<"ProductReports">["navigation"];
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
        setProducts(response.data);
      }
    } catch (error) {
      console.error("Load products error:", error);
    }
  };

  const loadWeightStatistics = async () => {
    try {
      // Format dates for API
      const formattedStartDate = startDate.toISOString();
      const formattedEndDate = endDate.toISOString();

      // Make sure we have product data loaded first
      let productData = products;
      if (productData.length === 0) {
        const productResponse = await productApi.getAllProducts();
        if (productResponse.success) {
          productData = productResponse.data;
          setProducts(productData);
        }
      }

      const response = await weighingApi.getWeightStatistics(
        formattedStartDate,
        formattedEndDate,
      );

      if (response.success) {
        const stats = response.data;
        setTotalWeight(stats.totalWeight);
        setTotalVehicles(stats.totalVehicles);

        // Sort products by weight in descending order
        const sortedProductStats = [...stats.byProduct].sort(
          (a, b) => b.totalWeight - a.totalWeight,
        );

        // Calculate total value
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

  const renderProductItem = ({ item, index }: { item: any; index: number }) => {
    const product = products.find((p) => p.ten === item.productName);
    const percentageOfTotal =
      totalWeight > 0
        ? ((item.totalWeight / totalWeight) * 100).toFixed(1)
        : "0";

    // Calculate total value if we have the unit price
    const unitPrice = product ? product.dongia : 0;
    const totalValue = (item.totalWeight / 1000) * unitPrice;

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

          {product && (
            <View style={styles.statRow}>
              <View style={styles.statItem}>
                <ThemedText type="subtitle" style={styles.statLabel}>
                  Đơn giá:
                </ThemedText>
                <ThemedText style={styles.statValue}>
                  {formatCurrency(product.dongia)}/tấn
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
    // Take top 7 products for the chart
    const topProducts = productStats.slice(0, 7);

    return {
      labels: topProducts.map((item) =>
        item.productName.length > 6
          ? item.productName.substring(0, 6) + "..."
          : item.productName,
      ),
      datasets: [
        {
          data: topProducts.map((item) => item.totalWeight / 1000), // Convert to tons
          colors: topProducts.map(
            (_, index) => () => chartColors[index % chartColors.length],
          ),
        },
      ],
    };
  };

  return (
    <ThemedView useSafeArea>
      <Header title="Báo Cáo Theo Hàng Hóa" showBack />

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
            data={productStats}
            renderItem={renderProductItem}
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
                      styles.totalValueContainer,
                      { borderTopColor: colors.gray200 },
                    ]}
                  >
                    <ThemedText type="subtitle" style={styles.totalValueLabel}>
                      Tổng giá trị:
                    </ThemedText>
                    <ThemedText
                      style={styles.totalValueText}
                      color={colors.success}
                    >
                      {formatCurrency(totalValue)}
                    </ThemedText>
                  </View>
                </Card>

                {productStats.length > 0 && (
                  <Card style={styles.chartCard}>
                    <ThemedText style={styles.chartTitle}>
                      Phân bố trọng lượng theo hàng hóa (tấn)
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

                <ThemedText type="title" style={styles.sectionTitle}>
                  Chi tiết theo hàng hóa
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
