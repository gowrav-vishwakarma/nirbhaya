import { ref, onMounted, onUnmounted } from 'vue';
import { api } from 'boot/axios';
import { Capacitor } from '@capacitor/core';
import { BackgroundRunner } from '@capacitor/background-runner';

export function useBackgroundNotifications() {
  const unreadNotificationCount = ref(0);
  let notificationCountInterval: number | null = null;

  const fetchUnreadNotificationCount = async () => {
    try {
      const response = await api.get('/auth/notifications/unread-count');
      unreadNotificationCount.value = response.data;
    } catch (error) {
      console.error('Error fetching unread notification count:', error);
    }
  };

  const startNotificationCountRefresh = (intervalMs = 60000) => {
    fetchUnreadNotificationCount(); // Fetch immediately
    notificationCountInterval = window.setInterval(
      fetchUnreadNotificationCount,
      intervalMs
    );
  };

  const stopNotificationCountRefresh = () => {
    if (notificationCountInterval) {
      window.clearInterval(notificationCountInterval);
    }
  };

  const setupBackgroundRunner = async () => {
    if (Capacitor.isNativePlatform()) {
      try {
        await BackgroundRunner.requestPermissions();

        // The actual background task will be defined in a separate file
        // as specified in the capacitor.config.ts

        // We can dispatch the event manually if needed
        await BackgroundRunner.dispatchEvent({
          label: 'com.example.notifications',
          event: 'fetchNotifications',
          details: {},
        });
      } catch (error) {
        console.error('Error setting up background runner:', error);
      }
    }
  };

  onMounted(() => {
    startNotificationCountRefresh();
    setupBackgroundRunner();
  });

  onUnmounted(() => {
    stopNotificationCountRefresh();
  });

  return {
    unreadNotificationCount,
    fetchUnreadNotificationCount,
    startNotificationCountRefresh,
    stopNotificationCountRefresh,
    setupBackgroundRunner,
  };
}
