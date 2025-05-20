// src/components/charts/BarChart.tsx
import React from "react";
import { View, StyleSheet } from "react-native";
import { useAppTheme } from "@/hooks/useAppTheme";
import ThemedText from "@/components/common/ThemedText";

interface BarChartProps {
  data: {
    label: string;
    value: number;
    color?: string;
  }[];
  height?: number;
  barWidth?: number;
  showValues?: boolean;
  showLabels?: boolean;
  barColor?: string;
}

/**
 * A simple bar chart component that supports dark mode
 */
const BarChart: React.FC<BarChartProps> = ({
  data,
  height = 150,
  barWidth = 26,
  showValues = true,
  showLabels = true,
  barColor,
}) => {
  const { colors } = useAppTheme();

  // Default color from theme
  const defaultBarColor = barColor || colors.primary;

  // Filter out zero values
  const filteredData = data.filter((item) => item.value > 0);

  // Find max value for scaling
  const maxValue = Math.max(...filteredData.map((item) => item.value), 1);

  if (filteredData.length === 0) {
    return (
      <View style={[styles.container, { height }]}>
        <ThemedText style={styles.emptyText}>Không có dữ liệu</ThemedText>
      </View>
    );
  }

  return (
    <View style={[styles.container, { height }]}>
      <View style={styles.chartContainer}>
        {filteredData.map((item, index) => {
          const barHeight = (item.value / maxValue) * (height * 0.7);
          const itemColor = item.color || defaultBarColor;

          return (
            <View
              key={index}
              style={[styles.barContainer, { width: barWidth }]}
            >
              {showValues && (
                <ThemedText type="caption" style={styles.barValue}>
                  {item.value}
                </ThemedText>
              )}
              <View
                style={[
                  styles.bar,
                  {
                    height: barHeight,
                    backgroundColor: itemColor,
                    width: barWidth * 0.8,
                  },
                ]}
              />
              {showLabels && (
                <ThemedText type="caption" style={styles.barLabel}>
                  {item.label}
                </ThemedText>
              )}
            </View>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    padding: 5,
  },
  chartContainer: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    paddingBottom: 20,
  },
  barContainer: {
    height: "100%",
    alignItems: "center",
    justifyContent: "flex-end",
  },
  bar: {
    borderRadius: 4,
  },
  barValue: {
    position: "absolute",
    bottom: "100%",
    fontSize: 10,
    textAlign: "center",
  },
  barLabel: {
    position: "absolute",
    bottom: 0,
    fontSize: 10,
    textAlign: "center",
  },
  emptyText: {
    textAlign: "center",
    marginTop: 20,
  },
});

export default BarChart;
