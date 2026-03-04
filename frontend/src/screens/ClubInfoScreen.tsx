import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme';
import { useClub } from '../context/ClubContext';
import { clubService } from '../services/clubService';

export default function ClubInfoScreen() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const { colors, spacing, typography } = theme;
  const { selectedClub } = useClub();
  const [club, setClub] = useState<{ name: string; inviteCode?: string } | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!selectedClub) {
      setClub(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const res = await clubService.getById(selectedClub.id);
      const d = res.data as { name: string; inviteCode?: string };
      setClub({ name: d?.name ?? selectedClub.name, inviteCode: d?.inviteCode });
    } catch {
      setClub({ name: selectedClub.name });
    } finally {
      setLoading(false);
    }
  }, [selectedClub?.id, selectedClub?.name]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: insets.top + spacing.sm, paddingBottom: spacing.sm, paddingHorizontal: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border, backgroundColor: colors.surface }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ padding: spacing.xs }} hitSlop={12}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[typography.h3, { color: colors.text, fontWeight: '700', flex: 1 }]}>Club info</Text>
      </View>
      {loading ? (
        <View style={[styles.centered, { flex: 1 }]}>
          <ActivityIndicator size="small" color={colors.primary} />
        </View>
      ) : club ? (
        <View style={[styles.content, { padding: spacing.md }]}>
          <Text style={[typography.label, { color: colors.textSecondary, marginBottom: spacing.xs }]}>Name</Text>
          <Text style={[typography.h3, { color: colors.text, marginBottom: spacing.md }]}>{club.name}</Text>
          {club.inviteCode != null && (
            <>
              <Text style={[typography.label, { color: colors.textSecondary, marginBottom: spacing.xs }]}>Invite code</Text>
              <Text style={[typography.body, { color: colors.text, fontFamily: 'monospace', letterSpacing: 2 }]}>{club.inviteCode}</Text>
            </>
          )}
        </View>
      ) : (
        <View style={[styles.centered, { flex: 1 }]}>
          <Text style={[typography.body, { color: colors.textSecondary }]}>Select a club to view info.</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center' },
  content: {},
  centered: { justifyContent: 'center', alignItems: 'center' },
});
