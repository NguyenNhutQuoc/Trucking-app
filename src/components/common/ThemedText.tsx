// src/components/common/ThemedText.tsx
// Material Design 3 Typography Component
import React, { ReactNode } from "react";
import { Text, StyleSheet, TextStyle, TextProps, StyleProp } from "react-native";
import { useAppTheme } from "@/hooks/useAppTheme";
import typography from "@/constants/typography";

// M3 Typography roles
type TypographyRole = 
  // Display
  | "displayLarge"
  | "displayMedium"
  | "displaySmall"
  // Headline
  | "headlineLarge"
  | "headlineMedium"
  | "headlineSmall"
  // Title
  | "titleLarge"
  | "titleMedium"
  | "titleSmall"
  // Body
  | "bodyLarge"
  | "bodyMedium"
  | "bodySmall"
  // Label
  | "labelLarge"
  | "labelMedium"
  | "labelSmall"
  // Legacy types for backwards compatibility
  | "default"
  | "title"
  | "subtitle"
  | "caption"
  | "error"
  | "success";

interface ThemedTextProps extends TextProps {
  children: ReactNode;
  style?: StyleProp<TextStyle>;
  type?: TypographyRole;
  color?: string;
}

/**
 * Material Design 3 themed text component
 */
const ThemedText: React.FC<ThemedTextProps> = ({
  children,
  style,
  type = "default",
  color,
  ...props
}) => {
  const { colors } = useAppTheme();

  // Get text color based on type
  const getTextColor = () => {
    if (color) return color;

    switch (type) {
      case "error":
        return colors.error;
      case "success":
        return colors.success;
      case "caption":
      case "bodySmall":
      case "labelSmall":
        return colors.onSurfaceVariant || colors.textSecondary;
      case "subtitle":
        return colors.onSurfaceVariant || colors.textSecondary;
      default:
        return colors.onSurface || colors.text;
    }
  };

  // Get typography styles from M3 type scale
  const getTypographyStyle = (): TextStyle => {
    switch (type) {
      // M3 Display
      case "displayLarge":
        return typography.displayLarge;
      case "displayMedium":
        return typography.displayMedium;
      case "displaySmall":
        return typography.displaySmall;
      
      // M3 Headline
      case "headlineLarge":
        return typography.headlineLarge;
      case "headlineMedium":
        return typography.headlineMedium;
      case "headlineSmall":
        return typography.headlineSmall;
      
      // M3 Title
      case "titleLarge":
        return typography.titleLarge;
      case "titleMedium":
        return typography.titleMedium;
      case "titleSmall":
        return typography.titleSmall;
      
      // M3 Body
      case "bodyLarge":
        return typography.bodyLarge;
      case "bodyMedium":
        return typography.bodyMedium;
      case "bodySmall":
        return typography.bodySmall;
      
      // M3 Label
      case "labelLarge":
        return typography.labelLarge;
      case "labelMedium":
        return typography.labelMedium;
      case "labelSmall":
        return typography.labelSmall;

      // Legacy types mapping to M3
      case "title":
        return typography.titleLarge;
      case "subtitle":
        return typography.titleMedium;
      case "caption":
        return typography.bodySmall;
      case "error":
      case "success":
        return typography.bodyMedium;
      
      case "default":
      default:
        return typography.bodyMedium;
    }
  };

  return (
    <Text
      style={[
        getTypographyStyle(),
        { color: getTextColor() },
        Array.isArray(style) ? style : style ? [style] : null,
      ]}
      {...props}
    >
      {children}
    </Text>
  );
};

export default ThemedText;
