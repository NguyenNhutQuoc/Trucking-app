// src/components/common/PageSizeSelector.tsx
import React from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { useAppTheme } from "@/hooks/useAppTheme";
import ThemedText from "./ThemedText";

interface PageSizeSelectorProps {
  pageSize: number;
  onPageSizeChange: (size: number) => void;
  options?: number[];
  loading?: boolean;
}

/**
 * Component để chọn số lượng items mỗi trang
 * Default options: [10, 20, 50, 100]
 */
const PageSizeSelector: React.FC<PageSizeSelectorProps> = ({
  pageSize,
  onPageSizeChange,
  options = [10, 20, 50, 100],
  loading = false,
}) => {
  const { colors } = useAppTheme();

  return (
    <View style={styles.container}>
      <ThemedText style={styles.label}>Hiển thị:</ThemedText>
      <View style={styles.optionsContainer}>
        {options.map((option) => {
          const isActive = option === pageSize;
          return (
            <TouchableOpacity
              key={option}
              style={[
                styles.optionButton,
                {
                  backgroundColor: isActive ? colors.primary : colors.card,
                  borderColor: colors.border,
                },
                loading && styles.disabledButton,
              ]}
              onPress={() => onPageSizeChange(option)}
              disabled={loading}
            >
              <ThemedText
                style={[
                  styles.optionText,
                  { color: isActive ? "#FFFFFF" : colors.text },
                ]}
              >
                {option}
              </ThemedText>
            </TouchableOpacity>
          );
        })}
      </View>
      <ThemedText style={styles.label}>/ trang</ThemedText>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  label: {
    fontSize: 14,
    opacity: 0.7,
  },
  optionsContainer: {
    flexDirection: "row",
    gap: 4,
  },
  optionButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    minWidth: 40,
    alignItems: "center",
  },
  optionText: {
    fontSize: 14,
    fontWeight: "600",
  },
  disabledButton: {
    opacity: 0.4,
  },
});

export default PageSizeSelector;
