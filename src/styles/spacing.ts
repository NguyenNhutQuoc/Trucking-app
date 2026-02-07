// src/styles/spacing.ts
// Material Design 3 Spacing Scale
// Base unit: 4dp

export const spacing = {
  // Base spacing values
  xs: 4,   // Extra small
  sm: 8,   // Small
  md: 16,  // Medium (default)
  lg: 24,  // Large
  xl: 32,  // Extra large
  xxl: 48, // 2x Extra large

  // Semantic spacing
  none: 0,
  hairline: 1,
  
  // Component-specific
  buttonPadding: 16,
  cardPadding: 16,
  inputPadding: 12,
  listItemPadding: 16,
  screenPadding: 16,
  sectionGap: 24,
  
  // Icon sizes
  iconSm: 16,
  iconMd: 24,
  iconLg: 32,
  iconXl: 48,
  
  // Border radius (M3)
  radiusNone: 0,
  radiusXs: 4,
  radiusSm: 8,
  radiusMd: 12,   // M3 default for cards
  radiusLg: 16,
  radiusXl: 28,   // M3 default for FAB
  radiusFull: 9999,
};

export const elevation = {
  level0: 0,
  level1: 1,
  level2: 3,
  level3: 6,
  level4: 8,
  level5: 12,
};

export default spacing;
