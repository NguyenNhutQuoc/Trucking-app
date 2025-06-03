// src/hooks/useSlideMenu.ts
import { useState, useCallback } from "react";

interface UseSlideMenuReturn {
  isVisible: boolean;
  openMenu: () => void;
  closeMenu: () => void;
  toggleMenu: () => void;
}

/**
 * Custom hook để quản lý trạng thái của slide menu
 * @returns Object chứa trạng thái và các function control menu
 */
export const useSlideMenu = (): UseSlideMenuReturn => {
  const [isVisible, setIsVisible] = useState(false);

  const openMenu = useCallback(() => {
    setIsVisible(true);
  }, []);

  const closeMenu = useCallback(() => {
    setIsVisible(false);
  }, []);

  const toggleMenu = useCallback(() => {
    setIsVisible((prev) => !prev);
  }, []);

  return {
    isVisible,
    openMenu,
    closeMenu,
    toggleMenu,
  };
};
