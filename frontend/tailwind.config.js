/**
 * FitClub Tailwind config — design system tokens only.
 * Dark mode: class strategy (add .dark to a parent to enable dark theme).
 * All components should use theme tokens (e.g. bg-primary-500, text-neutral-900).
 */

const tokens = require('./design-system/tokens.js');

module.exports = {
  content: [
    './App.{js,jsx,ts,tsx}',
    './index.ts',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        neutral: tokens.neutral,
        primary: tokens.primary,
        success: {
          ...tokens.success,
          DEFAULT: tokens.success[500],
        },
        warning: {
          ...tokens.warning,
          DEFAULT: tokens.warning[500],
        },
        error: {
          ...tokens.error,
          DEFAULT: tokens.error[500],
        },
        accent: {
          ...tokens.accent,
          DEFAULT: tokens.accent[500],
        },
        medals: tokens.medals,
        // Semantic aliases for light/dark (use with dark: prefix)
        background: {
          DEFAULT: tokens.lightTheme.background,
          dark: tokens.darkTheme.background,
        },
        surface: {
          DEFAULT: tokens.lightTheme.surface,
          dark: tokens.darkTheme.surface,
        },
      },
      spacing: tokens.spacing,
      borderRadius: tokens.borderRadius,
      boxShadow: tokens.boxShadow,
    },
  },
  plugins: [],
};
