import { ref, onMounted, onUnmounted } from 'vue';
import { api } from 'boot/axios';
import { Capacitor, Plugins } from '@capacitor/core';

const { BackgroundFetch } = Plugins;

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
    notificationCountInterval = setInterval(
      fetchUnreadNotificationCount,
      intervalMs
    );
  };

  const stopNotificationCountRefresh = () => {
    if (notificationCountInterval) {
      clearInterval(notificationCountInterval);
    }
  };

  const setupBackgroundFetch = async () => {
    if (Capacitor.isNativePlatform()) {
      try {
        await BackgroundFetch.configure({
          minimumFetchInterval: 15, // Fetch every 15 minutes
        });

        BackgroundFetch.addListener('backgroundFetch', async () => {
          await fetchUnreadNotificationCount();
          BackgroundFetch.finish({
            fetchResult: BackgroundFetch.BackgroundFetchResult.NewData,
          });
        });
      } catch (error) {
        console.error('Error setting up background fetch:', error);
      }
    }
  };

  onMounted(() => {
    startNotificationCountRefresh();
    setupBackgroundFetch();
  });

  onUnmounted(() => {
    stopNotificationCountRefresh();
  });

  return {
    unreadNotificationCount,
    fetchUnreadNotificationCount,
    startNotificationCountRefresh,
    stopNotificationCountRefresh,
    setupBackgroundFetch,
  };
}
