// src/components/common/EmptyState.tsx
// Material Design 3 Empty/Error State Component
import React from "react";
import { View, StyleSheet, ViewStyle } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAppTheme } from "@/hooks/useAppTheme";
import ThemedText from "./ThemedText";
import Button from "./Button";

type StateType = "empty" | "error" | "noResults" | "noConnection" | "custom";

interface EmptyStateProps {
  type?: StateType;
  icon?: keyof typeof Ionicons.glyphMap;
  title?: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  secondaryActionLabel?: string;
  onSecondaryAction?: () => void;
  style?: ViewStyle;
}

// Default configurations for each state type
const stateConfigs: Record<StateType, { icon: string; title: string; description: string }> = {
  empty: {
    icon: "folder-open-outline",
    title: "Chưa có dữ liệu",
    description: "Bắt đầu bằng cách thêm dữ liệu mới",
  },
  error: {
    icon: "alert-circle-outline",
    title: "Đã xảy ra lỗi",
    description: "Không thể tải dữ liệu. Vui lòng thử lại sau.",
  },
  noResults: {
    icon: "search-outline",
    title: "Không tìm thấy kết quả",
    description: "Thử thay đổi từ khóa tìm kiếm hoặc điều kiện lọc",
  },
  noConnection: {
    icon: "cloud-offline-outline",
    title: "Không có kết nối",
    description: "Kiểm tra kết nối mạng và thử lại",
  },
  custom: {
    icon: "information-circle-outline",
    title: "",
    description: "",
  },
};

/**
 * M3 Empty/Error State Component
 * Displays helpful feedback when content is unavailable
 */
const EmptyState: React.FC<EmptyStateProps> = ({
  type = "empty",
  icon,
  title,
  description,
  actionLabel,
  onAction,
  secondaryActionLabel,
  onSecondaryAction,
  style,
}) => {
  const { colors } = useAppTheme();
  const config = stateConfigs[type];

  const displayIcon = icon || config.icon;
  const displayTitle = title || config.title;
  const displayDescription = description || config.description;

  // Icon color based on state type
  const iconColor = type === "error" ? colors.error : colors.textSecondary;
  const iconBgColor = type === "error" 
    ? colors.error + "15" 
    : (colors.surfaceContainer || colors.gray100);

  return (
    <View style={[styles.container, style]}>
      {/* Icon with background circle */}
      <View style={[styles.iconContainer, { backgroundColor: iconBgColor }]}>
        <Ionicons
          name={displayIcon as any}
          size={48}
          color={iconColor}
        />
      </View>

      {/* Title */}
      {displayTitle && (
        <ThemedText type="title" style={styles.title}>
          {displayTitle}
        </ThemedText>
      )}

      {/* Description */}
      {displayDescription && (
        <ThemedText 
          style={styles.description}
          color={colors.textSecondary}
        >
          {displayDescription}
        </ThemedText>
      )}

      {/* Actions */}
      {(actionLabel || secondaryActionLabel) && (
        <View style={styles.actions}>
          {secondaryActionLabel && onSecondaryAction && (
            <Button
              title={secondaryActionLabel}
              variant="outlined"
              onPress={onSecondaryAction}
              style={styles.secondaryButton}
            />
          )}
          {actionLabel && onAction && (
            <Button
              title={actionLabel}
              variant="filled"
              onPress={onAction}
              style={styles.primaryButton}
            />
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
  },
  iconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
    maxWidth: 280,
  },
  actions: {
    flexDirection: "row",
    marginTop: 24,
    gap: 12,
  },
  primaryButton: {
    minWidth: 120,
  },
  secondaryButton: {
    minWidth: 100,
  },
});

export default EmptyState;
