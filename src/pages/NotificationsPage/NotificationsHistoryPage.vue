<template>
  <q-page class="notifications-page q-pa-md">
    <div class="notifications-content">
      <q-card class="notifications-card q-mb-md" style="margin: 10px 20px">
        <q-card-section>
          <div class="text-h5 text-weight-bold q-mb-md">
            {{ $t('common.notifications') }}
          </div>

          <q-inner-loading :showing="isLoading">
            <q-spinner-dots size="50px" color="primary" />
          </q-inner-loading>

          <template v-if="!isLoading">
            <q-list v-if="responseData.length > 0" class="q-mb-md">
              <q-item v-for="notification in responseData" :key="notification.id"
                class="q-py-md q-ma-none notification-item">
                <q-item-section>
                  <q-card flat bordered class="notification-card">
                    <q-card-section>
                      <div class="notification-header">
                        <q-icon :name="getNotificationIcon(notification)" size="24px" class="notification-icon" />
                        <span class="notification-title">
                          {{ getNotificationTitle(notification) }}
                        </span>
                        <q-space></q-space>
                        <q-chip :color="getStatusColor(notification.status)" text-color="white" size="sm">
                          {{ $t(`common.sosStatus.${notification.status}`) }}
                        </q-chip>
                      </div>
                      <div class="notification-time">
                        {{ formatRelativeTime(notification.createdAt) }}
                      </div>
                    </q-card-section>

                    <q-card-section class="q-pa-none">
                      <div class="notification-threat">
                        {{ $t('common.threat') }}:
                        <strong>{{
                          $t(notification.threat || 'Emergency Alert')
                          }}</strong>
                      </div>
                    </q-card-section>
                  </q-card>
                </q-item-section>
              </q-item>
              <div class="text-center q-mt-md">
                <q-btn v-if="hasMoreItems" color="primary" :loading="isLoadingMore" @click="loadMore"
                  label="Load more" />
              </div>
            </q-list>
            <div v-else class="no-notifications" style="text-align: center">
              <div class="text-h6 text-grey-6">
                <q-icon name="notifications_off" size="48px" color="grey-6" />
                <div>
                  {{ $t('common.noNotificationsFound') }}
                </div>
              </div>
            </div>
          </template>
        </q-card-section>
      </q-card>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, onBeforeUnmount, defineEmits } from 'vue';
import { api } from 'boot/axios';
import { useQuasar } from 'quasar';
import { useBackgroundNotifications } from 'src/composables/useBackgroundNotifications';
import { useI18n } from 'vue-i18n';
import { useRoute } from 'vue-router';
import { useUserStore } from 'src/stores/user-store';
const userStore = useUserStore();

interface SosEvent {
  id: number;
  location: {
    type: string;
    coordinates: number[];
  };
  status: string;
  threat: string | null;
  createdAt: string;
  contactsOnly: boolean;
  user: {
    name: string;
  };
}

const $q = useQuasar();
const { unreadNotificationCount } = useBackgroundNotifications();

const responseData = ref<SosEvent[]>([]);
const isLoading = ref(false);
const limit = ref(10); // Increased to 10 items per page
const offset = ref(0);
const isLoadingMore = ref(false);
const hasMoreItems = ref(true);

const fetchNotifications = async (isLoadMore = false) => {
  if (!isLoadMore) {
    isLoading.value = true;
  }

  try {
    const response = await api.post('/global/contact-sos-events', {
      userId: userStore.user.id,
      limit: limit.value,
      offset: offset.value,
    });

    const newData = response.data || [];

    if (!isLoadMore) {
      responseData.value = newData;
    } else {
      responseData.value = [...responseData.value, ...newData];
    }

    hasMoreItems.value = newData.length === limit.value;
  } catch (error) {
    console.error('Error fetching notifications:', error);
    $q.notify({
      type: 'negative',
      message: t('common.errorLoadingMore'),
      position: 'top',
    });
  } finally {
    isLoading.value = false;
  }
};

const { t } = useI18n();
const route = useRoute();

onMounted(async () => {
  await fetchNotifications();
});

// Refresh notifications when unreadNotificationCount changes
watch(unreadNotificationCount, async () => {
  offset.value = 0;
  await fetchNotifications();
});

// Watch for changes in the query parameters to refresh notifications
watch(
  () => route.query.key,
  async () => {
    offset.value = 0;
    await fetchNotifications();
  }
);

const getNotificationTitle = (notification) => {
  const eventType = notification.threat || 'SOS';

  return t('common.notificationTitles.emergencyContact', {
    eventType: t(`${eventType}`),
    victimName: notification.user.name,
  });
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'resolved':
      return 'green';
    default:
      return 'grey';
  }
};

const formatRelativeTime = (dateString: string) => {
  const now = new Date();
  const date = new Date(dateString);
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  // Format the actual date and time
  const formattedDateTime = new Intl.DateTimeFormat(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);

  // Get relative time string
  let relativeTime: string;
  if (diffInSeconds < 60) {
    relativeTime = 'justNow';
  } else {
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) {
      relativeTime = `${diffInMinutes} minutes Ago`;
    } else {
      const diffInHours = Math.floor(diffInMinutes / 60);
      if (diffInHours < 24) {
        const remainingMinutes = diffInMinutes % 60;
        relativeTime = `${diffInHours} hours And ${remainingMinutes} minutes Ago`;
      } else {
        const diffInDays = Math.floor(diffInHours / 24);
        if (diffInDays < 30) {
          const remainingHours = diffInHours % 24;
          relativeTime = `${diffInDays} 'days And' ${remainingHours} hours Ago`;
        } else {
          const diffInMonths = Math.floor(diffInDays / 30);
          if (diffInMonths < 12) {
            relativeTime = `${diffInMonths} ${diffInMonths === 1 ? 'month Ago' : 'months Ago'
              }`;
          } else {
            const diffInYears = Math.floor(diffInDays / 365);
            relativeTime = `${diffInYears} ${diffInYears === 1 ? 'year Ago' : 'years Ago'
              }`;
          }
        }
      }
    }
  }

  // Return both relative time and formatted date/time
  return `${relativeTime}\n${formattedDateTime}`;
};

const getNotificationIcon = (notification: SosEvent) => {
  // Return an icon name based on the notification type
  return notification.status === 'resolved' ? 'check_circle' : 'warning';
};

const emit = defineEmits(['notifications-updated']);

const loadMore = async () => {
  if (isLoadingMore.value) return;

  isLoadingMore.value = true;
  offset.value += limit.value;

  try {
    await fetchNotifications(true);
  } finally {
    isLoadingMore.value = false;
  }
};
</script>

<style lang="scss" scoped>
.notifications-page {
  background: linear-gradient(135deg, $primary, darken($primary, 20%));
  min-height: 100vh;
  padding: 0;
}

.notifications-content {
  max-width: 600px;
  margin: 0 auto;
}

.notifications-card {
  border-radius: 12px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.notification-item {
  transition: transform 0.3s, box-shadow 0.3s;
  cursor: pointer;
  padding: 1px;

  // &:hover {
  //   transform: translateY(-4px);
  //   box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
  // }
}

.notification-card {
  border-radius: 10px;
  background-color: #ffffff;
  border: 1px solid #e0e0e0;
  padding: 5px;
}

.notification-header {
  display: flex;
  // justify-content: space-between;
  align-items: start;
  margin-bottom: 5px;
  // padding-left: 20px;
}

.notification-title {
  font-weight: bold;
  font-size: 1em;
  color: #333;
  padding-left: 10px;
}

.notification-time {
  font-size: 0.8em;
  color: #888;
}

.notification-threat {
  font-weight: 700;
  color: #d9534f;
  margin-top: 0px;
  margin-left: 15px;
}

.notification-location {
  font-size: 0.9em;
  color: #5bc0de;
  margin-top: 4px;
}

.q-card-actions {
  background-color: rgba(0, 0, 0, 0.03);
  border-top: 1px solid #e0e0e0;
  padding-top: 5px;
}

.no-notifications {
  text-align: left;
  padding: 10px;
}

.notification-icon {
  // padding-left: 20px;
}
</style>
