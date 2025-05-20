// src/screens/reports/ProductReportsScreen.tsx
import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  SafeAreaView,
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
import DateRangeSelector from "@/components/reports/DateRangeSelector";
import colors from "@/constants/colors";
import { formatWeight, formatCurrency } from "@/utils/formatters";
import { Hanghoa } from "@/types/api.types";
import { ReportsStackScreenProps } from "@/types/navigation.types";

type NavigationProp = ReportsStackScreenProps<"ProductReports">["navigation"];
const screenWidth = Dimensions.get("window").width;

const ProductReportsScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();

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
      await loadProducts();
      await loadWeightStatistics();
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

    // Calculate total value
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
          <Text style={styles.productName} numberOfLines={1}>
            {item.productName}
          </Text>
          <Text style={styles.percentageText}>{percentageOfTotal}%</Text>
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statRow}>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Số lượt cân:</Text>
              <Text style={styles.statValue}>{item.weighCount} xe</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Trọng lượng:</Text>
              <Text style={styles.statValue}>
                {formatWeight(item.totalWeight)}
              </Text>
            </View>
          </View>

          {product && (
            <View style={styles.statRow}>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Đơn giá:</Text>
                <Text style={styles.statValue}>
                  {formatCurrency(product.dongia)}/kg
                </Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Thành tiền:</Text>
                <Text style={[styles.statValue, styles.valueText]}>
                  {formatCurrency(totalValue)}
                </Text>
              </View>
            </View>
          )}
        </View>

        {product && (
          <View style={styles.productInfo}>
            <Text style={styles.productCode}>Mã: {product.ma}</Text>
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
    <SafeAreaView style={styles.safeArea}>
      <Header title="Báo Cáo Theo Hàng Hóa" showBack />

      <View style={styles.container}>
        <DateRangeSelector
          startDate={startDate}
          endDate={endDate}
          onDateRangeChange={handleDateRangeChange}
          style={styles.dateRangeSelector}
        />

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.loadingText}>Đang tải dữ liệu...</Text>
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
                      <Text style={styles.summaryLabel}>Tổng xe:</Text>
                      <Text style={styles.summaryValue}>{totalVehicles}</Text>
                    </View>

                    <View style={styles.summaryDivider} />

                    <View style={styles.summaryItem}>
                      <Text style={styles.summaryLabel}>Tổng trọng lượng:</Text>
                      <Text style={styles.summaryValue}>
                        {formatWeight(totalWeight, true)}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.totalValueContainer}>
                    <Text style={styles.totalValueLabel}>Tổng giá trị:</Text>
                    <Text style={styles.totalValueText}>
                      {formatCurrency(totalValue)}
                    </Text>
                  </View>
                </Card>

                {productStats.length > 0 && (
                  <Card style={styles.chartCard}>
                    <Text style={styles.chartTitle}>
                      Phân bố trọng lượng theo hàng hóa (tấn)
                    </Text>
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
                            `rgba(92, 124, 250, ${opacity})`,
                          labelColor: (opacity = 1) =>
                            `rgba(0, 0, 0, ${opacity})`,
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

                <Text style={styles.sectionTitle}>Chi tiết theo hàng hóa</Text>
              </View>
            }
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Ionicons
                  name="analytics-outline"
                  size={48}
                  color={colors.gray400}
                />
                <Text style={styles.emptyText}>
                  Không có dữ liệu trong khoảng thời gian này
                </Text>
              </View>
            }
            contentContainerStyle={styles.listContent}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
          />
        )}
      </View>

      <View style={styles.exportContainer}>
        <Button
          title="Xuất báo cáo"
          variant="primary"
          icon={<Ionicons name="download-outline" size={20} color="white" />}
          fullWidth
        />
      </View>
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
  dateRangeSelector: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray200,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: colors.gray600,
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
  totalValueContainer: {
    borderTopWidth: 1,
    borderTopColor: colors.gray200,
    paddingVertical: 12,
    alignItems: "center",
  },
  totalValueLabel: {
    fontSize: 14,
    color: colors.gray600,
    marginBottom: 4,
  },
  totalValueText: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.success,
  },
  chartCard: {
    marginBottom: 16,
    padding: 16,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text,
    marginBottom: 8,
  },
  chartContainer: {
    alignItems: "center",
    marginVertical: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text,
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
    color: colors.text,
    flex: 1,
  },
  percentageText: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.primary,
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
    color: colors.gray600,
  },
  statValue: {
    fontSize: 14,
    fontWeight: "500",
    color: colors.text,
  },
  valueText: {
    color: colors.success,
    fontWeight: "600",
  },
  productInfo: {
    borderTopWidth: 1,
    borderTopColor: colors.gray200,
    paddingTop: 10,
  },
  productCode: {
    fontSize: 12,
    color: colors.gray600,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 48,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 14,
    color: colors.gray600,
    textAlign: "center",
  },
  exportContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    backgroundColor: colors.background,
    borderTopWidth: 1,
    borderTopColor: colors.gray200,
  },
});

export default ProductReportsScreen;
