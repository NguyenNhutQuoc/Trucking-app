// src/components/common/UnderDevelopmentModal.tsx
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
import { useAppTheme } from "@/hooks/useAppTheme";

interface UnderDevelopmentModalProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  message?: string;
  featureName?: string;
}

const UnderDevelopmentModal: React.FC<UnderDevelopmentModalProps> = ({
  visible,
  onClose,
  title = "Chức năng đang phát triển",
  message,
  featureName,
}) => {
  const { colors } = useAppTheme();

  const getDefaultMessage = () => {
    if (message) return message;
    if (featureName) {
      return `Chức năng "${featureName}" đang trong quá trình phát triển và sẽ có mặt trong các phiên bản tiếp theo.`;
    }
    return "Chức năng này chưa sẵn sàng trong phiên bản hiện tại.\nVui lòng thử lại trong các phiên bản tiếp theo.";
  };

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
          <View style={styles.iconContainer}>
            <View
              style={[
                styles.iconBackground,
                { backgroundColor: colors.warning + "20" },
              ]}
            >
              <Ionicons
                name="construct-outline"
                size={48}
                color={colors.warning}
              />
            </View>
          </View>

          <Text style={[styles.title, { color: colors.text }]}>{title}</Text>

          <Text style={[styles.message, { color: colors.textSecondary }]}>
            {getDefaultMessage()}
          </Text>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, { backgroundColor: colors.primary }]}
              onPress={onClose}
            >
              <Text style={styles.buttonText}>Đã hiểu</Text>
            </TouchableOpacity>
          </View>

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
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    maxWidth: width * 0.85,
    width: "100%",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  iconContainer: {
    marginBottom: 16,
  },
  iconBackground: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 12,
  },
  message: {
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 24,
  },
  buttonContainer: {
    width: "100%",
  },
  button: {
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 8,
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

export default UnderDevelopmentModal;
