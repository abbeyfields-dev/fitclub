import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  LayoutAnimation,
  UIManager,
  Platform,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme';
import { useClub } from '../context/ClubContext';
import { roundService } from '../services/roundService';
import type { LeaderboardEntry, LeaderboardTab } from '../types/leaderboard';
import type { RootStackParamList } from '../navigation/types';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const RANK_MEDAL: Record<1 | 2 | 3, string> = { 1: '🥇', 2: '🥈', 3: '🥉' };
const PODIUM_HEIGHTS = { 1: 88, 2: 72, 3: 72 } as const;

export default function RoundLeaderboardScreen() {
  const theme = useTheme();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const route = useRoute<RouteProp<RootStackParamList, 'RoundLeaderboard'>>();
  const { roundId, roundName } = route.params;
  const { colors, spacing: s, radius: r, typography, shadows } = theme;
  const { selectedClub } = useClub();

  const [tab, setTab] = useState<LeaderboardTab>('teams');
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [individuals, setIndividuals] = useState<LeaderboardEntry[]>([]);
  const [teams, setTeams] = useState<LeaderboardEntry[]>([]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [indRes, teamRes] = await Promise.all([
        roundService.getLeaderboard(roundId, 'individuals'),
        roundService.getLeaderboard(roundId, 'teams'),
      ]);
      const maxInd = indRes.data?.length ? Math.max(...indRes.data.map((e) => e.points)) : 0;
      const maxTeam = teamRes.data?.length ? Math.max(...teamRes.data.map((e) => e.points)) : 0;
      setIndividuals((indRes.data ?? []).map((e) => ({ ...e, maxPoints: maxInd || e.points })));
      setTeams((teamRes.data ?? []).map((e) => ({ ...e, maxPoints: maxTeam || e.points })));
    } catch {
      setIndividuals([]);
      setTeams([]);
    } finally {
      setLoading(false);
    }
  }, [roundId]);

  useEffect(() => {
    load();
  }, [load]);

  const data = tab === 'individuals' ? individuals : teams;
  const myEntry = data.find((e) => e.isCurrentUser) ?? null;
  const totalPoints = data.reduce((sum, e) => sum + e.points, 0);
  const top3 = data.filter((e) => e.rank >= 1 && e.rank <= 3);
  const rest = data.filter((e) => e.rank > 3);
  const firstPlacePoints = data[0]?.points ?? 0;
  const gapToFirst = myEntry && myEntry.rank > 1 ? firstPlacePoints - myEntry.points : 0;

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    await load();
    setRefreshing(false);
  }, [load]);

  const onTabChange = (next: LeaderboardTab) => {
    if (next === tab) return;
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setTab(next);
  };

  const goBack = () => (navigation as any).goBack();

  if (loading && data.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor: colors.surface, flex: 1, justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={[typography.body, { color: colors.textSecondary, fontWeight: '600' }]}>Loading…</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.surface }]}>
      {/* Header: back + round name + Ended — respect safe area */}
      <View style={[styles.header, { paddingTop: insets.top + s.sm, paddingBottom: s.sm, paddingHorizontal: s.md, borderBottomWidth: 1, borderBottomColor: colors.border, backgroundColor: colors.card }]}>
        <TouchableOpacity onPress={goBack} style={{ padding: s.xs, marginRight: s.sm }} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <View style={{ flex: 1, minWidth: 0 }}>
          <Text style={[typography.h3, { color: colors.text, fontWeight: '800' }]} numberOfLines={1}>
            {roundName}
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: s.sm, marginTop: 2 }}>
            <View style={{ backgroundColor: colors.textMuted, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 }}>
              <Text style={[typography.caption, { color: colors.textInverse, fontWeight: '700' }]}>Ended</Text>
            </View>
            <Text style={[typography.caption, { color: colors.textSecondary, fontWeight: '600' }]}>
              {totalPoints.toLocaleString()} pts total
            </Text>
          </View>
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={{ paddingHorizontal: s.sm, paddingBottom: s.xxl + s.lg }}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
      >
        {/* Insight strip */}
        {myEntry && (
          <View
            style={[
              styles.insightStrip,
              {
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: myEntry.rank === 1 ? colors.accentMuted : colors.statCardBackground,
                borderWidth: 1,
                borderColor: myEntry.rank === 1 ? colors.accent : colors.border,
                borderRadius: r.sm,
                paddingVertical: s.xs,
                paddingHorizontal: s.sm,
                marginTop: s.sm,
                marginBottom: s.sm,
              },
            ]}
          >
            {myEntry.rank === 1 ? (
              <>
                <Ionicons name="trophy" size={16} color={colors.accent} />
                <Text style={[typography.label, { color: colors.text, fontWeight: '800', marginLeft: 6 }]}>You were #1</Text>
              </>
            ) : (
              <>
                <Ionicons name="trophy-outline" size={14} color={colors.primary} />
                <Text style={[typography.caption, { color: colors.text, fontWeight: '700', marginLeft: 4 }]}>
                  {gapToFirst.toLocaleString()} pts behind #1
                </Text>
              </>
            )}
          </View>
        )}

        {/* Segment */}
        <View style={[styles.segmentWrap, { flexDirection: 'row', backgroundColor: colors.card, borderRadius: r.sm, padding: 2, marginBottom: s.sm, borderWidth: 1, borderColor: colors.border }]}>
          <TouchableOpacity
            onPress={() => onTabChange('teams')}
            activeOpacity={0.85}
            style={[styles.segmentBtn, { flex: 1, paddingVertical: s.sm, borderRadius: r.sm - 2, backgroundColor: tab === 'teams' ? colors.primary : 'transparent' }]}
          >
            <Ionicons name="people" size={18} color={tab === 'teams' ? colors.heroText : colors.textSecondary} />
            <Text style={[typography.label, { fontWeight: '700', color: tab === 'teams' ? colors.heroText : colors.text }]}>Teams</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => onTabChange('individuals')}
            activeOpacity={0.85}
            style={[styles.segmentBtn, { flex: 1, paddingVertical: s.sm, borderRadius: r.sm - 2, backgroundColor: tab === 'individuals' ? colors.primary : 'transparent' }]}
          >
            <Ionicons name="person" size={18} color={tab === 'individuals' ? colors.heroText : colors.textSecondary} />
            <Text style={[typography.label, { fontWeight: '700', color: tab === 'individuals' ? colors.heroText : colors.text }]}>Individuals</Text>
          </TouchableOpacity>
        </View>

        {/* Podium */}
        {top3.length > 0 && (
          <View style={[styles.podiumRow, { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'center', marginBottom: s.sm, gap: s.xs }]}>
            {[2, 1, 3].map((rank) => {
              const entry = top3.find((e) => e.rank === rank);
              if (!entry) return null;
              return (
                <View key={entry.id} style={[styles.podiumSlot, { flex: 1, alignItems: 'center' }]}>
                  <Text style={styles.medalPodium}>{RANK_MEDAL[rank as 1 | 2 | 3]}</Text>
                  <View
                    style={[
                      styles.podiumBlock,
                      {
                        height: PODIUM_HEIGHTS[rank as 1 | 2 | 3],
                        backgroundColor: colors.card,
                        borderWidth: 1,
                        borderColor: colors.border,
                        borderBottomLeftRadius: r.sm,
                        borderBottomRightRadius: r.sm,
                        justifyContent: 'flex-end',
                        paddingBottom: s.xs,
                        marginTop: 4,
                        ...(rank === 1 ? shadows.md : shadows.sm),
                      },
                    ]}
                  >
                    <Text style={[typography.caption, { color: colors.textSecondary, fontWeight: '700' }]}>#{rank}</Text>
                    <Text style={[typography.caption, { color: colors.text, fontWeight: '800' }]} numberOfLines={1}>{entry.name}</Text>
                    <Text style={[typography.label, { color: rank === 1 ? colors.primary : colors.text, fontWeight: '800' }]}>{entry.points.toLocaleString()}</Text>
                  </View>
                </View>
              );
            })}
          </View>
        )}

        {/* List header */}
        <View style={[styles.listHeader, { flexDirection: 'row', paddingHorizontal: s.xs, paddingVertical: s.xs, borderBottomWidth: 1, borderBottomColor: colors.border, marginBottom: s.xs }]}>
          <Text style={[typography.caption, { color: colors.textSecondary, fontWeight: '700', width: 32 }]}>#</Text>
          <Text style={[typography.caption, { color: colors.textSecondary, fontWeight: '700', flex: 1 }]}>{tab === 'teams' ? 'Team' : 'Name'}</Text>
          <Text style={[typography.caption, { color: colors.textSecondary, fontWeight: '700', textAlign: 'right', minWidth: 56 }]}>Pts</Text>
        </View>
        {rest.map((item) => (
          <View
            key={item.id}
            style={[
              styles.listRow,
              {
                flexDirection: 'row',
                alignItems: 'center',
                paddingVertical: s.xs + 2,
                paddingHorizontal: s.sm,
                borderBottomWidth: 1,
                borderBottomColor: colors.border,
                backgroundColor: item.isCurrentUser ? colors.accentMuted : 'transparent',
              },
            ]}
          >
            <Text style={[typography.bodySmall, { fontWeight: '800', color: colors.text, width: 32 }]}>#{item.rank}</Text>
            <View style={{ flex: 1, minWidth: 0, flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Text style={[typography.body, { fontWeight: '700', color: colors.text }]} numberOfLines={1}>{item.name}</Text>
              {item.isCurrentUser && (
                <View style={{ backgroundColor: colors.accent, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 }}>
                  <Text style={[typography.caption, { color: colors.textInverse, fontWeight: '700', fontSize: 10 }]}>
                    {tab === 'teams' ? 'Your Team' : 'You'}
                  </Text>
                </View>
              )}
            </View>
            <Text style={[typography.label, { fontWeight: '800', color: colors.text, textAlign: 'right', minWidth: 56 }]}>{item.points.toLocaleString()}</Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center' },
  scroll: { flex: 1 },
  insightStrip: {},
  segmentWrap: {},
  segmentBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 },
  podiumRow: {},
  podiumSlot: {},
  podiumBlock: { width: '100%', alignItems: 'center' },
  medalPodium: { fontSize: 28, marginTop: 4 },
  listHeader: {},
  listRow: {},
});
