// src/contexts/AuthContext.tsx
import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { Alert } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { authApi } from "@/api/auth";
import { stationApi } from "@/api/station";
import {
  TenantLoginRequest,
  AuthState,
  TenantInfo,
  Nhanvien,
  LoginRequest,
  KhachHang,
} from "@/types/api.types";

// ✅ THAY ĐỔI: Updated context interface
export interface AuthContextType {
  // New multi-tenant methods
  tenantLogin: (credentials: TenantLoginRequest) => Promise<{
    success: boolean;
    data?: {
      sessionToken: string;
      khachHang: any;
      tramCans: any[];
    };
  }>;
  selectStation: (sessionToken: string, tramCanId: number) => Promise<boolean>;
  switchStation: (tramCanId: number) => Promise<boolean>;
  getMyStations: () => Promise<any[]>;

  // State
  isAuthenticated: boolean;
  isLoading: boolean;
  sessionToken: string | null;
  tenantInfo: TenantInfo | null;

  // Legacy methods (for backward compatibility)
  login: (credentials: LoginRequest) => Promise<boolean>;
  logout: () => Promise<void>;
  userInfo: Nhanvien | null;

  // Session management
  validateSession: () => Promise<boolean>;
  handleTokenExpired: () => void;
  showTokenExpiredModal: boolean;
  hideTokenExpiredModal: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined,
);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    isLoading: true,
    sessionToken: null,
    tenantInfo: null,
    userInfo: null,
  });

  const [showTokenExpiredModal, setShowTokenExpiredModal] = useState(false);

  // ✅ THAY ĐỔI: Updated bootstrap logic
  useEffect(() => {
    const bootstrapAsync = async () => {
      try {
        setAuthState((prev) => ({ ...prev, isLoading: true }));

        // Check for existing session
        const sessionToken = await authApi.getSessionToken();
        const tenantInfo = await authApi.getTenantInfo();

        if (sessionToken && tenantInfo) {
          // Validate existing session
          const isSessionValid = await authApi.validateToken();

          if (isSessionValid) {
            // ✅ FIXED: Access properties directly (.NET flattened format)
            setAuthState({
              isAuthenticated: true,
              isLoading: false,
              sessionToken,
              tenantInfo,
              userInfo: {
                id: tenantInfo.selectedStation?.maTramCan || 0,
                username: tenantInfo.selectedStation?.tenTramCan || "",
              } as Nhanvien,
            });
          } else {
            // Invalid session - clear and show expired modal
            await authApi.logout();
            setAuthState({
              isAuthenticated: false,
              isLoading: false,
              sessionToken: null,
              tenantInfo: null,
              userInfo: null,
            });
            setShowTokenExpiredModal(true);
          }
        } else {
          // No existing session
          setAuthState({
            isAuthenticated: false,
            isLoading: false,
            sessionToken: null,
            tenantInfo: null,
            userInfo: null,
          });
        }
      } catch (error) {
        console.error("Bootstrap error:", error);
        setAuthState({
          isAuthenticated: false,
          isLoading: false,
          sessionToken: null,
          tenantInfo: null,
          userInfo: null,
        });
        setShowTokenExpiredModal(true);
      }
    };

    bootstrapAsync();
  }, []);

  // ✅ NEW: Tenant login (step 1)
  const tenantLogin = async (credentials: TenantLoginRequest) => {
    try {
      const response = await authApi.tenantLogin(credentials);

      if (response.success) {
        return {
          success: true,
          data: response.data,
        };
      } else {
        return { success: false };
      }
    } catch (error) {
      console.error("Tenant login error:", error);
      return { success: false };
    }
  };

  // ✅ NEW: Station selection (step 2)
  const selectStation = async (
    sessionToken: string,
    tramCanId: number,
  ): Promise<boolean> => {
    try {
      const response = await authApi.selectStation({ sessionToken, tramCanId });

      if (response.success) {
        // ✅ FIXED: Access data directly (.NET flattened format)
        const newTenantInfo: TenantInfo = {
          selectedStation: response.data.selectedStation,
          dbConfig: response.data.dbConfig,
        };

        setAuthState({
          isAuthenticated: true,
          isLoading: false,
          sessionToken: response.data.sessionToken,
          tenantInfo: newTenantInfo,
          userInfo: {
            id: response.data.selectedStation?.maTramCan || 0,
            username: response.data.selectedStation?.tenTramCan || "",
          } as Nhanvien,
        });

        return true;
      }
      return false;
    } catch (error) {
      console.error("Station selection error:", error);
      return false;
    }
  };

  // ✅ LEGACY: Backward compatibility login
  const login = async (credentials: LoginRequest): Promise<boolean> => {
    try {
      // Convert old login to new tenant login
      const tenantCredentials: TenantLoginRequest = {
        maKhachHang: credentials.username,
        password: credentials.password,
      };

      const loginResult = await tenantLogin(tenantCredentials);

      if (loginResult.success && loginResult.data) {
        // If only one station, auto-select it
        if (loginResult.data.tramCans.length === 1) {
          return await selectStation(
            loginResult.data.sessionToken,
            loginResult.data.tramCans[0].id,
          );
        } else {
          // Multiple stations - need to navigate to selection screen
          // This will be handled by the LoginScreen component
          return false; // Return false to indicate additional step needed
        }
      }
      return false;
    } catch (error) {
      console.error("Login error:", error);
      return false;
    }
  };

  // ✅ UPDATED: Logout
  const logout = async (): Promise<void> => {
    try {
      await authApi.logout();
      setAuthState({
        isAuthenticated: false,
        isLoading: false,
        sessionToken: null,
        tenantInfo: null,
        userInfo: null,
      });
    } catch (error) {
      console.error("Logout error:", error);
      // Even if API call fails, clear local state
      setAuthState({
        isAuthenticated: false,
        isLoading: false,
        sessionToken: null,
        tenantInfo: null,
        userInfo: null,
      });
    }
  };

  // ✅ NEW: Session validation
  const validateSession = async (): Promise<boolean> => {
    try {
      return await authApi.validateToken();
    } catch (error) {
      console.error("Session validation error:", error);
      return false;
    }
  };

  // ✅ NEW: Handle token expired
  const handleTokenExpired = () => {
    setShowTokenExpiredModal(true);
    setAuthState({
      isAuthenticated: false,
      isLoading: false,
      sessionToken: null,
      tenantInfo: null,
      userInfo: null,
    });
    authApi.logout();
  };

  // ✅ NEW: Station switching
  const switchStation = async (tramCanId: number): Promise<boolean> => {
    try {
      const response = await stationApi.switchStation(tramCanId);

      if (response.success) {
        // ✅ FIXED: Update auth state with flattened structure
        const newTenantInfo = {
          selectedStation: response.data.selectedStation,
          dbConfig: response.data.dbConfig,
        };

        setAuthState((prev) => ({
          ...prev,
          sessionToken: response.data.sessionToken,
          tenantInfo: newTenantInfo,
          userInfo: {
            ...prev.userInfo,
            id: response.data.selectedStation?.maTramCan || 0,
            username: response.data.selectedStation?.tenTramCan || "",
          } as Nhanvien,
        }));

        return true;
      }
      return false;
    } catch (error) {
      console.error("Station switching error:", error);
      return false;
    }
  };

  // ✅ NEW: Get station list
  const getMyStations = async () => {
    try {
      const response = await stationApi.getMyStations();
      return response.success ? response.data.tramCans : [];
    } catch (error) {
      console.error("Get my stations error:", error);
      return [];
    }
  };

  const contextValue = React.useMemo<AuthContextType>(
    () => ({
      // New multi-tenant methods
      tenantLogin,
      selectStation,
      switchStation,
      getMyStations,

      // State
      isAuthenticated: authState.isAuthenticated,
      isLoading: authState.isLoading,
      sessionToken: authState.sessionToken,
      tenantInfo: authState.tenantInfo,

      // Legacy methods
      login,
      logout,
      userInfo: authState.userInfo,

      // Session management
      validateSession,
      handleTokenExpired,
      showTokenExpiredModal,
      hideTokenExpiredModal: () => setShowTokenExpiredModal(false),
    }),
    [
      tenantLogin,
      selectStation,
      switchStation,
      getMyStations,
      authState.isAuthenticated,
      authState.isLoading,
      authState.sessionToken,
      authState.tenantInfo,
      login,
      logout,
      authState.userInfo,
      validateSession,
      handleTokenExpired,
      showTokenExpiredModal,
    ],
  );

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
