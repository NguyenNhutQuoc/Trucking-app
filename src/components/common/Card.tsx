// src/components/common/Card.tsx
// Material Design 3 Card Component
import React, { ReactNode } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ViewStyle,
  TextStyle,
  StyleProp,
  Platform,
} from "react-native";
import { useAppTheme } from "@/hooks/useAppTheme";
import spacing from "@/styles/spacing";

// M3-inspired border radius for cards
/** M3-inspired card border radius in density-independent pixels (dp). */
const CARD_BORDER_RADIUS = 16;

// M3 Card variants
type CardVariant = "elevated" | "filled" | "outlined";

interface CardProps {
  title?: string;
  subtitle?: string;
  children: ReactNode;
  onPress?: () => void;
  variant?: CardVariant;
  style?: StyleProp<ViewStyle>;
  titleStyle?: StyleProp<TextStyle>;
  subtitleStyle?: StyleProp<TextStyle>;
  contentStyle?: StyleProp<ViewStyle>;
  // Legacy props
  bordered?: boolean;
  elevated?: boolean;
  header?: ReactNode;
  footer?: ReactNode;
  status?: "default" | "success" | "warning" | "error" | "pending";
  rightContent?: ReactNode;
}

const Card: React.FC<CardProps> = ({
  title,
  subtitle,
  children,
  onPress,
  variant = "elevated",
  style,
  titleStyle,
  subtitleStyle,
  contentStyle,
  bordered = false,
  elevated: legacyElevated,
  header,
  footer,
  status = "default",
  rightContent,
}) => {
  const { colors } = useAppTheme();

  // Status color for left bar
  const getStatusColor = (): string => {
    switch (status) {
      case "success":
        return colors.success;
      case "warning":
        return colors.warning;
      case "error":
        return colors.error;
      case "pending":
        return colors.warning;
      default:
        return "transparent";
    }
  };

  // M3 variant styles
  const getVariantStyles = (): ViewStyle => {
    // Legacy support: if legacyElevated is explicitly passed, use old behavior
    if (legacyElevated !== undefined) {
      return legacyElevated ? styles.elevated : {};
    }

    switch (variant) {
      case "filled":
        return {
          backgroundColor: colors.surfaceContainerHighest || colors.gray100,
          borderWidth: 0,
          borderRadius: CARD_BORDER_RADIUS,
        };
      case "outlined":
        return {
          backgroundColor: colors.surface || colors.card,
          borderWidth: 1,
          borderColor: colors.outlineVariant || colors.gray300,
          elevation: 0,
          shadowOpacity: 0,
        };
      case "elevated":
      default:
        return {
          backgroundColor: colors.surfaceContainerLow || colors.card,
          borderRadius: CARD_BORDER_RADIUS,
          ...styles.elevated,
        };
    }
  };

  const variantStyles = getVariantStyles();
  const borderRadius =
    (variantStyles as ViewStyle).borderRadius ?? spacing.radiusMd;

  // Flatten external style to decompose & redistribute properties safely.
  const flatStyle = StyleSheet.flatten(style ?? {}) as ViewStyle;

  // The user-intended or variant background (may be semi-transparent).
  const intentedBg: string =
    (flatStyle?.backgroundColor as string) ||
    ((variantStyles as ViewStyle).backgroundColor as string) ||
    colors.card;

  // On Android, elevation draws a native shadow BEHIND the view.
  // If the view's background is semi-transparent, the shadow bleeds through
  // and appears as a dark/black border. Fix: outer view (which carries
  // elevation) always uses an OPAQUE background on Android.
  const outerBg = Platform.OS === "android" ? colors.card : intentedBg;

  // Strip overflow and backgroundColor from the user style so they don't
  // leak onto the outer view. overflow:hidden on an elevated Android view
  // also causes the black border artifact.
  const {
    overflow: _overflow,
    backgroundColor: _bg,
    ...cleanedStyle
  } = flatStyle || {};

  const outerStyle: StyleProp<ViewStyle>[] = [
    styles.cardOuter,
    { borderRadius, backgroundColor: outerBg },
    variantStyles,
    cleanedStyle as ViewStyle,
  ];

  const innerStyle: StyleProp<ViewStyle>[] = [
    styles.cardInner,
    { borderRadius, backgroundColor: intentedBg },
    bordered && styles.bordered,
    bordered && { borderColor: colors.outlineVariant || colors.gray200 },
  ];

  const renderContent = () => (
    <View style={outerStyle}>
      {/* Inner view clips content to borderRadius without conflicting with elevation on Android */}
      <View style={innerStyle}>
        {status !== "default" && (
          <View
            style={[styles.statusBar, { backgroundColor: getStatusColor() }]}
          />
        )}

        {(header || title || subtitle) && (
          <View
            style={[
              styles.headerContainer,
              { borderBottomColor: colors.outlineVariant || colors.gray200 },
            ]}
          >
            {header || (
              <View style={styles.titleContainer}>
                <View style={styles.titleWrapper}>
                  {title && (
                    <Text
                      style={[
                        styles.title,
                        { color: colors.onSurface || colors.text },
                        titleStyle,
                      ]}
                    >
                      {title}
                    </Text>
                  )}
                  {subtitle && (
                    <Text
                      style={[
                        styles.subtitle,
                        {
                          color:
                            colors.onSurfaceVariant || colors.textSecondary,
                        },
                        subtitleStyle,
                      ]}
                    >
                      {subtitle}
                    </Text>
                  )}
                </View>
                {rightContent && (
                  <View style={styles.rightContent}>{rightContent}</View>
                )}
              </View>
            )}
          </View>
        )}

        <View style={[styles.content, contentStyle]}>{children}</View>

        {footer && (
          <View
            style={[
              styles.footerContainer,
              { borderTopColor: colors.outlineVariant || colors.gray200 },
            ]}
          >
            {footer}
          </View>
        )}
      </View>
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity activeOpacity={0.85} onPress={onPress}>
        {renderContent()}
      </TouchableOpacity>
    );
  }

  return renderContent();
};

const styles = StyleSheet.create({
  // Outer container: handles elevation/shadow — NO overflow:hidden to avoid Android black border
  cardOuter: {
    borderRadius: spacing.radiusMd,
    marginBottom: spacing.md,
  },
  // Inner container: handles borderRadius clipping — safe to use overflow:hidden here
  // because there is no elevation on this view
  cardInner: {
    overflow: "hidden",
    borderRadius: spacing.radiusMd,
  },
  bordered: {
    borderWidth: 1,
  },
  elevated: {
    elevation: 3,
    shadowColor: "#4A4A8A",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  statusBar: {
    position: "absolute",
    top: 0,
    left: 0,
    width: 5,
    height: "100%",
    borderTopRightRadius: 2.5,
    borderBottomRightRadius: 2.5,
  },
  headerContainer: {
    paddingVertical: 12,
    paddingHorizontal: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  titleContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  titleWrapper: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: "500", // M3: Medium weight
    letterSpacing: 0.15,
  },
  subtitle: {
    fontSize: 14,
    marginTop: 2,
    letterSpacing: 0.25,
  },
  rightContent: {
    marginLeft: spacing.md,
  },
  content: {
    padding: spacing.md,
  },
  footerContainer: {
    padding: 12,
    borderTopWidth: 1,
  },
});

export default Card;
