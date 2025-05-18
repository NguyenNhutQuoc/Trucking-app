// src/components/common/Button.tsx
import React from "react";
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacityProps,
  ViewStyle,
  TextStyle,
} from "react-native";
import colors from "@/constants/colors";

interface ButtonProps extends TouchableOpacityProps {
  title: string;
  variant?:
    | "primary"
    | "secondary"
    | "outline"
    | "text"
    | "success"
    | "warning"
    | "error";
  size?: "small" | "medium" | "large";
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  icon?: React.ReactNode;
  contentStyle?: ViewStyle;
  textStyle?: TextStyle;
}

const Button: React.FC<ButtonProps> = ({
  title,
  variant = "primary",
  size = "medium",
  loading = false,
  disabled = false,
  fullWidth = false,
  icon,
  contentStyle,
  textStyle,
  ...props
}) => {
  // Xác định styles dựa trên variant
  const getVariantStyles = (): { container: ViewStyle; text: TextStyle } => {
    switch (variant) {
      case "secondary":
        return {
          container: {
            backgroundColor: colors.secondary,
          },
          text: {
            color: colors.text,
          },
        };
      case "outline":
        return {
          container: {
            backgroundColor: "transparent",
            borderWidth: 1,
            borderColor: colors.primary,
          },
          text: {
            color: colors.primary,
          },
        };
      case "text":
        return {
          container: {
            backgroundColor: "transparent",
            elevation: 0,
            shadowOpacity: 0,
          },
          text: {
            color: colors.primary,
          },
        };
      case "success":
        return {
          container: {
            backgroundColor: colors.success,
          },
          text: {
            color: "white",
          },
        };
      case "warning":
        return {
          container: {
            backgroundColor: colors.warning,
          },
          text: {
            color: colors.text,
          },
        };
      case "error":
        return {
          container: {
            backgroundColor: colors.error,
          },
          text: {
            color: "white",
          },
        };
      case "primary":
      default:
        return {
          container: {
            backgroundColor: colors.primary,
          },
          text: {
            color: "white",
          },
        };
    }
  };

  // Xác định styles dựa trên size
  const getSizeStyles = (): { container: ViewStyle; text: TextStyle } => {
    switch (size) {
      case "small":
        return {
          container: {
            paddingVertical: 6,
            paddingHorizontal: 12,
          },
          text: {
            fontSize: 12,
          },
        };
      case "large":
        return {
          container: {
            paddingVertical: 14,
            paddingHorizontal: 24,
          },
          text: {
            fontSize: 16,
          },
        };
      case "medium":
      default:
        return {
          container: {
            paddingVertical: 10,
            paddingHorizontal: 16,
          },
          text: {
            fontSize: 14,
          },
        };
    }
  };

  const variantStyles = getVariantStyles();
  const sizeStyles = getSizeStyles();

  return (
    <TouchableOpacity
      style={[
        styles.container,
        variantStyles.container,
        sizeStyles.container,
        fullWidth && styles.fullWidth,
        disabled && styles.disabled,
        contentStyle,
      ]}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <ActivityIndicator
          color={
            variant === "outline" || variant === "text"
              ? colors.primary
              : "white"
          }
          size="small"
        />
      ) : (
        <>
          {icon && <>{icon}</>}
          <Text
            style={[
              styles.text,
              variantStyles.text,
              sizeStyles.text,
              !!icon && styles.textWithIcon,
              disabled && styles.disabledText,
              textStyle,
            ]}
          >
            {title}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 8,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.5,
  },
  text: {
    fontWeight: "600",
    textAlign: "center",
  },
  textWithIcon: {
    marginLeft: 8,
  },
  fullWidth: {
    width: "100%",
  },
  disabled: {
    backgroundColor: colors.gray300,
    elevation: 0,
    shadowOpacity: 0,
  },
  disabledText: {
    color: colors.gray600,
  },
});

export default Button;
