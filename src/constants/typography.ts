// src/constants/typography.ts
// Material Design 3 Type Scale with Roboto font
// https://m3.material.io/styles/typography/type-scale-tokens

// Font families
export const fontFamily = {
  light: "Roboto_300Light",
  regular: "Roboto_400Regular",
  medium: "Roboto_500Medium",
  bold: "Roboto_700Bold",
};

export const typography = {
  // Display - Large promotional headlines
  displayLarge: {
    fontFamily: fontFamily.regular,
    fontSize: 57,
    fontWeight: "400" as const,
    lineHeight: 64,
    letterSpacing: -0.25,
  },
  displayMedium: {
    fontFamily: fontFamily.regular,
    fontSize: 45,
    fontWeight: "400" as const,
    lineHeight: 52,
    letterSpacing: 0,
  },
  displaySmall: {
    fontFamily: fontFamily.regular,
    fontSize: 36,
    fontWeight: "400" as const,
    lineHeight: 44,
    letterSpacing: 0,
  },

  // Headline - Section headers
  headlineLarge: {
    fontFamily: fontFamily.regular,
    fontSize: 32,
    fontWeight: "400" as const,
    lineHeight: 40,
    letterSpacing: 0,
  },
  headlineMedium: {
    fontFamily: fontFamily.regular,
    fontSize: 28,
    fontWeight: "400" as const,
    lineHeight: 36,
    letterSpacing: 0,
  },
  headlineSmall: {
    fontFamily: fontFamily.regular,
    fontSize: 24,
    fontWeight: "400" as const,
    lineHeight: 32,
    letterSpacing: 0,
  },

  // Title - Subsections and card titles
  titleLarge: {
    fontFamily: fontFamily.medium,
    fontSize: 22,
    fontWeight: "500" as const,
    lineHeight: 28,
    letterSpacing: 0,
  },
  titleMedium: {
    fontFamily: fontFamily.medium,
    fontSize: 16,
    fontWeight: "500" as const,
    lineHeight: 24,
    letterSpacing: 0.15,
  },
  titleSmall: {
    fontFamily: fontFamily.medium,
    fontSize: 14,
    fontWeight: "500" as const,
    lineHeight: 20,
    letterSpacing: 0.1,
  },

  // Body - Main content text
  bodyLarge: {
    fontFamily: fontFamily.regular,
    fontSize: 16,
    fontWeight: "400" as const,
    lineHeight: 24,
    letterSpacing: 0.5,
  },
  bodyMedium: {
    fontFamily: fontFamily.regular,
    fontSize: 14,
    fontWeight: "400" as const,
    lineHeight: 20,
    letterSpacing: 0.25,
  },
  bodySmall: {
    fontFamily: fontFamily.regular,
    fontSize: 12,
    fontWeight: "400" as const,
    lineHeight: 16,
    letterSpacing: 0.4,
  },

  // Label - Buttons, tabs, chips
  labelLarge: {
    fontFamily: fontFamily.medium,
    fontSize: 14,
    fontWeight: "500" as const,
    lineHeight: 20,
    letterSpacing: 0.1,
  },
  labelMedium: {
    fontFamily: fontFamily.medium,
    fontSize: 12,
    fontWeight: "500" as const,
    lineHeight: 16,
    letterSpacing: 0.5,
  },
  labelSmall: {
    fontFamily: fontFamily.medium,
    fontSize: 11,
    fontWeight: "500" as const,
    lineHeight: 16,
    letterSpacing: 0.5,
  },
};

export type TypographyVariant = keyof typeof typography;

export default typography;
