// src/hooks/useViewMode.ts
// Hook to manage view mode (list, grid, table) with persistence

import { useState, useCallback } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export type ViewMode = "list" | "grid" | "table";

export interface UseViewModeOptions {
  defaultMode?: ViewMode;
  storageKey?: string;
  persistMode?: boolean;
}

export interface UseViewModeReturn {
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  toggleViewMode: () => void;
  getViewModeIcon: () => string;
  isListMode: boolean;
  isGridMode: boolean;
  isTableMode: boolean;
}

export const useViewMode = (
  options: UseViewModeOptions = {}
): UseViewModeReturn => {
  const { 
    defaultMode = "list", 
    storageKey = "@view_mode",
    persistMode = false 
  } = options;

  const [viewMode, setViewModeState] = useState<ViewMode>(defaultMode);

  // Set view mode with optional persistence
  const setViewMode = useCallback(
    async (mode: ViewMode) => {
      setViewModeState(mode);
      if (persistMode) {
        try {
          await AsyncStorage.setItem(storageKey, mode);
        } catch (error) {
          console.error("Error saving view mode:", error);
        }
      }
    },
    [persistMode, storageKey]
  );

  // Toggle between modes: list -> grid -> table -> list
  const toggleViewMode = useCallback(() => {
    const nextMode: ViewMode = 
      viewMode === "list" ? "grid" : 
      viewMode === "grid" ? "table" : "list";
    setViewMode(nextMode);
  }, [viewMode, setViewMode]);

  // Get icon for current view mode
  const getViewModeIcon = useCallback((): string => {
    switch (viewMode) {
      case "list":
        return "list";
      case "grid":
        return "grid";
      case "table":
        return "stats-chart";
      default:
        return "list";
    }
  }, [viewMode]);

  return {
    viewMode,
    setViewMode,
    toggleViewMode,
    getViewModeIcon,
    isListMode: viewMode === "list",
    isGridMode: viewMode === "grid",
    isTableMode: viewMode === "table",
  };
};

export default useViewMode;
