import type { Theme } from '@react-navigation/native';
import { DefaultTheme } from '@react-navigation/native';
import { lightTheme, darkTheme } from '../theme';

export const navLightTheme: Theme = {
  ...DefaultTheme,
  dark: false,
  colors: {
    primary: lightTheme.colors.primary,
    background: lightTheme.colors.background,
    card: lightTheme.colors.surface,
    text: lightTheme.colors.text,
    border: lightTheme.colors.border,
    notification: lightTheme.colors.accent,
  },
};

export const navDarkTheme: Theme = {
  ...DefaultTheme,
  dark: true,
  colors: {
    primary: darkTheme.colors.primary,
    background: darkTheme.colors.background,
    card: darkTheme.colors.surface,
    text: darkTheme.colors.text,
    border: darkTheme.colors.border,
    notification: darkTheme.colors.accent,
  },
};
