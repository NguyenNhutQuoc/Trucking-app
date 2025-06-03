// src/hooks/useNavigationHandler.ts - Super Simple Version
import { useCallback, useState } from "react";
import { useNavigation } from "@react-navigation/native";
import { Alert } from "react-native";
import { AVAILABLE_ROUTES } from "@/constants/routes";

interface NavigationOptions {
  showUnavailableModal?: boolean;
  customMessage?: string;
}

export const useNavigationHandler = (options: NavigationOptions = {}) => {
  const navigation = useNavigation();
  const [showModal, setShowModal] = useState(false);
  const [currentFeature, setCurrentFeature] = useState("");
  const [currentMessage, setCurrentMessage] = useState("");

  const {
    showUnavailableModal = true,
    customMessage = "Chức năng này chưa sẵn sàng trong phiên bản hiện tại.",
  } = options;

  const showUnavailableFeature = useCallback(
    (featureName?: string, message?: string) => {
      if (!showUnavailableModal) return;

      const finalMessage = message || customMessage;
      const finalFeatureName = featureName || "Chức năng";

      showModalVersion(finalFeatureName, finalMessage);
    },
    [showUnavailableModal, customMessage],
  );

  const safeNavigate = useCallback(
    (
      routeName: string,
      params?: any,
      showError: boolean = true,
      featureName?: string,
    ) => {
      console.log(`Navigating to: ${routeName}`, params);

      // Check if route exists in our defined routes
      if (
        !Object.prototype.hasOwnProperty.call(AVAILABLE_ROUTES, routeName) ||
        !AVAILABLE_ROUTES[routeName as keyof typeof AVAILABLE_ROUTES]
      ) {
        console.log(`Route ${routeName} is not available`);
        if (showError) {
          showUnavailableFeature(featureName || routeName);
        }
        return;
      }

      try {
        // @ts-ignore - Deliberately ignoring type check for dynamic navigation
        navigation.navigate(routeName, params);
      } catch (error: any) {
        console.log(`Navigation error for route: ${routeName}`, error);
        if (showError) {
          showUnavailableFeature(featureName || routeName);
        }
      }
    },
    [navigation, showUnavailableFeature],
  );

  const navigateWithFallback = useCallback(
    (
      routeName: string,
      params?: any,
      fallbackRoute?: string,
      featureName?: string,
    ) => {
      try {
        // @ts-ignore
        navigation.navigate(routeName, params);
      } catch (error) {
        console.log(`Navigation error for route: ${routeName}`, error);

        if (fallbackRoute) {
          try {
            // @ts-ignore
            navigation.navigate(fallbackRoute);
          } catch (fallbackError) {
            console.log(
              `Fallback navigation also failed: ${fallbackRoute}`,
              fallbackError,
            );
            showUnavailableFeature(featureName || routeName);
          }
        } else {
          showUnavailableFeature(featureName || routeName);
        }
      }
    },
    [navigation, showUnavailableFeature],
  );

  const showModalVersion = useCallback(
    (featureName?: string, message?: string) => {
      setCurrentFeature(featureName || "");
      setCurrentMessage(message || customMessage);
      setShowModal(true);
    },
    [customMessage],
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
    navigation,
    // Modal state for manual control
    showModal,
    currentFeature,
    currentMessage,
  };
};
