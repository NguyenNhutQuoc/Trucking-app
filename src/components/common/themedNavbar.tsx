// src/components/common/ThemedStatusBar.tsx
import React from "react";
import { StatusBar } from "expo-status-bar";
import { useAppTheme } from "@/hooks/useAppTheme";

interface ThemedStatusBarProps {
  /**
   * Custom bar style that overrides the theme default
   */
  barStyle?: "light" | "dark" | "auto";
  /**
   * Whether to use primary color from theme for background
   */
  usePrimaryBackground?: boolean;
}

/**
 * A themed status bar that automatically adjusts to the current theme
 */
const ThemedStatusBar: React.FC<ThemedStatusBarProps> = ({
  barStyle,
  usePrimaryBackground = false,
}) => {
  const { isDarkMode, colors } = useAppTheme();

  // Determine status bar style based on theme and props
  const statusBarStyle = barStyle || (isDarkMode ? "light" : "dark");

  // When used with primary color background, always use light content
  const finalStyle = usePrimaryBackground ? "light" : statusBarStyle;

  // For iOS, the status bar is always floating above content
  // For Android, we need to set backgroundColor on the StatusBar component
  // with expo-status-bar, backgroundColor is only used on Android
  const backgroundColor = usePrimaryBackground ? colors.primary : undefined;

  return <StatusBar style={finalStyle} backgroundColor={backgroundColor} />;
};

export default ThemedStatusBar;
