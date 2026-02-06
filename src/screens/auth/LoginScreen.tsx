// src/screens/auth/LoginScreen.tsx
import React, { useState } from "react";
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Image,
  SafeAreaView,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { StatusBar } from "expo-status-bar";

import { useAuth } from "@/hooks/useAuth";
import { useAppTheme } from "@/hooks/useAppTheme";
import Input from "@/components/common/Input";
import Button from "@/components/common/Button";
import Loading from "@/components/common/Loading";
import { APP_NAME, APP_VERSION } from "@/constants/config";

const LoginScreen: React.FC = () => {
  const navigation = useNavigation();
  const { tenantLogin } = useAuth(); // ✅ Sử dụng tenantLogin
  const { colors, isDarkMode } = useAppTheme();

  // ✅ Thay đổi từ username → maKhachHang
  const [maKhachHang, setMaKhachHang] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({
    maKhachHang: "",
    password: "",
  });

  const validateInputs = () => {
    let isValid = true;
    const newErrors = {
      maKhachHang: "",
      password: "",
    };

    // ✅ Validate mã khách hàng
    if (!maKhachHang.trim()) {
      newErrors.maKhachHang = "Vui lòng nhập mã khách hàng";
      isValid = false;
    } else if (maKhachHang.length > 20) {
      newErrors.maKhachHang = "Mã khách hàng không được vượt quá 20 ký tự";
      isValid = false;
    } else if (!/^[A-Za-z0-9]+$/.test(maKhachHang)) {
      newErrors.maKhachHang = "Mã khách hàng chỉ được chứa chữ cái và số";
      isValid = false;
    }

    // Validate password
    if (!password.trim()) {
      newErrors.password = "Vui lòng nhập mật khẩu";
      isValid = false;
    } else if (password.length < 6) {
      newErrors.password = "Mật khẩu phải có ít nhất 6 ký tự";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleLogin = async () => {
    if (!validateInputs()) return;

    try {
      setLoading(true);

      // ✅ Sử dụng tenantLogin API mới
      const result = await tenantLogin({ maKhachHang, password });
      console.log("Login result:", result);
      if (result.success && result.data) {
        // ✅ Navigate đến StationSelection với data
        // ✅ FIXED: Map the flat response to the expected nested structure
        navigation.navigate("StationSelection", {
          sessionToken: result.data.sessionToken,
          khachHang: {
            maKhachHang: result.data.maKhachHang,
            tenKhachHang: result.data.tenKhachHang,
          },
          tramCans: result.data.tramCans,
        });
      } else {
        Alert.alert(
          "Đăng nhập thất bại",
          "Mã khách hàng hoặc mật khẩu không đúng. Vui lòng thử lại.",
        );
      }
    } catch (error) {
      console.error("Login error:", error);
      Alert.alert(
        "Lỗi đăng nhập",
        "Có lỗi xảy ra khi đăng nhập. Vui lòng kiểm tra kết nối mạng và thử lại.",
      );
    } finally {
      setLoading(false);
    }
  };

  const clearError = (field: string) => {
    if (errors[field as keyof typeof errors]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: colors.background }]}
    >
      <StatusBar style={isDarkMode ? "light" : "dark"} />

      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 0}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          bounces={false}
        >
          {/* Header Section */}
          <View style={styles.headerContainer}>
            <Text style={[styles.title, { color: colors.text }]}>
              {APP_NAME}
            </Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              Quản lý cân xe
            </Text>
            <Text style={[styles.subtitle2, { color: colors.textSecondary }]}>
              Đăng nhập vào hệ thống
            </Text>
          </View>

          {/* Form Section */}
          <View style={styles.formContainer}>
            {/* ✅ Input mã khách hàng */}
            <Input
              label="Mã khách hàng"
              placeholder="Nhập mã khách hàng của bạn"
              value={maKhachHang}
              onChangeText={(text) => {
                setMaKhachHang(text.toUpperCase()); // Auto uppercase
                clearError("maKhachHang");
              }}
              error={errors.maKhachHang}
              leftIcon={
                <Ionicons name="business" size={20} color={colors.primary} />
              }
              autoCapitalize="characters"
              autoCorrect={false}
              maxLength={20}
              returnKeyType="next"
              containerStyle={styles.inputContainer}
            />

            {/* Input mật khẩu */}
            <Input
              label="Mật khẩu"
              placeholder="Nhập mật khẩu của bạn"
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                clearError("password");
              }}
              error={errors.password}
              secureTextEntry
              leftIcon={
                <Ionicons name="lock-closed" size={20} color={colors.primary} />
              }
              returnKeyType="go"
              onSubmitEditing={handleLogin}
              containerStyle={styles.inputContainer}
            />

            {/* Forgot Password Link */}
            <TouchableOpacity
              style={styles.forgotPasswordContainer}
              disabled={loading}
            >
              <Text
                style={[styles.forgotPasswordText, { color: colors.primary }]}
              >
                Quên mật khẩu?
              </Text>
            </TouchableOpacity>

            {/* ✅ Login Button - Component version */}
            {/* <Button
              title="Đăng nhập"
              onPress={handleLogin}
              loading={loading}
              disabled={loading || !maKhachHang.trim() || !password.trim()}
              style={styles.loginButton}
              textStyle={styles.loginButtonText}
            /> */}

            {/* ✅ Fallback Button - ACTIVE */}
            <TouchableOpacity
              style={[
                styles.fallbackButton,
                {
                  backgroundColor: loading ? colors.gray300 : colors.primary,
                  opacity: loading ? 0.6 : 1,
                },
              ]}
              onPress={handleLogin}
              disabled={loading || !maKhachHang.trim() || !password.trim()}
              activeOpacity={0.8}
            >
              <Text
                style={[styles.fallbackButtonText, { color: colors.white }]}
              >
                {loading ? "Đang đăng nhập..." : "Đăng nhập"}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Help Section */}
          <View style={styles.helpContainer}>
            <TouchableOpacity style={styles.helpItem}>
              <Ionicons
                name="help-circle-outline"
                size={20}
                color={colors.textSecondary}
              />
              <Text style={[styles.helpText, { color: colors.textSecondary }]}>
                Cần hỗ trợ đăng nhập?
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>

        {/* Footer */}
        <View style={styles.footerContainer}>
          <Text style={[styles.versionText, { color: colors.textSecondary }]}>
            Phiên bản {APP_VERSION}
          </Text>
        </View>
      </KeyboardAvoidingView>

      {/* Loading Overlay */}
      {loading && <Loading loading={true} overlay message="Đang xác thực..." />}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    padding: 24,
    paddingBottom: 200, // ✅ Tăng thêm space cho button
    minHeight: "100%", // ✅ Đảm bảo chiều cao tối thiểu
  },
  headerContainer: {
    alignItems: "center",
    marginTop: 40,
    marginBottom: 50,
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 18,
    textAlign: "center",
    marginBottom: 4,
  },
  subtitle2: {
    fontSize: 16,
    textAlign: "center",
    fontStyle: "italic",
  },
  formContainer: {
    flex: 1,
    width: "100%",
  },
  inputContainer: {
    marginBottom: 20,
  },
  forgotPasswordContainer: {
    alignSelf: "flex-end",
    marginBottom: 30,
    paddingVertical: 8,
  },
  forgotPasswordText: {
    fontSize: 14,
    fontWeight: "500",
  },
  buttonContainer: {
    marginTop: 10,
    marginBottom: 30,
  },
  loginButton: {
    height: 56,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  loginButtonText: {
    fontSize: 18,
    fontWeight: "600",
  },
  // ✅ Fallback button styles - REQUIRED
  fallbackButton: {
    height: 56,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  fallbackButtonText: {
    fontSize: 18,
    fontWeight: "600",
  },
  helpContainer: {
    alignItems: "center",
    marginTop: 20,
  },
  helpItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 12,
  },
  helpText: {
    fontSize: 14,
  },
  footerContainer: {
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  versionText: {
    fontSize: 12,
    textAlign: "center",
  },
});

export default LoginScreen;
