// src/screens/auth/StationUserLoginScreen.tsx
import React, { useState, useEffect, useRef } from "react";
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  SafeAreaView,
  Alert,
  Animated,
  Dimensions,
  TextInput,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";

import { useAuth } from "@/hooks/useAuth";
import { useAppTheme } from "@/hooks/useAppTheme";
import Input from "@/components/common/Input";
import Loading from "@/components/common/Loading";
import { APP_NAME, APP_VERSION } from "@/constants/config";

const { width } = Dimensions.get("window");

const StationUserLoginScreen: React.FC = () => {
  const { stationUserLogin, tenantInfo, logout } = useAuth();
  const { colors, isDarkMode } = useAppTheme();

  const [nvId, setNvId] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({
    nvId: "",
    password: "",
  });

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;
  const passwordRef = useRef<TextInput>(null);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const stationName = tenantInfo?.selectedStation?.tenTramCan || "Trạm cân";

  const validateInputs = () => {
    let isValid = true;
    const newErrors = { nvId: "", password: "" };

    if (!nvId.trim()) {
      newErrors.nvId = "Vui lòng nhập tên đăng nhập";
      isValid = false;
    }

    if (!password.trim()) {
      newErrors.password = "Vui lòng nhập mật khẩu";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleLogin = async () => {
    if (!validateInputs()) return;

    try {
      setLoading(true);
      const success = await stationUserLogin(nvId.trim(), password);

      if (!success) {
        Alert.alert(
          "Đăng nhập thất bại",
          "Tên đăng nhập hoặc mật khẩu không đúng.\nVui lòng thử lại.",
        );
      }
      // If success, AuthContext will handle navigation
    } catch (error: any) {
      console.error("Station user login error:", error);
      const message =
        error?.response?.data?.message ||
        "Có lỗi xảy ra khi đăng nhập. Vui lòng thử lại.";
      Alert.alert("Lỗi đăng nhập", message);
    } finally {
      setLoading(false);
    }
  };

  const handleBackToLogin = () => {
    Alert.alert("Đăng xuất", "Bạn có muốn quay về màn hình đăng nhập chính?", [
      { text: "Hủy", style: "cancel" },
      {
        text: "Đăng xuất",
        style: "destructive",
        onPress: () => {
          logout().catch((e) => console.error("Logout error:", e));
        },
      },
    ]);
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
          <Animated.View
            style={[
              styles.content,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }, { scale: scaleAnim }],
              },
            ]}
          >
            {/* Station Info Header */}
            <View style={styles.headerContainer}>
              <View
                style={[
                  styles.stationBadge,
                  { backgroundColor: colors.primaryContainer },
                ]}
              >
                <Ionicons name="business" size={32} color={colors.primary} />
              </View>
              <Text style={[styles.stationName, { color: colors.primary }]}>
                {stationName}
              </Text>
              <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                Đăng nhập tài khoản trạm cân
              </Text>
            </View>

            {/* Login Card */}
            <View
              style={[
                styles.loginCard,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.outlineVariant,
                  shadowColor: isDarkMode ? "#000" : "#1976D2",
                },
              ]}
            >
              <View style={styles.cardHeader}>
                <View
                  style={[
                    styles.cardHeaderIcon,
                    { backgroundColor: colors.primary + "15" },
                  ]}
                >
                  <Ionicons
                    name="person-circle"
                    size={24}
                    color={colors.primary}
                  />
                </View>
                <Text style={[styles.cardTitle, { color: colors.text }]}>
                  Xác thực nhân viên
                </Text>
              </View>

              {/* Username Input */}
              <Input
                label="Tên đăng nhập"
                placeholder="Nhập tên đăng nhập"
                value={nvId}
                onChangeText={(text) => {
                  setNvId(text);
                  clearError("nvId");
                }}
                error={errors.nvId}
                leftIcon={
                  <Ionicons
                    name="person-outline"
                    size={20}
                    color={colors.primary}
                  />
                }
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="next"
                onSubmitEditing={() => passwordRef.current?.focus()}
                containerStyle={styles.inputContainer}
              />

              {/* Password Input */}
              <Input
                label="Mật khẩu"
                placeholder="Nhập mật khẩu"
                value={password}
                onChangeText={(text) => {
                  setPassword(text);
                  clearError("password");
                }}
                error={errors.password}
                secureTextEntry={!showPassword}
                leftIcon={
                  <Ionicons
                    name="lock-closed-outline"
                    size={20}
                    color={colors.primary}
                  />
                }
                rightIcon={
                  <TouchableOpacity
                    onPress={() => setShowPassword(!showPassword)}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    <Ionicons
                      name={showPassword ? "eye-off-outline" : "eye-outline"}
                      size={20}
                      color={colors.textSecondary}
                    />
                  </TouchableOpacity>
                }
                returnKeyType="go"
                onSubmitEditing={handleLogin}
                containerStyle={styles.inputContainer}
              />

              {/* Login Button */}
              <TouchableOpacity
                style={[
                  styles.loginButton,
                  {
                    backgroundColor: loading ? colors.gray300 : colors.primary,
                    opacity:
                      loading || !nvId.trim() || !password.trim() ? 0.7 : 1,
                  },
                ]}
                onPress={handleLogin}
                disabled={loading || !nvId.trim() || !password.trim()}
                activeOpacity={0.8}
              >
                {loading ? (
                  <View style={styles.loginButtonContent}>
                    <Text
                      style={[styles.loginButtonText, { color: colors.white }]}
                    >
                      Đang đăng nhập...
                    </Text>
                  </View>
                ) : (
                  <View style={styles.loginButtonContent}>
                    <Ionicons
                      name="log-in-outline"
                      size={20}
                      color={colors.white}
                    />
                    <Text
                      style={[styles.loginButtonText, { color: colors.white }]}
                    >
                      Đăng nhập
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>

            {/* Back to Login Link */}
            <TouchableOpacity
              style={styles.backContainer}
              onPress={handleBackToLogin}
              disabled={loading}
            >
              <Ionicons
                name="arrow-back-circle-outline"
                size={20}
                color={colors.error}
              />
              <Text style={[styles.backText, { color: colors.error }]}>
                Đăng xuất tài khoản chính
              </Text>
            </TouchableOpacity>
          </Animated.View>
        </ScrollView>

        {/* Footer */}
        <View style={styles.footerContainer}>
          <Text style={[styles.versionText, { color: colors.textSecondary }]}>
            {APP_NAME} • Phiên bản {APP_VERSION}
          </Text>
        </View>
      </KeyboardAvoidingView>

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
    justifyContent: "center",
    padding: 24,
    paddingBottom: 100,
  },
  content: {
    width: "100%",
    maxWidth: 400,
    alignSelf: "center",
  },
  headerContainer: {
    alignItems: "center",
    marginBottom: 32,
  },
  stationBadge: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  stationName: {
    fontSize: 22,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 15,
    textAlign: "center",
    lineHeight: 22,
  },
  loginCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 24,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
  },
  cardHeaderIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  inputContainer: {
    marginBottom: 16,
  },
  loginButton: {
    height: 52,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 8,
    shadowColor: "#1976D2",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  loginButtonContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  loginButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  backContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 24,
    paddingVertical: 12,
    gap: 6,
  },
  backText: {
    fontSize: 14,
    fontWeight: "500",
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

export default StationUserLoginScreen;
