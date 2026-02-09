// src/hooks/useAuth.ts
import { useContext } from "react";
import {
  TenantLoginRequest,
  LoginRequest,
  TenantInfo,
  Nhanvien,
} from "@/types/api.types";
import {
  AuthContext,
  AuthContextType,
  AuthLevel,
  StationUserInfo,
  TenantSessionData,
} from "@/contexts/AuthContext";

// ✅ Updated hook interface with auth levels
interface UseAuthReturn {
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
  selectStation: (
    sessionToken: string,
    tramCanId: number,
    isActivated?: boolean,
  ) => Promise<boolean>;
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

  // Legacy methods (for backward compatibility)
  login: (credentials: LoginRequest) => Promise<boolean>;
  logout: () => Promise<void>;
  logoutStationUser: () => Promise<void>;
  userInfo: Nhanvien | null;

  // Session management
  validateSession: () => Promise<boolean>;
  handleTokenExpired: () => void;
  showTokenExpiredModal: boolean;
  hideTokenExpiredModal: () => void;

  // Helper methods
  getTenantDisplayName: () => string;
  getStationDisplayName: () => string;
  isSessionValid: () => Promise<boolean>;
}

export const useAuth = (): UseAuthReturn => {
  const context = useContext(AuthContext) as AuthContextType;

  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  // Helper methods
  const getTenantDisplayName = (): string => {
    return context.tenantInfo?.khachHang?.tenKhachHang || "N/A";
  };

  const getStationDisplayName = (): string => {
    return context.tenantInfo?.selectedStation?.tenTramCan || "N/A";
  };

  const isSessionValid = async (): Promise<boolean> => {
    try {
      if (!context.sessionToken) return false;
      return await context.validateSession();
    } catch (error) {
      console.error("Session validation error:", error);
      return false;
    }
  };

  return {
    // Auth level
    authLevel: context.authLevel,

    // Multi-tenant methods
    tenantLogin: context.tenantLogin,
    selectStation: context.selectStation,
    stationUserLogin: context.stationUserLogin,
    switchStation: context.switchStation,
    getMyStations: context.getMyStations,

    // State
    isAuthenticated: context.isAuthenticated,
    isLoading: context.isLoading,
    sessionToken: context.sessionToken,
    tenantInfo: context.tenantInfo,
    tenantSessionData: context.tenantSessionData,
    stationUserInfo: context.stationUserInfo,

    // Legacy methods
    login: context.login,
    logout: context.logout,
    logoutStationUser: context.logoutStationUser,
    userInfo: context.userInfo,

    // Session management
    validateSession: context.validateSession,
    handleTokenExpired: context.handleTokenExpired,
    showTokenExpiredModal: context.showTokenExpiredModal,
    hideTokenExpiredModal: context.hideTokenExpiredModal,

    // Helper methods
    getTenantDisplayName,
    getStationDisplayName,
    isSessionValid,
  };
};
