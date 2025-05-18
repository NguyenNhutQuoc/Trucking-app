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
import colors from "@/constants/colors";

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

  const toggleSecureEntry = () => {
    setSecureTextEntry(!secureTextEntry);
  };

  const renderInput = () => (
    <View
      style={[styles.inputContainer, !!error && styles.inputError, inputStyle]}
    >
      {leftIcon && <View style={styles.leftIconContainer}>{leftIcon}</View>}
      <TextInput
        style={[
          styles.input,
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
        <Text style={[styles.label, !!error && styles.labelError, labelStyle]}>
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
        <Text style={[styles.helperText, !!error && styles.errorText]}>
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
    color: colors.gray700,
    marginBottom: 6,
  },
  labelError: {
    color: colors.error,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.gray100,
    borderWidth: 1,
    borderColor: colors.gray300,
    borderRadius: 8,
    overflow: "hidden",
  },
  inputError: {
    borderColor: colors.error,
  },
  input: {
    flex: 1,
    height: 48,
    paddingHorizontal: 12,
    color: colors.text,
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
    color: colors.gray600,
    marginTop: 4,
    marginLeft: 4,
  },
  errorText: {
    color: colors.error,
  },
});

export default Input;
