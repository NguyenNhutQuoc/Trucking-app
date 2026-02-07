// src/components/common/Card.tsx
// Material Design 3 Card Component
import React, { ReactNode } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ViewStyle,
  TextStyle,
  StyleProp,
} from "react-native";
import { useAppTheme } from "@/hooks/useAppTheme";
import spacing from "@/styles/spacing";

// M3 Card variants
type CardVariant = "elevated" | "filled" | "outlined";

interface CardProps {
  title?: string;
  subtitle?: string;
  children: ReactNode;
  onPress?: () => void;
  variant?: CardVariant;
  style?: StyleProp<ViewStyle>;
  titleStyle?: StyleProp<TextStyle>;
  subtitleStyle?: StyleProp<TextStyle>;
  contentStyle?: StyleProp<ViewStyle>;
  // Legacy props
  bordered?: boolean;
  elevated?: boolean;
  header?: ReactNode;
  footer?: ReactNode;
  status?: "default" | "success" | "warning" | "error" | "pending";
  rightContent?: ReactNode;
}

const Card: React.FC<CardProps> = ({
  title,
  subtitle,
  children,
  onPress,
  variant = "elevated",
  style,
  titleStyle,
  subtitleStyle,
  contentStyle,
  bordered = false,
  elevated: legacyElevated,
  header,
  footer,
  status = "default",
  rightContent,
}) => {
  const { colors } = useAppTheme();

  // Status color for left bar
  const getStatusColor = (): string => {
    switch (status) {
      case "success":
        return colors.success;
      case "warning":
        return colors.warning;
      case "error":
        return colors.error;
      case "pending":
        return colors.warning;
      default:
        return "transparent";
    }
  };

  // M3 variant styles
  const getVariantStyles = (): ViewStyle => {
    // Legacy support: if legacyElevated is explicitly passed, use old behavior
    if (legacyElevated !== undefined) {
      return legacyElevated ? styles.elevated : {};
    }

    switch (variant) {
      case "filled":
        return {
          backgroundColor: colors.surfaceContainerHighest || colors.gray100,
          borderWidth: 0,
        };
      case "outlined":
        return {
          backgroundColor: colors.surface || colors.card,
          borderWidth: 1,
          borderColor: colors.outlineVariant || colors.gray300,
          elevation: 0,
          shadowOpacity: 0,
        };
      case "elevated":
      default:
        return {
          backgroundColor: colors.surfaceContainerLow || colors.card,
          ...styles.elevated,
        };
    }
  };

  const renderContent = () => (
    <View
      style={[
        styles.card,
        { backgroundColor: colors.card },
        getVariantStyles(),
        bordered && styles.bordered,
        bordered && { borderColor: colors.outlineVariant || colors.gray200 },
        style,
      ]}
    >
      {status !== "default" && (
        <View
          style={[styles.statusBar, { backgroundColor: getStatusColor() }]}
        />
      )}

      {(header || title || subtitle) && (
        <View
          style={[
            styles.headerContainer,
            { borderBottomColor: colors.outlineVariant || colors.gray200 },
          ]}
        >
          {header || (
            <View style={styles.titleContainer}>
              <View style={styles.titleWrapper}>
                {title && (
                  <Text
                    style={[
                      styles.title, 
                      { color: colors.onSurface || colors.text }, 
                      titleStyle
                    ]}
                  >
                    {title}
                  </Text>
                )}
                {subtitle && (
                  <Text
                    style={[
                      styles.subtitle,
                      { color: colors.onSurfaceVariant || colors.textSecondary },
                      subtitleStyle,
                    ]}
                  >
                    {subtitle}
                  </Text>
                )}
              </View>
              {rightContent && (
                <View style={styles.rightContent}>{rightContent}</View>
              )}
            </View>
          )}
        </View>
      )}

      <View style={[styles.content, contentStyle]}>{children}</View>

      {footer && (
        <View
          style={[
            styles.footerContainer, 
            { borderTopColor: colors.outlineVariant || colors.gray200 }
          ]}
        >
          {footer}
        </View>
      )}
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity activeOpacity={0.7} onPress={onPress}>
        {renderContent()}
      </TouchableOpacity>
    );
  }

  return renderContent();
};

const styles = StyleSheet.create({
  card: {
    borderRadius: spacing.radiusMd, // M3: 12px
    overflow: "hidden",
    marginBottom: spacing.md,
  },
  bordered: {
    borderWidth: 1,
  },
  elevated: {
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
  },
  statusBar: {
    position: "absolute",
    top: 0,
    left: 0,
    width: 4,
    height: "100%",
  },
  headerContainer: {
    paddingVertical: 12,
    paddingHorizontal: spacing.md,
    borderBottomWidth: 1,
  },
  titleContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  titleWrapper: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: "500", // M3: Medium weight
    letterSpacing: 0.15,
  },
  subtitle: {
    fontSize: 14,
    marginTop: 2,
    letterSpacing: 0.25,
  },
  rightContent: {
    marginLeft: spacing.md,
  },
  content: {
    padding: spacing.md,
  },
  footerContainer: {
    padding: 12,
    borderTopWidth: 1,
  },
});

export default Card;
