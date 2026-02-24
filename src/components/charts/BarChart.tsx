// src/components/charts/BarChart.tsx
import React, { useRef, useEffect } from "react";
import { View, StyleSheet, ScrollView, Animated } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
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

/** Lighten a hex color by mixing it toward white by `amount` (0–1). */
function lightenHex(hex: string, amount: number): string {
  const h = hex.replace("#", "");
  const r = parseInt(h.substring(0, 2), 16);
  const g = parseInt(h.substring(2, 4), 16);
  const b = parseInt(h.substring(4, 6), 16);
  const lr = Math.round(r + (255 - r) * amount);
  const lg = Math.round(g + (255 - g) * amount);
  const lb = Math.round(b + (255 - b) * amount);
  return `#${lr.toString(16).padStart(2, "0")}${lg.toString(16).padStart(2, "0")}${lb.toString(16).padStart(2, "0")}`;
}

/** Animated bar that grows from 0 to its target height. */
const AnimatedBar: React.FC<{
  targetHeight: number;
  barWidth: number;
  color: string;
}> = ({ targetHeight, barWidth, color }) => {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(anim, {
      toValue: targetHeight,
      duration: 500,
      useNativeDriver: false,
    }).start();
  }, [targetHeight]);

  const topColor = lightenHex(color, 0.45);

  return (
    <Animated.View
      style={{
        height: anim,
        width: barWidth * 0.65,
        borderTopLeftRadius: 4,
        borderTopRightRadius: 4,
        borderBottomLeftRadius: 0,
        borderBottomRightRadius: 0,
        overflow: "hidden",
      }}
    >
      <LinearGradient
        colors={[topColor, color]}
        style={{ flex: 1 }}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
      />
    </Animated.View>
  );
};

const GRIDLINE_COUNT = 4;
const PADDING_TOP = 24;
const PADDING_BOTTOM = 28;

/**
 * A bar chart component with gridlines, axis line, gradient bars, and
 * spring-animated growth. Supports dark mode and horizontal scrolling.
 */
const BarChart: React.FC<BarChartProps> = ({
  data,
  height = 200,
  barWidth = 40,
  showValues = true,
  showLabels = true,
  barColor,
}) => {
  const { colors, isDarkMode: isDark } = useAppTheme();

  const defaultBarColor = barColor || colors.primary;

  const filteredData = data.filter((item) => item.value > 0);
  const maxValue = Math.max(...filteredData.map((item) => item.value), 1);

  if (filteredData.length === 0) {
    return (
      <View style={[styles.container, { height }]}>
        <ThemedText style={styles.emptyText}>Không có dữ liệu</ThemedText>
      </View>
    );
  }

  const chartAreaHeight = height - PADDING_TOP - PADDING_BOTTOM;
  const gridlineColor = isDark ? colors.gray300 : colors.gray200;
  const axisColor = colors.gray300;

  return (
    <View style={[styles.container, { height }]}>
      {/* Gridlines — rendered behind the bars */}
      <View
        style={[
          styles.gridlineOverlay,
          { top: PADDING_TOP, bottom: PADDING_BOTTOM, height: chartAreaHeight },
        ]}
        pointerEvents="none"
      >
        {Array.from({ length: GRIDLINE_COUNT }).map((_, i) => {
          const fraction = (i + 1) / (GRIDLINE_COUNT + 1);
          return (
            <View
              key={i}
              style={[
                styles.gridline,
                {
                  top: chartAreaHeight * fraction,
                  backgroundColor: gridlineColor,
                },
              ]}
            />
          );
        })}
        {/* Bottom axis line */}
        <View
          style={[styles.axisLine, { backgroundColor: axisColor }]}
        />
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={[styles.chartContainer, { height }]}>
          {filteredData.map((item, index) => {
            const barHeight = (item.value / maxValue) * chartAreaHeight;
            const itemColor = item.color || defaultBarColor;

            return (
              <View
                key={index}
                style={[
                  styles.barContainer,
                  {
                    width: barWidth,
                    height: chartAreaHeight,
                    marginRight: 8,
                    marginTop: PADDING_TOP,
                    marginBottom: PADDING_BOTTOM,
                  },
                ]}
              >
                {/* Value label above bar */}
                {showValues && (
                  <ThemedText
                    style={[
                      styles.barValue,
                      { color: colors.primary },
                    ]}
                  >
                    {item.value}
                  </ThemedText>
                )}

                {/* Gradient bar */}
                <AnimatedBar
                  targetHeight={barHeight}
                  barWidth={barWidth}
                  color={itemColor}
                />

                {/* Label below bar */}
                {showLabels && (
                  <ThemedText
                    style={[
                      styles.barLabel,
                      { color: colors.textSecondary },
                    ]}
                    numberOfLines={1}
                  >
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
  scrollContent: {
    minWidth: "100%",
    paddingHorizontal: 10,
  },
  chartContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
  },
  gridlineOverlay: {
    position: "absolute",
    left: 10,
    right: 10,
  },
  gridline: {
    position: "absolute",
    left: 0,
    right: 0,
    height: 1,
    opacity: 0.6,
  },
  axisLine: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 1,
  },
  barContainer: {
    alignItems: "center",
    justifyContent: "flex-end",
  },
  barValue: {
    marginBottom: 4,
    fontSize: 10,
    fontWeight: "700",
    textAlign: "center",
  },
  barLabel: {
    position: "absolute",
    bottom: -20,
    fontSize: 11,
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
