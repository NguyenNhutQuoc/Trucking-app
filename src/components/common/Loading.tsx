// src/components/common/Loading.tsx
import React from "react";
import {
  View,
  ActivityIndicator,
  StyleSheet,
  Text,
  Modal,
  ViewStyle,
} from "react-native";
import { useAppTheme } from "@/hooks/useAppTheme";

interface LoadingProps {
  loading: boolean;
  message?: string;
  fullscreen?: boolean;
  overlay?: boolean;
  size?: "small" | "large";
  color?: string;
  style?: ViewStyle;
}

const Loading: React.FC<LoadingProps> = ({
  loading,
  message,
  fullscreen = false,
  overlay = false,
  size = "large",
  color,
  style,
}) => {
  const { colors } = useAppTheme();

  if (!loading) return null;

  const loadingColor = color || colors.primary;

  const content = (
    <View
      style={[
        styles.container,
        fullscreen && styles.fullscreen,
        fullscreen && { backgroundColor: colors.background },
        overlay && styles.overlay,
        style,
      ]}
    >
      <View style={[styles.loadingContainer, { backgroundColor: colors.card }]}>
        <ActivityIndicator size={size} color={loadingColor} />
        {message && (
          <Text style={[styles.message, { color: colors.text }]}>
            {message}
          </Text>
        )}
      </View>
    </View>
  );

  if (fullscreen || overlay) {
    return (
      <Modal transparent visible={loading} animationType="fade">
        {content}
      </Modal>
    );
  }

  return content;
};

const styles = StyleSheet.create({
  container: {
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  fullscreen: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 999,
  },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    zIndex: 999,
  },
  loadingContainer: {
    padding: 20,
    borderRadius: 10,
    alignItems: "center",
    minWidth: 140,
  },
  message: {
    marginTop: 16,
    fontSize: 14,
    fontWeight: "500",
    textAlign: "center",
  },
});

export default Loading;
