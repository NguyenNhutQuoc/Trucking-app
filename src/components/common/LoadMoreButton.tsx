// src/components/common/LoadMoreButton.tsx
import React from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAppTheme } from "@/hooks/useAppTheme";
import ThemedText from "./ThemedText";

interface LoadMoreButtonProps {
  onLoadMore: () => void;
  loading?: boolean;
  hasMore: boolean;
  currentCount: number;
  totalCount: number;
}

/**
 * Button "Load More" cho infinite scroll
 * Hiển thị ở cuối list khi còn data để load
 */
const LoadMoreButton: React.FC<LoadMoreButtonProps> = ({
  onLoadMore,
  loading = false,
  hasMore,
  currentCount,
  totalCount,
}) => {
  const { colors } = useAppTheme();

  if (!hasMore) {
    return (
      <View style={styles.container}>
        <View style={[styles.endMessage, { borderColor: colors.border }]}>
          <Ionicons name="checkmark-circle" size={24} color={colors.primary} />
          <ThemedText style={styles.endText}>
            Đã hiển thị tất cả {totalCount} mục
          </ThemedText>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[
          styles.button,
          {
            backgroundColor: colors.card,
            borderColor: colors.border,
          },
          loading && styles.loadingButton,
        ]}
        onPress={onLoadMore}
        disabled={loading}
      >
        {loading ? (
          <>
            <ActivityIndicator size="small" color={colors.primary} />
            <ThemedText style={styles.buttonText}>Đang tải...</ThemedText>
          </>
        ) : (
          <>
            <Ionicons
              name="arrow-down-circle-outline"
              size={24}
              color={colors.primary}
            />
            <ThemedText style={styles.buttonText}>
              Tải thêm ({currentCount}/{totalCount})
            </ThemedText>
          </>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
  },
  loadingButton: {
    opacity: 0.7,
  },
  buttonText: {
    fontSize: 14,
    fontWeight: "600",
  },
  endMessage: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderStyle: "dashed",
  },
  endText: {
    fontSize: 14,
    opacity: 0.7,
  },
});

export default LoadMoreButton;
