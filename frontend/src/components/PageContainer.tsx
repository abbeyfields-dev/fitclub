import React from 'react';
import { View, ScrollView, StyleSheet, ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme, useAppTheme } from '../theme';

type PageContainerProps = {
  children: React.ReactNode;
  /** Use ScrollView for content (keyboard-aware content should wrap with KeyboardAvoidingView outside) */
  scroll?: boolean;
  /** When true, use system light/dark (useAppTheme). Use on auth screens for dark mode parity. */
  useSystemTheme?: boolean;
  /** Horizontal padding: theme spacing key. Default lg */
  paddingHorizontal?: 'xxs' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl' | 'xxxl';
  /** Bottom padding for scroll content. Default xxl */
  paddingBottom?: 'xxs' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl' | 'xxxl';
  /** Top padding. Default none */
  paddingTop?: 'xxs' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl' | 'xxxl';
  style?: ViewStyle;
  contentContainerStyle?: ViewStyle;
  /** Safe area edges. Default ['top','bottom'] */
  edges?: ('top' | 'bottom' | 'left' | 'right')[];
};

export function PageContainer({
  children,
  scroll = false,
  useSystemTheme = false,
  paddingHorizontal = 'lg',
  paddingBottom = 'xxl',
  paddingTop,
  style,
  contentContainerStyle,
  edges = ['top', 'bottom'],
}: PageContainerProps) {
  const themeFromContext = useTheme();
  const themeFromSystem = useAppTheme();
  const theme = useSystemTheme ? themeFromSystem : themeFromContext;
  const { colors, spacing } = theme;

  const paddingHor = spacing[paddingHorizontal];
  const paddingBot = spacing[paddingBottom];
  const paddingTopVal = paddingTop != null ? spacing[paddingTop] : undefined;

  const contentStyle: ViewStyle = {
    paddingHorizontal: paddingHor,
    paddingBottom: paddingBot,
    ...(paddingTopVal != null && { paddingTop: paddingTopVal }),
  };

  if (scroll) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }, style]} edges={edges}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[styles.scrollContent, contentStyle, contentContainerStyle]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {children}
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }, style]} edges={edges}>
      <View style={[styles.content, contentStyle, contentContainerStyle]}>{children}</View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  scrollView: { flex: 1 },
  scrollContent: { flexGrow: 1 },
  content: { flex: 1 },
});
