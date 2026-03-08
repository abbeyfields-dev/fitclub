import { API_BASE_URL } from '../config/environment';
import { getAuthToken } from '../config/api';

const base = API_BASE_URL.replace(/\/+$/, '');

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = await getAuthToken();
  if (!token) throw new Error('Not authenticated');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
    ...(options.headers as Record<string, string>),
  };
  const res = await fetch(`${base}${path}`, { ...options, headers });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.error || data?.message || `Request failed ${res.status}`);
  return data as T;
}

/** Generic workout type from API (GenericWorkoutMet). Used for activity chips. */
export type WorkoutActivity = {
  id: number;
  workoutType: string;
  metCap: number | null;
  avgMetPerHour: number | null;
  maxMetLimit: number | null;
};

/** WorkoutMaster option for log screen (specific activity with MET). */
export type WorkoutMasterOption = {
  id: number;
  workoutType: string;
  genericWorkoutType: string;
  met: number | null;
};

export type LogWorkoutPayload = {
  workoutMasterId: number;
  durationMinutes: number;
  distanceKm?: number | null;
  heartRate?: number | null;
  proofUrl?: string | null;
  note?: string | null;
  loggedAt?: string; // ISO
};

export const workoutService = {
  /** List generic workout types for the workout screen (activity options). */
  listActivities() {
    return request<{ success: boolean; data: WorkoutActivity[] }>('/workouts/activities');
  },

  /** List WorkoutMaster (all specific activities with MET) for autocomplete picker. */
  listWorkoutMaster() {
    return request<{ success: boolean; data: WorkoutMasterOption[] }>('/workouts/workout-master');
  },

  /** Log a workout for the active round. Returns awarded points. */
  async logWorkout(roundId: string, payload: LogWorkoutPayload): Promise<{ success: boolean; data?: { points: number }; error?: string }> {
    try {
      const res = await request<{ success: boolean; data: { id: string; points: number }; message?: string }>(`/rounds/${roundId}/workouts`, {
        method: 'POST',
        body: JSON.stringify({
          workoutMasterId: payload.workoutMasterId,
          durationMinutes: payload.durationMinutes,
          distanceKm: payload.distanceKm ?? undefined,
          heartRate: payload.heartRate ?? undefined,
          proofUrl: payload.proofUrl ?? undefined,
          note: payload.note ?? undefined,
          loggedAt: payload.loggedAt ?? new Date().toISOString(),
        }),
      });
      return { success: true, data: { points: res.data?.points ?? 0 } };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to log workout';
      return { success: false, error: message };
    }
  },
};
