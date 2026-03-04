import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, Alert, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../store/authStore';
import { authService } from '../services/authService';
import { User } from '../types';
import { useAppTheme } from '../theme';
import { PageContainer, Card, Button, Input } from '../components';
import { useAuthScreenEnterAnimation } from '../hooks/useAuthScreenEnterAnimation';

export default function RegisterScreen({
  onLogin,
  onSuccess,
  onBack,
}: {
  onLogin: () => void;
  onSuccess: () => void;
  onBack?: () => void;
}) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [focusFlags, setFocusFlags] = useState({ displayName: false, email: false, password: false });

  const login = useAuthStore((s) => s.login);
  const theme = useAppTheme();
  const { colors, spacing, radius, typography } = theme;

  const handleRegister = async () => {
    if (!email.trim() || !password || !displayName.trim()) {
      setErrorMessage('Please fill in all fields.');
      return;
    }
    setErrorMessage(null);
    setLoading(true);
    try {
      const res = await authService.register(email.trim(), password, displayName.trim());
      if (res.success && res.data) {
        const user: User = res.data.user;
        await login(user, res.data.token);
        onSuccess();
      }
    } catch (e: any) {
      setErrorMessage(e?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const borderColor = (focused: boolean) => (focused ? colors.primary : colors.border);
  const enterStyle = useAuthScreenEnterAnimation();

  const content = (
    <Animated.View style={[styles.content, enterStyle]} pointerEvents="box-none">
      {onBack ? (
        <TouchableOpacity
          onPress={onBack}
          style={[styles.backButton, { marginBottom: spacing.xs, padding: spacing.xs }]}
          hitSlop={{ top: spacing.sm, bottom: spacing.sm, left: spacing.sm, right: spacing.sm }}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
      ) : null}

      <View style={[styles.hero, { alignItems: 'center', marginBottom: spacing.lg, paddingTop: spacing.sm }]}>
        <View style={[styles.logoIcon, { marginBottom: spacing.sm }]}>
          <Ionicons name="barbell" size={36} color={colors.primary} />
        </View>
        <Text style={[styles.heroTitle, { ...typography.h1, color: colors.text, marginBottom: spacing.xxs }]}>
          Create account
        </Text>
        <Text
          style={[styles.heroSubtitle, { ...typography.body, color: colors.textSecondary, textAlign: 'center', marginTop: spacing.xxs }]}
        >
          Join your club and start earning points
        </Text>
      </View>

      <Card
        useSystemTheme
        paddingSize="xl"
        style={{ marginBottom: spacing.md, backgroundColor: colors.card }}
      >
        <View
          style={[
            styles.inputWrap,
            {
              borderColor: borderColor(focusFlags.displayName),
              borderWidth: focusFlags.displayName ? 2 : 1,
              borderRadius: radius.md,
              marginBottom: spacing.md,
              minHeight: 48,
            },
          ]}
          pointerEvents="box-none"
        >
          <Input
            leftIcon={<Ionicons name="person-outline" size={20} color={colors.textMuted} />}
            placeholder="Display name"
            value={displayName}
            onChangeText={(t) => {
              setDisplayName(t);
              setErrorMessage(null);
            }}
            onFocus={() => setFocusFlags((f) => ({ ...f, displayName: true }))}
            onBlur={() => setFocusFlags((f) => ({ ...f, displayName: false }))}
            editable={!loading}
            unstyled
            containerStyle={{ minHeight: 48 }}
          />
        </View>
        <View
          style={[
            styles.inputWrap,
            {
              borderColor: borderColor(focusFlags.email),
              borderWidth: focusFlags.email ? 2 : 1,
              borderRadius: radius.md,
              marginBottom: spacing.md,
              minHeight: 48,
            },
          ]}
          pointerEvents="box-none"
        >
          <Input
            leftIcon={<Ionicons name="mail-outline" size={20} color={colors.textMuted} />}
            placeholder="Email"
            value={email}
            onChangeText={(t) => {
              setEmail(t);
              setErrorMessage(null);
            }}
            onFocus={() => setFocusFlags((f) => ({ ...f, email: true }))}
            onBlur={() => setFocusFlags((f) => ({ ...f, email: false }))}
            autoCapitalize="none"
            keyboardType="email-address"
            editable={!loading}
            unstyled
            containerStyle={{ minHeight: 48 }}
          />
        </View>
        <View
          style={[
            styles.inputWrap,
            {
              borderColor: borderColor(focusFlags.password),
              borderWidth: focusFlags.password ? 2 : 1,
              borderRadius: radius.md,
              marginBottom: spacing.md,
              minHeight: 48,
            },
          ]}
          pointerEvents="box-none"
        >
          <Input
            leftIcon={<Ionicons name="lock-closed-outline" size={20} color={colors.textMuted} />}
            placeholder="Password"
            value={password}
            onChangeText={(t) => {
              setPassword(t);
              setErrorMessage(null);
            }}
            onFocus={() => setFocusFlags((f) => ({ ...f, password: true }))}
            onBlur={() => setFocusFlags((f) => ({ ...f, password: false }))}
            secureTextEntry
            editable={!loading}
            unstyled
            containerStyle={{ minHeight: 48 }}
          />
        </View>

        {errorMessage ? (
          <View
            style={[
              styles.errorBox,
              {
                backgroundColor: colors.errorMuted,
                borderRadius: radius.md,
                padding: spacing.sm,
                marginBottom: spacing.md,
              },
            ]}
          >
            <Ionicons name="alert-circle" size={18} color={colors.error} />
            <Text
              style={[
                styles.errorText,
                { ...typography.bodySmall, color: colors.error, marginLeft: spacing.sm, flex: 1, fontWeight: '600' },
              ]}
            >
              {errorMessage}
            </Text>
          </View>
        ) : null}

        <Button
          title="Sign up"
          onPress={handleRegister}
          loading={loading}
          disabled={loading}
          fullWidth
        />

        <View
          style={[
            styles.divider,
            {
              flexDirection: 'row',
              alignItems: 'center',
              marginTop: spacing.md,
              marginBottom: spacing.sm,
            },
          ]}
        >
          <View style={[styles.dividerLine, { flex: 1, height: 1, backgroundColor: colors.border }]} />
          <Text
            style={[
              styles.dividerText,
              { ...typography.bodySmall, fontWeight: '700', color: colors.textSecondary, marginHorizontal: spacing.md },
            ]}
          >
            OR
          </Text>
          <View style={[styles.dividerLine, { flex: 1, height: 1, backgroundColor: colors.border }]} />
        </View>

        <Button
          title="Continue with Google"
          onPress={() => Alert.alert('Coming soon', 'Sign up with Google will be available soon.')}
          disabled={loading}
          variant="outline"
          fullWidth
          icon={<Ionicons name="logo-google" size={20} color={colors.socialGoogle} />}
          style={{ marginBottom: spacing.sm }}
        />
        <Button
          title="Continue with Apple"
          onPress={() => Alert.alert('Coming soon', 'Sign up with Apple will be available soon.')}
          disabled={loading}
          variant="outline"
          fullWidth
          titleColor={colors.socialApple}
          icon={<Ionicons name="logo-apple" size={20} color={colors.socialApple} />}
        />
      </Card>

      <View
        style={[
          styles.footer,
          {
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
            marginTop: spacing.md,
          },
        ]}
      >
        <Text style={[styles.footerText, { ...typography.bodySmall, color: colors.textSecondary }]}>
          Already have an account?{' '}
        </Text>
        <TouchableOpacity onPress={onLogin} disabled={loading}>
          <Text
            style={[
              styles.footerLink,
              { ...typography.bodySmall, fontWeight: '700', color: colors.primary, textDecorationLine: 'underline' },
            ]}
          >
            Sign in
          </Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );

  return (
    <KeyboardAvoidingView
      style={styles.keyboard}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={0}
    >
      <PageContainer useSystemTheme scroll>{content}</PageContainer>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  keyboard: { flex: 1 },
  content: { width: '100%' },
  hero: {},
  logoIcon: {},
  heroTitle: {},
  heroSubtitle: {},
  inputWrap: { flexDirection: 'row', alignItems: 'center' },
  errorBox: { flexDirection: 'row', alignItems: 'center' },
  errorText: {},
  divider: {},
  dividerLine: {},
  dividerText: {},
  footer: {},
  footerText: {},
  footerLink: {},
  backButton: { alignSelf: 'flex-start' },
});
