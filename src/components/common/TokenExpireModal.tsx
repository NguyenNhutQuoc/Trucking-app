// src/components/common/TokenExpiredModal.tsx
import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAppTheme } from "@/hooks/useAppTheme";
import Button from "./Button";

interface TokenExpiredModalProps {
  visible: boolean;
  onRetryLogin: () => void;
  onClose?: () => void;
}

const TokenExpiredModal: React.FC<TokenExpiredModalProps> = ({
  visible,
  onRetryLogin,
  onClose,
}) => {
  const { colors } = useAppTheme();
  const { width } = Dimensions.get("window");

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View
          style={[
            styles.modalContainer,
            { backgroundColor: colors.card, maxWidth: width * 0.9 },
          ]}
        >
          {/* Icon */}
          <View
            style={[
              styles.iconContainer,
              { backgroundColor: colors.warning + "20" },
            ]}
          >
            <Ionicons name="time-outline" size={48} color={colors.warning} />
          </View>

          {/* Title */}
          <Text style={[styles.title, { color: colors.text }]}>
            Phiên đăng nhập đã hết hạn
          </Text>

          {/* Message */}
          <Text style={[styles.message, { color: colors.textSecondary }]}>
            Vì lý do bảo mật, phiên đăng nhập của bạn đã hết hạn. Vui lòng đăng
            nhập lại để tiếp tục sử dụng ứng dụng.
          </Text>

          {/* Buttons */}
          <View style={styles.buttonContainer}>
            <Button
              title="Đăng nhập lại"
              onPress={onRetryLogin}
              fullWidth
              icon={<Ionicons name="log-in-outline" size={18} color="white" />}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContainer: {
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
    width: "100%",
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
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
});

export default TokenExpiredModal;
