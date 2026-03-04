import React, { useEffect, useRef } from 'react';
import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import { userService } from '../services/userService';

/**
 * Registers the device push token with the API when the user is authenticated (mobile only).
 * Run once on mount. Failures are silent so the app is not blocked.
 */
export function RegisterPushToken() {
  const done = useRef(false);

  useEffect(() => {
    if (Platform.OS === 'web') return;
    if (done.current) return;

    let cancelled = false;
    (async () => {
      try {
        const { status: existing } = await Notifications.getPermissionsAsync();
        let status = existing;
        if (existing !== 'granted') {
          const { status: requested } = await Notifications.requestPermissionsAsync();
          status = requested;
        }
        if (status !== 'granted' || cancelled) return;

        const tokenResult = await Notifications.getExpoPushTokenAsync({
          projectId: undefined, // uses app.json / app.config.js if needed
        });
        const token = tokenResult?.data?.trim();
        if (!token || cancelled) return;

        await userService.registerPushToken(token, Platform.OS as 'ios' | 'android');
        if (!cancelled) done.current = true;
      } catch {
        // Silent: push registration is best-effort
      }
    })();

    return () => { cancelled = true; };
  }, []);

  return null;
}
