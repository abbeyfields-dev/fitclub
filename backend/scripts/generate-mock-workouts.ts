/**
 * Generates seed-mock-workouts-bulk.sql with hundreds of Workout INSERT rows.
 * For each (userId, teamId, roundId) triplet, outputs 5 workouts: random WorkoutMaster 1–180,
 * duration 15–119 min, caloriesBurned = met × 70 × duration × 0.0175.
 *
 * Run: npx ts-node scripts/generate-mock-workouts.ts
 * Then: psql $DATABASE_URL -f scripts/seed-mock-workouts-bulk.sql
 * Or run the SQL via Prisma in a separate script.
 */

import * as fs from 'fs';
import * as path from 'path';

// WorkoutMaster id (1–180) -> [workoutType, met] — same order as seed-workout-master-met.ts
const WORKOUT_MASTER: [string, number][] = [
  ['Generic Workout', 6], ['Workout', 6], ['General Workout', 6], ['Gym Workout', 6], ['Machine Workout', 7],
  ['Machine Workout Misc.', 6], ['Weight Workout', 6], ['Total Body Weights', 6], ['Total Body Other', 6], ['General Total Body', 6],
  ['Mat Workout', 6], ['Home Workout', 6], ['Health Club', 7], ['Gym Misc.', 6], ['General Strength Training', 6],
  ['Lower Body', 6], ['Upper Body', 6], ['Upper Body with Weights Other', 6], ['Lower Body with Weights Other', 6], ['Chest with Weights Other', 6],
  ['Shoulders', 6], ['Shoulders with Weights Other', 6], ['Forearms with Weights Other', 6], ['Abdominals', 6], ['Abs', 6],
  ['Abs Video', 6], ['Biceps', 6], ['Triceps with Weights Other', 6], ['Legs', 6], ['Kettlebell', 6],
  ['Barre Workout', 5.5], ['Pure Barre', 5.5], ['Body Pump', 7], ['CrossFit Class', 10], ['CrossFit Video', 10],
  ['Orangetheory', 9], ['HIIT', 9], ['Tabata', 10], ['Insanity', 10], ['Fit Body Boot Camp', 6], ['Gym Intervals', 6],
  ['Cardiovascular (CV) Circuit Training', 7], ['Resistance Circuit Training', 7], ['Circuit Training', 7], ['Aerobic', 7], ['Aerobics', 7],
  ['Step Aerobics Class', 7], ['Spinning Class', 8], ['Spin', 8], ['Jump Rope', 10], ['Stair Machine', 8],
  ['Climbing Stairs Running', 8], ['Rowing', 7], ['Rowing Machine', 7], ['Elliptical Machine', 6], ['Elliptical Bike', 6],
  ['Incline Trainer', 7], ['Stationary Bike', 6], ['Indoor Bike', 6], ['Indoor Bike Trainer', 6], ['Cross Trainer', 7],
  ['Walk', 4.5], ['General Walk', 4.5], ['Power Walk', 5], ['Casual Walk', 3.5], ['Quick Walking', 4.5],
  ['Long Walk', 4.5], ['Brisk Walk', 5], ['Interval Walk', 5], ['Family Walk', 3.5], ['Group Walk', 3.5],
  ['Dog Walk', 3.5], ['Treadmill Walk', 4.5], ['Indoor Track Walk', 4], ['Hike', 6], ['General Hike', 6],
  ['Hiking Light or No Pack', 6], ['Hiking Medium Pack', 7], ['Hiking Heavy Pack', 9], ['Trekking', 6], ['Stairs', 5],
  ['Climbing Stairs Walking', 5], ['Climbing Stairs Indoor Walking', 5], ['Single Stroller Walk', 4], ['Double Stroller Walk', 4], ['Carrying Child Walk', 4],
  ['Run', 8.4], ['General Run', 8.4], ['Quick Run', 9], ['Long Run', 9], ['Trail Run', 9],
  ['Easy Jog', 7], ['Indoor Run / Jog', 8], ['Indoor Track Run', 8], ['Treadmill Run', 8], ['Interval Run', 10],
  ['Run Race / Event', 10], ['Dog Run', 8], ['Group Run', 8], ['Bike Ride', 5.8], ['Cycling', 5.8], ['Biking', 5.8],
  ['Road Cycling', 7], ['General Road Cycling', 6], ['Road Cycling Indoor', 7], ['Hybrid Cycling', 6], ['General Hybrid Cycling', 6],
  ['Mountain Biking', 8], ['General Mountain Biking', 8], ['Mountain Biking Long Distance', 9], ['Downhill Mountain Biking', 8], ['Track Cycling', 8],
  ['Indoor Bike Ride', 7], ['Electric Bicycle', 4], ['Swim', 6], ['Indoor Swim', 6], ['Lap Swim', 7],
  ['General Lap Swim', 7], ['Open Water Swim', 7], ['Group Swimming', 6], ['Swimming Lessons', 5], ['Swim Class / Aerobics', 6],
  ['Football', 7], ['Football Competitive', 8], ['Football Practice', 6], ['Soccer Sport', 7], ['Indoor Soccer', 7],
  ['Futsal', 8], ['Basketball', 8], ['Cricket', 5], ['Indoor Cricket', 5], ['Volleyball', 4], ['Indoor Volleyball', 4],
  ['Beach Volleyball', 8], ['Field Hockey', 8], ['Handball', 7], ['Tennis', 8], ['Tennis Doubles', 7], ['Badminton', 6],
  ['Squash', 9], ['PickleBall', 5], ['Racquetball', 8], ['Table Tennis', 4], ['Rock Climbing', 8], ['Rock Climbing Outdoor', 8],
  ['Mountaineering', 9], ['Skiing', 7], ['Snorkelling', 5], ['Kayak', 5], ['Whitewater Rafting', 7], ['Adventure Race / Event', 9],
  ['Stand Up Paddling', 6], ['Motorcycle', 2], ['Sports Conditioning', 7], ['Dance', 6], ['Dance Class', 6],
  ['Indoor Dance', 6], ['Classical Dance', 5], ['Latin Dance', 7], ['Zumba', 8], ['Strong by Zumba', 8],
  ['Yoga', 3], ['Yoga Class', 3], ['Yoga General', 3], ['Power Yoga', 5], ['Ashtanga Yoga', 5], ['CorePower Yoga', 5],
  ['Stretch / Sculpt', 2.5], ['Meditation', 1.5], ['Recovery', 2], ['Yard Work', 4], ['Gardening', 4],
  ['Farming', 5], ['Cleaning (Light)', 3], ['House Work', 3], ['Misc Tasks (Light)', 3], ['Vacuuming', 3.5],
  ['Golf', 4], ['Singing', 2], ['Trampoline', 4],
];

const TRIPLETS_RAW = `"068e4e4a-875e-4711-bc04-992c8e18c564" "11" "4"
"0e2fff08-9655-4842-a045-504a82a47470" "7" "3"
"0e55064d-ca16-4adb-b886-dbc26cb960e7" "7" "3"
"102b7b3a-dcbb-4d4f-b935-4465e97fabee" "7" "3"
"15e7eec0-d5bc-4ea5-a455-9f7684683c5b" "7" "3"
"17a5aaa2-eb65-4c23-a5a3-cefc788f6041" "7" "3"
"068e4e4a-875e-4711-bc04-992c8e18c564" "3" "2"
"0cafff15-27f5-4779-a747-f4c07a25f5d2" "3" "2"
"0e2fff08-9655-4842-a045-504a82a47470" "3" "2"
"0e55064d-ca16-4adb-b886-dbc26cb960e7" "3" "2"
"102b7b3a-dcbb-4d4f-b935-4465e97fabee" "3" "2"
"0cafff15-27f5-4779-a747-f4c07a25f5d2" "11" "4"
"15e7eec0-d5bc-4ea5-a455-9f7684683c5b" "3" "2"
"17a5aaa2-eb65-4c23-a5a3-cefc788f6041" "3" "2"
"068e4e4a-875e-4711-bc04-992c8e18c564" "15" "5"
"0cafff15-27f5-4779-a747-f4c07a25f5d2" "15" "5"
"0e2fff08-9655-4842-a045-504a82a47470" "15" "5"
"0e55064d-ca16-4adb-b886-dbc26cb960e7" "15" "5"
"102b7b3a-dcbb-4d4f-b935-4465e97fabee" "15" "5"
"15e7eec0-d5bc-4ea5-a455-9f7684683c5b" "15" "5"
"17a5aaa2-eb65-4c23-a5a3-cefc788f6041" "15" "5"
"198c1c48-78c5-4359-8e9f-418907c95f12" "9" "3"
"0e2fff08-9655-4842-a045-504a82a47470" "11" "4"
"1adc70a0-58c6-47df-9dc2-3d3d2a19a82c" "9" "3"
"1d3fd620-32a6-4c8f-8830-e275a4294882" "9" "3"
"1dd53d12-20dc-4428-ad82-115b196b3117" "9" "3"
"1f17e612-9b90-4ce8-9e6f-4a96714d6625" "9" "3"
"210a8081-37c1-4740-a2af-660ffb2b23f8" "9" "3"
"198c1c48-78c5-4359-8e9f-418907c95f12" "13" "5"
"1adc70a0-58c6-47df-9dc2-3d3d2a19a82c" "13" "5"
"1d3fd620-32a6-4c8f-8830-e275a4294882" "13" "5"
"1dd53d12-20dc-4428-ad82-115b196b3117" "13" "5"
"1f17e612-9b90-4ce8-9e6f-4a96714d6625" "13" "5"
"0e55064d-ca16-4adb-b886-dbc26cb960e7" "11" "4"
"210a8081-37c1-4740-a2af-660ffb2b23f8" "13" "5"
"227833fe-9019-4d48-9731-8bc111b910b1" "6" "3"
"2346001b-c414-44da-91d3-74ffbf047f67" "6" "3"
"272681d7-4e62-4823-ad21-3c7b332fd781" "6" "3"
"2769a6b2-9939-413c-b643-95ffe7afc4c7" "6" "3"
"227833fe-9019-4d48-9731-8bc111b910b1" "2" "2"
"2346001b-c414-44da-91d3-74ffbf047f67" "2" "2"
"272681d7-4e62-4823-ad21-3c7b332fd781" "2" "2"
"2769a6b2-9939-413c-b643-95ffe7afc4c7" "2" "2"
"28d81377-ffac-4a13-af2d-2941ee939b64" "8" "3"
"102b7b3a-dcbb-4d4f-b935-4465e97fabee" "11" "4"
"2aa14e16-62f5-490c-acc9-be14d95d21da" "8" "3"
"3016829c-1d44-47b1-adb3-8c2e22e59bdb" "8" "3"
"28d81377-ffac-4a13-af2d-2941ee939b64" "10" "4"
"2aa14e16-62f5-490c-acc9-be14d95d21da" "10" "4"
"3016829c-1d44-47b1-adb3-8c2e22e59bdb" "10" "4"
"28d81377-ffac-4a13-af2d-2941ee939b64" "14" "5"
"2aa14e16-62f5-490c-acc9-be14d95d21da" "14" "5"
"3016829c-1d44-47b1-adb3-8c2e22e59bdb" "14" "5"
"31433625-e6b9-42ba-ab16-8c003fc92f1a" "16" "5"
"39049238-c6e7-45eb-9b6a-9d048e93cbb0" "16" "5"
"15e7eec0-d5bc-4ea5-a455-9f7684683c5b" "11" "4"
"31433625-e6b9-42ba-ab16-8c003fc92f1a" "12" "4"
"39049238-c6e7-45eb-9b6a-9d048e93cbb0" "12" "4"
"31433625-e6b9-42ba-ab16-8c003fc92f1a" "4" "2"
"39049238-c6e7-45eb-9b6a-9d048e93cbb0" "4" "2"
"3aac5d72-b056-4d07-9cf3-5a5eab474a9d" "17" "5"
"3bd09ada-4e3b-44b9-b1e4-ea651ffe8fb2" "17" "5"
"3cf813ed-22e3-4bdf-8b0f-f345bb1af5b8" "17" "5"
"3d9504d8-3ef3-433f-bbae-df61fad6efac" "17" "5"
"406fec07-8fb1-4e10-995a-ba5a22126665" "17" "5"
"453494ae-9345-4269-a21f-eedec49d6651" "17" "5"
"17a5aaa2-eb65-4c23-a5a3-cefc788f6041" "11" "4"
"47218058-72de-45ba-a71a-9947d8906d35" "17" "5"
"4c24b44d-5335-43bc-a1df-d33809d6db88" "17" "5"
"50f48cd0-b29a-4ebd-a614-cad76a517f88" "17" "5"
"545ad37a-49f2-4da2-a02e-d35136b011fe" "17" "5"
"2aa14e16-62f5-490c-acc9-be14d95d21da" "24" "7"
"3016829c-1d44-47b1-adb3-8c2e22e59bdb" "24" "7"
"3104c45d-2857-4645-8d66-b4216e8daf1d" "24" "7"
"31433625-e6b9-42ba-ab16-8c003fc92f1a" "24" "7"
"39049238-c6e7-45eb-9b6a-9d048e93cbb0" "24" "7"
"3aac5d72-b056-4d07-9cf3-5a5eab474a9d" "24" "7"
"068e4e4a-875e-4711-bc04-992c8e18c564" "7" "3"
"0cafff15-27f5-4779-a747-f4c07a25f5d2" "7" "3"`;

function escapeSql(s: string): string {
  return "'" + s.replace(/'/g, "''") + "'";
}

function parseTriplets(raw: string): [string, string, string][] {
  const out: [string, string, string][] = [];
  const parts = raw.match(/"([^"]*)"/g);
  if (!parts) return out;
  for (let i = 0; i + 2 < parts.length; i += 3) {
    out.push([
      parts[i].slice(1, -1),
      parts[i + 1].slice(1, -1),
      parts[i + 2].slice(1, -1),
    ]);
  }
  return out;
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function main() {
  const triplets = parseTriplets(TRIPLETS_RAW);
  const WORKOUTS_PER_TRIPLET = 5;
  const WEIGHT_KG = 70;

  const rows: string[] = [];
  for (const [userId, _teamId, roundId] of triplets) {
    for (let w = 0; w < WORKOUTS_PER_TRIPLET; w++) {
      const wmIndex = randomInt(0, WORKOUT_MASTER.length - 1);
      const [activityType, met] = WORKOUT_MASTER[wmIndex];
      const workoutMasterId = wmIndex + 1;
      const durationMinutes = randomInt(15, 119);
      const caloriesBurned =
        met != null ? Math.round(met * WEIGHT_KG * durationMinutes * 0.0175) : 'NULL';

      const row = [
        'gen_random_uuid()',
        escapeSql(userId),
        escapeSql(roundId),
        escapeSql(activityType),
        durationMinutes,
        'NULL',
        'NULL',
        'CURRENT_TIMESTAMP',
        'CURRENT_TIMESTAMP',
        escapeSql('mock workout'),
        workoutMasterId,
        'NULL',
        caloriesBurned === 'NULL' ? 'NULL' : String(caloriesBurned),
      ].join(', ');
      rows.push('(' + row + ')');
    }
  }

  const header = `-- Generated by scripts/generate-mock-workouts.ts — ${rows.length} mock Workout rows.
-- caloriesBurned = met × 70 kg × durationMinutes × 0.0175. Duration 15–119 min.

INSERT INTO public."Workout"(
  id, "userId", "roundId", "activityType", "durationMinutes", "distanceKm", "proofUrl",
  "loggedAt", "createdAt", notes, "workoutMasterId", "heartRate", "caloriesBurned"
)
VALUES
`;
  const sql = header + rows.join(',\n') + ';\n';
  const outPath = path.join(__dirname, 'seed-mock-workouts-bulk.sql');
  fs.writeFileSync(outPath, sql, 'utf-8');
  console.log('Wrote', rows.length, 'rows to', outPath);
}

main();
