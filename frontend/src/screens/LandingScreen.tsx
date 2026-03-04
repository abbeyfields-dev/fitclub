import React from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '../theme';
import { PageContainer, Button } from '../components';
import { useAuthScreenEnterAnimation } from '../hooks/useAuthScreenEnterAnimation';

type LandingScreenProps = {
  onSignIn: () => void;
  onGetStarted: () => void;
};

export default function LandingScreen({ onSignIn, onGetStarted }: LandingScreenProps) {
  const theme = useAppTheme();
  const { colors, spacing, typography } = theme;
  const enterStyle = useAuthScreenEnterAnimation();

  return (
    <PageContainer useSystemTheme paddingTop="lg" paddingBottom="lg">
      <Animated.View style={[styles.content, { flex: 1, justifyContent: 'space-between' }, enterStyle]} pointerEvents="box-none">
        <View style={styles.hero}>
          <View style={[styles.logoIcon, { marginBottom: spacing.md }]}>
            <Ionicons name="barbell" size={40} color={colors.primary} />
          </View>
          <Text style={[styles.title, { ...typography.h1, color: colors.text, marginBottom: spacing.xxs }]}>
            FitClub
          </Text>
          <Text style={[styles.tagline, { ...typography.body, color: colors.textSecondary, marginTop: spacing.xxs }]}>
            Compete with your club. Log workouts. Climb the leaderboard.
          </Text>
        </View>

        <View style={[styles.actions, { gap: spacing.sm, marginTop: spacing.xl }]}>
          <Button title="Get started" onPress={onGetStarted} fullWidth />
          <Button title="Sign in" onPress={onSignIn} variant="outline" fullWidth />
        </View>
      </Animated.View>
    </PageContainer>
  );
}

const styles = StyleSheet.create({
  content: {},
  hero: { alignItems: 'center' },
  logoIcon: {},
  title: { textAlign: 'center' },
  tagline: { textAlign: 'center', maxWidth: 320 },
  actions: {},
});
