-- WorkoutMaster: remove calsPerMinute, add met
ALTER TABLE "WorkoutMaster" DROP COLUMN IF EXISTS "calsPerMinute";
ALTER TABLE "WorkoutMaster" ADD COLUMN IF NOT EXISTS "met" DOUBLE PRECISION;

-- User: add weight (kg) for calories formula
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "weight" DOUBLE PRECISION;
