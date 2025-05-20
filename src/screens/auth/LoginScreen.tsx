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
  const { login } = useAuth();
  const { colors, isDarkMode } = useAppTheme();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({
    username: "",
    password: "",
  });

  const validateInputs = () => {
    let isValid = true;
    const newErrors = {
      username: "",
      password: "",
    };

    // Validate username
    if (!username.trim()) {
      newErrors.username = "Vui lòng nhập tên đăng nhập";
      isValid = false;
    }

    // Validate password
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
      const success = await login({ username, password });

      if (!success) {
        Alert.alert(
          "Đăng nhập thất bại",
          "Tên đăng nhập hoặc mật khẩu không đúng. Vui lòng thử lại.",
        );
      }
    } catch (error) {
      console.error("Login error:", error);
      Alert.alert(
        "Lỗi đăng nhập",
        "Có lỗi xảy ra khi đăng nhập. Vui lòng thử lại sau.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: colors.background }]}
    >
      <StatusBar style={isDarkMode ? "light" : "dark"} />
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 0}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.logoContainer}>
            <Image
              source={require("../../../assets/logo.png")}
              style={styles.logo}
              resizeMode="contain"
            />
            <Text style={[styles.title, { color: colors.primary }]}>
              {APP_NAME}
            </Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              Đăng nhập để tiếp tục
            </Text>
          </View>

          <View style={styles.formContainer}>
            <Input
              label="Tên đăng nhập"
              placeholder="Nhập tên đăng nhập"
              value={username}
              onChangeText={(text) => {
                setUsername(text);
                if (errors.username) {
                  setErrors((prev) => ({ ...prev, username: "" }));
                }
              }}
              error={errors.username}
              autoCapitalize="none"
              leftIcon={
                <Ionicons
                  name="person-outline"
                  size={20}
                  color={colors.gray600}
                />
              }
            />

            <Input
              label="Mật khẩu"
              placeholder="Nhập mật khẩu"
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                if (errors.password) {
                  setErrors((prev) => ({ ...prev, password: "" }));
                }
              }}
              error={errors.password}
              secure
              leftIcon={
                <Ionicons
                  name="lock-closed-outline"
                  size={20}
                  color={colors.gray600}
                />
              }
            />

            <TouchableOpacity style={styles.forgotPasswordContainer}>
              <Text
                style={[styles.forgotPasswordText, { color: colors.primary }]}
              >
                Quên mật khẩu?
              </Text>
            </TouchableOpacity>

            <Button
              title="Đăng nhập"
              onPress={handleLogin}
              loading={loading}
              fullWidth
              contentStyle={styles.loginButton}
            />
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <Text style={[styles.versionText, { color: colors.gray500 }]}>
            Phiên bản: {APP_VERSION}
          </Text>
        </View>

        <Loading loading={loading} overlay message="Đang đăng nhập..." />
      </KeyboardAvoidingView>
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
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 10,
    paddingBottom: 24,
  },
  logoContainer: {
    alignItems: "center",
    marginTop: "10%",
    marginBottom: 30,
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
  },
  formContainer: {
    width: "100%",
  },
  forgotPasswordContainer: {
    alignSelf: "flex-end",
    marginBottom: 24,
  },
  forgotPasswordText: {
    fontSize: 14,
  },
  loginButton: {
    height: 48,
  },
  footer: {
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  versionText: {
    fontSize: 12,
  },
});

export default LoginScreen;
