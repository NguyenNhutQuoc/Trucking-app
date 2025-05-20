// src/hooks/useAppTheme.ts
import { useContext } from "react";
import { ThemeContext } from "@/contexts/ThemeContext";

/**
 * Custom hook to use the theme context
 * @returns ThemeContext including theme type, colors, and theme control functions
 */
export const useAppTheme = () => {
  const context = useContext(ThemeContext);

  if (context === undefined) {
    throw new Error("useAppTheme must be used within a ThemeProvider");
  }

  return context;
};
