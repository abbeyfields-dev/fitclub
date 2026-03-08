-- Generate mock Workout rows for given user/team/round combinations.
-- Activity type and workoutMasterId come from random WorkoutMaster; caloriesBurned = met × 70 kg × duration × 0.0175.
-- Run with: psql $DATABASE_URL -f scripts/seed-mock-workouts.sql
-- Or: npm run seed:mock-workouts (runs the .ts wrapper)

WITH input_rows(user_id, team_id, round_id) AS (
VALUES
('068e4e4a-875e-4711-bc04-992c8e18c564',11,4),
('0e2fff08-9655-4842-a045-504a82a47470',7,3),
('0e55064d-ca16-4adb-b886-dbc26cb960e7',7,3),
('102b7b3a-dcbb-4d4f-b935-4465e97fabee',7,3),
('15e7eec0-d5bc-4ea5-a455-9f7684683c5b',7,3),
('17a5aaa2-eb65-4c23-a5a3-cefc788f6041',7,3),
('068e4e4a-875e-4711-bc04-992c8e18c564',3,2),
('0cafff15-27f5-4779-a747-f4c07a25f5d2',3,2)
),

random_workouts AS (
SELECT
    i.user_id,
    i.team_id,
    i.round_id,
    wm.id AS workout_master_id,
    wm."workoutType" AS activity_type,
    (20 + floor(random()*80))::int AS duration_minutes
FROM input_rows i
CROSS JOIN generate_series(1,5)
JOIN LATERAL (
    SELECT *
    FROM "WorkoutMaster"
    ORDER BY random()
    LIMIT 1
) wm ON TRUE
)

INSERT INTO "Workout"
(
"id",
"userId",
"roundId",
"activityType",
"durationMinutes",
"distanceKm",
"proofUrl",
"loggedAt",
"createdAt",
notes,
"workoutMasterId",
"heartRate",
"caloriesBurned"
)
SELECT
gen_random_uuid(),
user_id,
round_id,
activity_type,
duration_minutes,
NULL,
NULL,
CURRENT_TIMESTAMP,
CURRENT_TIMESTAMP,
'mock workout',
workout_master_id,
NULL,
ROUND((wm.met * 70 * duration_minutes * 0.0175)::numeric, 0)
FROM random_workouts rw
JOIN "WorkoutMaster" wm
ON wm.id = rw.workout_master_id;
