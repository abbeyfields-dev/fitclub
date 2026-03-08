import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TextInput,
  ActivityIndicator,
  Animated,
  Modal,
  FlatList,
  Pressable,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import type { HomeStackParamList } from '../navigation/types';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme';
import { useClub } from '../context/ClubContext';
import { useDashboardStore } from '../store/dashboardStore';
import { clubService } from '../services/clubService';
import { workoutService, type WorkoutMasterOption, type LogWorkoutPayload } from '../services/workoutService';
import { getInputConfig, getPointsPreview, DEFAULT_ACTIVITY_TYPES } from '../config/workoutInputMap';
import type { RecentWorkout } from '../types/dashboard';

const STEP_DURATION = 5;
const STEP_DISTANCE = 0.5;

export default function WorkoutNewScreen() {
  const theme = useTheme();
  const navigation = useNavigation();
  const route = useRoute<RouteProp<HomeStackParamList, 'WorkoutNew'>>();
  const insets = useSafeAreaInsets();
  const { colors, spacing: s, radius: r, typography, shadows } = theme;
  const { selectedClub } = useClub();
  const { lastLoggedWorkout, setLastLoggedWorkout, optimisticallyAddWorkout } = useDashboardStore();
  const repeatLastIntent = route.params?.repeatLast === true;
  const repeatWorkoutIndex = route.params?.repeatWorkoutIndex ?? 0;

  const [masterList, setMasterList] = useState<WorkoutMasterOption[]>([]);
  const [activitiesLoading, setActivitiesLoading] = useState(true);
  const [activitiesError, setActivitiesError] = useState<string | null>(null);
  const [selectedActivity, setSelectedActivity] = useState<WorkoutMasterOption | null>(null);
  const [activitySearch, setActivitySearch] = useState('');
  const [activityModalVisible, setActivityModalVisible] = useState(false);
  const [duration, setDuration] = useState('');
  const [distance, setDistance] = useState('');
  const [heartRate, setHeartRate] = useState('');
  const [optionalExpanded, setOptionalExpanded] = useState(false);
  const [note, setNote] = useState('');
  const [hasProof, setHasProof] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [dailyCap, setDailyCap] = useState<number | null>(null);
  const [todayPoints, setTodayPoints] = useState<number>(0);
  const [activeRoundId, setActiveRoundId] = useState<string | null>(null);
  const [recentWorkouts, setRecentWorkouts] = useState<RecentWorkout[]>([]);
  const [successPoints, setSuccessPoints] = useState<number | null>(null);
  const [streakMessage, setStreakMessage] = useState<string | null>(null);
  const successOpacity = React.useRef(new Animated.Value(0)).current;
  const successScale = React.useRef(new Animated.Value(0.85)).current;

  const loadActivities = useCallback(async () => {
    setActivitiesLoading(true);
    setActivitiesError(null);
    try {
      const res = await workoutService.listWorkoutMaster();
      if (res.success && res.data && res.data.length > 0) {
        setMasterList(res.data);
      } else {
        const fallback = await workoutService.listActivities();
        if (fallback.success && fallback.data && fallback.data.length > 0) {
          setMasterList(
            fallback.data.map((a) => ({
              id: a.id,
              workoutType: a.workoutType,
              genericWorkoutType: a.workoutType,
              met: null,
            }))
          );
        } else {
          setMasterList(
            DEFAULT_ACTIVITY_TYPES.map((workoutType, i) => ({
              id: i + 1,
              workoutType,
              genericWorkoutType: workoutType,
              met: null,
            }))
          );
        }
      }
    } catch (err) {
      setActivitiesError(err instanceof Error ? err.message : 'Failed to load activities');
      setMasterList(
        DEFAULT_ACTIVITY_TYPES.map((workoutType, i) => ({
          id: i + 1,
          workoutType,
          genericWorkoutType: workoutType,
          met: null,
        }))
      );
    } finally {
      setActivitiesLoading(false);
    }
  }, []);

  const loadDashboard = useCallback(async () => {
    if (!selectedClub) return;
    try {
      const dash = await clubService.getDashboard(selectedClub.id);
      const round = dash.data?.activeRound;
      setActiveRoundId(round?.id ?? null);
      setDailyCap(dash.data?.dailyCap ?? null);
      setTodayPoints(dash.data?.todayPoints ?? 0);
      setRecentWorkouts(dash.data?.recentWorkouts ?? []);
    } catch {
      setActiveRoundId(null);
      setDailyCap(null);
      setTodayPoints(0);
      setRecentWorkouts([]);
    }
  }, [selectedClub?.id]);

  useEffect(() => {
    loadActivities();
  }, [loadActivities]);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const workoutToRepeat = recentWorkouts[repeatWorkoutIndex];
  const lastWorkout = lastLoggedWorkout ?? (workoutToRepeat ? {
    activityType: workoutToRepeat.activityName,
    points: workoutToRepeat.points,
    durationMinutes: undefined,
    distanceKm: undefined,
  } : recentWorkouts[0] ? {
    activityType: recentWorkouts[0].activityName,
    points: recentWorkouts[0].points,
    durationMinutes: undefined,
    distanceKm: undefined,
  } : null);

  const filteredActivities = useMemo(() => {
    const q = activitySearch.trim().toLowerCase();
    if (!q) return masterList;
    return masterList.filter(
      (a) =>
        a.workoutType.toLowerCase().includes(q) || a.genericWorkoutType.toLowerCase().includes(q)
    );
  }, [masterList, activitySearch]);

  const inputConfig = selectedActivity ? getInputConfig(selectedActivity.genericWorkoutType) : null;
  const isDistance = inputConfig?.inputType === 'distance';
  const durationNum = parseInt(duration, 10) || 0;
  const distanceNum = parseFloat(distance) || 0;
  const numValue = inputConfig ? (isDistance ? distanceNum : durationNum) : 0;
  const points = inputConfig ? getPointsPreview(inputConfig.inputType, numValue) : 0;
  const atOrOverCap = dailyCap != null && todayPoints >= dailyCap;
  const wouldHitCap = dailyCap != null && todayPoints + points > dailyCap && todayPoints < dailyCap;
  const pointsAfterSubmit = dailyCap != null ? Math.min(todayPoints + points, dailyCap) - todayPoints : points;

  const validate = useCallback((): string | null => {
    if (!selectedActivity) return 'Select an activity';
    if (!duration.trim()) return 'Duration (minutes) is required';
    const v = parseInt(duration, 10);
    if (isNaN(v) || v <= 0) return 'Enter a valid duration (minutes) greater than 0';
    if (activeRoundId == null) return 'No active round. Join a round to log workouts.';
    if (atOrOverCap) return "You've reached your daily points cap.";
    return null;
  }, [selectedActivity, duration, activeRoundId, atOrOverCap]);

  const runSuccessFlow = useCallback((awarded: number, activityName: string, showStreak: boolean) => {
    setSuccessPoints(awarded);
    setStreakMessage(showStreak ? 'Streak increased' : null);
    successOpacity.setValue(0);
    successScale.setValue(0.85);
    if (selectedClub && activeRoundId) {
      optimisticallyAddWorkout(selectedClub.id, activeRoundId, { points: awarded, activityName });
    }
    setLastLoggedWorkout({
      activityType: selectedActivity!.workoutType,
      points: awarded,
      durationMinutes: parseInt(duration, 10) || undefined,
      distanceKm: distance.trim() ? parseFloat(distance) || undefined : undefined,
    });
    Animated.parallel([
      Animated.timing(successOpacity, { toValue: 1, duration: 220, useNativeDriver: true }),
      Animated.spring(successScale, { toValue: 1, useNativeDriver: true, damping: 14, stiffness: 120 }),
    ]).start();
    setTimeout(() => {
      Animated.timing(successOpacity, { toValue: 0, duration: 180, useNativeDriver: true }).start(() => {
        setSuccessPoints(null);
        setStreakMessage(null);
        if (navigation.canGoBack()) navigation.goBack();
      });
    }, 1500);
  }, [selectedActivity, duration, distance, selectedClub, activeRoundId, successOpacity, successScale, optimisticallyAddWorkout, setLastLoggedWorkout, navigation]);

  const handleSubmit = async () => {
    const err = validate();
    if (err) {
      setSubmitError(err);
      return;
    }
    setSubmitError(null);
    setSubmitting(true);
    const durationMinutes = parseInt(duration, 10) || 0;
    const payload: LogWorkoutPayload = {
      workoutMasterId: selectedActivity!.id,
      durationMinutes,
      distanceKm: distance.trim() ? parseFloat(distance) || undefined : undefined,
      heartRate: heartRate.trim() ? parseInt(heartRate, 10) || undefined : undefined,
      proofUrl: hasProof ? 'proof' : undefined,
      note: note.trim() || undefined,
      loggedAt: new Date().toISOString(),
    };
    const result = await workoutService.logWorkout(activeRoundId!, payload);
    setSubmitting(false);
    if (result.success && result.data != null) {
      const awarded = result.data.points ?? pointsAfterSubmit;
      runSuccessFlow(awarded, selectedActivity!.workoutType, true);
    } else {
      setSubmitError(result.error ?? 'Failed to log workout');
    }
  };

  const handleRepeat = async () => {
    if (!lastWorkout || !activeRoundId) return;
    const activityType = lastWorkout.activityType;
    const match = masterList.find((a) => a.workoutType === activityType);
    if (!match) {
      setSubmitError('This activity is no longer available. Select an activity from the list to log.');
      return;
    }
    const durationMinutes = lastWorkout.durationMinutes ?? 30;
    setSubmitting(true);
    setSubmitError(null);
    const payload: LogWorkoutPayload = {
      workoutMasterId: match.id,
      durationMinutes,
      distanceKm: lastWorkout.distanceKm ?? undefined,
      loggedAt: new Date().toISOString(),
    };
    const result = await workoutService.logWorkout(activeRoundId, payload);
    setSubmitting(false);
    if (result.success && result.data != null) {
      const awarded = result.data.points ?? lastWorkout.points;
      if (selectedClub) optimisticallyAddWorkout(selectedClub.id, activeRoundId, { points: awarded, activityName: activityType });
      setLastLoggedWorkout({ activityType, points: awarded, durationMinutes, distanceKm: lastWorkout.distanceKm });
      setSuccessPoints(awarded);
      setStreakMessage('Streak increased');
      successOpacity.setValue(0);
      successScale.setValue(0.85);
      Animated.parallel([
        Animated.timing(successOpacity, { toValue: 1, duration: 220, useNativeDriver: true }),
        Animated.spring(successScale, { toValue: 1, useNativeDriver: true, damping: 14, stiffness: 120 }),
      ]).start();
      setTimeout(() => {
        Animated.timing(successOpacity, { toValue: 0, duration: 180, useNativeDriver: true }).start(() => {
          setSuccessPoints(null);
          setStreakMessage(null);
          if (navigation.canGoBack()) navigation.goBack();
        });
      }, 1500);
    } else {
      setSubmitError(result.error ?? 'Failed to log workout');
    }
  };

  const handleEditFromQuickLog = () => {
    if (!lastWorkout) return;
    const match = masterList.find((a) => a.workoutType === lastWorkout.activityType);
    if (match) setSelectedActivity(match);
    setDuration(String(lastWorkout.durationMinutes ?? 30));
    setDistance(lastWorkout.distanceKm != null ? String(lastWorkout.distanceKm) : '');
    setHeartRate('');
    setSubmitError(null);
    (navigation as any).setParams?.({ repeatLast: false });
  };

  const stepUp = () => {
    const v = parseInt(duration, 10) || 0;
    setDuration(String(v + STEP_DURATION));
  };
  const stepDown = () => {
    const v = parseInt(duration, 10) || 0;
    if (v > STEP_DURATION) setDuration(String(v - STEP_DURATION));
  };

  const goBack = () => {
    if (navigation.canGoBack()) navigation.goBack();
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.surface }]}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.keyboard}>
        <View style={[styles.header, { paddingTop: s.sm, paddingBottom: s.sm, paddingHorizontal: s.md, borderBottomWidth: 1, borderBottomColor: colors.border, backgroundColor: colors.card }]}>
          <TouchableOpacity onPress={goBack} hitSlop={12} activeOpacity={0.8}>
            <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
          </TouchableOpacity>
          <Text style={[typography.label, { color: colors.textPrimary, fontSize: 18 }]}>Log Workout</Text>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={[
            styles.scrollContent,
            {
              padding: s.sm,
              paddingBottom: insets.bottom + s.lg,
              flexGrow: 0,
            },
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* One-tap repeat banner when opened from Home Quick Log */}
          {repeatLastIntent && lastWorkout && activeRoundId && (
            <View
              style={[
                styles.oneTapRepeatBanner,
                {
                  backgroundColor: colors.primaryMuted ?? colors.primarySoft,
                  borderWidth: 2,
                  borderColor: colors.primary,
                  borderRadius: r.md,
                  padding: s.sm,
                  marginBottom: s.sm,
                  ...shadows.card,
                },
              ]}
            >
              <Text style={[typography.caption, { color: colors.textSecondary, fontWeight: '700', marginBottom: s.xxs }]}>
                Log same workout?
              </Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: s.xs }}>
                <Text style={[typography.label, { color: colors.textPrimary, fontWeight: '800' }]} numberOfLines={1}>
                  {lastWorkout.activityType}
                  {(lastWorkout.durationMinutes != null || lastWorkout.distanceKm != null) && (
                    <Text style={[typography.caption, { color: colors.textSecondary, fontWeight: '600' }]}>
                      {' '}· {lastWorkout.durationMinutes != null ? `${lastWorkout.durationMinutes} min` : `${lastWorkout.distanceKm} km`}
                    </Text>
                  )}
                  <Text style={[typography.caption, { color: colors.energy, fontWeight: '700' }]}> +{lastWorkout.points} pts</Text>
                </Text>
                <View style={{ flexDirection: 'row', gap: s.xs }}>
                  <TouchableOpacity
                    onPress={handleRepeat}
                    disabled={submitting || atOrOverCap}
                    style={[styles.quickLogBtn, { backgroundColor: colors.primary, borderRadius: r.sm, paddingVertical: s.xs, paddingHorizontal: s.sm }]}
                    activeOpacity={0.9}
                  >
                    <Text style={[typography.caption, { color: colors.textInverse, fontWeight: '800' }]}>Log</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={handleEditFromQuickLog}
                    style={[styles.quickLogBtn, { backgroundColor: colors.border, borderRadius: r.sm, paddingVertical: s.xs, paddingHorizontal: s.sm }]}
                    activeOpacity={0.9}
                  >
                    <Text style={[typography.caption, { color: colors.text, fontWeight: '700' }]}>Edit</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )}

          {/* 1. Quick Log (when not from one-tap intent) */}
          {!repeatLastIntent && lastWorkout && activeRoundId && (
            <View style={[styles.quickLogCard, { backgroundColor: colors.card, borderWidth: 2, borderColor: colors.primary, borderRadius: r.md, padding: s.md, marginBottom: s.sm, ...shadows.card }]}>
              <Text style={[typography.caption, { color: colors.textSecondary, fontWeight: '700', marginBottom: s.xxs }]}>Last logged</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: s.xs }}>
                <View>
                  <Text style={[typography.label, { color: colors.textPrimary, fontWeight: '800' }]} numberOfLines={1}>{lastWorkout.activityType}</Text>
                  <Text style={[typography.caption, { color: colors.accent, fontWeight: '700' }]}>
                    +{lastWorkout.points} pts
                    {(lastWorkout.durationMinutes != null || lastWorkout.distanceKm != null) && (
                      <Text style={[typography.caption, { color: colors.textSecondary }]}>
                        {' '}· {lastWorkout.durationMinutes != null ? `${lastWorkout.durationMinutes} min` : `${lastWorkout.distanceKm} km`}
                      </Text>
                    )}
                  </Text>
                </View>
                <View style={{ flexDirection: 'row', gap: s.xs }}>
                  <TouchableOpacity onPress={handleRepeat} disabled={submitting || atOrOverCap} style={[styles.quickLogBtn, { backgroundColor: colors.primary, borderRadius: r.sm, paddingVertical: s.xs, paddingHorizontal: s.sm }]} activeOpacity={0.9}>
                    <Text style={[typography.caption, { color: colors.heroText, fontWeight: '800' }]}>Repeat</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={handleEditFromQuickLog} style={[styles.quickLogBtn, { backgroundColor: colors.border, borderRadius: r.sm, paddingVertical: s.xs, paddingHorizontal: s.sm }]} activeOpacity={0.9}>
                    <Text style={[typography.caption, { color: colors.text, fontWeight: '700' }]}>Edit</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )}

          {/* 2. Activity type — autocomplete */}
          <Text style={[styles.sectionLabel, { color: colors.textPrimary, fontWeight: '800', marginBottom: s.xs }]}>Activity type</Text>
          {activitiesLoading ? (
            <View style={[styles.loadingWrap, { paddingVertical: s.lg }]}>
              <ActivityIndicator size="small" color={colors.primary} />
              <Text style={[typography.caption, { color: colors.textSecondary, marginLeft: s.sm }]}>Loading…</Text>
            </View>
          ) : activitiesError ? (
            <Text style={[typography.caption, { color: colors.error, fontWeight: '600' }]}>{activitiesError}</Text>
          ) : (
            <TouchableOpacity
              onPress={() => { setActivitySearch(''); setActivityModalVisible(true); setSubmitError(null); }}
              activeOpacity={0.85}
              style={[
                styles.activityTrigger,
                {
                  backgroundColor: colors.card,
                  borderWidth: 2,
                  borderColor: selectedActivity ? colors.primary : colors.border,
                  borderRadius: r.md,
                  paddingVertical: s.sm,
                  paddingHorizontal: s.md,
                  flexDirection: 'row',
                  alignItems: 'center',
                  ...(selectedActivity ? shadows.sm : {}),
                },
              ]}
            >
              {selectedActivity ? (
                <>
                  <Ionicons name={getInputConfig(selectedActivity.genericWorkoutType).icon} size={22} color={colors.primary} />
                  <Text style={[typography.body, { color: colors.textPrimary, fontWeight: '600', marginLeft: s.sm }]} numberOfLines={1}>{selectedActivity.workoutType}</Text>
                </>
              ) : (
                <>
                  <Ionicons name="search" size={22} color={colors.textSecondary} />
                  <Text style={[typography.body, { color: colors.textSecondary, marginLeft: s.sm }]}>Search activity…</Text>
                </>
              )}
              <Ionicons name="chevron-down" size={18} color={colors.textSecondary} style={{ marginLeft: 'auto' }} />
            </TouchableOpacity>
          )}

          {/* 3. Duration (required), Distance & Heart rate (optional) */}
          {selectedActivity && (
            <>
              <Text style={[styles.sectionLabel, { color: colors.textPrimary, fontWeight: '800', marginTop: s.md, marginBottom: s.xs }]}>Duration (required)</Text>
              <View style={[styles.inputRow, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: r.md, borderWidth: 1, ...shadows.card }]}>
                <TouchableOpacity onPress={stepDown} style={[styles.stepperBtn, { borderRightWidth: 1, borderRightColor: colors.border }]} activeOpacity={0.8}>
                  <Ionicons name="remove" size={28} color={colors.textPrimary} />
                </TouchableOpacity>
                <TextInput
                  value={duration}
                  onChangeText={setDuration}
                  placeholder="0"
                  placeholderTextColor={colors.textSecondary}
                  keyboardType="number-pad"
                  style={[styles.bigInput, { color: colors.textPrimary }]}
                />
                <View style={[styles.unitBadge, { backgroundColor: colors.border }]}>
                  <Text style={[typography.label, { color: colors.textPrimary, fontWeight: '800' }]}>min</Text>
                </View>
                <TouchableOpacity onPress={stepUp} style={[styles.stepperBtn, { borderLeftWidth: 1, borderLeftColor: colors.border }]} activeOpacity={0.8}>
                  <Ionicons name="add" size={28} color={colors.textPrimary} />
                </TouchableOpacity>
              </View>
              {(parseInt(duration, 10) || 0) <= 0 && duration.trim() && (
                <Text style={[typography.caption, { color: colors.error, marginTop: s.xxs, fontWeight: '600' }]}>Enter a value greater than 0</Text>
              )}

              <Text style={[styles.sectionLabel, { color: colors.textPrimary, fontWeight: '800', marginTop: s.sm, marginBottom: s.xs }]}>Distance (optional)</Text>
              <TextInput
                value={distance}
                onChangeText={setDistance}
                placeholder="e.g. 5.2"
                placeholderTextColor={colors.textSecondary}
                keyboardType="decimal-pad"
                style={[styles.singleInput, { backgroundColor: colors.card, borderColor: colors.border, color: colors.textPrimary, borderRadius: r.md, padding: s.sm, borderWidth: 1 }]}
              />
              <Text style={[typography.caption, { color: colors.textSecondary, marginTop: s.xxs }]}>km</Text>

              <Text style={[styles.sectionLabel, { color: colors.textPrimary, fontWeight: '800', marginTop: s.sm, marginBottom: s.xs }]}>Heart rate (optional)</Text>
              <TextInput
                value={heartRate}
                onChangeText={setHeartRate}
                placeholder="e.g. 120"
                placeholderTextColor={colors.textSecondary}
                keyboardType="number-pad"
                style={[styles.singleInput, { backgroundColor: colors.card, borderColor: colors.border, color: colors.textPrimary, borderRadius: r.md, padding: s.sm, borderWidth: 1 }]}
              />
              <Text style={[typography.caption, { color: colors.textSecondary, marginTop: s.xxs }]}>bpm</Text>

              {dailyCap != null && (
                <View style={[styles.capRow, { marginTop: s.sm }]}>
                  {atOrOverCap ? (
                    <Text style={[typography.caption, { color: colors.warning, fontWeight: '700' }]}>Daily cap reached ({todayPoints}/{dailyCap} pts). Log tomorrow.</Text>
                  ) : wouldHitCap ? (
                    <Text style={[typography.caption, { color: colors.warning, fontWeight: '600' }]}>You'll hit daily cap — only +{Math.max(0, dailyCap - todayPoints)} pts will count today.</Text>
                  ) : (
                    <Text style={[typography.caption, { color: colors.textSecondary, fontWeight: '600' }]}>Today: {todayPoints}/{dailyCap} pts</Text>
                  )}
                </View>
              )}

              <View style={[styles.pointsPreview, { marginTop: s.md, backgroundColor: colors.card, borderWidth: 2, borderColor: colors.energy, borderRadius: r.md, paddingVertical: s.md, ...shadows.card }]}>
                <Text style={[typography.metric, { color: colors.energy }]}>+{dailyCap != null ? pointsAfterSubmit : points} pts</Text>
              </View>

              <TouchableOpacity onPress={() => setOptionalExpanded(!optionalExpanded)} style={[styles.optionalToggle, { marginTop: s.md, borderBottomWidth: 1, borderBottomColor: colors.border, paddingVertical: s.sm }]} activeOpacity={0.8}>
                <Text style={[typography.caption, { color: colors.textSecondary, fontWeight: '700' }]}>Note & proof (optional)</Text>
                <Ionicons name={optionalExpanded ? 'chevron-up' : 'chevron-down'} size={18} color={colors.textSecondary} />
              </TouchableOpacity>
              {optionalExpanded && (
                <View style={{ marginTop: s.xs }}>
                  <TextInput value={note} onChangeText={setNote} placeholder="Add a note" placeholderTextColor={colors.textSecondary} style={[styles.noteInput, { backgroundColor: colors.card, borderColor: colors.border, color: colors.textPrimary, borderRadius: r.sm, padding: s.sm, minHeight: 72 }]} multiline />
                  <TouchableOpacity onPress={() => setHasProof(!hasProof)} style={[styles.proofBtn, { backgroundColor: hasProof ? colors.accentMuted : colors.card, borderColor: hasProof ? colors.energy : colors.border, marginTop: s.sm, gap: s.sm, paddingVertical: s.sm, borderRadius: r.sm }]} activeOpacity={0.8}>
                    <Ionicons name={hasProof ? 'checkmark-circle' : 'cloud-upload-outline'} size={20} color={hasProof ? colors.accent : colors.textSecondary} />
                    <Text style={[typography.caption, { color: hasProof ? colors.accent : colors.textSecondary, fontWeight: '600' }]}>{hasProof ? 'Proof added' : 'Upload proof'}</Text>
                  </TouchableOpacity>
                </View>
              )}
            </>
          )}

          {/* Activity picker modal */}
          <Modal visible={activityModalVisible} animationType="slide" transparent>
            <Pressable style={[styles.modalOverlay, { backgroundColor: colors.overlay }]} onPress={() => setActivityModalVisible(false)}>
              <Pressable style={[styles.modalContent, { backgroundColor: colors.surface, borderRadius: r.lg, maxHeight: '80%' }]} onPress={(e) => e.stopPropagation()}>
                <View style={{ padding: s.md, borderBottomWidth: 1, borderBottomColor: colors.border }}>
                  <Text style={[typography.label, { color: colors.textPrimary, marginBottom: s.sm }]}>Search activity</Text>
                  <TextInput
                    value={activitySearch}
                    onChangeText={setActivitySearch}
                    placeholder="Type to filter…"
                    placeholderTextColor={colors.textSecondary}
                    style={[styles.searchInput, { backgroundColor: colors.card, borderColor: colors.border, color: colors.textPrimary, borderRadius: r.sm, padding: s.sm, borderWidth: 1 }]}
                    autoFocus
                  />
                </View>
                <FlatList
                  data={filteredActivities}
                  keyExtractor={(item) => `${item.id}-${item.workoutType}`}
                  keyboardShouldPersistTaps="handled"
                  style={{ maxHeight: 320 }}
                  renderItem={({ item }) => {
                    const config = getInputConfig(item.genericWorkoutType);
                    return (
                      <TouchableOpacity
                        onPress={() => { setSelectedActivity(item); setActivityModalVisible(false); }}
                        style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: s.sm, paddingHorizontal: s.md, borderBottomWidth: 1, borderBottomColor: colors.border }}
                        activeOpacity={0.7}
                      >
                        <Ionicons name={config.icon} size={20} color={colors.textSecondary} />
                        <Text style={[typography.body, { color: colors.textPrimary, marginLeft: s.sm }]}>{item.workoutType}</Text>
                        {item.genericWorkoutType !== item.workoutType && (
                          <Text style={[typography.caption, { color: colors.textSecondary, marginLeft: s.xs }]}>({item.genericWorkoutType})</Text>
                        )}
                      </TouchableOpacity>
                    );
                  }}
                />
                <TouchableOpacity onPress={() => setActivityModalVisible(false)} style={{ padding: s.md, alignItems: 'center', borderTopWidth: 1, borderTopColor: colors.border }}>
                  <Text style={[typography.label, { color: colors.primary }]}>Cancel</Text>
                </TouchableOpacity>
              </Pressable>
            </Pressable>
          </Modal>

          {submitError && <Text style={[typography.caption, { color: colors.error, fontWeight: '600', marginTop: s.sm }]}>{submitError}</Text>}

          {/* Log Workout CTA — directly under form, no stretch/gap */}
          {selectedActivity && (
            <TouchableOpacity
              onPress={handleSubmit}
              disabled={submitting || !duration.trim() || (parseInt(duration, 10) || 0) <= 0 || atOrOverCap || !activeRoundId}
              activeOpacity={0.9}
              style={[
                styles.cta,
                {
                  marginTop: s.md,
                  backgroundColor: (submitting || !duration.trim() || (parseInt(duration, 10) || 0) <= 0 || atOrOverCap || !activeRoundId) ? colors.border : colors.primary,
                  borderRadius: r.sm,
                  paddingVertical: s.md,
                },
              ]}
            >
              {submitting ? <ActivityIndicator size="small" color={colors.heroText} /> : <Text style={[typography.label, { color: colors.heroText, fontWeight: '800' }]}>Log Workout</Text>}
            </TouchableOpacity>
          )}
        </ScrollView>
      </KeyboardAvoidingView>

      {/* 7. Success overlay */}
      {successPoints != null && (
        <Animated.View style={[styles.successOverlay, { backgroundColor: colors.surface, opacity: successOpacity }]} pointerEvents="box-none">
          <Animated.View style={[styles.successContent, { transform: [{ scale: successScale }] }]}>
            <Text style={[typography.metric, { color: colors.energy }]}>+{successPoints} pts</Text>
            {streakMessage && <Text style={[typography.label, { color: colors.textPrimary, marginTop: s.xs }]}>🔥 {streakMessage}</Text>}
            {!streakMessage && <Text style={[typography.caption, { color: colors.textSecondary, marginTop: s.xs }]}>Logged</Text>}
          </Animated.View>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  keyboard: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  scroll: { flex: 1 },
  scrollContent: {},
  sectionLabel: {},
  quickLogCard: {},
  oneTapRepeatBanner: {},
  quickLogBtn: {},
  loadingWrap: { flexDirection: 'row', alignItems: 'center' },
  activityTrigger: {},
  modalOverlay: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  modalContent: { width: '100%' },
  searchInput: { fontSize: 16 },
  singleInput: { fontSize: 16 },
  inputRow: { flexDirection: 'row', alignItems: 'stretch' },
  stepperBtn: { paddingHorizontal: 12, justifyContent: 'center', minWidth: 48 },
  bigInput: { flex: 1, fontSize: 28, fontWeight: '800', paddingVertical: 16, paddingHorizontal: 8, textAlign: 'center' },
  unitBadge: { paddingHorizontal: 16, justifyContent: 'center', borderTopRightRadius: 6, borderBottomRightRadius: 6 },
  capRow: {},
  pointsPreview: { alignItems: 'center' },
  pointsValue: { fontSize: 36 },
  optionalToggle: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  noteInput: { borderWidth: 1, minHeight: 72, fontSize: 14 },
  proofBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderWidth: 1 },
  footer: {},
  cta: { alignItems: 'center', justifyContent: 'center' },
  successOverlay: { ...StyleSheet.absoluteFillObject, justifyContent: 'center', alignItems: 'center' },
  successContent: { alignItems: 'center' },
  successPts: { fontSize: 48, fontWeight: '800' },
});
