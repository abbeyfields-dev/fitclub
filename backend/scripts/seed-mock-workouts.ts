/**
 * Inserts mock Workout rows using the SQL in seed-mock-workouts.sql.
 * Uses user/team/round IDs and random WorkoutMaster; activityType from master.workoutType,
 * caloriesBurned = met × 70 kg × durationMinutes × 0.0175.
 *
 * Run from backend/: npm run seed:mock-workouts
 * Or: npx ts-node scripts/seed-mock-workouts.ts
 * Requires: DATABASE_URL, WorkoutMaster populated (and optionally MET seeded).
 */

import * as fs from 'fs';
import * as path from 'path';
import prisma from '../src/config/database';

async function main() {
  const sqlPath = path.join(__dirname, 'seed-mock-workouts.sql');
  const sql = fs.readFileSync(sqlPath, 'utf-8').trim();
  const count = await prisma.$executeRawUnsafe(sql);
  console.log('Inserted', count, 'mock workout rows.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
