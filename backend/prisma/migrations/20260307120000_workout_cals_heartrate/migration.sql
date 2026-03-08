-- AlterTable WorkoutMaster: add calsPerMinute
ALTER TABLE "WorkoutMaster" ADD COLUMN IF NOT EXISTS "calsPerMinute" DOUBLE PRECISION;

-- AlterTable Workout: add heartRate and caloriesBurned
ALTER TABLE "Workout" ADD COLUMN IF NOT EXISTS "heartRate" INTEGER;
ALTER TABLE "Workout" ADD COLUMN IF NOT EXISTS "caloriesBurned" DOUBLE PRECISION;
