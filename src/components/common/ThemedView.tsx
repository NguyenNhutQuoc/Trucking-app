// src/components/common/ThemedView.tsx
import React, { ReactNode } from "react";
import { View, StyleSheet, ViewStyle } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAppTheme } from "@/hooks/useAppTheme";

interface ThemedViewProps {
  children: ReactNode;
  style?: ViewStyle;
  useSafeArea?: boolean;
}

/**
 * A themed view component that automatically uses the current theme's background color
 * Can optionally use SafeAreaView for screens
 */
const ThemedView: React.FC<ThemedViewProps> = ({
  children,
  style,
  useSafeArea = false,
}) => {
  const { colors } = useAppTheme();

  const viewStyle = [
    styles.container,
    { backgroundColor: colors.background },
    style,
  ];

  if (useSafeArea) {
    return <SafeAreaView style={viewStyle}>{children}</SafeAreaView>;
  }

  return <View style={viewStyle}>{children}</View>;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default ThemedView;
