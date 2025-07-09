// src/api/api.ts
import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URL, API_TIMEOUT } from "@/constants/config";

// ✅ Declare global interface for React Native
declare global {
  var handleSessionExpired: (() => void) | undefined;
}

// Create axios instance
const api: AxiosInstance = axios.create({
  baseURL: API_URL,
  timeout: API_TIMEOUT,
  headers: {
    "Content-Type": "application/json",
  },
});

// ✅ NEW: Request interceptor để tự động thêm x-session-token
api.interceptors.request.use(
  async (config: import("axios").InternalAxiosRequestConfig) => {
    try {
      // Lấy session token từ AsyncStorage
      const sessionToken = await AsyncStorage.getItem("session_token");

      console.log(sessionToken);
      if (sessionToken && config.headers) {
        // ✅ KEY POINT: Thêm x-session-token vào header
        config.headers["x-session-token"] = sessionToken;
      }

      // Log request for debugging
      console.log(
        `🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`,
      );
      if (sessionToken) {
        console.log(`🔑 Session Token: ${sessionToken.substring(0, 20)}...`);
      }
      if (config.data) {
        console.log("📦 Request Data:", config.data);
      }

      return config;
    } catch (error) {
      console.error("❌ Request interceptor error:", error);
      return config;
    }
  },
  (error) => {
    console.error("❌ Request interceptor error:", error);
    return Promise.reject(error);
  },
);

// ✅ NEW: Response interceptor để handle session expired và tenant info
api.interceptors.response.use(
  (response: AxiosResponse) => {
    // Log successful responses
    console.log(`✅ API Response: ${response.status} ${response.config.url}`);

    // Log tenant info if present
    if (response.data?.data?.tenantInfo) {
      console.log("🏢 Tenant Info:", response.data.data.tenantInfo);
    }

    return response;
  },
  async (error) => {
    console.error(
      "❌ API Error:",
      error.response?.status,
      error.response?.data,
    );

    // ✅ KEY POINT: Handle session expired (401)
    if (error.response?.status === 401) {
      console.log("🔐 Session expired, clearing local storage...");

      try {
        // Clear session data
        await AsyncStorage.removeItem("session_token");
        await AsyncStorage.removeItem("tenant_info");

        // Call global handler if available
        if (typeof global !== "undefined" && global.handleSessionExpired) {
          global.handleSessionExpired();
        }
      } catch (clearError) {
        console.error("❌ Error clearing session data:", clearError);
      }
    }

    // Handle tenant connection errors
    if (error.response?.data?.errorCode === "DB_CONNECTION_FAILED") {
      console.error("🏢 Tenant database connection failed");
    }

    return Promise.reject(error);
  },
);

// ✅ Helper function để set session expired handler
export const setSessionExpiredHandler = (handler: () => void) => {
  if (typeof global !== "undefined") {
    global.handleSessionExpired = handler;
  }
};

// ✅ Helper function để get current session info
export const getCurrentSessionInfo = async () => {
  try {
    const sessionToken = await AsyncStorage.getItem("session_token");
    const tenantInfo = await AsyncStorage.getItem("tenant_info");

    return {
      sessionToken,
      tenantInfo: tenantInfo ? JSON.parse(tenantInfo) : null,
    };
  } catch (error) {
    console.error("❌ Error getting session info:", error);
    return {
      sessionToken: null,
      tenantInfo: null,
    };
  }
};

// ✅ Helper function để clear session
export const clearSession = async () => {
  try {
    await AsyncStorage.removeItem("session_token");
    await AsyncStorage.removeItem("tenant_info");
    console.log("🧹 Session cleared successfully");
  } catch (error) {
    console.error("❌ Error clearing session:", error);
  }
};

// ✅ Helper function để manually set session token (for testing)
export const setSessionToken = async (token: string) => {
  try {
    await AsyncStorage.setItem("session_token", token);
    console.log("🔑 Session token set successfully");
  } catch (error) {
    console.error("❌ Error setting session token:", error);
  }
};

export default api;
