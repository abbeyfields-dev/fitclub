/**
 * Light theme — colors + shared tokens.
 */

import { spacing, radius, typography as typoScale, shadows as shadowTokens, animation } from './tokens';

/** Light theme colors (design tokens + aliases for existing usage) */
const lightColors = {
  // Design token palette
  background: '#FFFFFF',
  surface: '#F3F4F6',
  card: '#FFFFFF',

  // Hero / performance section (deeper navy, high contrast)
  heroBackground: '#1D4ED8',
  heroGradientStart: '#0F172A',
  heroGradientEnd: '#1E3A8A',
  heroText: '#FFFFFF',
  heroTextMuted: 'rgba(255,255,255,0.88)',

  // Stat cards — slightly darker than card for depth
  statCardBackground: '#F8FAFC',

  textPrimary: '#111827',
  textSecondary: '#6B7280',
  textMuted: '#9CA3AF',

  primary: '#3B82F6',
  primaryHover: '#2563EB',

  success: '#22C55E',
  warning: '#F59E0B',
  error: '#EF4444',

  border: '#E5E7EB',
  inputBackground: '#F3F4F6',

  // Aliases for existing components (map to token names above)
  text: '#111827',
  primaryMuted: '#DBEAFE',
  textInverse: '#FFFFFF',

  errorMuted: '#FEE2E2',
  successMuted: '#DCFCE7',
  warningMuted: '#FEF3C7',

  accent: '#22C55E',
  accentMuted: '#DCFCE7',

  borderLight: '#F3F4F6',

  transparent: 'transparent' as const,
  shadowColor: '#000000',
  overlay: 'rgba(0,0,0,0.5)',
  overlayLight: 'rgba(0,0,0,0.2)',

  socialGoogle: '#4285F4',
  socialApple: '#000000',

  gold: '#EAB308',
  goldMuted: '#FEF9C3',
  silver: '#94A3B8',
  silverMuted: '#F1F5F9',
  bronze: '#B45309',
  bronzeMuted: '#FFEDD5',

  authGradient: ['#3B82F6', '#2563EB', '#1D4ED8'] as readonly [string, string, string],
  authLogoGradient: ['#60A5FA', '#3B82F6'] as readonly [string, string],
  authOverlayText: '#FFFFFF',
  authOverlayTextMuted: 'rgba(255,255,255,0.95)',
};

export type ThemeColors = typeof lightColors;

/** Typography style objects built from token scale (for Theme) */
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
  card: { ...shadowTokens.card, shadowColor: lightColors.shadowColor },
  sm: {
    ...shadowTokens.card,
    shadowColor: lightColors.shadowColor,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
    elevation: 2,
  },
  md: { ...shadowTokens.card, shadowColor: lightColors.shadowColor },
  lg: {
    ...shadowTokens.card,
    shadowColor: lightColors.shadowColor,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 5,
  },
};

export type Theme = {
  colors: ThemeColors;
  spacing: typeof spacing;
  typography: typeof typography;
  radius: typeof radius;
  shadows: typeof shadows;
  animation: typeof animation;
  isDark: boolean;
};

export const lightTheme: Theme = {
  colors: lightColors,
  spacing,
  typography,
  radius,
  shadows,
  animation,
  isDark: false,
};
