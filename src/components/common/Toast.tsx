// src/components/common/Toast.tsx
// Material Design 3 Toast Component with Gradient Backgrounds
import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

export type ToastType = "success" | "warning" | "error" | "info";

interface ToastProps {
  visible: boolean;
  message: string;
  type?: ToastType;
  duration?: number;
  onHide?: () => void;
  actionLabel?: string;
  onAction?: () => void;
}

// M3 Toast gradient colors and text colors
const TOAST_CONFIG: Record<
  ToastType,
  {
    gradient: [string, string];
    textColor: string;
    iconName: string;
  }
> = {
  // Thêm mới - xanh lá gradient
  success: {
    gradient: ["#10B981", "#059669"], // Emerald gradient
    textColor: "#FFFFFF",
    iconName: "checkmark-circle",
  },
  // Edit - vàng gradient
  warning: {
    gradient: ["#F59E0B", "#D97706"], // Amber gradient
    textColor: "#1F2937", // Dark text for contrast
    iconName: "create",
  },
  // Xóa - đỏ gradient
  error: {
    gradient: ["#EF4444", "#DC2626"], // Red gradient
    textColor: "#FFFFFF",
    iconName: "trash",
  },
  // Info - xanh dương gradient
  info: {
    gradient: ["#3B82F6", "#2563EB"], // Blue gradient
    textColor: "#FFFFFF",
    iconName: "information-circle",
  },
};

const Toast: React.FC<ToastProps> = ({
  visible,
  message,
  type = "info",
  duration = 3000,
  onHide,
  actionLabel,
  onAction,
}) => {
  const translateY = useRef(new Animated.Value(-100)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      // Animate in
      Animated.parallel([
        Animated.spring(translateY, {
          toValue: 0,
          useNativeDriver: true,
          tension: 80,
          friction: 10,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();

      // Auto hide after duration
      const timer = setTimeout(() => {
        hideToast();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [visible]);

  const hideToast = () => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: -100,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onHide?.();
    });
  };

  if (!visible) return null;

  const config = TOAST_CONFIG[type];

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ translateY }],
          opacity,
        },
      ]}
    >
      <LinearGradient
        colors={config.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.gradient}
      >
        <View style={styles.content}>
          <Ionicons
            name={config.iconName as any}
            size={24}
            color={config.textColor}
            style={styles.icon}
          />
          <Text
            style={[styles.message, { color: config.textColor }]}
            numberOfLines={2}
          >
            {message}
          </Text>
          {actionLabel && onAction && (
            <TouchableOpacity onPress={onAction} style={styles.actionButton}>
              <Text style={[styles.actionText, { color: config.textColor }]}>
                {actionLabel}
              </Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity onPress={hideToast} style={styles.closeButton}>
            <Ionicons name="close" size={20} color={config.textColor} />
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </Animated.View>
  );
};

const { width } = Dimensions.get("window");

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 50,
    left: 16,
    right: 16,
    zIndex: 9999,
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  gradient: {
    borderRadius: 16,
    overflow: "hidden",
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  icon: {
    marginRight: 12,
  },
  message: {
    flex: 1,
    fontSize: 15,
    fontWeight: "500",
    lineHeight: 20,
  },
  actionButton: {
    marginLeft: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 8,
  },
  actionText: {
    fontSize: 14,
    fontWeight: "600",
  },
  closeButton: {
    marginLeft: 8,
    padding: 4,
  },
});

export default Toast;
