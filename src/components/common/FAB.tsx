// src/components/common/FAB.tsx
// Material Design 3 Floating Action Button
import React from "react";
import {
  TouchableOpacity,
  StyleSheet,
  View,
  ViewStyle,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAppTheme } from "@/hooks/useAppTheme";
import ThemedText from "./ThemedText";

type FABSize = "small" | "medium" | "large";
type FABVariant = "primary" | "secondary" | "tertiary" | "surface";

interface FABProps {
  icon: keyof typeof Ionicons.glyphMap;
  label?: string; // Extended FAB shows label
  onPress: () => void;
  size?: FABSize;
  variant?: FABVariant;
  style?: ViewStyle;
  disabled?: boolean;
  position?: "bottomRight" | "bottomLeft" | "bottomCenter";
}

// M3 FAB sizes
const sizeStyles: Record<FABSize, { container: number; icon: number }> = {
  small: { container: 40, icon: 20 },
  medium: { container: 56, icon: 24 },
  large: { container: 96, icon: 36 },
};

/**
 * M3 Floating Action Button
 * Primary action for a screen
 */
const FAB: React.FC<FABProps> = ({
  icon,
  label,
  onPress,
  size = "medium",
  variant = "primary",
  style,
  disabled = false,
  position = "bottomRight",
}) => {
  const { colors, isDarkMode } = useAppTheme();
  const sizeConfig = sizeStyles[size];

  // M3 color variants
  const getColors = () => {
    switch (variant) {
      case "primary":
        return {
          background: colors.primaryContainer || colors.primary + "20",
          icon: colors.primary,
        };
      case "secondary":
        return {
          background: colors.secondaryContainer || colors.gray200,
          icon: colors.text,
        };
      case "tertiary":
        return {
          background: colors.tertiaryContainer || colors.success + "20",
          icon: colors.success,
        };
      case "surface":
        return {
          background: colors.surfaceContainer || colors.card,
          icon: colors.primary,
        };
      default:
        return {
          background: colors.primaryContainer || colors.primary + "20",
          icon: colors.primary,
        };
    }
  };

  const fabColors = getColors();
  const isExtended = !!label;

  // Position styles
  const positionStyle: ViewStyle = {
    position: "absolute",
    bottom: Platform.OS === "ios" ? 100 : 88,
    ...(position === "bottomRight" && { right: 16 }),
    ...(position === "bottomLeft" && { left: 16 }),
    ...(position === "bottomCenter" && { alignSelf: "center", left: "50%", marginLeft: -28 }),
  };

  return (
    <TouchableOpacity
      style={[
        styles.fab,
        positionStyle,
        {
          backgroundColor: fabColors.background,
          width: isExtended ? undefined : sizeConfig.container,
          height: sizeConfig.container,
          borderRadius: isExtended ? sizeConfig.container / 2 : sizeConfig.container / 2,
          paddingHorizontal: isExtended ? 16 : 0,
          opacity: disabled ? 0.5 : 1,
        },
        style,
      ]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.8}
    >
      <Ionicons
        name={icon}
        size={sizeConfig.icon}
        color={fabColors.icon}
      />
      {isExtended && (
        <ThemedText
          style={[styles.label, { color: fabColors.icon }]}
        >
          {label}
        </ThemedText>
      )}
    </TouchableOpacity>
  );
};

// Mini FAB for secondary actions
interface MiniFABProps {
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  style?: ViewStyle;
}

export const MiniFAB: React.FC<MiniFABProps> = ({ icon, onPress, style }) => {
  const { colors } = useAppTheme();

  return (
    <TouchableOpacity
      style={[
        styles.miniFab,
        { backgroundColor: colors.surfaceContainer || colors.gray100 },
        style,
      ]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Ionicons name={icon} size={20} color={colors.primary} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  fab: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    // M3 elevation level 3
    elevation: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },
  label: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: "500",
    letterSpacing: 0.1,
  },
  miniFab: {
    width: 40,
    height: 40,
    borderRadius: 12, // M3 small FAB corner radius
    alignItems: "center",
    justifyContent: "center",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
});

export default FAB;
