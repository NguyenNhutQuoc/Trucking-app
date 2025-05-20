// src/components/charts/PieChart.tsx
import React from "react";
import { View, StyleSheet } from "react-native";
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
 * A simple pie chart component that supports dark mode
 */
const PieChart: React.FC<PieChartProps> = ({
  data,
  colors,
  height = 150,
  showLegend = true,
  showPercentage = true,
}) => {
  const { colors: themeColors } = useAppTheme();

  // Use provided colors or default theme chart colors
  const chartColors = colors || [
    themeColors.chartBlue,
    themeColors.chartGreen,
    themeColors.chartYellow,
    themeColors.chartPurple,
    themeColors.chartOrange,
    themeColors.chartRed,
    themeColors.chartCyan,
    themeColors.chartPink,
  ];

  // Calculate total for percentages
  const total = data.reduce((sum, item) => sum + item.value, 0);

  // Filter out zero values
  const filteredData = data.filter((item) => item.value > 0);

  if (filteredData.length === 0) {
    return (
      <View style={[styles.container, { height }]}>
        <ThemedText style={styles.emptyText}>Không có dữ liệu</ThemedText>
      </View>
    );
  }

  return (
    <View style={[styles.container, { height }]}>
      <View style={[styles.pieContainer, { height: height * 0.8 }]}>
        <View
          style={[styles.pieChart, { backgroundColor: themeColors.gray200 }]}
        >
          {filteredData.map((item, index) => {
            const percentage = item.value / total;
            const rotation =
              index === 0
                ? 0
                : filteredData
                    .slice(0, index)
                    .reduce((sum, prev) => sum + (prev.value / total) * 360, 0);

            return (
              <View
                key={index}
                style={[
                  styles.pieSlice,
                  {
                    backgroundColor: chartColors[index % chartColors.length],
                    transform: [{ rotate: `${rotation}deg` }],
                    zIndex: filteredData.length - index,
                    // Use clip-path to create the slice effect
                    // But we're using basic rotation for simplicity here
                  },
                ]}
              />
            );
          })}
        </View>
      </View>

      {showLegend && (
        <View style={styles.legendContainer}>
          {filteredData.map((item, index) => (
            <View key={index} style={styles.legendItem}>
              <View
                style={[
                  styles.legendColor,
                  {
                    backgroundColor: chartColors[index % chartColors.length],
                  },
                ]}
              />
              <ThemedText style={styles.legendText}>
                {item.name}
                {showPercentage &&
                  ` (${Math.round((item.value / total) * 100)}%)`}
              </ThemedText>
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
    alignItems: "center",
    justifyContent: "space-between",
  },
  pieContainer: {
    justifyContent: "center",
    alignItems: "center",
    width: "40%",
  },
  pieChart: {
    width: 120,
    height: 120,
    borderRadius: 60,
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
  legendContainer: {
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
  },
  emptyText: {
    textAlign: "center",
    flex: 1,
  },
});

export default PieChart;
