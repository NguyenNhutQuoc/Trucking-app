// src/api/api.ts
import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URL, API_TIMEOUT } from "@/constants/config";

// ✅ FIX: Declare global interface for React Native
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

// ✅ THAY ĐỔI: Request interceptor để thêm session token
api.interceptors.request.use(
  async (config: import("axios").InternalAxiosRequestConfig) => {
    try {
      // ✅ THAY ĐỔI: Lấy session token thay vì auth token
      const sessionToken = await AsyncStorage.getItem("session_token");

      if (sessionToken && config.headers) {
        // ✅ THAY ĐỔI: Sử dụng session token
        config.headers["X-Session-Token"] = sessionToken;
        // Hoặc có thể dùng Authorization header tùy theo backend
        // config.headers['Authorization'] = `Bearer ${sessionToken}`;
      }

      // Log request for debugging
      console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
      if (config.data) {
        console.log("Request Data:", config.data);
      }

      return config;
    } catch (error) {
      console.error("Request interceptor error:", error);
      return config;
    }
  },
  (error) => {
    console.error("Request interceptor error:", error);
    return Promise.reject(error);
  },
);

// ✅ THAY ĐỔI: Response interceptor để handle session expired
api.interceptors.response.use(
  (response: AxiosResponse) => {
    // Log successful responses
    console.log(`API Response: ${response.status} ${response.config.url}`);

    // ✅ THAY ĐỔI: Kiểm tra tenant info trong response
    if (response.data?.data?.tenantInfo) {
      console.log("Tenant Info:", response.data.data.tenantInfo);
    }

    return response;
  },
  async (error) => {
    console.error("API Error:", error.response?.status, error.response?.data);

    // ✅ THAY ĐỔI: Handle session expired (401)
    if (error.response?.status === 401) {
      console.log("Session expired, clearing local storage...");

      try {
        // Clear session data
        await AsyncStorage.removeItem("session_token");
        await AsyncStorage.removeItem("tenant_info");

        // ✅ FIX: Safely call global handler
        if (typeof global !== "undefined" && global.handleSessionExpired) {
          global.handleSessionExpired();
        }
      } catch (clearError) {
        console.error("Error clearing session data:", clearError);
      }
    }

    // ✅ THAY ĐỔI: Handle tenant connection errors
    if (error.response?.data?.errorCode === "DB_CONNECTION_FAILED") {
      console.error("Tenant database connection failed");
      // Handle specific tenant connection errors
    }

    return Promise.reject(error);
  },
);

// ✅ FIX: Helper function để set session expired handler
export const setSessionExpiredHandler = (handler: () => void) => {
  if (typeof global !== "undefined") {
    global.handleSessionExpired = handler;
  }
};

// ✅ THAY ĐỔI: Helper function để get current session info
export const getCurrentSessionInfo = async () => {
  try {
    const sessionToken = await AsyncStorage.getItem("session_token");
    const tenantInfo = await AsyncStorage.getItem("tenant_info");

    return {
      sessionToken,
      tenantInfo: tenantInfo ? JSON.parse(tenantInfo) : null,
    };
  } catch (error) {
    console.error("Error getting session info:", error);
    return {
      sessionToken: null,
      tenantInfo: null,
    };
  }
};

// ✅ THAY ĐỔI: Helper function để clear session
export const clearSession = async () => {
  try {
    await AsyncStorage.removeItem("session_token");
    await AsyncStorage.removeItem("tenant_info");
  } catch (error) {
    console.error("Error clearing session:", error);
  }
};

export default api;
