/**
 * Design tokens — spacing, radius, typography scale, shadows.
 */

export const spacing = {
  xxs: 4,
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  xxxl: 64,
};

export const radius = {
  sm: 6,
  md: 10,
  lg: 14,
  xl: 18,
  full: 9999,
};

export const typography = {
  displayLarge: 32,
  displayMedium: 28,
  headingLarge: 24,
  headingMedium: 20,
  bodyLarge: 16,
  bodyMedium: 14,
  bodySmall: 12,
};

/** Shadow structure; shadowColor is supplied by theme (colors.shadowColor). */
export const shadows = {
  card: {
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
};

export const animation = { duration: 200, durationSlow: 300 } as const;
