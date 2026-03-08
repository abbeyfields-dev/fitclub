/**
 * Backfill ScoreLedger for Workouts that don't have a ledger row, then recompute user_stats and team_stats.
 * Use after bulk-inserting mock Workout rows (e.g. from seed-mock-workouts-bulk.sql).
 *
 * Run: npx ts-node scripts/backfill-score-ledger-and-stats.ts
 */

import prisma from '../src/config/database';

function getDailyCap(round: { scoringConfig: unknown }): number {
  try {
    const config = round.scoringConfig as { dailyCap?: number };
    return typeof config?.dailyCap === 'number' ? config.dailyCap : 100;
  } catch {
    return 100;
  }
}

function calculateRawPoints(durationMinutes: number | null, distanceKm: number | null): number {
  if (distanceKm != null && distanceKm > 0) return Math.round(distanceKm * 5 * 10) / 10;
  if (durationMinutes != null && durationMinutes > 0) return Math.round(durationMinutes * 0.2 * 10) / 10;
  return 0;
}

async function main() {
  const workoutsWithoutLedger = await prisma.workout.findMany({
    where: {
      ScoreLedger: null,
    },
    include: {
      Round: { select: { id: true, clubId: true, scoringConfig: true } },
    },
  });

  console.log('Found', workoutsWithoutLedger.length, 'workouts without ScoreLedger.');

  const dailyCap = 100; // use default for backfill so we don't need per-day logic
  let created = 0;

  for (const w of workoutsWithoutLedger) {
    const rawPoints = calculateRawPoints(w.durationMinutes, w.distanceKm);
    if (rawPoints <= 0) continue;

    const cap = w.Round ? getDailyCap(w.Round) : dailyCap;
    const finalAwardedPoints = Math.min(rawPoints, cap);

    const membership = await prisma.teamMembership.findUnique({
      where: { userId_roundId: { userId: w.userId, roundId: w.roundId } },
      include: { Team: { include: { Memberships: true } } },
    });
    const teamId = membership?.teamId ?? null;

    await prisma.scoreLedger.create({
      data: {
        workoutId: w.id,
        userId: w.userId,
        roundId: w.roundId,
        teamId,
        reasonType: 'workout',
        rawPoints,
        cappedPoints: rawPoints,
        dailyAdjustedPoints: finalAwardedPoints,
        finalAwardedPoints,
        ruleSnapshotJson: JSON.stringify({ source: 'backfill', dailyCap: cap }),
      },
    });
    created++;
  }

  console.log('Created', created, 'ScoreLedger rows.');

  const roundIds = [...new Set(workoutsWithoutLedger.map((w) => w.roundId))];
  const rounds = await prisma.round.findMany({
    where: { id: { in: roundIds } },
    select: { id: true, clubId: true },
  });

  for (const r of rounds) {
    const ledgerByUser = await prisma.scoreLedger.groupBy({
      by: ['userId'],
      where: { roundId: r.id, reasonType: 'workout' },
      _sum: { finalAwardedPoints: true },
      _count: { workoutId: true },
    });

    for (const g of ledgerByUser) {
      const totalCalories = await prisma.workout.aggregate({
        where: { userId: g.userId, roundId: r.id },
        _sum: { caloriesBurned: true },
      });

      await prisma.userStats.upsert({
        where: {
          userId_clubId_roundId: { userId: g.userId, clubId: r.clubId, roundId: r.id },
        },
        create: {
          userId: g.userId,
          clubId: r.clubId,
          roundId: r.id,
          totalPoints: g._sum.finalAwardedPoints ?? 0,
          totalWorkouts: g._count.workoutId,
          totalCalories: totalCalories._sum.caloriesBurned ?? 0,
          streakDays: 0,
          updatedAt: new Date(),
        },
        update: {
          totalPoints: g._sum.finalAwardedPoints ?? 0,
          totalWorkouts: g._count.workoutId,
          totalCalories: totalCalories._sum.caloriesBurned ?? 0,
          updatedAt: new Date(),
        },
      });
    }

    const ledgerByTeam = await prisma.scoreLedger.groupBy({
      by: ['teamId'],
      where: { roundId: r.id, reasonType: 'workout' },
      _sum: { finalAwardedPoints: true },
      _count: { workoutId: true },
    });

    for (const g of ledgerByTeam) {
      if (g.teamId == null) continue;
      const memberCount = await prisma.teamMembership.count({
        where: { teamId: g.teamId, roundId: r.id },
      });
      await prisma.teamStats.upsert({
        where: {
          teamId_roundId: { teamId: g.teamId, roundId: r.id },
        },
        create: {
          teamId: g.teamId,
          clubId: r.clubId,
          roundId: r.id,
          totalPoints: g._sum.finalAwardedPoints ?? 0,
          totalWorkouts: g._count.workoutId,
          memberCount,
          updatedAt: new Date(),
        },
        update: {
          totalPoints: g._sum.finalAwardedPoints ?? 0,
          totalWorkouts: g._count.workoutId,
          memberCount,
          updatedAt: new Date(),
        },
      });
    }
  }

  console.log('Updated user_stats and team_stats for affected rounds.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
