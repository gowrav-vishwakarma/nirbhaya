import { ref, onMounted, onUnmounted } from 'vue';
import { api } from 'boot/axios';
import { useUserStore } from 'src/stores/user-store';

const userStore = useUserStore();

export function useBackgroundNotifications() {
  const unreadNotificationCount = ref(0);
  let notificationCountInterval: number | null = null;

  const fetchUnreadNotificationCount = async () => {
    if (!userStore.isLoggedIn) {
      return;
    }
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

  onMounted(() => {
    if (userStore.user) {
      startNotificationCountRefresh();
    }
  });

  onUnmounted(() => {
    stopNotificationCountRefresh();
  });

  return {
    unreadNotificationCount,
    fetchUnreadNotificationCount,
    startNotificationCountRefresh,
    stopNotificationCountRefresh,
  };
}
