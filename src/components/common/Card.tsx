// src/components/common/Card.tsx
import React, { ReactNode } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ViewStyle,
  TextStyle,
} from "react-native";
import colors from "@/constants/colors";

interface CardProps {
  title?: string;
  subtitle?: string;
  children: ReactNode;
  onPress?: () => void;
  style?: ViewStyle;
  titleStyle?: TextStyle;
  subtitleStyle?: TextStyle;
  contentStyle?: ViewStyle;
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
  style,
  titleStyle,
  subtitleStyle,
  contentStyle,
  bordered = true,
  elevated = true,
  header,
  footer,
  status = "default",
  rightContent,
}) => {
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

  const renderContent = () => (
    <View
      style={[
        styles.card,
        bordered && styles.bordered,
        elevated && styles.elevated,
        style,
      ]}
    >
      {status !== "default" && (
        <View
          style={[styles.statusBar, { backgroundColor: getStatusColor() }]}
        />
      )}

      {(header || title || subtitle) && (
        <View style={styles.headerContainer}>
          {header || (
            <View style={styles.titleContainer}>
              <View style={styles.titleWrapper}>
                {title && (
                  <Text style={[styles.title, titleStyle]}>{title}</Text>
                )}
                {subtitle && (
                  <Text style={[styles.subtitle, subtitleStyle]}>
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

      {footer && <View style={styles.footerContainer}>{footer}</View>}
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity activeOpacity={0.7} onPress={onPress}>
        {renderContent()}
      </TouchableOpacity>
    );
  }

  return renderContent();
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 16,
  },
  bordered: {
    borderWidth: 1,
    borderColor: colors.gray200,
  },
  elevated: {
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  statusBar: {
    position: "absolute",
    top: 0,
    left: 0,
    width: 4,
    height: "100%",
  },
  headerContainer: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray200,
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
    fontWeight: "600",
    color: colors.text,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 2,
  },
  rightContent: {
    marginLeft: 16,
  },
  content: {
    padding: 16,
  },
  footerContainer: {
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: colors.gray200,
  },
});

export default Card;
