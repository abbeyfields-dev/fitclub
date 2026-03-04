import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, ViewStyle, Platform } from 'react-native';
import { useAppTheme } from '../theme';
import { spacing, radius, typography } from '../theme/tokens';

type ButtonVariant = 'primary' | 'outline';

type ButtonProps = {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  fullWidth?: boolean;
  loading?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  style?: ViewStyle;
  /** Override label (and loading indicator) color, e.g. for Apple button (black in light mode) */
  titleColor?: string;
};

const BUTTON_RADIUS = 14;

export function Button({
  title,
  onPress,
  variant = 'primary',
  fullWidth,
  loading = false,
  disabled = false,
  icon,
  style,
  titleColor: titleColorProp,
}: ButtonProps) {
  const theme = useAppTheme();
  const isOutline = variant === 'outline';
  const isDisabled = disabled || loading;
  const defaultTextColor = isOutline ? theme.colors.primary : theme.colors.textInverse;
  const textColor = titleColorProp ?? defaultTextColor;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.85}
      style={[
        styles.button,
        {
          backgroundColor: isOutline ? theme.colors.transparent : theme.colors.primary,
          borderWidth: isOutline ? 1 : 0,
          borderColor: isOutline ? theme.colors.border : undefined,
          borderRadius: BUTTON_RADIUS,
          width: fullWidth ? '100%' : undefined,
          opacity: isDisabled ? 0.6 : 1,
          ...(Platform.OS === 'ios' ? theme.shadows.sm : { elevation: 2 }),
        },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={textColor} size="small" />
      ) : (
        <>
          {icon}
          <Text style={[styles.text, { color: textColor }]}>{title}</Text>
        </>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
    gap: spacing.sm,
  },
  text: {
    fontSize: typography.bodyLarge,
    fontWeight: '600',
  },
});
