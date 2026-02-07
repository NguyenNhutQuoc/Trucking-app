// src/components/common/Header.tsx
// Material Design 3 Top App Bar
import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  ViewStyle,
  TextStyle,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useAppTheme } from "@/hooks/useAppTheme";
import spacing from "@/styles/spacing";

// M3 App Bar variants
type HeaderVariant = "small" | "medium" | "large" | "centerAligned";

interface HeaderProps {
  title: string;
  variant?: HeaderVariant;
  showBack?: boolean;
  showMenu?: boolean;
  rightComponent?: React.ReactNode;
  onBackPress?: () => void;
  onMenuPress?: () => void;
  containerStyle?: ViewStyle;
  titleStyle?: TextStyle;
  backgroundColor?: string;
  transparent?: boolean;
}

const Header: React.FC<HeaderProps> = ({
  title,
  variant = "small",
  showBack = false,
  showMenu = false,
  rightComponent,
  onBackPress,
  onMenuPress,
  containerStyle,
  titleStyle,
  backgroundColor,
  transparent = false,
}) => {
  const navigation = useNavigation();
  const { colors, isDarkMode } = useAppTheme();

  const handleBackPress = () => {
    if (onBackPress) {
      onBackPress();
    } else {
      navigation.goBack();
    }
  };

  const handleMenuPress = () => {
    if (onMenuPress) {
      onMenuPress();
    }
  };

  // M3 uses surface color by default, primary for branded headers
  const headerBgColor = transparent 
    ? "transparent" 
    : (backgroundColor || colors.primary);
  
  const contentColor = transparent 
    ? (isDarkMode ? colors.onSurface : colors.onSurface) 
    : colors.onPrimary || colors.white;

  // Get variant-specific styles
  const getVariantStyles = () => {
    switch (variant) {
      case "medium":
        return {
          container: { height: 112 },
          title: { fontSize: 24, fontWeight: "400" as const },
        };
      case "large":
        return {
          container: { height: 152 },
          title: { fontSize: 28, fontWeight: "400" as const },
        };
      case "centerAligned":
        return {
          container: { height: 64 },
          title: { fontSize: 22, fontWeight: "500" as const, textAlign: "center" as const },
        };
      case "small":
      default:
        return {
          container: { height: 64 },
          title: { fontSize: 22, fontWeight: "500" as const },
        };
    }
  };

  const variantStyles = getVariantStyles();

  return (
    <>
      <StatusBar 
        backgroundColor={headerBgColor} 
        barStyle={transparent || isDarkMode ? "dark-content" : "light-content"} 
      />
      <View
        style={[
          styles.container,
          variantStyles.container,
          { backgroundColor: headerBgColor },
          containerStyle,
        ]}
      >
        <View style={styles.leftContainer}>
          {showBack && (
            <TouchableOpacity
              style={styles.iconButton}
              onPress={handleBackPress}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="arrow-back" size={24} color={contentColor} />
            </TouchableOpacity>
          )}
          {showMenu && (
            <TouchableOpacity
              style={styles.iconButton}
              onPress={handleMenuPress}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="menu" size={24} color={contentColor} />
            </TouchableOpacity>
          )}
        </View>

        <Text 
          style={[
            styles.title, 
            variantStyles.title,
            { color: contentColor },
            titleStyle
          ]} 
          numberOfLines={1}
        >
          {title}
        </Text>

        <View style={styles.rightContainer}>
          {rightComponent || <View style={styles.placeholder} />}
        </View>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.md,
    width: "100%",
  },
  leftContainer: {
    flexDirection: "row",
    alignItems: "center",
    minWidth: 48,
  },
  rightContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    minWidth: 48,
  },
  iconButton: {
    width: 48,
    height: 48,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: -12, // Align with edge
  },
  title: {
    flex: 1,
    letterSpacing: 0,
  },
  placeholder: {
    width: 48,
  },
});

export default Header;
