// src/components/common/NavigationErrorBoundary.tsx
import React, { Component, ReactNode } from "react";
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import colors from "@/constants/colors";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  showModal: boolean;
  errorMessage: string;
}

class NavigationErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      showModal: false,
      errorMessage: "",
    };
  }

  static getDerivedStateFromError(error: Error): State {
    // Check if it's a navigation error
    const isNavigationError =
      error.message.includes("was not handled by any navigator") ||
      error.message.includes("NAVIGATE") ||
      error.message.includes("Do you have a screen named");

    if (isNavigationError) {
      return {
        hasError: true,
        showModal: true,
        errorMessage: error.message,
      };
    }

    return {
      hasError: false,
      showModal: false,
      errorMessage: "",
    };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.log("Navigation Error Boundary caught an error:", error, errorInfo);
  }

  handleDismiss = () => {
    this.setState({
      hasError: false,
      showModal: false,
      errorMessage: "",
    });
  };

  render() {
    if (this.state.hasError && this.state.showModal) {
      return (
        <>
          {this.props.children}
          <Modal
            animationType="fade"
            transparent={true}
            visible={this.state.showModal}
            onRequestClose={this.handleDismiss}
          >
            <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                <View style={styles.iconContainer}>
                  <Ionicons
                    name="construct-outline"
                    size={48}
                    color={colors.warning}
                  />
                </View>

                <Text style={styles.title}>Chức năng đang phát triển</Text>

                <Text style={styles.message}>
                  Chức năng này chưa sẵn sàng trong phiên bản hiện tại.
                  {"\n"}Vui lòng thử lại trong các phiên bản tiếp theo.
                </Text>

                <TouchableOpacity
                  style={styles.button}
                  onPress={this.handleDismiss}
                >
                  <Text style={styles.buttonText}>Đã hiểu</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
        </>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    maxWidth: 320,
    width: "100%",
  },
  iconContainer: {
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.text,
    textAlign: "center",
    marginBottom: 12,
  },
  message: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 24,
  },
  button: {
    backgroundColor: colors.primary,
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 8,
    minWidth: 120,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },
});

export default NavigationErrorBoundary;
