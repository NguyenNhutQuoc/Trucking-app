// src/components/common/ResultModal.tsx
// Beautiful M3 Result Modal for Add, Edit, Delete operations
import React from "react";
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useAppTheme } from "@/hooks/useAppTheme";

export type ResultModalType = "success" | "warning" | "error" | "info";

interface ResultModalProps {
  visible: boolean;
  onClose: () => void;
  type?: ResultModalType;
  title?: string;
  message?: string;
  buttonText?: string;
}

// M3 Modal configurations with gradient backgrounds
const MODAL_CONFIG: Record<
  ResultModalType,
  {
    gradient: [string, string];
    iconName: string;
    defaultTitle: string;
    iconBgColor: string;
  }
> = {
  // Thêm mới - xanh lá gradient
  success: {
    gradient: ["#10B981", "#059669"],
    iconName: "checkmark-circle",
    defaultTitle: "Thành công",
    iconBgColor: "#10B98120",
  },
  // Edit - vàng/cam gradient
  warning: {
    gradient: ["#F59E0B", "#D97706"],
    iconName: "create",
    defaultTitle: "Cập nhật thành công",
    iconBgColor: "#F59E0B20",
  },
  // Xóa - đỏ gradient
  error: {
    gradient: ["#EF4444", "#DC2626"],
    iconName: "alert-circle",
    defaultTitle: "Lỗi",
    iconBgColor: "#EF444420",
  },
  // Info - xanh dương gradient
  info: {
    gradient: ["#3B82F6", "#2563EB"],
    iconName: "information-circle",
    defaultTitle: "Thông báo",
    iconBgColor: "#3B82F620",
  },
};

const ResultModal: React.FC<ResultModalProps> = ({
  visible,
  onClose,
  type = "success",
  title,
  message,
  buttonText = "OK",
}) => {
  const { colors } = useAppTheme();
  const config = MODAL_CONFIG[type];

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
          {/* Icon with gradient background */}
          <View style={styles.iconContainer}>
            <LinearGradient
              colors={config.gradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.iconBackground}
            >
              <Ionicons name={config.iconName as any} size={48} color="white" />
            </LinearGradient>
          </View>

          {/* Title */}
          <Text style={[styles.title, { color: colors.text }]}>
            {title || config.defaultTitle}
          </Text>

          {/* Message */}
          {message && (
            <Text style={[styles.message, { color: colors.textSecondary }]}>
              {message}
            </Text>
          )}

          {/* Button with gradient */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.buttonWrapper}
              onPress={onClose}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={config.gradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.button}
              >
                <Text style={styles.buttonText}>{buttonText}</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {/* Close button */}
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Ionicons name="close" size={24} color={colors.gray600} />
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const { width } = Dimensions.get("window");

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    borderRadius: 20,
    padding: 24,
    alignItems: "center",
    maxWidth: width * 0.85,
    width: "100%",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
  iconContainer: {
    marginBottom: 20,
  },
  iconBackground: {
    width: 88,
    height: 88,
    borderRadius: 44,
    justifyContent: "center",
    alignItems: "center",
    // Shadow for icon
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 8,
  },
  message: {
    fontSize: 15,
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 24,
    paddingHorizontal: 8,
  },
  buttonContainer: {
    width: "100%",
  },
  buttonWrapper: {
    width: "100%",
    borderRadius: 12,
    overflow: "hidden",
    // Shadow for button
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  button: {
    paddingHorizontal: 32,
    paddingVertical: 14,
    alignItems: "center",
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  closeButton: {
    position: "absolute",
    top: 16,
    right: 16,
    padding: 4,
  },
});

export default ResultModal;
