// src/contexts/AuthContext.tsx
import React, { createContext, useState, useEffect, ReactNode } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { authApi } from "@/api/auth";
import { LoginRequest } from "@/types/api.types";
import TokenExpiredModal from "@/components/common/TokenExpireModal";

interface AuthContextType {
  isLoading: boolean;
  isAuthenticated: boolean;
  userInfo: UserInfo | null;
  login: (credentials: LoginRequest) => Promise<boolean>;
  logout: () => Promise<void>;
  checkAuthentication: () => Promise<boolean>;
  showTokenExpiredModal: boolean;
  handleTokenExpired: () => void;
  hideTokenExpiredModal: () => void;
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
  showTokenExpiredModal: false,
  handleTokenExpired: () => {},
  hideTokenExpiredModal: () => {},
});

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [showTokenExpiredModal, setShowTokenExpiredModal] =
    useState<boolean>(false);

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
            // Nếu token không hợp lệ, hiển thị modal và đăng xuất
            await authApi.logout();
            setIsAuthenticated(false);
            setShowTokenExpiredModal(true);
          }
        } else {
          // Nếu không có token, đăng xuất
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error("Bootstrap error:", error);
        setIsAuthenticated(false);
        // Nếu có lỗi khi kiểm tra token, có thể là do token hết hạn
        setShowTokenExpiredModal(true);
      } finally {
        setIsLoading(false);
      }
    };

    bootstrapAsync();
  }, []);

  // Hàm xử lý khi token hết hạn
  const handleTokenExpired = () => {
    setShowTokenExpiredModal(true);
    setIsAuthenticated(false);
    setUserInfo(null);
    // Xóa token và thông tin user
    authApi.logout();
  };

  // Hàm ẩn modal token hết hạn
  const hideTokenExpiredModal = () => {
    setShowTokenExpiredModal(false);
  };

  // Đăng nhập
  const login = async (credentials: LoginRequest): Promise<boolean> => {
    try {
      setIsLoading(true);
      const response = await authApi.login(credentials);
      console.log("Login response:", response);
      if (response.success) {
        setUserInfo(response.data.user);
        setIsAuthenticated(true);
        setShowTokenExpiredModal(false); // Ẩn modal nếu đăng nhập thành công
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
      setShowTokenExpiredModal(false);
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
      setShowTokenExpiredModal(true);
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
    showTokenExpiredModal,
    handleTokenExpired,
    hideTokenExpiredModal,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
      <TokenExpiredModal
        visible={showTokenExpiredModal}
        onRetryLogin={hideTokenExpiredModal}
        onClose={hideTokenExpiredModal}
      />
    </AuthContext.Provider>
  );
};
