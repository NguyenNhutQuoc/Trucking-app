// src/components/common/ViewModeToogle.tsx
import React from "react";
import { View, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAppTheme } from "@/hooks/useAppTheme";

interface ViewModeToggleProps {
  viewMode: "list" | "grid" | "table";
  onToggle: () => void;
  options?: ("list" | "grid" | "table")[];
}

const ViewModeToggle: React.FC<ViewModeToggleProps> = ({
  viewMode,
  onToggle,
  options = ["list", "grid"],
}) => {
  const { colors } = useAppTheme();

  const getIcon = (mode: "list" | "grid" | "table") => {
    switch (mode) {
      case "list":
        return "list-outline";
      case "grid":
        return "grid-outline";
      case "table":
        return "table-outline";
      default:
        return "list-outline";
    }
  };

  const getLabel = (mode: "list" | "grid" | "table") => {
    switch (mode) {
      case "list":
        return "List";
      case "grid":
        return "Grid";
      case "table":
        return "Table";
      default:
        return "List";
    }
  };

  // Simple toggle for 2 options
  if (options.length === 2) {
    return (
      <TouchableOpacity
        style={styles.toggleButton}
        onPress={onToggle}
        accessibilityLabel={`Switch to ${viewMode === options[0] ? options[1] : options[0]} view`}
      >
        <Ionicons name={getIcon(viewMode) as any} size={24} color="white" />
      </TouchableOpacity>
    );
  }

  // Multi-option toggle for 3+ options
  return (
    <View
      style={[styles.multiToggleContainer, { backgroundColor: colors.gray100 }]}
    >
      {options.map((mode) => (
        <TouchableOpacity
          key={mode}
          style={[
            styles.multiToggleButton,
            viewMode === mode && [
              styles.activeToggleButton,
              { backgroundColor: colors.primary },
            ],
          ]}
          onPress={onToggle}
          accessibilityLabel={`Switch to ${getLabel(mode)} view`}
        >
          <Ionicons
            name={getIcon(mode) as any}
            size={18}
            color={viewMode === mode ? "white" : colors.gray600}
          />
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  toggleButton: {
    padding: 4,
  },
  multiToggleContainer: {
    flexDirection: "row",
    borderRadius: 8,
    padding: 2,
  },
  multiToggleButton: {
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 6,
    marginHorizontal: 1,
  },
  activeToggleButton: {
    // Handled dynamically
  },
});

export default ViewModeToggle;
