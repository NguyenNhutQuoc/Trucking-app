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

// ✅ NEW: Updated interfaces for multi-tenant
export interface TenantLoginRequest {
  maKhachHang: string;
  password: string;
}

export interface TenantLoginResponse {
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

export interface StationSelectionRequest {
  sessionToken: string;
  tramCanId: number;
}

export interface StationSelectionResponse {
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

export interface SessionValidationResponse {
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
 * ✅ UPDATED: Dịch vụ xác thực người dùng với multi-tenant support
 */
export const authApi = {
  /**
   * ✅ NEW: Lấy session token từ AsyncStorage
   */
  getSessionToken: async (): Promise<string | null> => {
    try {
      const sessionToken = await AsyncStorage.getItem("session_token");
      console.log(
        "🔑 Retrieved session token:",
        sessionToken ? "exists" : "null",
      );
      return sessionToken;
    } catch (error) {
      console.error("❌ Get session token error:", error);
      return null;
    }
  },

  /**
   * ✅ NEW: Lấy thông tin tenant từ AsyncStorage
   */
  getTenantInfo: async () => {
    try {
      const tenantInfoStr = await AsyncStorage.getItem("tenant_info");
      if (tenantInfoStr) {
        const tenantInfo = JSON.parse(tenantInfoStr);
        console.log(
          "🏢 Retrieved tenant info:",
          tenantInfo?.khachHang?.tenKhachHang,
        );
        return tenantInfo;
      }
      console.log("🏢 No tenant info found");
      return null;
    } catch (error) {
      console.error("❌ Get tenant info error:", error);
      return null;
    }
  },

  /**
   * ✅ NEW: Validate session token hiện tại
   */
  validateToken: async (): Promise<boolean> => {
    try {
      const sessionToken = await AsyncStorage.getItem("session_token");
      if (!sessionToken) {
        console.log("🔍 No session token to validate");
        return false;
      }

      console.log("🔍 Validating session token...");
      const response = await authApi.validateSession(sessionToken);

      if (response.success) {
        console.log("✅ Session token is valid");
        return true;
      } else {
        console.log("❌ Session token is invalid:", response.message);
        return false;
      }
    } catch (error) {
      console.error("❌ Validate token error:", error);
      return false;
    }
  },

  /**
   * Đăng nhập theo tenant (bước 1)
   */
  tenantLogin: async (credentials: TenantLoginRequest): Promise<TenantLoginResponse> => {
    try {
      console.log("🔐 Starting tenant login:", credentials.maKhachHang);

      const response = await api.post<TenantLoginResponse>(
        "/auth/tenant-login",
        credentials,
      );

      if (response.data.success) {
        console.log("✅ Tenant login successful");

        // ✅ CRITICAL FIX: Immediately store temp session token
        console.log("💾 Storing temporary session token...");
        await AsyncStorage.setItem("session_token", response.data.data.sessionToken);

        console.log("🔑 Temp token stored:", response.data.data.sessionToken.substring(0, 20) + "...");
      }

      return response.data;
    } catch (error: any) {
      console.error("❌ Tenant login error:", error);
      throw error;
    }
  },

  /**
   * Chọn trạm cân (bước 2)
   */
  selectStation: async (
    request: StationSelectionRequest,
  ): Promise<StationSelectionResponse> => {
    try {
      console.log("🏭 Selecting station:", request.tramCanId);

      // Temporarily store session token for this request
      await AsyncStorage.setItem("session_token", request.sessionToken);

      const response = await api.post<StationSelectionResponse>(
        "/auth/select-station",
        { tramCanId: request.tramCanId },
      );

      // Save final session token and tenant info
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

      console.log("✅ Station selection successful");
      return response.data;
    } catch (error: any) {
      console.error("❌ Station selection error:", error);
      throw error;
    }
  },

  /**
   * Validate session với server
   */
  validateSession: async (
    sessionToken: string,
  ): Promise<SessionValidationResponse> => {
    try {
      console.log("🔍 Validating session with server...");

      const response = await api.post<SessionValidationResponse>(
        "/auth/validate-session",
        { sessionToken },
      );

      console.log("✅ Session validation response:", response.data.success);
      return response.data;
    } catch (error) {
      console.error("❌ Validate session error:", error);
      return { success: false, message: "Session validation failed" };
    }
  },

  /**
   * Đăng xuất khỏi hệ thống
   */
  logout: async (): Promise<void> => {
    try {
      console.log("🚪 Logging out...");

      const sessionToken = await AsyncStorage.getItem("session_token");

      if (sessionToken) {
        try {
          // Call logout API
          await api.post("/auth/logout", { sessionToken });
          console.log("✅ Server logout successful");
        } catch (error) {
          console.log(
            "⚠️ Server logout failed, continuing with local cleanup...",
          );
        }
      }

      // Clear local storage
      await AsyncStorage.removeItem("session_token");
      await AsyncStorage.removeItem("tenant_info");

      console.log("🧹 Local session cleared");
    } catch (error) {
      console.error("❌ Logout error:", error);
      throw error;
    }
  },

  /**
   * Kiểm tra người dùng đã đăng nhập chưa
   */
  isAuthenticated: async (): Promise<boolean> => {
    try {
      const sessionToken = await AsyncStorage.getItem("session_token");
      const tenantInfo = await AsyncStorage.getItem("tenant_info");

      const hasLocalData = !!(sessionToken && tenantInfo);

      if (!hasLocalData) {
        console.log("🔐 No local authentication data");
        return false;
      }

      // Validate with server
      const isValid = await authApi.validateToken();
      console.log("🔐 Authentication check result:", isValid);

      return isValid;
    } catch (error) {
      console.error("❌ Authentication check error:", error);
      return false;
    }
  },

  /**
   * ✅ NEW: Refresh session token
   */
  refreshSession: async (): Promise<boolean> => {
    try {
      const sessionToken = await AsyncStorage.getItem("session_token");

      if (!sessionToken) {
        console.log("🔄 No session token to refresh");
        return false;
      }

      console.log("🔄 Refreshing session...");

      const response = await api.post("/auth/refresh-session", {
        sessionToken,
      });

      if (response.data.success) {
        console.log("✅ Session refreshed successfully");
        return true;
      }

      console.log("❌ Session refresh failed");
      return false;
    } catch (error) {
      console.error("❌ Refresh session error:", error);
      return false;
    }
  },

  // ============================================================================
  // ✅ LEGACY METHODS - For backward compatibility
  // ============================================================================

  /**
   * @deprecated Sử dụng tenantLogin thay thế
   */
  login: async (
    credentials: LoginRequest,
  ): Promise<ApiResponse<LoginResponse["data"]>> => {
    console.log("⚠️ Using deprecated login method, redirecting to tenantLogin");

    // Convert old login to new tenant login
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
      console.log("🔑 Changing password...");

      const response = await api.post<ApiResponse<{ success: boolean }>>(
        "/auth/change-password",
        passwordData,
      );

      console.log("✅ Password changed successfully");
      return response.data;
    } catch (error) {
      console.error("❌ Change password error:", error);
      throw error;
    }
  },

  /**
   * Lấy danh sách quyền của người dùng hiện tại
   */
  getUserPermissions: async () => {
    try {
      console.log("🔐 Getting user permissions...");

      const response = await api.get("/auth/permissions");

      console.log("✅ User permissions retrieved");
      return response.data;
    } catch (error) {
      console.error("❌ Get user permissions error:", error);
      throw error;
    }
  },

  /**
   * @deprecated Sử dụng getTenantInfo thay thế
   */
  getCurrentUser: async () => {
    console.log(
      "⚠️ Using deprecated getCurrentUser method, redirecting to getTenantInfo",
    );

    try {
      const tenantInfo = await authApi.getTenantInfo();
      if (tenantInfo) {
        return {
          id: tenantInfo.khachHang.id,
          username: tenantInfo.khachHang.maKhachHang,
          name: tenantInfo.khachHang.tenKhachHang,
          // Convert tenant info to user format for compatibility
        };
      }
      return null;
    } catch (error) {
      console.error("❌ Get current user error:", error);
      return null;
    }
  },
};
