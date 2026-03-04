import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = 'fitclub_notifications_enabled';

interface NotificationsState {
  enabled: boolean;
  setEnabled: (enabled: boolean) => Promise<void>;
  hydrate: () => Promise<void>;
}

export const useNotificationsStore = create<NotificationsState>((set, get) => ({
  enabled: true,

  setEnabled: async (enabled: boolean) => {
    await AsyncStorage.setItem(KEY, enabled ? '1' : '0');
    set({ enabled });
  },

  hydrate: async () => {
    try {
      const v = await AsyncStorage.getItem(KEY);
      set({ enabled: v !== '0' });
    } catch {
      set({ enabled: true });
    }
  },
}));
