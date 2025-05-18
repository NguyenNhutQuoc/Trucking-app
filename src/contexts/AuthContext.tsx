// src/contexts/AuthContext.tsx
import React, { createContext, useState, useEffect, ReactNode } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { authApi } from "@/api/auth";
import { LoginRequest } from "@/types/api.types";

interface AuthContextType {
  isLoading: boolean;
  isAuthenticated: boolean;
  userInfo: UserInfo | null;
  login: (credentials: LoginRequest) => Promise<boolean>;
  logout: () => Promise<void>;
  checkAuthentication: () => Promise<boolean>;
}

interface UserInfo {
  nvId: string;
  tenNV: string;
  type: number;
  nhomId: number;
}

export const AuthContext = createContext<AuthContextType>({
  isLoading: true,
  isAuthenticated: false,
  userInfo: null,
  login: async () => false,
  logout: async () => {},
  checkAuthentication: async () => false,
});

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);

  // Kiểm tra trạng thái xác thực khi ứng dụng khởi động
  useEffect(() => {
    const bootstrapAsync = async () => {
      try {
        // Kiểm tra xem có token trong AsyncStorage không
        const token = await AsyncStorage.getItem("auth_token");

        if (token) {
          // Nếu có token, kiểm tra tính hợp lệ
          const isTokenValid = await authApi.validateToken();

          if (isTokenValid) {
            // Nếu token hợp lệ, lấy thông tin người dùng
            const user = await authApi.getCurrentUser();
            if (user) {
              setUserInfo(user);
              setIsAuthenticated(true);
            } else {
              // Nếu không có thông tin người dùng, đăng xuất
              await authApi.logout();
              setIsAuthenticated(false);
            }
          } else {
            // Nếu token không hợp lệ, đăng xuất
            await authApi.logout();
            setIsAuthenticated(false);
          }
        } else {
          // Nếu không có token, đăng xuất
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error("Bootstrap error:", error);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    bootstrapAsync();
  }, []);

  // Đăng nhập
  const login = async (credentials: LoginRequest): Promise<boolean> => {
    try {
      setIsLoading(true);
      const response = await authApi.login(credentials);

      if (response.success) {
        setUserInfo(response.data.user);
        setIsAuthenticated(true);
        return true;
      } else {
        return false;
      }
    } catch (error) {
      console.error("Login error:", error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Đăng xuất
  const logout = async (): Promise<void> => {
    try {
      setIsLoading(true);
      await authApi.logout();
      setUserInfo(null);
      setIsAuthenticated(false);
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Kiểm tra trạng thái xác thực
  const checkAuthentication = async (): Promise<boolean> => {
    try {
      setIsLoading(true);
      const isLoggedIn = await authApi.isAuthenticated();
      if (isLoggedIn) {
        const user = await authApi.getCurrentUser();
        if (user) {
          setUserInfo(user);
          setIsAuthenticated(true);
          return true;
        }
      }
      setIsAuthenticated(false);
      return false;
    } catch (error) {
      console.error("Check authentication error:", error);
      setIsAuthenticated(false);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const value = {
    isLoading,
    isAuthenticated,
    userInfo,
    login,
    logout,
    checkAuthentication,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
