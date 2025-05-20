// src/contexts/ThemeContext.tsx
import React, { createContext, useState, useEffect, ReactNode } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useColorScheme } from "react-native";
import colors, { darkColors } from "@/constants/colors";

export type ThemeType = "light" | "dark";

export interface ThemeContextType {
  theme: ThemeType;
  isDarkMode: boolean;
  colors: typeof colors;
  toggleTheme: () => void;
  setTheme: (theme: ThemeType) => void;
}

export const ThemeContext = createContext<ThemeContextType>({
  theme: "light",
  isDarkMode: false,
  colors,
  toggleTheme: () => {},
  setTheme: () => {},
});

interface ThemeProviderProps {
  children: ReactNode;
}

const THEME_STORAGE_KEY = "@theme_preference";

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const systemColorScheme = useColorScheme();
  const [theme, setThemeState] = useState<ThemeType>("light");

  // Load saved theme preference from AsyncStorage on app start
  useEffect(() => {
    const loadTheme = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
        if (savedTheme) {
          setThemeState(savedTheme as ThemeType);
        } else if (systemColorScheme) {
          // If no saved preference, use system preference
          setThemeState(systemColorScheme as ThemeType);
        }
      } catch (error) {
        console.error("Error loading theme preference:", error);
      }
    };

    loadTheme();
  }, [systemColorScheme]);

  const setTheme = async (newTheme: ThemeType) => {
    try {
      setThemeState(newTheme);
      await AsyncStorage.setItem(THEME_STORAGE_KEY, newTheme);
    } catch (error) {
      console.error("Error saving theme preference:", error);
    }
  };

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
  };

  const isDarkMode = theme === "dark";
  const themeColors = isDarkMode ? darkColors : colors;

  const value = {
    theme,
    isDarkMode,
    colors: themeColors,
    toggleTheme,
    setTheme,
  };

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
};

// Custom hook to use the theme context
export const useTheme = () => {
  const context = React.useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};
