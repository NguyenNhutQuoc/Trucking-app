// src/hooks/useTokenExpired.ts
import { useEffect } from "react";
import { setTokenExpiredCallback } from "@/api/api";
import { useAuth } from "./useAuth";

/**
 * Hook để tự động xử lý khi token hết hạn
 */
export const useTokenExpired = () => {
  const { handleTokenExpired } = useAuth();

  useEffect(() => {
    // Đăng ký callback khi token hết hạn
    setTokenExpiredCallback(handleTokenExpired);

    // Cleanup khi component unmount
    return () => {
      setTokenExpiredCallback(() => {});
    };
  }, [handleTokenExpired]);
};
