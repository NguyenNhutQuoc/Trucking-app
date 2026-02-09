// src/contexts/AuthContext.tsx
import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { Alert } from "react-native";
import { authApi } from "@/api/auth";
import { stationApi } from "@/api/station";
import {
  TenantLoginRequest,
  AuthState,
  TenantInfo,
  Nhanvien,
  LoginRequest,
  KhachHang,
  TramCan,
} from "@/types/api.types";

// Auth levels:
// "none" - not logged in at all
// "tenant" - logged in with maKhachHang/password, session token exists, but no station selected
// "station" - station selected but station user not yet authenticated
// "full" - fully authenticated (tenant + station + station user)
export type AuthLevel = "none" | "tenant" | "station" | "full";

export interface StationUserInfo {
  nvId: string;
  tenNV: string | null;
  trangthai: number | null;
  type: number | null;
  nhomId: number | null;
}

export interface TenantSessionData {
  sessionToken: string;
  khachHang: KhachHang;
  tramCans: TramCan[];
}

// ✅ Updated context interface
export interface AuthContextType {
  // Auth level
  authLevel: AuthLevel;

  // Multi-tenant methods
  tenantLogin: (credentials: TenantLoginRequest) => Promise<{
    success: boolean;
    data?: {
      sessionToken: string;
      maKhachHang: string;
      tenKhachHang: string;
      tramCans: any[];
    };
  }>;
  selectStation: (sessionToken: string, tramCanId: number) => Promise<boolean>;
  stationUserLogin: (nvId: string, password: string) => Promise<boolean>;
  switchStation: (tramCanId: number) => Promise<boolean>;
  getMyStations: () => Promise<any[]>;

  // State
  isAuthenticated: boolean;
  isLoading: boolean;
  sessionToken: string | null;
  tenantInfo: TenantInfo | null;
  tenantSessionData: TenantSessionData | null;
  stationUserInfo: StationUserInfo | null;

  // Legacy methods
  login: (credentials: LoginRequest) => Promise<boolean>;
  logout: () => Promise<void>;
  logoutStationUser: () => Promise<void>;
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

  const [authLevel, setAuthLevel] = useState<AuthLevel>("none");
  const [tenantSessionData, setTenantSessionData] =
    useState<TenantSessionData | null>(null);
  const [stationUserInfo, setStationUserInfo] =
    useState<StationUserInfo | null>(null);
  const [showTokenExpiredModal, setShowTokenExpiredModal] = useState(false);

  // Bootstrap: check existing session on app start
  useEffect(() => {
    const bootstrapAsync = async () => {
      try {
        setAuthState((prev) => ({ ...prev, isLoading: true }));

        const sessionToken = await authApi.getSessionToken();

        if (!sessionToken) {
          // No session at all
          setAuthLevel("none");
          setAuthState({
            isAuthenticated: false,
            isLoading: false,
            sessionToken: null,
            tenantInfo: null,
            userInfo: null,
          });
          return;
        }

        // Validate the session (could be temp or full)
        const validationResult = await authApi.validateAnySession(sessionToken);

        if (!validationResult.success || !validationResult.data) {
          // Session invalid - clear everything
          await authApi.logout();
          setAuthLevel("none");
          setAuthState({
            isAuthenticated: false,
            isLoading: false,
            sessionToken: null,
            tenantInfo: null,
            userInfo: null,
          });
          return;
        }

        const sessionData = validationResult.data;

        if (sessionData.sessionType === "temp") {
          // Temp session: tenant logged in, no station selected yet
          // User should see StationSelection screen
          setAuthLevel("tenant");
          setTenantSessionData({
            sessionToken: sessionData.sessionToken,
            khachHang: {
              maKhachHang: sessionData.maKhachHang,
              tenKhachHang: sessionData.tenKhachHang,
            },
            tramCans: [], // Will be loaded by StationSelection screen
          });
          setAuthState({
            isAuthenticated: false,
            isLoading: false,
            sessionToken: sessionData.sessionToken,
            tenantInfo: null,
            userInfo: null,
          });
          return;
        }

        if (sessionData.sessionType === "full") {
          // Full session: station selected
          const tenantInfo = await authApi.getTenantInfo();
          const savedStationUser = await authApi.getStationUserInfo();

          if (tenantInfo && savedStationUser) {
            // Full auth: tenant + station + station user
            setAuthLevel("full");
            setStationUserInfo(savedStationUser);
            setAuthState({
              isAuthenticated: true,
              isLoading: false,
              sessionToken: sessionData.sessionToken,
              tenantInfo,
              userInfo: {
                id: tenantInfo.selectedStation?.maTramCan || 0,
                username: tenantInfo.selectedStation?.tenTramCan || "",
                hoTen: savedStationUser.tenNV,
              } as Nhanvien,
            });
          } else if (tenantInfo) {
            // Station selected but no station user login yet
            setAuthLevel("station");
            setAuthState({
              isAuthenticated: false,
              isLoading: false,
              sessionToken: sessionData.sessionToken,
              tenantInfo,
              userInfo: null,
            });
          } else {
            // Something wrong, clear
            await authApi.logout();
            setAuthLevel("none");
            setAuthState({
              isAuthenticated: false,
              isLoading: false,
              sessionToken: null,
              tenantInfo: null,
              userInfo: null,
            });
          }
          return;
        }

        // Unknown session type
        await authApi.logout();
        setAuthLevel("none");
        setAuthState({
          isAuthenticated: false,
          isLoading: false,
          sessionToken: null,
          tenantInfo: null,
          userInfo: null,
        });
      } catch (error) {
        console.error("Bootstrap error:", error);
        setAuthLevel("none");
        setAuthState({
          isAuthenticated: false,
          isLoading: false,
          sessionToken: null,
          tenantInfo: null,
          userInfo: null,
        });
      }
    };

    bootstrapAsync();
  }, []);

  // Step 1: Tenant login
  const tenantLogin = async (credentials: TenantLoginRequest) => {
    try {
      const response = await authApi.tenantLogin(credentials);

      if (response.success) {
        setAuthLevel("tenant");
        setTenantSessionData({
          sessionToken: response.data.sessionToken,
          khachHang: {
            maKhachHang: response.data.maKhachHang,
            tenKhachHang: response.data.tenKhachHang,
          },
          tramCans: response.data.tramCans,
        });
        setAuthState((prev) => ({
          ...prev,
          sessionToken: response.data.sessionToken,
        }));

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

  // Step 2: Station selection
  const selectStation = async (
    sessionToken: string,
    tramCanId: number,
    isActivated: boolean = false,
  ): Promise<boolean> => {
    try {
      const response = await authApi.selectStation({
        sessionToken,
        tramCanId,
        isActivated,
      });

      if (response.success) {
        const newTenantInfo: TenantInfo = {
          selectedStation: response.data.selectedStation,
          khachHang: response.data.khachHang,
          dbConfig: response.data.dbConfig,
        };

        await authApi.saveTenantInfo(newTenantInfo);

        // After station selection, move to "station" level (need station user login)
        setAuthLevel("station");
        setAuthState({
          isAuthenticated: false,
          isLoading: false,
          sessionToken: response.data.sessionToken,
          tenantInfo: newTenantInfo,
          userInfo: null,
        });

        return true;
      }
      return false;
    } catch (error) {
      console.error("Station selection error:", error);
      return false;
    }
  };

  // Step 3: Station user login
  const stationUserLogin = async (
    nvId: string,
    password: string,
  ): Promise<boolean> => {
    try {
      const currentToken = authState.sessionToken;
      if (!currentToken) {
        console.error("No session token for station user login");
        return false;
      }

      const response = await authApi.stationUserLogin(
        currentToken,
        nvId,
        password,
      );

      if (response.success && response.data) {
        const userInfo: StationUserInfo = response.data.stationUser;
        setStationUserInfo(userInfo);
        setAuthLevel("full");
        setAuthState((prev) => ({
          ...prev,
          isAuthenticated: true,
          sessionToken: response.data.sessionToken,
          userInfo: {
            id: 0,
            username: userInfo.nvId,
            hoTen: userInfo.tenNV,
          } as Nhanvien,
        }));

        return true;
      }
      return false;
    } catch (error) {
      console.error("Station user login error:", error);
      return false;
    }
  };

  // Legacy login
  const login = async (credentials: LoginRequest): Promise<boolean> => {
    try {
      const tenantCredentials: TenantLoginRequest = {
        maKhachHang: credentials.username,
        password: credentials.password,
      };

      const loginResult = await tenantLogin(tenantCredentials);

      if (loginResult.success && loginResult.data) {
        if (loginResult.data.tramCans.length === 1) {
          return await selectStation(
            loginResult.data.sessionToken,
            loginResult.data.tramCans[0].id,
          );
        } else {
          return false;
        }
      }
      return false;
    } catch (error) {
      console.error("Login error:", error);
      return false;
    }
  };

  // Full logout (clear everything)
  const logout = async (): Promise<void> => {
    try {
      await authApi.logout();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setAuthLevel("none");
      setTenantSessionData(null);
      setStationUserInfo(null);
      setAuthState({
        isAuthenticated: false,
        isLoading: false,
        sessionToken: null,
        tenantInfo: null,
        userInfo: null,
      });
    }
  };

  // Logout only station user (go back to station user login)
  const logoutStationUser = async (): Promise<void> => {
    try {
      await authApi.logoutStationUser();
    } catch (error) {
      console.error("Station user logout error:", error);
    } finally {
      setStationUserInfo(null);
      // Go back to station level (station user login screen)
      setAuthLevel("station");
      setAuthState((prev) => ({
        ...prev,
        isAuthenticated: false,
        userInfo: null,
      }));
    }
  };

  // Session validation
  const validateSession = async (): Promise<boolean> => {
    try {
      return await authApi.validateToken();
    } catch (error) {
      console.error("Session validation error:", error);
      return false;
    }
  };

  // Handle token expired
  const handleTokenExpired = () => {
    setShowTokenExpiredModal(true);
    setAuthLevel("none");
    setTenantSessionData(null);
    setStationUserInfo(null);
    setAuthState({
      isAuthenticated: false,
      isLoading: false,
      sessionToken: null,
      tenantInfo: null,
      userInfo: null,
    });
    authApi.logout();
  };

  // Station switching
  const switchStation = async (tramCanId: number): Promise<boolean> => {
    try {
      const response = await stationApi.switchStation(tramCanId);

      if (response.success) {
        const newTenantInfo: TenantInfo = {
          selectedStation: response.data.selectedStation,
          khachHang: response.data.khachHang,
        };

        await authApi.saveTenantInfo(newTenantInfo);

        // After switching station, need to re-login as station user
        setStationUserInfo(null);
        setAuthLevel("station");
        setAuthState((prev) => ({
          ...prev,
          isAuthenticated: false,
          sessionToken: response.data.sessionToken,
          tenantInfo: newTenantInfo,
          userInfo: null,
        }));

        return true;
      }
      return false;
    } catch (error) {
      console.error("Station switching error:", error);
      return false;
    }
  };

  // Get station list
  const getMyStations = async () => {
    try {
      const response = await stationApi.getMyStations();
      return response.tramCans || [];
    } catch (error) {
      console.error("Get my stations error:", error);
      return [];
    }
  };

  const contextValue = React.useMemo<AuthContextType>(
    () => ({
      authLevel,
      tenantLogin,
      selectStation,
      stationUserLogin,
      switchStation,
      getMyStations,
      isAuthenticated: authState.isAuthenticated,
      isLoading: authState.isLoading,
      sessionToken: authState.sessionToken,
      tenantInfo: authState.tenantInfo,
      tenantSessionData,
      stationUserInfo,
      login,
      logout,
      logoutStationUser,
      userInfo: authState.userInfo,
      validateSession,
      handleTokenExpired,
      showTokenExpiredModal,
      hideTokenExpiredModal: () => setShowTokenExpiredModal(false),
    }),
    [
      authLevel,
      authState.isAuthenticated,
      authState.isLoading,
      authState.sessionToken,
      authState.tenantInfo,
      authState.userInfo,
      tenantSessionData,
      stationUserInfo,
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
