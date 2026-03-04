import React from 'react';
import { View, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import { useTheme, useAppTheme } from '../theme';

type CardProps = {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  /** Apply soft shadow. Default true */
  elevated?: boolean;
  /** No inner padding. Default false */
  noPadding?: boolean;
  /** Padding size when not noPadding. Default sm */
  paddingSize?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  /** When true, use system theme (for auth screens dark mode parity) */
  useSystemTheme?: boolean;
};

export function Card({ children, style, elevated = true, noPadding = false, paddingSize = 'sm', useSystemTheme = false }: CardProps) {
  const themeFromContext = useTheme();
  const themeFromSystem = useAppTheme();
  const theme = useSystemTheme ? themeFromSystem : themeFromContext;
  const { colors, spacing, radius } = theme;

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.surface,
          borderRadius: radius.lg,
          padding: noPadding ? 0 : spacing[paddingSize],
          borderWidth: 1,
          borderColor: colors.border,
        },
        elevated && theme.shadows.md,
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {},
});
