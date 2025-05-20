// src/components/common/Input.tsx
import React, { useState } from "react";
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  TextInputProps,
  ViewStyle,
  TextStyle,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAppTheme } from "@/hooks/useAppTheme";

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  helper?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
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
  const { colors } = useAppTheme();

  const toggleSecureEntry = () => {
    setSecureTextEntry(!secureTextEntry);
  };

  const renderInput = () => (
    <View
      style={[
        styles.inputContainer,
        {
          backgroundColor: colors.gray100,
          borderColor: error ? colors.error : colors.gray300,
        },
        !!error && styles.inputError,
        inputStyle,
      ]}
    >
      {leftIcon && <View style={styles.leftIconContainer}>{leftIcon}</View>}
      <TextInput
        style={[
          styles.input,
          { color: colors.text },
          !!leftIcon && styles.inputWithLeftIcon,
          !!(rightIcon || secure) && styles.inputWithRightIcon,
        ]}
        placeholderTextColor={colors.gray500}
        secureTextEntry={secureTextEntry}
        editable={!touchable}
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
            color={colors.gray600}
          />
        </TouchableOpacity>
      )}
      {rightIcon && !secure && (
        <View style={styles.rightIconContainer}>{rightIcon}</View>
      )}
    </View>
  );

  return (
    <View style={[styles.container, containerStyle]}>
      {label && (
        <Text
          style={[
            styles.label,
            { color: error ? colors.error : colors.gray700 },
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
            { color: error ? colors.error : colors.gray600 },
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
    marginBottom: 16,
    width: "100%",
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 6,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 8,
    overflow: "hidden",
  },
  inputError: {
    borderColor: "red", // This is overridden with the theme color
  },
  input: {
    flex: 1,
    height: 48,
    paddingHorizontal: 12,
    fontSize: 16,
  },
  inputWithLeftIcon: {
    paddingLeft: 8,
  },
  inputWithRightIcon: {
    paddingRight: 8,
  },
  leftIconContainer: {
    paddingLeft: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  rightIconContainer: {
    paddingRight: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  helperText: {
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
});

export default Input;
