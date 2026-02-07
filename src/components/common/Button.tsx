// src/components/common/Button.tsx
// Material Design 3 Button Component
import React from "react";
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacityProps,
  ViewStyle,
  TextStyle,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAppTheme } from "@/hooks/useAppTheme";
import spacing from "@/styles/spacing";

// M3 Button variants
type ButtonVariant =
  | "filled"      // Primary filled button (default)
  | "tonal"       // Tonal/secondary container button
  | "outlined"    // Outlined button
  | "text"        // Text-only button
  | "elevated"    // Elevated button with shadow
  // Legacy variants (kept for backwards compatibility)
  | "primary"
  | "secondary"
  | "outline"
  | "success"
  | "warning"
  | "error";

interface ButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: ButtonVariant;
  size?: "small" | "medium" | "large";
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  icon?: string | React.ReactNode; // Can be Ionicons name or custom node
  iconPosition?: "left" | "right";
  contentStyle?: ViewStyle;
  textStyle?: TextStyle;
}

const Button: React.FC<ButtonProps> = ({
  title,
  variant = "filled",
  size = "medium",
  loading = false,
  disabled = false,
  fullWidth = false,
  icon,
  iconPosition = "left",
  contentStyle,
  textStyle,
  ...props
}) => {
  const { colors } = useAppTheme();

  // M3 variant styles
  const getVariantStyles = (): { 
    container: ViewStyle; 
    text: TextStyle;
    iconColor: string;
  } => {
    switch (variant) {
      // M3 Tonal button
      case "tonal":
      case "secondary":
        return {
          container: {
            backgroundColor: colors.secondaryContainer || colors.secondary + "20",
            elevation: 0,
            shadowOpacity: 0,
          },
          text: {
            color: colors.onSecondaryContainer || colors.secondary,
          },
          iconColor: colors.onSecondaryContainer || colors.secondary,
        };

      // M3 Outlined button
      case "outlined":
      case "outline":
        return {
          container: {
            backgroundColor: "transparent",
            borderWidth: 1,
            borderColor: colors.outline || colors.primary,
            elevation: 0,
            shadowOpacity: 0,
          },
          text: {
            color: colors.primary,
          },
          iconColor: colors.primary,
        };

      // M3 Text button
      case "text":
        return {
          container: {
            backgroundColor: "transparent",
            elevation: 0,
            shadowOpacity: 0,
            paddingHorizontal: spacing.sm,
          },
          text: {
            color: colors.primary,
          },
          iconColor: colors.primary,
        };

      // M3 Elevated button
      case "elevated":
        return {
          container: {
            backgroundColor: colors.surfaceContainerLow || colors.surface,
          },
          text: {
            color: colors.primary,
          },
          iconColor: colors.primary,
        };

      // Status variants
      case "success":
        return {
          container: {
            backgroundColor: colors.success,
          },
          text: {
            color: colors.white,
          },
          iconColor: colors.white,
        };

      case "warning":
        return {
          container: {
            backgroundColor: colors.warning,
          },
          text: {
            color: colors.onBackground || colors.text,
          },
          iconColor: colors.onBackground || colors.text,
        };

      case "error":
        return {
          container: {
            backgroundColor: colors.error,
          },
          text: {
            color: colors.onError || colors.white,
          },
          iconColor: colors.onError || colors.white,
        };

      // M3 Filled button (default)
      case "filled":
      case "primary":
      default:
        return {
          container: {
            backgroundColor: colors.primary,
          },
          text: {
            color: colors.onPrimary || colors.white,
          },
          iconColor: colors.onPrimary || colors.white,
        };
    }
  };

  // M3 size styles with proper padding
  const getSizeStyles = (): { container: ViewStyle; text: TextStyle; iconSize: number } => {
    switch (size) {
      case "small":
        return {
          container: {
            paddingVertical: 8,
            paddingHorizontal: 16,
            minHeight: 32,
            borderRadius: spacing.radiusMd,
          },
          text: {
            fontSize: 12,
            letterSpacing: 0.5,
          },
          iconSize: 16,
        };
      case "large":
        return {
          container: {
            paddingVertical: 16,
            paddingHorizontal: 28,
            minHeight: 56,
            borderRadius: spacing.radiusXl,
          },
          text: {
            fontSize: 16,
            letterSpacing: 0.1,
          },
          iconSize: 24,
        };
      case "medium":
      default:
        return {
          container: {
            paddingVertical: 12,
            paddingHorizontal: 24,
            minHeight: 40,
            borderRadius: 20, // M3 default: full rounded for medium buttons
          },
          text: {
            fontSize: 14,
            letterSpacing: 0.1,
          },
          iconSize: 18,
        };
    }
  };

  const variantStyles = getVariantStyles();
  const sizeStyles = getSizeStyles();

  // Determine if this variant should have shadow
  const shouldHaveShadow = variant === "elevated" || variant === "filled" || variant === "primary";

  // Render icon
  const renderIcon = () => {
    if (!icon) return null;

    const iconElement = typeof icon === "string" ? (
      <Ionicons 
        name={icon as any} 
        size={sizeStyles.iconSize} 
        color={disabled ? colors.textDisabled : variantStyles.iconColor} 
      />
    ) : (
      icon
    );

    return (
      <View style={iconPosition === "right" ? styles.iconRight : styles.iconLeft}>
        {iconElement}
      </View>
    );
  };

  return (
    <TouchableOpacity
      style={[
        styles.container,
        shouldHaveShadow && styles.containerWithShadow,
        variantStyles.container,
        sizeStyles.container,
        fullWidth && styles.fullWidth,
        disabled && styles.disabled,
        disabled && { backgroundColor: colors.surfaceVariant || colors.gray300 },
        contentStyle,
      ]}
      disabled={disabled || loading}
      activeOpacity={0.7}
      {...props}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === "outlined" || variant === "outline" || variant === "text" 
            ? colors.primary 
            : variantStyles.iconColor}
          size="small"
        />
      ) : (
        <View style={styles.content}>
          {iconPosition === "left" && renderIcon()}
          <Text
            style={[
              styles.text,
              variantStyles.text,
              sizeStyles.text,
              disabled && { color: colors.textDisabled },
              textStyle,
            ]}
          >
            {title}
          </Text>
          {iconPosition === "right" && renderIcon()}
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  containerWithShadow: {
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.18,
    shadowRadius: 2,
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  text: {
    fontWeight: "500",
    textAlign: "center",
  },
  iconLeft: {
    marginRight: 8,
  },
  iconRight: {
    marginLeft: 8,
  },
  fullWidth: {
    width: "100%",
  },
  disabled: {
    elevation: 0,
    shadowOpacity: 0,
  },
});

export default Button;