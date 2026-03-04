/**
 * Dark theme — colors + shared tokens.
 */

import { spacing, radius, typography as typoScale, shadows as shadowTokens, animation } from './tokens';
import type { Theme } from './light';

/** Dark theme colors (design tokens + aliases for existing usage) */
const darkColors = {
  // Design token palette
  background: '#0B1220',
  surface: '#0F172A',
  card: '#1F2937',

  // Hero / performance section (deeper navy, high contrast)
  heroBackground: '#1E3A8A',
  heroGradientStart: '#0B1220',
  heroGradientEnd: '#1E3A8A',
  heroText: '#FFFFFF',
  heroTextMuted: 'rgba(255,255,255,0.88)',

  // Stat cards — slightly darker than card for depth
  statCardBackground: '#111827',

  textPrimary: '#FFFFFF',
  textSecondary: '#9CA3AF',
  textMuted: '#6B7280',

  primary: '#60A5FA',
  primaryHover: '#3B82F6',

  success: '#22C55E',
  warning: '#F59E0B',
  error: '#EF4444',

  border: '#374151',
  inputBackground: '#1F2937',

  // Aliases for existing components (map to token names above)
  text: '#FFFFFF',
  primaryMuted: '#1E3A8A',
  textInverse: '#0B1220',

  errorMuted: 'rgba(127,29,29,0.5)',
  successMuted: '#14532D',
  warningMuted: '#78350F',

  accent: '#22C55E',
  accentMuted: '#14532D',

  borderLight: '#1F2937',

  transparent: 'transparent' as const,
  shadowColor: '#000000',
  overlay: 'rgba(0,0,0,0.5)',
  overlayLight: 'rgba(0,0,0,0.2)',

  socialGoogle: '#4285F4',
  socialApple: '#FFFFFF',

  gold: '#EAB308',
  goldMuted: '#FEF9C3',
  silver: '#94A3B8',
  silverMuted: '#374151',
  bronze: '#B45309',
  bronzeMuted: '#78350F',

  authGradient: ['#0B1220', '#111827', '#1F2937'] as readonly [string, string, string],
  authLogoGradient: ['#3B82F6', '#60A5FA'] as readonly [string, string],
  authOverlayText: '#FFFFFF',
  authOverlayTextMuted: 'rgba(248,250,252,0.9)',
};

/** Typography style objects built from token scale */
const typography = {
  display: {
    fontSize: typoScale.displayLarge,
    fontWeight: '800' as const,
    lineHeight: typoScale.displayLarge + 8,
  },
  h1: {
    fontSize: typoScale.displayMedium,
    fontWeight: '800' as const,
    lineHeight: typoScale.displayMedium + 6,
  },
  h2: {
    fontSize: typoScale.headingLarge,
    fontWeight: '700' as const,
    lineHeight: typoScale.headingLarge + 4,
  },
  h3: {
    fontSize: typoScale.headingMedium,
    fontWeight: '700' as const,
    lineHeight: typoScale.headingMedium + 4,
  },
  body: {
    fontSize: typoScale.bodyLarge,
    fontWeight: '400' as const,
    lineHeight: typoScale.bodyLarge + 8,
  },
  bodySmall: {
    fontSize: typoScale.bodyMedium,
    fontWeight: '400' as const,
    lineHeight: typoScale.bodyMedium + 6,
  },
  caption: {
    fontSize: typoScale.bodySmall,
    fontWeight: '500' as const,
    lineHeight: typoScale.bodySmall + 4,
  },
  label: {
    fontSize: typoScale.bodyMedium,
    fontWeight: '600' as const,
    lineHeight: typoScale.bodyMedium + 6,
  },
} as const;

/** Shadow presets (shadowColor from theme colors) */
const shadows = {
  card: { ...shadowTokens.card, shadowColor: darkColors.shadowColor },
  sm: {
    ...shadowTokens.card,
    shadowColor: darkColors.shadowColor,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
    elevation: 2,
  },
  md: { ...shadowTokens.card, shadowColor: darkColors.shadowColor },
  lg: {
    ...shadowTokens.card,
    shadowColor: darkColors.shadowColor,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 5,
  },
};

export const darkTheme: Theme = {
  colors: darkColors,
  spacing,
  typography,
  radius,
  shadows,
  animation,
  isDark: true,
};
