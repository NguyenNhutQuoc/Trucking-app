// src/components/common/Input.tsx
// Material Design 3 TextField Component
import React, { useState, useRef } from "react";
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  TextInputProps,
  ViewStyle,
  TextStyle,
  TouchableOpacity,
  Animated,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAppTheme } from "@/hooks/useAppTheme";
import spacing from "@/styles/spacing";

// M3 TextField variants
type InputVariant = "filled" | "outlined";

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  helper?: string;
  variant?: InputVariant;
  leftIcon?: React.ReactNode | string; // Can be Ionicons name or custom node
  rightIcon?: React.ReactNode | string;
  containerStyle?: ViewStyle;
  labelStyle?: TextStyle;
  inputStyle?: ViewStyle;
  secure?: boolean;
  onPress?: () => void;
  touchable?: boolean;
}

const Input: React.FC<InputProps> = ({
  label,
  error,
  helper,
  variant = "filled",
  leftIcon,
  rightIcon,
  containerStyle,
  labelStyle,
  inputStyle,
  secure = false,
  onPress,
  touchable = false,
  ...props
}) => {
  const [secureTextEntry, setSecureTextEntry] = useState<boolean>(secure);
  const [isFocused, setIsFocused] = useState(false);
  const { colors } = useAppTheme();

  const toggleSecureEntry = () => {
    setSecureTextEntry(!secureTextEntry);
  };

  // Get variant-specific styles
  const getVariantStyles = (): ViewStyle => {
    const baseError = error ? {
      borderColor: colors.error,
      borderWidth: variant === "outlined" ? 2 : 0,
    } : {};

    switch (variant) {
      case "outlined":
        return {
          backgroundColor: "transparent",
          borderWidth: isFocused ? 2 : 1,
          borderColor: isFocused 
            ? colors.primary 
            : (error ? colors.error : colors.outline || colors.gray400),
          borderRadius: spacing.radiusSm,
          ...baseError,
        };
      case "filled":
      default:
        return {
          backgroundColor: colors.surfaceContainerHighest || colors.gray100,
          borderWidth: 0,
          borderBottomWidth: isFocused ? 2 : 1,
          borderBottomColor: isFocused 
            ? colors.primary 
            : (error ? colors.error : colors.outline || colors.gray400),
          borderTopLeftRadius: spacing.radiusSm,
          borderTopRightRadius: spacing.radiusSm,
          borderBottomLeftRadius: 0,
          borderBottomRightRadius: 0,
          ...baseError,
        };
    }
  };

  // Render icon (string or component)
  const renderIcon = (icon: React.ReactNode | string | undefined, position: "left" | "right") => {
    if (!icon) return null;

    const iconElement = typeof icon === "string" ? (
      <Ionicons 
        name={icon as any} 
        size={20} 
        color={error ? colors.error : colors.onSurfaceVariant || colors.gray600} 
      />
    ) : (
      icon
    );

    return (
      <View style={position === "left" ? styles.leftIconContainer : styles.rightIconContainer}>
        {iconElement}
      </View>
    );
  };

  const renderInput = () => (
    <View
      style={[
        styles.inputContainer,
        getVariantStyles(),
        inputStyle,
      ]}
    >
      {renderIcon(leftIcon, "left")}
      <TextInput
        style={[
          styles.input,
          { color: colors.onSurface || colors.text },
          !!leftIcon && styles.inputWithLeftIcon,
          !!(rightIcon || secure) && styles.inputWithRightIcon,
        ]}
        placeholderTextColor={colors.onSurfaceVariant || colors.gray500}
        secureTextEntry={secureTextEntry}
        editable={!touchable}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        {...props}
      />
      {secure && (
        <TouchableOpacity
          onPress={toggleSecureEntry}
          style={styles.rightIconContainer}
        >
          <Ionicons
            name={secureTextEntry ? "eye-outline" : "eye-off-outline"}
            size={20}
            color={colors.onSurfaceVariant || colors.gray600}
          />
        </TouchableOpacity>
      )}
      {renderIcon(!secure ? rightIcon : undefined, "right")}
    </View>
  );

  return (
    <View style={[styles.container, containerStyle]}>
      {label && (
        <Text
          style={[
            styles.label,
            { 
              color: error 
                ? colors.error 
                : (isFocused ? colors.primary : colors.onSurfaceVariant || colors.gray700)
            },
            labelStyle,
          ]}
        >
          {label}
        </Text>
      )}

      {touchable ? (
        <TouchableOpacity activeOpacity={0.7} onPress={onPress}>
          {renderInput()}
        </TouchableOpacity>
      ) : (
        renderInput()
      )}

      {(error || helper) && (
        <Text
          style={[
            styles.helperText,
            { color: error ? colors.error : colors.onSurfaceVariant || colors.gray600 },
          ]}
        >
          {error || helper}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
    width: "100%",
  },
  label: {
    fontSize: 12,
    fontWeight: "500",
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    overflow: "hidden",
  },
  input: {
    flex: 1,
    height: 56, // M3: 56dp height
    paddingHorizontal: spacing.md,
    fontSize: 16,
    letterSpacing: 0.5,
  },
  inputWithLeftIcon: {
    paddingLeft: spacing.sm,
  },
  inputWithRightIcon: {
    paddingRight: spacing.sm,
  },
  leftIconContainer: {
    paddingLeft: spacing.md,
    justifyContent: "center",
    alignItems: "center",
  },
  rightIconContainer: {
    paddingRight: spacing.md,
    justifyContent: "center",
    alignItems: "center",
  },
  helperText: {
    fontSize: 12,
    marginTop: 4,
    marginLeft: spacing.md,
    letterSpacing: 0.4,
  },
});

export default Input;
