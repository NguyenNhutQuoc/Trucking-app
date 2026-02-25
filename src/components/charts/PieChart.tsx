// src/components/charts/PieChart.tsx
import React from "react";
import { View, StyleSheet, Dimensions } from "react-native";
import { PieChart as RNCPieChart } from "react-native-chart-kit";
import { useAppTheme } from "@/hooks/useAppTheme";
import ThemedText from "@/components/common/ThemedText";

interface PieChartProps {
  data: {
    name: string;
    value: number;
  }[];
  colors?: string[];
  height?: number;
  showLegend?: boolean;
  showPercentage?: boolean;
}

/**
 * A donut pie chart component with a below-chart 2-column legend,
 * total summary row, and per-item percentage + value display.
 */
const PieChart: React.FC<PieChartProps> = ({
  data,
  colors,
  height = 200,
  showLegend = true,
  showPercentage = true,
}) => {
  const { colors: themeColors } = useAppTheme();

  const defaultPalette = [
    themeColors.chartBlue || "#2196F3",
    themeColors.chartGreen || "#4CAF50",
    themeColors.chartOrange || "#FF9800",
    themeColors.chartPurple || "#9C27B0",
    themeColors.chartRed || "#F44336",
    themeColors.chartYellow || "#FFEB3B",
    themeColors.chartCyan || "#00BCD4",
    themeColors.chartPink || "#E91E63",
  ];

  const chartColors = colors || defaultPalette;

  const total = data.reduce((sum, item) => sum + item.value, 0);
  const chartData = data
    .filter((item) => item.value > 0)
    .map((item, index) => ({
      name: item.name,
      value: item.value,
      color: chartColors[index % chartColors.length],
      legendFontColor: themeColors.onSurface,
      legendFontSize: 12,
    }));

  if (chartData.length === 0) {
    return (
      <View style={[styles.emptyContainer, { height }]}>
        <ThemedText style={styles.emptyText}>Không có dữ liệu</ThemedText>
      </View>
    );
  }

  const chartWidth = Dimensions.get("window").width - 32; // account for common page padding

  return (
    <View style={styles.container}>
      {/* Donut chart */}
      <View style={styles.chartWrapper}>
        <RNCPieChart
          data={chartData}
          width={chartWidth}
          height={height}
          chartConfig={{
            color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
            decimalPlaces: 0,
          }}
          accessor={"value"}
          backgroundColor={"transparent"}
          paddingLeft={"15"}
          center={[chartWidth / 4 - 15, 0]}
          absolute={false}
          hasLegend={false}
        />
      </View>

      {/* Total summary */}
      <View style={styles.totalRow}>
        <ThemedText style={[styles.totalText, { color: themeColors.text }]}>
          Tổng:{" "}
          <ThemedText style={[styles.totalValue, { color: themeColors.primary }]}>
            {total.toLocaleString()} lượt cân
          </ThemedText>
        </ThemedText>
      </View>

      {/* 2-column legend */}
      {showLegend && (
        <View style={styles.legendGrid}>
          {chartData.map((item, index) => {
            const pct = total > 0 ? ((item.value / total) * 100).toFixed(1) : "0.0";
            return (
              <View key={index} style={styles.legendItem}>
                <View
                  style={[styles.legendDot, { backgroundColor: item.color }]}
                />
                <View style={styles.legendTextContainer}>
                  <ThemedText
                    style={[styles.legendLabel, { color: themeColors.text }]}
                    numberOfLines={1}
                  >
                    {item.name}
                  </ThemedText>
                  {showPercentage && (
                    <ThemedText
                      style={[
                        styles.legendValue,
                        { color: themeColors.textSecondary },
                      ]}
                    >
                      {pct}% · {item.value.toLocaleString()}
                    </ThemedText>
                  )}
                </View>
              </View>
            );
          })}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    flexDirection: "column",
    alignItems: "center",
  },
  chartWrapper: {
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
  },
  emptyContainer: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  emptyText: {
    textAlign: "center",
  },
  totalRow: {
    marginTop: 8,
    marginBottom: 12,
    alignItems: "center",
  },
  totalText: {
    fontSize: 14,
    fontWeight: "600",
  },
  totalValue: {
    fontSize: 14,
    fontWeight: "700",
  },
  legendGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    width: "100%",
    paddingHorizontal: 4,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    width: "50%",
    paddingRight: 8,
    marginBottom: 10,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginTop: 2,
    marginRight: 8,
    flexShrink: 0,
  },
  legendTextContainer: {
    flex: 1,
  },
  legendLabel: {
    fontSize: 12,
    fontWeight: "500",
    lineHeight: 16,
  },
  legendValue: {
    fontSize: 11,
    lineHeight: 15,
    marginTop: 1,
  },
});

export default PieChart;
