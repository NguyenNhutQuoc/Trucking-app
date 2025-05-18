// src/api/auth.ts
import api from "./api";
import {
  ApiResponse,
  LoginRequest,
  LoginResponse,
  ChangePasswordRequest,
} from "@/types/api.types";
import AsyncStorage from "@react-native-async-storage/async-storage";

/**
 * Dịch vụ xác thực người dùng
 */
export const authApi = {
  /**
   * Đăng nhập vào hệ thống
   * @param credentials Thông tin đăng nhập (username, password)
   */
  login: async (
    credentials: LoginRequest,
  ): Promise<ApiResponse<LoginResponse["data"]>> => {
    try {
      const response = await api.post<LoginResponse>(
        "/auth/login",
        credentials,
      );

      // Lưu token vào AsyncStorage
      if (response.data.success && response.data.data.token) {
        await AsyncStorage.setItem("auth_token", response.data.data.token);
        // Lưu thông tin user
        await AsyncStorage.setItem(
          "user_info",
          JSON.stringify(response.data.data.user),
        );
      }

      return response.data;
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  },

  /**
   * Đăng xuất khỏi hệ thống
   */
  logout: async (): Promise<void> => {
    try {
      // Xóa token và thông tin user
      await AsyncStorage.removeItem("auth_token");
      await AsyncStorage.removeItem("user_info");

      // Xóa các dữ liệu liên quan khác nếu cần
    } catch (error) {
      console.error("Logout error:", error);
      throw error;
    }
  },

  /**
   * Kiểm tra token hiện tại có hợp lệ không
   */
  validateToken: async (): Promise<boolean> => {
    try {
      const response = await api.post<ApiResponse<{ valid: boolean }>>(
        "/auth/validate-token",
      );
      return response.data.success && response.data.data.valid;
    } catch (error) {
      console.error("Validate token error:", error);
      return false;
    }
  },

  /**
   * Đổi mật khẩu
   * @param passwordData Object chứa mật khẩu hiện tại và mật khẩu mới
   */
  changePassword: async (
    passwordData: ChangePasswordRequest,
  ): Promise<ApiResponse<{ success: boolean }>> => {
    try {
      const response = await api.post<ApiResponse<{ success: boolean }>>(
        "/auth/change-password",
        passwordData,
      );
      return response.data;
    } catch (error) {
      console.error("Change password error:", error);
      throw error;
    }
  },

  /**
   * Lấy danh sách quyền của người dùng hiện tại
   */
  getUserPermissions: async () => {
    try {
      const response = await api.get("/auth/permissions");
      return response.data;
    } catch (error) {
      console.error("Get user permissions error:", error);
      throw error;
    }
  },

  /**
   * Lấy thông tin người dùng đã lưu
   */
  getCurrentUser: async () => {
    try {
      const userInfo = await AsyncStorage.getItem("user_info");
      if (userInfo) {
        return JSON.parse(userInfo);
      }
      return null;
    } catch (error) {
      console.error("Get current user error:", error);
      return null;
    }
  },

  /**
   * Kiểm tra người dùng đã đăng nhập chưa
   */
  isAuthenticated: async (): Promise<boolean> => {
    try {
      const token = await AsyncStorage.getItem("auth_token");
      return !!token;
    } catch (error) {
      console.error("Check authentication error:", error);
      return false;
    }
  },
};
