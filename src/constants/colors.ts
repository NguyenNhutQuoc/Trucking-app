// =====================================================
// src/constants/colors.ts - Material Design 3 Color System
// =====================================================

// M3 Light Theme Colors
const colors = {
  // Primary - Blue (M3)
  primary: "#1976D2",
  primaryDark: "#1565C0",
  primaryLight: "#42A5F5",
  onPrimary: "#FFFFFF",
  primaryContainer: "#BBDEFB",
  onPrimaryContainer: "#0D47A1",

  // Secondary - Teal (M3)
  secondary: "#00796B",
  secondaryDark: "#00695C",
  secondaryLight: "#26A69A",
  onSecondary: "#FFFFFF",
  secondaryContainer: "#B2DFDB",
  onSecondaryContainer: "#004D40",

  // Tertiary - Orange
  tertiary: "#FF6F00",
  onTertiary: "#FFFFFF",
  tertiaryContainer: "#FFE0B2",
  onTertiaryContainer: "#E65100",

  // Status colors (M3)
  success: "#2E7D32",
  warning: "#F57F17",
  error: "#D32F2F",
  info: "#0288D1",
  onError: "#FFFFFF",
  errorContainer: "#FFCDD2",
  onErrorContainer: "#B71C1C",

  // Surface & Background (M3)
  background: "#FEFBFF",
  onBackground: "#1C1B1F",
  surface: "#FEFBFF",
  onSurface: "#1C1B1F",
  surfaceVariant: "#E7E0EC",
  onSurfaceVariant: "#49454F",
  
  // Surface Container levels (M3 Elevation)
  surfaceContainerLowest: "#FFFFFF",
  surfaceContainerLow: "#F7F2FA",
  surfaceContainer: "#F3EDF7",
  surfaceContainerHigh: "#ECE6F0",
  surfaceContainerHighest: "#E6E0E9",

  // Text
  text: "#1C1B1F",
  textSecondary: "#49454F",
  textDisabled: "#9E9E9E",

  // Outline (M3)
  outline: "#79747E",
  outlineVariant: "#CAC4D0",

  // Core
  white: "#FFFFFF",
  black: "#000000",
  card: "#FFFFFF",
  border: "#E0E0E0",

  // Status colors (legacy support)
  completed: "#2E7D32",
  pending: "#F57F17",
  cancelled: "#D32F2F",

  // Chart colors (M3 vibrant)
  chartBlue: "#1976D2",
  chartGreen: "#388E3C",
  chartYellow: "#FBC02D",
  chartOrange: "#F57C00",
  chartRed: "#D32F2F",
  chartPurple: "#7B1FA2",
  chartCyan: "#0097A7",
  chartPink: "#C2185B",
  chartTeal: "#00796B",
  chartIndigo: "#303F9F",

  // Gray scale (M3 Neutral)
  gray50: "#FAFAFA",
  gray100: "#F5F5F5",
  gray200: "#EEEEEE",
  gray300: "#E0E0E0",
  gray400: "#BDBDBD",
  gray500: "#9E9E9E",
  gray600: "#757575",
  gray700: "#616161",
  gray800: "#424242",
  gray900: "#212121",
};

export default colors;

// M3 Dark Theme Colors
export const darkColors = {
  ...colors,
  
  // Primary - Blue (M3 Dark)
  primary: "#90CAF9",
  primaryDark: "#64B5F6",
  primaryLight: "#BBDEFB",
  onPrimary: "#0D47A1",
  primaryContainer: "#1565C0",
  onPrimaryContainer: "#BBDEFB",

  // Secondary - Teal (M3 Dark)
  secondary: "#80CBC4",
  secondaryDark: "#4DB6AC",
  secondaryLight: "#B2DFDB",
  onSecondary: "#004D40",
  secondaryContainer: "#00695C",
  onSecondaryContainer: "#B2DFDB",

  // Status colors (M3 Dark)
  success: "#81C784",
  warning: "#FFD54F",
  error: "#EF9A9A",
  info: "#4FC3F7",
  onError: "#B71C1C",
  errorContainer: "#B71C1C",
  onErrorContainer: "#FFCDD2",

  // Surface & Background (M3 Dark)
  background: "#1C1B1F",
  onBackground: "#E6E1E5",
  surface: "#1C1B1F",
  onSurface: "#E6E1E5",
  surfaceVariant: "#49454F",
  onSurfaceVariant: "#CAC4D0",
  
  // Surface Container levels (M3 Dark Elevation)
  surfaceContainerLowest: "#0F0D13",
  surfaceContainerLow: "#1D1B20",
  surfaceContainer: "#211F26",
  surfaceContainerHigh: "#2B2930",
  surfaceContainerHighest: "#36343B",

  // Text (M3 Dark)
  text: "#E6E1E5",
  textSecondary: "#CAC4D0",
  textDisabled: "#6C6C6C",

  // Outline (M3 Dark)
  outline: "#938F99",
  outlineVariant: "#49454F",

  // Core (M3 Dark)
  card: "#1E1E1E",
  border: "#49454F",

  // Gray scale (M3 Dark - inverted)
  gray50: "#212121",
  gray100: "#424242",
  gray200: "#616161",
  gray300: "#757575",
  gray400: "#9E9E9E",
  gray500: "#BDBDBD",
  gray600: "#E0E0E0",
  gray700: "#EEEEEE",
  gray800: "#F5F5F5",
  gray900: "#FAFAFA",
};