// src/components/common/ThemedText.tsx
import React, { ReactNode } from "react";
import { Text, StyleSheet, TextStyle, TextProps } from "react-native";
import { useAppTheme } from "@/hooks/useAppTheme";

interface ThemedTextProps extends TextProps {
  children: ReactNode;
  style?: TextStyle | TextStyle[];
  type?: "default" | "title" | "subtitle" | "caption" | "error" | "success";
  color?: string; // Optional override for theme color
}

/**
 * A themed text component that automatically uses the current theme's text color
 */
const ThemedText: React.FC<ThemedTextProps> = ({
  children,
  style,
  type = "default",
  color,
  ...props
}) => {
  const { colors } = useAppTheme();

  // Determine text color based on type
  const getTextColor = () => {
    if (color) return color;

    switch (type) {
      case "title":
        return colors.text;
      case "subtitle":
        return colors.textSecondary;
      case "caption":
        return colors.gray500;
      case "error":
        return colors.error;
      case "success":
        return colors.success;
      case "default":
      default:
        return colors.text;
    }
  };

  // Apply typography styles based on type
  const getTextStyle = () => {
    switch (type) {
      case "title":
        return styles.title;
      case "subtitle":
        return styles.subtitle;
      case "caption":
        return styles.caption;
      case "error":
      case "success":
        return styles.message;
      case "default":
      default:
        return {};
    }
  };

  return (
    <Text
      style={[
        getTextStyle(),
        { color: getTextColor() },
        Array.isArray(style) ? style : style ? [style] : null,
      ]}
      {...props}
    >
      {children}
    </Text>
  );
};

const styles = StyleSheet.create({
  title: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 6,
  },
  caption: {
    fontSize: 12,
  },
  message: {
    fontSize: 14,
    fontWeight: "500",
  },
});

export default ThemedText;
