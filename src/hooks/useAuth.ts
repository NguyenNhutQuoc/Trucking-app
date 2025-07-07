// src/hooks/useAuth.ts
import { useContext } from "react";
import {
  TenantLoginRequest,
  LoginRequest,
  TenantInfo,
  Nhanvien,
} from "@/types/api.types";
import { AuthContext, AuthContextType } from "@/contexts/AuthContext";

// ✅ THAY ĐỔI: Updated hook interface
interface UseAuthReturn {
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

  // ✅ NEW: Helper methods
  getTenantDisplayName: () => string;
  getStationDisplayName: () => string;
  isSessionValid: () => Promise<boolean>;
}

export const useAuth = (): UseAuthReturn => {
  const context = useContext(AuthContext) as AuthContextType;

  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  // ✅ NEW: Helper methods
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
    // Multi-tenant methods
    tenantLogin: context.tenantLogin,
    selectStation: context.selectStation,
    switchStation: context.switchStation,
    getMyStations: context.getMyStations,

    // State
    isAuthenticated: context.isAuthenticated,
    isLoading: context.isLoading,
    sessionToken: context.sessionToken,
    tenantInfo: context.tenantInfo,

    // Legacy methods
    login: context.login,
    logout: context.logout,
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
