// src/components/common/Skeleton.tsx
// Material Design 3 Skeleton Loading Component
import React, { useEffect, useRef } from "react";
import { View, StyleSheet, Animated, ViewStyle, DimensionValue } from "react-native";
import { useAppTheme } from "@/hooks/useAppTheme";

interface SkeletonProps {
  width?: DimensionValue;
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
}

/**
 * M3 Skeleton Loading Component
 * Displays a shimmering placeholder while content is loading
 */
const Skeleton: React.FC<SkeletonProps> = ({
  width = "100%",
  height = 16,
  borderRadius = 4,
  style,
}) => {
  const { colors, isDarkMode } = useAppTheme();
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(animatedValue, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [animatedValue]);

  const opacity = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  const backgroundColor = isDarkMode
    ? colors.surfaceContainer || "#2C2C2C"
    : colors.surfaceContainer || "#E8E8E8";

  return (
    <Animated.View
      style={[
        styles.skeleton,
        {
          width,
          height,
          borderRadius,
          backgroundColor,
          opacity,
        },
        style,
      ]}
    />
  );
};

// Skeleton presets for common use cases
interface SkeletonCardProps {
  style?: ViewStyle;
}

export const SkeletonCard: React.FC<SkeletonCardProps> = ({ style }) => {
  const { colors } = useAppTheme();

  return (
    <View style={[styles.card, { backgroundColor: colors.surface }, style]}>
      <View style={styles.cardHeader}>
        <Skeleton width={48} height={48} borderRadius={24} />
        <View style={styles.cardHeaderText}>
          <Skeleton width="60%" height={16} borderRadius={8} />
          <Skeleton width="40%" height={12} borderRadius={6} style={styles.mt8} />
        </View>
      </View>
      <Skeleton width="100%" height={12} borderRadius={6} style={styles.mt16} />
      <Skeleton width="80%" height={12} borderRadius={6} style={styles.mt8} />
      <Skeleton width="60%" height={12} borderRadius={6} style={styles.mt8} />
    </View>
  );
};

export const SkeletonListItem: React.FC<SkeletonCardProps> = ({ style }) => {
  const { colors } = useAppTheme();

  return (
    <View style={[styles.listItem, { backgroundColor: colors.surface }, style]}>
      <Skeleton width={40} height={40} borderRadius={20} />
      <View style={styles.listItemContent}>
        <Skeleton width="70%" height={14} borderRadius={7} />
        <Skeleton width="50%" height={10} borderRadius={5} style={styles.mt8} />
      </View>
      <Skeleton width={60} height={24} borderRadius={12} />
    </View>
  );
};

export const SkeletonText: React.FC<{ lines?: number }> = ({ lines = 3 }) => {
  return (
    <View>
      {Array.from({ length: lines }).map((_, index) => (
        <Skeleton
          key={index}
          width={index === lines - 1 ? "60%" : "100%"}
          height={12}
          borderRadius={6}
          style={index > 0 ? styles.mt8 : undefined}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  skeleton: {
    overflow: "hidden",
  },
  card: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  cardHeaderText: {
    flex: 1,
    marginLeft: 12,
  },
  listItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  listItemContent: {
    flex: 1,
    marginHorizontal: 12,
  },
  mt8: {
    marginTop: 8,
  },
  mt16: {
    marginTop: 16,
  },
});

export default Skeleton;
