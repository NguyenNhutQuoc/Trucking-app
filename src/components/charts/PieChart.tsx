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
 * A pie chart component using react-native-chart-kit with M3 styling
 */
const PieChart: React.FC<PieChartProps> = ({
  data,
  colors,
  height = 200,
  showLegend = true,
  showPercentage = true,
}) => {
  const { colors: themeColors } = useAppTheme();

  // Define chart colors
  const defaultPalette = [
    themeColors.chartBlue || "#2196F3",
    themeColors.chartGreen || "#4CAF50",
    themeColors.chartYellow || "#FFEB3B",
    themeColors.chartPurple || "#9C27B0",
    themeColors.chartOrange || "#FF9800",
    themeColors.chartRed || "#F44336",
    themeColors.chartCyan || "#00BCD4",
    themeColors.chartPink || "#E91E63",
  ];

  const chartColors = colors || defaultPalette;

  // Transform data for react-native-chart-kit
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
      <View style={[styles.container, { height }]}>
        <ThemedText style={styles.emptyText}>Không có dữ liệu</ThemedText>
      </View>
    );
  }

  // Calculate percentage for legend
  const getPercentage = (value: number) => {
    return ((value / total) * 100).toFixed(1) + "%";
  };

  const chartWidth = Dimensions.get("window").width;
  // We use a custom legend layout to handle overflow better than the library
  // Increased width to prevent clipping
  const pieWidth = 200; 

  return (
    <View style={styles.container}>
      {/* Chart Section */}
      <View style={styles.chartWrapper}>
        <RNCPieChart
          data={chartData}
          width={pieWidth}
          height={height}
          chartConfig={{
            color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
            decimalPlaces: 0,
          }}
          accessor={"value"}
          backgroundColor={"transparent"}
          paddingLeft={"40"} // Center the chart in the wrapper - adjusted for increased width
          center={[0, 0]}
          absolute={false}
          hasLegend={false}
        />
      </View>

      {/* Custom Legend Section */}
      {showLegend && (
        <View style={styles.legendContainer}>
          {chartData.map((item, index) => (
            <View key={index} style={styles.legendItem}>
              <View
                style={[
                  styles.legendColor,
                  { backgroundColor: item.color },
                ]}
              />
              <View style={styles.legendTextContainer}>
                <ThemedText style={styles.legendLabel} numberOfLines={2}>
                  {item.name}
                </ThemedText>
                {showPercentage && (
                  <ThemedText style={styles.legendValue}>
                    {getPercentage(item.value)}
                  </ThemedText>
                )}
              </View>
            </View>
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "flex-start", // Top align to handle different heights
    justifyContent: "space-between",
  },
  chartWrapper: {
    width: 200, // Matched with pieWidth
    alignItems: "center",
    justifyContent: "center",
    marginLeft: -20, // Negative margin to offset the extra padding/width and keep visual balance
  },
  emptyText: {
    textAlign: "center",
    flex: 1,
    textAlignVertical: "center",
  },
  legendContainer: {
    flex: 1,
    paddingLeft: 16,
    paddingTop: 8, // Align with top of chart
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center", // Align dot with text center
    marginBottom: 10,
    flexWrap: "nowrap",
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
    marginTop: 2, // Slight adjustment for visual alignment with text
  },
  legendTextContainer: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  legendLabel: {
    fontSize: 12,
    flex: 1,
    marginRight: 4,
  },
  legendValue: {
    fontSize: 12,
    fontWeight: "600",
    opacity: 0.7,
  },
});

export default PieChart;
