// src/api/auth.ts
import api from "./api";
import {
  ApiResponse,
  LoginRequest,
  LoginResponse,
  ChangePasswordRequest,
  Nhanvien,
} from "@/types/api.types";
import AsyncStorage from "@react-native-async-storage/async-storage";

// ✅ THAY ĐỔI: Cập nhật interfaces
interface TenantLoginRequest {
  maKhachHang: string;
  password: string;
}

interface TenantLoginResponse {
  success: boolean;
  message: string;
  data: {
    sessionToken: string;
    khachHang: {
      id: number;
      maKhachHang: string;
      tenKhachHang: string;
    };
    tramCans: Array<{
      id: number;
      maTramCan: string;
      tenTramCan: string;
      diaChi: string;
    }>;
  };
}

interface StationSelectionRequest {
  sessionToken: string;
  tramCanId: number;
}

interface StationSelectionResponse {
  success: boolean;
  message: string;
  data: {
    sessionToken: string;
    selectedStation: {
      id: number;
      tenTramCan: string;
    };
    khachHang: {
      maKhachHang: string;
      tenKhachHang: string;
    };
  };
}

interface SessionValidationResponse {
  success: boolean;
  message: string;
  data?: {
    khachHang: {
      maKhachHang: string;
      tenKhachHang: string;
    };
    tramCan: {
      id: number;
      tenTramCan: string;
    };
  };
}

/**
 * Dịch vụ xác thực người dùng
 */
export const authApi = {
  /**
   * ✅ THAY ĐỔI: Đăng nhập theo tenant (bước 1)
   * @param credentials Thông tin đăng nhập (maKhachHang, password)
   */
  tenantLogin: async (
    credentials: TenantLoginRequest,
  ): Promise<TenantLoginResponse> => {
    try {
      console.log("Attempting tenant login with credentials:", credentials);
      const response = await api.post<TenantLoginResponse>(
        "/auth/tenant-login",
        credentials,
      );

      console.log("Tenant login successful:", response.data);
      return response.data;
    } catch (error: any) {
      console.log("Tenant login error:", error.message);
      console.error("Tenant login error:", error);
      throw error;
    }
  },

  /**
   * ✅ THAY ĐỔI: Chọn trạm cân (bước 2)
   * @param request Object chứa sessionToken và tramCanId
   */
  selectStation: async (
    request: StationSelectionRequest,
  ): Promise<StationSelectionResponse> => {
    try {
      console.log("Attempting station selection:", request);
      const response = await api.post<StationSelectionResponse>(
        "/auth/select-station",
        request,
      );

      // ✅ THAY ĐỔI: Lưu session token và tenant info
      if (response.data.success) {
        await AsyncStorage.setItem(
          "session_token",
          response.data.data.sessionToken,
        );
        await AsyncStorage.setItem(
          "tenant_info",
          JSON.stringify({
            khachHang: response.data.data.khachHang,
            selectedStation: response.data.data.selectedStation,
          }),
        );
      }

      console.log("Station selection successful:", response.data);
      return response.data;
    } catch (error: any) {
      console.log("Station selection error:", error.message);
      console.error("Station selection error:", error);
      throw error;
    }
  },

  /**
   * ✅ THAY ĐỔI: Validate session token
   * @param sessionToken Token cần validate
   */
  validateSession: async (
    sessionToken: string,
  ): Promise<SessionValidationResponse> => {
    try {
      const response = await api.post<SessionValidationResponse>(
        "/auth/validate-session",
        { sessionToken },
      );
      return response.data;
    } catch (error) {
      console.error("Validate session error:", error);
      return { success: false, message: "Session validation failed" };
    }
  },

  /**
   * ✅ THAY ĐỔI: Đăng xuất khỏi hệ thống
   */
  logout: async (): Promise<void> => {
    try {
      const sessionToken = await AsyncStorage.getItem("session_token");

      if (sessionToken) {
        try {
          // Call logout API
          await api.post("/auth/logout", { sessionToken });
        } catch (error) {
          console.log("Logout API failed, continuing with local cleanup...");
        }
      }

      // ✅ THAY ĐỔI: Xóa session token và tenant info
      await AsyncStorage.removeItem("session_token");
      await AsyncStorage.removeItem("tenant_info");
    } catch (error) {
      console.error("Logout error:", error);
      throw error;
    }
  },

  /**
   * ✅ THAY ĐỔI: Kiểm tra session hiện tại có hợp lệ không
   */
  validateToken: async (): Promise<boolean> => {
    try {
      const sessionToken = await AsyncStorage.getItem("session_token");
      if (!sessionToken) return false;

      const response = await authApi.validateSession(sessionToken);
      return response.success;
    } catch (error) {
      console.error("Validate token error:", error);
      return false;
    }
  },

  /**
   * ✅ THAY ĐỔI: Lấy thông tin tenant đã lưu
   */
  getTenantInfo: async () => {
    try {
      const tenantInfo = await AsyncStorage.getItem("tenant_info");
      if (tenantInfo) {
        return JSON.parse(tenantInfo);
      }
      return null;
    } catch (error) {
      console.error("Get tenant info error:", error);
      return null;
    }
  },

  /**
   * ✅ THAY ĐỔI: Kiểm tra người dùng đã đăng nhập chưa
   */
  isAuthenticated: async (): Promise<boolean> => {
    try {
      const sessionToken = await AsyncStorage.getItem("session_token");
      const tenantInfo = await AsyncStorage.getItem("tenant_info");
      return !!(sessionToken && tenantInfo);
    } catch (error) {
      console.error("Check authentication error:", error);
      return false;
    }
  },

  /**
   * ✅ THAY ĐỔI: Lấy session token hiện tại
   */
  getSessionToken: async (): Promise<string | null> => {
    try {
      return await AsyncStorage.getItem("session_token");
    } catch (error) {
      console.error("Get session token error:", error);
      return null;
    }
  },

  // ✅ GIỮ NGUYÊN: Các method cũ cho compatibility
  /**
   * @deprecated Sử dụng tenantLogin thay thế
   */
  login: async (
    credentials: LoginRequest,
  ): Promise<ApiResponse<LoginResponse["data"]>> => {
    // Redirect to tenant login for backward compatibility
    const tenantCredentials: TenantLoginRequest = {
      maKhachHang: credentials.username, // Assume username is maKhachHang
      password: credentials.password,
    };

    const response = await authApi.tenantLogin(tenantCredentials);

    // Convert response format for compatibility
    return {
      success: response.success,
      message: response.message,
      data: {
        token: response.data.sessionToken,
        user: {
          nvId: response.data.khachHang.id?.toString() ?? "",
          tenNV: response.data.khachHang.tenKhachHang ?? "",
          type: 0, // Set appropriate value if available
          nhomId: 0, // Set appropriate value if available
        },
      },
    };
  },

  /**
   * Đổi mật khẩu
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
   * @deprecated Sử dụng getTenantInfo thay thế
   */
  getCurrentUser: async () => {
    try {
      const tenantInfo = await authApi.getTenantInfo();
      if (tenantInfo) {
        return {
          id: tenantInfo.khachHang.id,
          username: tenantInfo.khachHang.maKhachHang,
          // Convert tenant info to user format
        };
      }
      return null;
    } catch (error) {
      console.error("Get current user error:", error);
      return null;
    }
  },
};
