/**
 * FitClub design system — single source of truth for Tailwind and React Native theme.
 * Use these tokens only; no hex values in components.
 */

/** Neutral scale (slate) — 50–900 */
const neutral = {
  50: '#f8fafc',
  100: '#f1f5f9',
  200: '#e2e8f0',
  300: '#cbd5e1',
  400: '#94a3b8',
  500: '#64748b',
  600: '#475569',
  700: '#334155',
  800: '#1e293b',
  900: '#0f172a',
  950: '#020617',
};

/** Primary blue scale */
const primary = {
  50: '#eff6ff',
  100: '#dbeafe',
  200: '#bfdbfe',
  300: '#93c5fd',
  400: '#60a5fa',
  500: '#3b82f6',
  600: '#2563eb',
  700: '#1d4ed8',
  800: '#1e40af',
  900: '#1e3a8a',
  950: '#172554',
};

/** Semantic: success (green) */
const success = {
  50: '#f0fdf4',
  100: '#dcfce7',
  500: '#22c55e',
  600: '#16a34a',
  muted: '#dcfce7',
};

/** Semantic: warning (amber) */
const warning = {
  50: '#fffbeb',
  100: '#fef3c7',
  500: '#f59e0b',
  600: '#d97706',
  muted: '#fef3c7',
};

/** Semantic: error (red) */
const error = {
  50: '#fef2f2',
  100: '#fee2e2',
  500: '#ef4444',
  600: '#dc2626',
  muted: '#fee2e2',
};

/** Accent (lime) — points, highlights */
const accent = {
  50: '#f7fee7',
  100: '#ecfccb',
  500: '#84cc16',
  600: '#65a30d',
  muted: '#ecfccb',
};

/** Social / provider icon colors (optional theming) */
const social = {
  google: '#4285F4',
  apple: null, // use text color for Apple icon
};

/** Leaderboard medals */
const medals = {
  gold: '#eab308',
  goldMuted: '#fef9c3',
  silver: '#94a3b8',
  silverMuted: '#f1f5f9',
  bronze: '#b45309',
  bronzeMuted: '#ffedd5',
};

/** 8pt spacing scale (Tailwind-compatible keys + numeric values for RN) */
const spacing = {
  0: 0,
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  8: 32,
  10: 40,
  12: 48,
  16: 64,
  20: 80,
  24: 96,
  // Aliases for theme
  xxs: 4,
  xs: 8,
  sm: 16,
  md: 24,
  lg: 32,
  xl: 40,
  xxl: 48,
  xxxl: 64,
};

/** Border radius scale */
const borderRadius = {
  none: 0,
  sm: 8,
  DEFAULT: 12,
  md: 12,
  lg: 16,
  xl: 24,
  '2xl': 32,
  full: 9999,
};

/** Box shadow tokens (Tailwind format; for RN use shadowColor/Offset/Opacity/Radius) */
const boxShadow = {
  sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  DEFAULT: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
  md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
};

/** Light theme semantic mapping (for Tailwind dark: variants and for RN theme) */
const lightTheme = {
  background: neutral[50],
  surface: '#ffffff',
  surfaceElevated: '#ffffff',
  text: neutral[900],
  textSecondary: neutral[600],
  textMuted: neutral[500],
  border: neutral[200],
  borderLight: neutral[100],
  textInverse: '#ffffff',
  primary: primary[600],
  primaryHover: primary[700],
  primaryMuted: primary[100],
  accent: accent[500],
  accentMuted: accent[100],
  error: error[600],
  errorMuted: error.muted,
  success: success[600],
  successMuted: success.muted,
  warning: warning[600],
  warningMuted: warning.muted,
  /** Auth overlay (text on gradient) */
  authOverlayText: '#ffffff',
  authOverlayTextMuted: 'rgba(255,255,255,0.95)',
  /** Auth gradients from primary blue scale */
  authGradient: [primary[500], primary[600], primary[700]],
  authLogoGradient: [primary[400], primary[500]],
  shadowColor: neutral[950],
  /** Modal backdrop */
  overlay: 'rgba(0,0,0,0.5)',
  /** Lighter overlay (e.g. dropdown scrim) */
  overlayLight: 'rgba(0,0,0,0.2)',
  /** Transparent (e.g. input inside colored wrap) */
  transparent: 'transparent',
};

/** Dark theme semantic mapping */
const darkTheme = {
  background: neutral[900],
  surface: neutral[800],
  surfaceElevated: neutral[700],
  text: neutral[50],
  textSecondary: neutral[400],
  textMuted: neutral[500],
  border: neutral[700],
  borderLight: neutral[800],
  textInverse: neutral[900],
  primary: primary[400],
  primaryHover: primary[300],
  primaryMuted: primary[900],
  accent: accent[400],
  accentMuted: accent[900],
  error: error[400],
  errorMuted: 'rgba(127,29,29,0.5)',
  success: success[400],
  successMuted: success[900],
  warning: warning[400],
  warningMuted: warning[900],
  authOverlayText: neutral[50],
  authOverlayTextMuted: 'rgba(248,250,252,0.9)',
  authGradient: [neutral[900], neutral[800], neutral[700]],
  authLogoGradient: [primary[600], primary[500]],
  shadowColor: neutral[950],
  overlay: 'rgba(0,0,0,0.5)',
  overlayLight: 'rgba(0,0,0,0.2)',
  transparent: 'transparent',
};

/** React Native shadow objects (use neutral for shadowColor) */
const shadowsRN = {
  sm: {
    shadowColor: neutral[950],
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: neutral[950],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  lg: {
    shadowColor: neutral[950],
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 5,
  },
};

module.exports = {
  neutral,
  primary,
  success,
  warning,
  error,
  accent,
  social,
  medals,
  spacing,
  borderRadius,
  boxShadow,
  lightTheme,
  darkTheme,
  shadowsRN,
};
