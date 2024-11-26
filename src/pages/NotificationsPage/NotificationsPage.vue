<template>
  <q-page class="notifications-page q-pa-md">
    <div class="notifications-content">
      <q-card class="notifications-card q-mb-md" style="margin:10px 20px;">
        <q-card-section>
          <div class="text-h5 text-weight-bold q-mb-md">
            {{ $t('common.notifications') }}
          </div>

          <q-inner-loading :showing="isLoading">
            <q-spinner-dots size="50px" color="primary" />
          </q-inner-loading>

          <template v-if="!isLoading">
            <q-list v-if="responseData.length > 0" separator>
              <q-item v-for="notification in responseData" :key="notification.id" class="q-py-md q-ma-none notification-item">
                <q-item-section>
                  <q-card flat bordered class="notification-card">
                    <q-card-section>
                      <div class="notification-header">
                        <q-icon :name="getNotificationIcon(notification)" size="24px" class="notification-icon" />
                        <div class="notification-title">
                          {{ getNotificationTitle(notification) }}
                        </div>
                        <q-chip :color="getStatusColor(notification.sosEvent?.status)" text-color="white" size="sm">
                          {{ $t(`common.sosStatus.${notification.sosEvent?.status}`) }}
                        </q-chip>
                      </div>
                      <div class="notification-time">
                        {{ formatRelativeTime(notification.sosEvent.createdAt) }}
                      </div>
                    </q-card-section>

                    <q-card-section class="q-pa-none">
                      <div v-if="notification.sosEvent?.threat" class="notification-threat">
                        {{ $t('common.threat') }}: <strong>{{ $t(notification.sosEvent.threat) }}</strong>
                      </div>
                      <div v-if="notification.userLocationName && notification.distanceToEvent" class="notification-location">
                        {{ formatDistance(notification.distanceToEvent) }} {{ $t('common.awayFrom') }} {{ notification.userLocationName }}
                      </div>
                    </q-card-section>

                    <q-card-actions align="right" class="q-gutter-sm">
                      <q-btn v-if="notification.status === 'sent'" color="primary" :label="$t('common.accept')" @click="acceptNotification(notification.id)" dense no-caps />
                      <q-btn v-else-if="notification.status === 'accepted'" color="secondary" :label="$t('common.follow')" @click="followLocation(notification.sosEvent.location)" dense no-caps />
                      <AudioControl v-if="notification.status === 'accepted'" :sos-event-id="notification.sosEvent.id" />
                      <q-btn color="negative" :label="$t('common.discard')" @click="discardNotification(notification.id)" flat dense no-caps />
                    </q-card-actions>
                  </q-card>
                </q-item-section>
              </q-item>
            </q-list>
            <div v-else class="no-notifications">
              <p class="text-h6 text-grey-6">
                <q-icon name="notifications_off" size="48px" color="grey-6" />
                {{ $t('common.noNotificationsFound') }}
              </p>
            </div>
          </template>
        </q-card-section>
      </q-card>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, onBeforeUnmount, defineEmits } from 'vue';
import { useForm } from 'src/qnatk/composibles/use-form';
import { api } from 'boot/axios';
import { useQuasar } from 'quasar';
import { useBackgroundNotifications } from 'src/composables/useBackgroundNotifications';
import { useI18n } from 'vue-i18n';
import { useRoute } from 'vue-router';
import AudioControl from './NotificationAudioControl.vue';
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
}

interface Notification {
  id: number;
  eventId: number;
  recipientId: number;
  recipientType: 'volunteer' | 'emergency_contact';
  status: 'sent' | 'received' | 'accepted' | 'ignored';
  userLocationName: string;
  userLocation: {
    x: number;
    y: number;
  };
  distanceToEvent: number;
  createdAt: string;
  updatedAt: string;
  sosEvent: SosEvent;
}

const $q = useQuasar();
const { unreadNotificationCount, fetchUnreadNotificationCount } =
  useBackgroundNotifications();

const { responseData, validateAndSubmit, callbacks, isLoading } =
  useForm<Notification>(api, '/notifications', {}, 'get');

callbacks.onSuccess = () => {
  console.log('Notification accepted');
};

const { t } = useI18n();
const route = useRoute();

onMounted(async () => {
  await validateAndSubmit(false);
});

// Refresh notifications when unreadNotificationCount changes
watch(unreadNotificationCount, async () => {
  await validateAndSubmit(false);
});

// Watch for changes in the query parameters to refresh notifications
watch(
  () => route.query.key,
  async () => {
    await validateAndSubmit(false);
  }
);

const isBlinking = (status: string) => {
  return status === 'active';
};

const getNotificationTitle = (notification: Notification) => {
  const eventType = notification.sosEvent?.threat || 'SOS';
  if (notification.recipientType === 'volunteer') {
    return t('common.notificationTitles.volunteerNearby', {
      eventType: t(`${eventType}`),
    });
  } else if (notification.recipientType === 'emergency_contact') {
    return t(
      notification.sosEvent.contactsOnly
        ? 'common.notificationTitles.contactsOnly'
        : 'common.notificationTitles.emergencyContact',
      {
        eventType: t(`${eventType}`),
        victimName: notification.userLocationName, // Use victim's name here
      }
    );
  }
  return '';
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'active':
      return 'red';
    case 'sent':
      return 'red';
    case 'received':
      return 'red';
    case 'accepted':
      return 'red';
    case 'ignored':
      return 'red';
    default:
      return 'grey';
  }
};

const acceptNotification = async (notificationId: number) => {
  try {
    await api.post(`/notifications/${notificationId}/accept`);
    const index = responseData.value.findIndex((n) => n.id === notificationId);
    if (index !== -1) {
      responseData.value[index].status = 'accepted';
    }
    $q.notify({
      color: 'positive',
      message: t('common.notificationAcceptedSuccess'),
      icon: 'check',
    });
    await fetchUnreadNotificationCount();
  } catch (error) {
    console.error('Error accepting notification:', error);
    $q.notify({
      color: 'negative',
      message: t('common.notificationAcceptedError'),
      icon: 'error',
    });
  }
};

const followLocation = (location: { type: string; coordinates: number[] }) => {
  if (location && location.coordinates) {
    const [lng, lat] = location.coordinates;
    const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
    window.open(url, '_blank');
  } else {
    $q.notify({
      color: 'negative',
      message: t('common.locationNotAvailable'),
      icon: 'error',
    });
  }
};

const formatDistance = (distance: number) => {
  if (distance < 1000) {
    return `${Math.round(distance)} ${t('meters')}`;
  } else {
    return `${(distance / 1000).toFixed(2)} ${t('kilometers')}`;
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
    minute: '2-digit'
  }).format(date);

  // Get relative time string
  let relativeTime: string;
  if (diffInSeconds < 60) {
    relativeTime = t('common.justNow');
  } else {
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) {
      relativeTime = `${diffInMinutes} ${t('minutes Ago')}`;
    } else {
      const diffInHours = Math.floor(diffInMinutes / 60);
      if (diffInHours < 24) {
        const remainingMinutes = diffInMinutes % 60;
        relativeTime = `${diffInHours} ${t('hours And')} ${remainingMinutes} ${t('minutes Ago')}`;
      } else {
        const diffInDays = Math.floor(diffInHours / 24);
        if (diffInDays < 30) {
          const remainingHours = diffInHours % 24;
          relativeTime = `${diffInDays} ${t('days And')} ${remainingHours} ${t('hours Ago')}`;
        } else {
          const diffInMonths = Math.floor(diffInDays / 30);
          if (diffInMonths < 12) {
            relativeTime = `${diffInMonths} ${diffInMonths === 1 ? t('common.monthAgo') : t('common.monthsAgo')}`;
          } else {
            const diffInYears = Math.floor(diffInDays / 365);
            relativeTime = `${diffInYears} ${diffInYears === 1 ? t('common.yearAgo') : t('common.yearsAgo')}`;
          }
        }
      }
    }
  }

  // Return both relative time and formatted date/time
  return `${relativeTime}\n${formattedDateTime}`;
};

const refreshNotifications = async () => {
  await validateAndSubmit(false);
  await fetchUnreadNotificationCount();
};

const discardNotification = async (notificationId: number) => {
  try {
    await api.post(`/notifications/${notificationId}/discard`); // Call the discard API
    responseData.value = responseData.value.filter(
      (n) => n.id !== notificationId
    ); // Remove the discarded notification from the list
    $q.notify({
      color: 'positive',
      message: t('common.notificationDiscardedSuccess'),
      icon: 'check',
    });
  } catch (error) {
    console.error('Error discarding notification:', error);
    $q.notify({
      color: 'negative',
      message: t('common.notificationDiscardedError'),
      icon: 'error',
    });
  }
};


  // Call the function to start refreshing notifications

interface Notification {
  eventId: number;
  // Add other notification properties
}

interface EventResponse {
  id: number;
  status: 'resolved' | 'cancelled' | 'pending';
  // Add other event properties
}

const startNotificationCountRefresh = async (intervalMs = 20000) => {
    const $q = useQuasar();
    const { t } = useI18n();
    console.log('call current notification count');
    if (!userStore.isLoggedIn) {
        return;
    }
    const updateNotifications = async () => {
        try {
            const eventIds = (responseData.value as Notification[])
                .map(notification => notification.eventId)
                .filter(Boolean); // Remove any undefined/null values

            if (!eventIds.length) {
                return;
            }
            const response = await api.post<EventResponse[]>('/sos/current-event-list', {
                data: {
                    eventId: eventIds
                }
            });
            // Update unread count
            unreadNotificationCount.value = response.data.length;
            // Process resolved/cancelled events
            const resolvedEvents = response.data.filter(
                event => event.status === 'resolved' || event.status === 'cancelled'
            );
            if (resolvedEvents.length > 0) {
                // Update notifications state
                resolvedEvents.forEach(resolvedEvent => {
                    // Remove resolved/cancelled notifications
                    responseData.value = responseData.value.filter(
                        notification => notification.eventId !== resolvedEvent.id
                    );
                    // Show notification message
                    const messageKey = resolvedEvent.status === 'cancelled'
                        ? 'common.notificationCancelled'
                        : 'common.notificationResolved';
                    $q.notify({
                        color: 'positive',
                        message: t(messageKey, { eventId: resolvedEvent.id }),
                        icon: 'check',
                        position: 'top',
                        timeout: 10000,
                        actions: [
                            { label: 'Dismiss', color: 'white' }
                        ]
                    });
                });
                // Emit event for parent components if needed
                emit('notifications-updated', responseData.value);
            }
        } catch (error) {
            console.error('Error fetching unread notification count:', error);
            // Show error notification to user
            $q.notify({
                color: 'negative',
                message: t('common.errorFetchingNotifications'),
                icon: 'warning',
                position: 'top',
                timeout: 5000
            });
        }
    };

    // Initial update
    await updateNotifications();

    // Set up interval for subsequent updates
  const intervalId =  setInterval(updateNotifications, intervalMs);

   // Cleanup on component unmount
    onBeforeUnmount(() => {
        if (intervalId) {
            clearInterval(intervalId);
        }
    });
};

// Start the notification refresh
startNotificationCountRefresh();

const getNotificationIcon = (notification: Notification) => {
  // Return an icon name based on the notification type
  return notification.status === 'accepted' ? 'check_circle' : 'warning';
};

const emit = defineEmits(['notifications-updated']);
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
  padding: 5px;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
  }
}

.notification-card {
  border-radius: 10px;
  background-color: #ffffff;
  border: 1px solid #e0e0e0;
  padding: 10px;
}

.notification-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 5px;
}

.notification-title {
  font-weight: bold;
  font-size: 1em;
  color: #333;
}

.notification-time {
  font-size: 0.8em;
  color: #888;
}

.notification-threat {
  font-weight: 700;
  color: #d9534f;
  margin-top: 4px;
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
  margin-right: 8px;
}
</style>
