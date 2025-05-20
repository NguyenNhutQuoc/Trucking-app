// src/constants/colors.ts
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
};

export default colors;

// Dark theme colors
export const darkColors = {
  ...colors,
  primary: "#5C7CFA",
  primaryDark: "#4263EB",
  primaryLight: "#748FFC",

  background: "#121212", // Dark background
  card: "#1E1E1E", // Darker card background
  text: "#E9ECEF", // Light text for contrast
  textSecondary: "#ADB5BD",
  textDisabled: "#495057",
  border: "#343A40",

  // Gray scale - inverted for dark mode
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
