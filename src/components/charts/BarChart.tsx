// src/components/charts/BarChart.tsx
import React from "react";
import { View, StyleSheet, ScrollView } from "react-native";
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
 * A simple bar chart component that supports dark mode and horizontal scrolling
 */
const BarChart: React.FC<BarChartProps> = ({
  data,
  height = 200,
  barWidth = 40,
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

  // Calculate dynamic width based on data length
  // Ensure minimum width of 100% to fill container if few items
  const minWidth = "100%";
  
  return (
    <View style={[styles.container, { height }]}>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ 
          minWidth: minWidth,
          paddingHorizontal: 10 
        }}
      >
        <View style={styles.chartContainer}>
          {filteredData.map((item, index) => {
            const barHeight = (item.value / maxValue) * (height * 0.7);
            const itemColor = item.color || defaultBarColor;

            return (
              <View
                key={index}
                style={[styles.barContainer, { width: barWidth, marginRight: 8 }]}
              >
                {/* Bar Value (above bar) */}
                {showValues && (
                  <ThemedText type="caption" style={styles.barValue}>
                    {item.value}
                  </ThemedText>
                )}
                
                {/* The Bar itself */}
                <View
                  style={[
                    styles.bar,
                    {
                      height: barHeight,
                      backgroundColor: itemColor,
                      width: barWidth * 0.6, // Bar is thinner than container
                    },
                  ]}
                />
                
                {/* Bar Label (below bar) */}
                {showLabels && (
                  <ThemedText type="caption" style={styles.barLabel} numberOfLines={1}>
                    {item.label}
                  </ThemedText>
                )}
              </View>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
  chartContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    height: "100%",
    paddingBottom: 24, // Space for labels
    paddingTop: 20, // Space for values
  },
  barContainer: {
    height: "100%",
    alignItems: "center",
    justifyContent: "flex-end",
  },
  bar: {
    borderRadius: 4,
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
  },
  barValue: {
    marginBottom: 4,
    fontSize: 10,
    fontWeight: "600",
    textAlign: "center",
  },
  barLabel: {
    position: "absolute",
    bottom: -20,
    fontSize: 10,
    textAlign: "center",
    width: "100%",
  },
  emptyText: {
    textAlign: "center",
    marginTop: 20,
    flex: 1,
    textAlignVertical: "center",
  },
});

export default BarChart;
