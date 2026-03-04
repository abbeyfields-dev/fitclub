import { API_BASE_URL } from '../config/environment';
import { getAuthToken } from '../config/api';

const base = API_BASE_URL.replace(/\/+$/, '');

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = await getAuthToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${base}${path}`, { ...options, headers });
  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error((data as { error?: string })?.error || `Request failed ${res.status}`);
  }
  return data as T;
}

export const userService = {
  async registerPushToken(pushToken: string, platform?: 'ios' | 'android') {
    return request<{ success: boolean }>('/users/me/push-token', {
      method: 'POST',
      body: JSON.stringify({ token: pushToken, platform }),
    });
  },
};
