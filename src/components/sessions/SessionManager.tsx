// src/components/session/SessionManager.tsx
import React, { useEffect } from "react";
import { Modal, View, Text, StyleSheet, Alert } from "react-native";
import { useAuth } from "@/hooks/useAuth";
import { useAppTheme } from "@/hooks/useAppTheme";
import { setSessionExpiredHandler } from "@/api/api";
import Button from "@/components/common/Button";

const SessionManager: React.FC = () => {
  const {
    showTokenExpiredModal,
    hideTokenExpiredModal,
    handleTokenExpired,
    logout,
  } = useAuth();
  const { colors } = useAppTheme();

  // ✅ THAY ĐỔI: Set global session expired handler
  useEffect(() => {
    setSessionExpiredHandler(handleTokenExpired);

    // Cleanup function
    return () => {
      setSessionExpiredHandler(() => {});
    };
  }, [handleTokenExpired]);

  const handleSessionExpiredConfirm = async () => {
    hideTokenExpiredModal();
    await logout();
  };

  return (
    <Modal
      visible={showTokenExpiredModal}
      transparent={true}
      animationType="fade"
      onRequestClose={() => {}}
    >
      <View style={styles.modalOverlay}>
        <View
          style={[styles.modalContent, { backgroundColor: colors.surface }]}
        >
          <View style={styles.iconContainer}>
            <Text style={styles.icon}>⏰</Text>
          </View>

          <Text style={[styles.title, { color: colors.text }]}>
            Phiên làm việc hết hạn
          </Text>

          <Text style={[styles.message, { color: colors.textSecondary }]}>
            Phiên làm việc của bạn đã hết hạn. Vui lòng đăng nhập lại để tiếp
            tục sử dụng.
          </Text>

          <Button
            title="Đăng nhập lại"
            onPress={handleSessionExpiredConfirm}
            style={styles.button}
          />
        </View>
      </View>
    </Modal>
  );
};

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
    width: "100%",
    maxWidth: 320,
    alignItems: "center",
  },
  iconContainer: {
    marginBottom: 16,
  },
  icon: {
    fontSize: 48,
  },
  title: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 12,
    textAlign: "center",
  },
  message: {
    fontSize: 16,
    lineHeight: 24,
    textAlign: "center",
    marginBottom: 24,
  },
  button: {
    width: "100%",
  },
});

export default SessionManager;
