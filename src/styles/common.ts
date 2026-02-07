// src/styles/common.ts
// Common styles shared across the app

import { StyleSheet } from 'react-native';
import spacing from './spacing';

export const commonStyles = StyleSheet.create({
  // Flex utilities
  flex1: { flex: 1 },
  flexRow: { flexDirection: 'row' },
  flexColumn: { flexDirection: 'column' },
  flexWrap: { flexWrap: 'wrap' },
  
  // Alignment
  alignCenter: { alignItems: 'center' },
  alignStart: { alignItems: 'flex-start' },
  alignEnd: { alignItems: 'flex-end' },
  justifyCenter: { justifyContent: 'center' },
  justifyStart: { justifyContent: 'flex-start' },
  justifyEnd: { justifyContent: 'flex-end' },
  justifyBetween: { justifyContent: 'space-between' },
  justifyAround: { justifyContent: 'space-around' },
  center: { alignItems: 'center', justifyContent: 'center' },
  
  // Spacing - Padding
  pXs: { padding: spacing.xs },
  pSm: { padding: spacing.sm },
  pMd: { padding: spacing.md },
  pLg: { padding: spacing.lg },
  pXl: { padding: spacing.xl },
  
  phSm: { paddingHorizontal: spacing.sm },
  phMd: { paddingHorizontal: spacing.md },
  phLg: { paddingHorizontal: spacing.lg },
  
  pvSm: { paddingVertical: spacing.sm },
  pvMd: { paddingVertical: spacing.md },
  pvLg: { paddingVertical: spacing.lg },
  
  // Spacing - Margin
  mXs: { margin: spacing.xs },
  mSm: { margin: spacing.sm },
  mMd: { margin: spacing.md },
  mLg: { margin: spacing.lg },
  
  mbSm: { marginBottom: spacing.sm },
  mbMd: { marginBottom: spacing.md },
  mbLg: { marginBottom: spacing.lg },
  
  mtSm: { marginTop: spacing.sm },
  mtMd: { marginTop: spacing.md },
  mtLg: { marginTop: spacing.lg },
  
  // Gap
  gap4: { gap: 4 },
  gap8: { gap: 8 },
  gap12: { gap: 12 },
  gap16: { gap: 16 },
  gap24: { gap: 24 },
  
  // Screen container
  screenContainer: {
    flex: 1,
    padding: spacing.screenPadding,
  },
  
  // Card shadow (M3 elevation level 1)
  elevationLevel1: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 2,
  },
  
  // Card shadow (M3 elevation level 2)
  elevationLevel2: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
});

export default commonStyles;
