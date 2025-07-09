// =====================================================
// src/constants/colors.ts - FIXED Dark Mode Colors
// =====================================================

const colors = {
  primary: "#5C7CFA",
  primaryDark: "#4263EB",
  primaryLight: "#748FFC",
  secondary: "#63E6BE",
  secondaryDark: "#20C997",
  secondaryLight: "#96F2D7",

  success: "#40C057",
  warning: "#FAB005",
  error: "#FA5252",
  info: "#15AABF",

  background: "#F8F9FA",
  card: "#FFFFFF",
  text: "#212529",
  textSecondary: "#868E96",
  textDisabled: "#CED4DA",
  border: "#E9ECEF",

  white: "#FFFFFF",

  // Status colors
  completed: "#40C057",
  pending: "#FAB005",
  cancelled: "#FA5252",

  // Chart colors
  chartBlue: "#5C7CFA",
  chartGreen: "#40C057",
  chartYellow: "#FAB005",
  chartOrange: "#FD7E14",
  chartRed: "#FA5252",
  chartPurple: "#7950F2",
  chartCyan: "#15AABF",
  chartPink: "#E64980",
  chartTeal: "#12B886",
  chartIndigo: "#4263EB",

  // Gray scale
  gray50: "#F8F9FA",
  gray100: "#F1F3F5",
  gray200: "#E9ECEF",
  gray300: "#DEE2E6",
  gray400: "#CED4DA",
  gray500: "#ADB5BD",
  gray600: "#868E96",
  gray700: "#495057",
  gray800: "#343A40",
  gray900: "#212529",

  // ✅ FIXED: Surface colors for light mode
  surface: "#FFFFFF",
  surfaceVariant: "#F8F9FA",
  surfaceDark: "#F1F3F5",
  surfaceLight: "#E9ECEF",
  surfaceBorder: "#E9ECEF",
  surfaceText: "#212529",
  surfaceTextSecondary: "#868E96",
  surfaceTextDisabled: "#CED4DA",
  surfaceBorderLight: "#F1F3F5",
  surfaceBorderDark: "#343A40",
  surfaceBorderVariant: "#DEE2E6",
  surfaceBackground: "#F8F9FA",
  surfaceBackgroundDark: "#F1F3F5",
  surfaceBackgroundLight: "#E9ECEF",
  surfaceBackgroundVariant: "#DEE2E6",
  surfaceBackgroundText: "#212529",
};

export default colors;

// ✅ FIXED: Complete dark theme colors
export const darkColors = {
  ...colors,
  primary: "#5C7CFA",
  primaryDark: "#4263EB",
  primaryLight: "#748FFC",

  // ✅ FIXED: Core dark theme colors
  background: "#121212", // Dark background
  card: "#1E1E1E", // Darker card background
  text: "#E9ECEF", // Light text for contrast
  textSecondary: "#ADB5BD",
  textDisabled: "#495057",
  border: "#343A40",

  // ✅ FIXED: Surface colors for dark mode
  surface: "#1E1E1E", // Dark surface
  surfaceVariant: "#2D2D2D",
  surfaceDark: "#121212",
  surfaceLight: "#343A40",
  surfaceBorder: "#343A40",
  surfaceText: "#E9ECEF",
  surfaceTextSecondary: "#ADB5BD",
  surfaceTextDisabled: "#495057",
  surfaceBorderLight: "#495057",
  surfaceBorderDark: "#121212",
  surfaceBorderVariant: "#343A40",
  surfaceBackground: "#121212",
  surfaceBackgroundDark: "#0D1117",
  surfaceBackgroundLight: "#1E1E1E",
  surfaceBackgroundVariant: "#2D2D2D",
  surfaceBackgroundText: "#E9ECEF",

  // ✅ FIXED: Gray scale - properly inverted for dark mode
  gray50: "#343A40",
  gray100: "#495057",
  gray200: "#6C757D",
  gray300: "#868E96",
  gray400: "#ADB5BD",
  gray500: "#CED4DA",
  gray600: "#DEE2E6",
  gray700: "#E9ECEF",
  gray800: "#F1F3F5",
  gray900: "#F8F9FA",
};