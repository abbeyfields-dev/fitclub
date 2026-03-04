import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../theme';

const HEADER_CONTENT_HEIGHT = 48;

export function MobileHeader() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { colors, spacing, typography } = theme;

  return (
    <View
      style={[
        styles.container,
        {
          paddingBottom: spacing.sm,
          paddingHorizontal: spacing.md,
          backgroundColor: colors.surface,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
        },
      ]}
    >
      <View style={[styles.row, { minHeight: HEADER_CONTENT_HEIGHT, paddingTop: insets.top }]}>
        <Text style={[styles.title, { ...typography.h3, color: colors.text }]} numberOfLines={1}>
          FitClub
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {},
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {},
});
