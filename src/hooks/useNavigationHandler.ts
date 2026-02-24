// src/hooks/useNavigationHandler.ts - Expo Router version
import { useCallback, useState } from "react";
import { useRouter } from "expo-router";
import { ROUTE_PATH_MAP } from "@/constants/routes";

interface NavigationOptions {
  showUnavailableModal?: boolean;
  customMessage?: string;
}

export const useNavigationHandler = (options: NavigationOptions = {}) => {
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);
  const [currentFeature, setCurrentFeature] = useState("");
  const [currentMessage, setCurrentMessage] = useState("");

  const {
    showUnavailableModal = true,
    customMessage = "Chức năng này chưa sẵn sàng trong phiên bản hiện tại.",
  } = options;

  const showModalVersion = useCallback(
    (featureName?: string, message?: string) => {
      setCurrentFeature(featureName || "");
      setCurrentMessage(message || customMessage);
      setShowModal(true);
    },
    [customMessage],
  );

  const showUnavailableFeature = useCallback(
    (featureName?: string, message?: string) => {
      if (!showUnavailableModal) return;
      showModalVersion(featureName || "Chức năng", message || customMessage);
    },
    [showUnavailableModal, customMessage, showModalVersion],
  );

  const safeNavigate = useCallback(
    (
      routeName: string,
      params?: any,
      showError: boolean = true,
      featureName?: string,
    ) => {
      console.log(
        `Navigating to: ${routeName}`,
        params ? params : "(no params)",
      );

      const path = ROUTE_PATH_MAP[routeName];

      if (path === false || path === undefined) {
        console.log(`Route ${routeName} is not available`);
        if (showError) {
          showUnavailableFeature(featureName || routeName);
        }
        return;
      }

      try {
        router.push(path as any);
      } catch (error: any) {
        console.log(`Navigation error for route: ${routeName}`, error);
        if (showError) {
          showUnavailableFeature(featureName || routeName);
        }
      }
    },
    [router, showUnavailableFeature],
  );

  const navigateWithFallback = useCallback(
    (
      routeName: string,
      params?: any,
      fallbackRoute?: string,
      featureName?: string,
    ) => {
      const path = ROUTE_PATH_MAP[routeName];

      if (path !== false && path !== undefined) {
        try {
          router.push(path as any);
          return;
        } catch (error) {
          console.log(`Navigation error for route: ${routeName}`, error);
        }
      }

      if (fallbackRoute) {
        const fallbackPath = ROUTE_PATH_MAP[fallbackRoute];
        if (fallbackPath) {
          try {
            router.push(fallbackPath as any);
            return;
          } catch (fallbackError) {
            console.log(
              `Fallback navigation also failed: ${fallbackRoute}`,
              fallbackError,
            );
          }
        }
      }

      showUnavailableFeature(featureName || routeName);
    },
    [router, showUnavailableFeature],
  );

  const closeModal = useCallback(() => {
    setShowModal(false);
  }, []);

  return {
    safeNavigate,
    navigateWithFallback,
    showUnavailableFeature,
    showModalVersion,
    closeModal,
    router,
    // Modal state for manual control
    showModal,
    currentFeature,
    currentMessage,
  };
};

