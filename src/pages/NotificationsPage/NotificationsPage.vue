<template>
  <q-page class="notifications-page q-pa-md">
    <div class="notifications-content">
      <q-card class="notifications-card q-mb-md">
        <q-card-section>
          <div class="text-h5 text-weight-bold q-mb-md">
            {{ $t('common.notifications') }}
          </div>

          <q-inner-loading :showing="isLoading">
            <q-spinner-dots size="50px" color="primary" />
          </q-inner-loading>

          <template v-if="!isLoading">
            <q-list v-if="responseData.length > 0" separator>
              <q-item v-for="notification in responseData" :key="notification.id" class="q-py-md q-ma-none"
                style=" padding: 0;">
                <q-item-section class="q-ma-none">
                  <q-card flat bordered class="notification-item">
                    <q-card-section>
                      <div class="row items-center no-wrap">
                        <div class="col">
                          <div class="text-subtitle1 text-weight-medium">
                            {{ getNotificationTitle(notification) }}
                          </div>
                          <div class="text-caption text-grey white-space-pre-line">
                            {{ formatRelativeTime(notification.sosEvent.createdAt) }}
                          </div>
                        </div>
                        <div class="col-auto" style="margin-top: -70px;margin-left: 0px">
                          <q-chip :color="getStatusColor(notification.sosEvent?.status)"
                            :class="{ 'blink': isBlinking(notification.sosEvent?.status) }" text-color="white"
                            size="sm">
                            {{
                              $t(`sosStatus.${notification.sosEvent?.status}`)
                            }}
                          </q-chip>
                        </div>
                      </div>
                    </q-card-section>

                    <q-card-section class="q-pa-none q-px-md">
                      <div style="font-weight: 700;" v-if="notification.sosEvent?.threat" class="text-body2 q-mb-sm">
                        {{ $t('common.threat') }} :
                        <span class="text-weight-medium text-capitalize" style="font-weight: 800;">{{
                          $t(notification.sosEvent.threat)
                          }}</span>
                      </div>
                      <div v-if="
                        notification.userLocationName &&
                        notification.distanceToEvent
                      " class="text-body2">
                        {{ formatDistance(notification.distanceToEvent) }}
                        {{ $t('common.awayFrom') }}
                        {{ notification.userLocationName }}
                      </div>
                    </q-card-section>

                    <q-card-actions align="right" class="q-gutter-sm">
                      <q-btn v-if="notification.status === 'sent'" color="primary" :label="$t('common.accept')"
                        @click="acceptNotification(notification.id)" dense no-caps />
                      <q-btn v-else-if="notification.status === 'accepted'" color="secondary"
                        :label="$t('common.follow')" @click="followLocation(notification.sosEvent.location)" dense
                        no-caps />
                      <AudioControl v-if="notification.status === 'accepted'"
                        :sos-event-id="notification.sosEvent.id" />
                      <q-btn color="negative" :label="$t('common.discard')"
                        @click="discardNotification(notification.id)" flat dense no-caps />
                    </q-card-actions>
                  </q-card>
                </q-item-section>
              </q-item>
            </q-list>
            <div v-else class="text-center q-pa-md">
              <q-icon name="notifications_off" size="48px" color="grey-6" />
              <p class="text-h6 text-grey-6">
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
import { ref, onMounted, watch } from 'vue';
import { useForm } from 'src/qnatk/composibles/use-form';
import { api } from 'boot/axios';
import { useQuasar } from 'quasar';
import { useBackgroundNotifications } from 'src/composables/useBackgroundNotifications';
import { useI18n } from 'vue-i18n';
import { useRoute } from 'vue-router';
import AudioControl from './NotificationAudioControl.vue';

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
</script>

<style lang="scss" scoped>
.notifications-page {
  background: linear-gradient(135deg, $primary, darken($primary, 20%));
  min-height: 100vh;
}

.notifications-content {
  max-width: 600px;
  margin: 0 auto;
}

.notifications-card {
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.notification-item {
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  }
}

.q-card-actions {
  background-color: rgba(0, 0, 0, 0.03);
}

.white-space-pre-line {
  white-space: pre-line;
}

@keyframes blink {
  0% {
    opacity: 1;
  }

  50% {
    opacity: 0.5;
  }

  100% {
    opacity: 1;
  }
}

.blink {
  animation: blink 1.5s infinite;
}
</style>
