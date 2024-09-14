<template>
  <q-page class="notifications-page q-pa-md">
    <div class="notifications-content">
      <q-card class="notifications-card q-mb-md">
        <q-card-section>
          <div class="text-h5 text-weight-bold q-mb-md">
            {{ $t('notifications') }}
          </div>

          <q-inner-loading :showing="isLoading">
            <q-spinner-dots size="50px" color="primary" />
          </q-inner-loading>

          <template v-if="!isLoading">
            <q-list v-if="responseData.length > 0" separator>
              <q-item
                v-for="notification in responseData"
                :key="notification.id"
                class="q-py-md"
              >
                <q-item-section>
                  <q-card flat bordered class="notification-item">
                    <q-card-section>
                      <div class="row items-center no-wrap">
                        <div class="col">
                          <div class="text-subtitle1 text-weight-medium">
                            {{ getNotificationTitle(notification) }}
                          </div>
                          <div class="text-caption text-grey">
                            {{ formatRelativeTime(notification.createdAt) }}
                          </div>
                        </div>
                        <div class="col-auto">
                          <q-chip
                            :color="
                              getStatusColor(notification.sosEvent?.status)
                            "
                            text-color="white"
                            size="sm"
                          >
                            {{
                              $t(`sosStatus.${notification.sosEvent?.status}`)
                            }}
                          </q-chip>
                        </div>
                      </div>
                    </q-card-section>

                    <q-card-section>
                      <div
                        v-if="notification.sosEvent?.threat"
                        class="text-body2 q-mb-sm"
                      >
                        {{ $t('threat') }}:
                        <span class="text-weight-medium">{{
                          $t(notification.sosEvent.threat)
                        }}</span>
                      </div>
                      <div
                        v-if="
                          notification.userLocationName &&
                          notification.distanceToEvent
                        "
                        class="text-body2"
                      >
                        {{ formatDistance(notification.distanceToEvent) }}
                        {{ $t('awayFrom') }} {{ notification.userLocationName }}
                      </div>
                    </q-card-section>

                    <q-card-actions align="right" class="q-gutter-sm">
                      <q-btn
                        v-if="notification.status === 'sent'"
                        color="primary"
                        :label="$t('accept')"
                        @click="acceptNotification(notification.id)"
                        dense
                        no-caps
                      />
                      <q-btn
                        v-else-if="notification.status === 'accepted'"
                        color="secondary"
                        :label="$t('follow')"
                        @click="followLocation(notification.sosEvent.location)"
                        dense
                        no-caps
                      />
                      <q-btn
                        v-if="notification.status === 'accepted'"
                        round
                        :color="
                          isAudioOpen[notification.sosEvent.id]
                            ? 'primary'
                            : 'grey'
                        "
                        :icon="$t('icons.volumeUp')"
                        @click="toggleAudio(notification.sosEvent.id)"
                      >
                        <q-tooltip>{{
                          $t(
                            isAudioOpen[notification.sosEvent.id]
                              ? 'muteAudio'
                              : 'unmuteAudio'
                          )
                        }}</q-tooltip>
                      </q-btn>
                      <q-btn
                        color="negative"
                        :label="$t('discard')"
                        @click="discardNotification(notification.id)"
                        flat
                        dense
                        no-caps
                      />
                    </q-card-actions>
                  </q-card>
                </q-item-section>
              </q-item>
            </q-list>
            <div v-else class="text-center q-pa-md">
              <q-icon name="notifications_off" size="48px" color="grey-6" />
              <p class="text-h6 text-grey-6">
                {{ $t('noNotificationsFound') }}
              </p>
            </div>
          </template>
        </q-card-section>
      </q-card>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, reactive } from 'vue';
import { useForm } from 'src/qnatk/composibles/use-form';
import { api } from 'boot/axios';
import { useQuasar } from 'quasar';
import { useBackgroundNotifications } from 'src/composables/useBackgroundNotifications';
import { Capacitor } from '@capacitor/core';
import { VoiceRecorder } from 'capacitor-voice-recorder';
import { socket } from 'boot/socket';
import { useI18n } from 'vue-i18n';
import { useRoute } from 'vue-router';
import Peer from 'peerjs';
import { useUserStore } from 'src/stores/user-store';

interface SosEvent {
  id: number;
  location: {
    type: string;
    coordinates: number[];
  };
  status: string;
  threat: string | null;
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
  useForm<Notification>(api, '/auth/notifications', {}, 'get');

callbacks.onSuccess = () => {
  console.log('Notification accepted');
};

const peer = ref<Peer | null>(null);
const isAudioOpen = reactive({});
const audioElements = reactive({}); // Store audio elements by peer ID

const userStore = useUserStore();
const { t } = useI18n();

const route = useRoute();

onMounted(async () => {
  await validateAndSubmit(false);
  initializePeer();
});

onUnmounted(() => {
  closePeerConnection();
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

const getNotificationTitle = (notification: Notification) => {
  const eventType = notification.sosEvent?.threat || 'SOS';
  if (notification.recipientType === 'volunteer') {
    return t('notificationTitles.volunteerNearby', {
      eventType: t(`${eventType}`),
    });
  } else if (notification.recipientType === 'emergency_contact') {
    return t(
      notification.sosEvent.contactsOnly
        ? 'notificationTitles.contactsOnly'
        : 'notificationTitles.emergencyContact',
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
    case 'sent':
      return 'blue';
    case 'received':
      return 'orange';
    case 'accepted':
      return 'green';
    case 'ignored':
      return 'red';
    default:
      return 'grey';
  }
};

const acceptNotification = async (notificationId: number) => {
  try {
    await api.post(`/auth/notifications/${notificationId}/accept`);
    const index = responseData.value.findIndex((n) => n.id === notificationId);
    if (index !== -1) {
      responseData.value[index].status = 'accepted';
    }
    $q.notify({
      color: 'positive',
      message: t('notificationAcceptedSuccess'),
      icon: 'check',
    });
    await fetchUnreadNotificationCount();
    await connectAudio(responseData.value[index].sosEvent.id); // Connect audio when notification is accepted
  } catch (error) {
    console.error('Error accepting notification:', error);
    $q.notify({
      color: 'negative',
      message: t('notificationAcceptedError'),
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
      message: t('locationNotAvailable'),
      icon: 'error',
    });
  }
};

const initializePeer = () => {
  peer.value = new Peer(userStore.user.phoneNumber);

  peer.value.on('open', (id) => {
    console.log('My peer ID is: ' + id);
  });

  peer.value.on('call', (call) => {
    navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then((stream) => {
        call.answer(stream);
        call.on('stream', (remoteStream) => {
          const audio = new Audio();
          audio.srcObject = remoteStream;
          audio.play();
        });
      })
      .catch((err) => console.error('Failed to get local stream', err));
  });
};

const toggleAudio = async (sosEventId: number) => {
  if (isAudioOpen[sosEventId]) {
    await disconnectAudio(sosEventId); // Ensure to disconnect audio
  } else {
    await connectAudio(sosEventId);
  }
  isAudioOpen[sosEventId] = !isAudioOpen[sosEventId];
};

const connectAudio = async (sosEventId: number) => {
  const sosEventIdString = sosEventId.toString();
  socket.emit('join_sos_room', sosEventIdString);
  socket.emit('register_peer', {
    peerId: peer.value?.id,
    sosEventId: sosEventIdString,
  });
  socket.emit('get_peers_in_room', sosEventIdString);
};

const disconnectAudio = async (sosEventId: number) => {
  closePeerConnection();
  if (socket) {
    socket.emit('leave_sos_room', sosEventId);
  }
  console.log('Audio disconnected');
};

const closePeerConnection = () => {
  if (peer.value) {
    peer.value.destroy();
    peer.value = null;
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

  if (diffInSeconds < 60) {
    return t('justNow');
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes} ${t('minutesAgo')}`;
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    const remainingMinutes = diffInMinutes % 60;
    return `${diffInHours} ${t('hoursAnd')} ${remainingMinutes} ${t(
      'minutesAgo'
    )}`;
  }

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 30) {
    const remainingHours = diffInHours % 24;
    return `${diffInDays} ${t('daysAnd')} ${remainingHours} ${t('hoursAgo')}`;
  }

  const diffInMonths = Math.floor(diffInDays / 30);
  if (diffInMonths < 12) {
    return `${diffInMonths} ${
      diffInMonths === 1 ? t('monthAgo') : t('monthsAgo')
    }`;
  }

  const diffInYears = Math.floor(diffInDays / 365);
  return `${diffInYears} ${diffInYears === 1 ? t('yearAgo') : t('yearsAgo')}`;
};

const refreshNotifications = async () => {
  await validateAndSubmit(false);
  await fetchUnreadNotificationCount();
};

socket.on('peers_in_room', (peerIds: string[]) => {
  navigator.mediaDevices
    .getUserMedia({ audio: true })
    .then((stream) => {
      peerIds.forEach((peerId) => {
        if (peerId !== peer.value?.id) {
          const call = peer.value?.call(peerId, stream);
          call?.on('stream', (remoteStream) => {
            const audio = new Audio();
            audio.srcObject = remoteStream;
            audio.play();
            audioElements[peerId] = audio; // Store the audio element
          });
        }
      });
    })
    .catch((err) => console.error('Failed to get local stream', err));
});

socket.on('peer_left', (peerId: string) => {
  if (peerId !== peer.value?.id) {
    console.log(`Peer ${peerId} has left the room. Stopping audio.`);
    if (audioElements[peerId]) {
      audioElements[peerId].pause(); // Stop the audio
      delete audioElements[peerId]; // Remove the reference
    }
  }
});

const discardNotification = async (notificationId: number) => {
  try {
    await api.post(`/auth/notifications/${notificationId}/discard`); // Call the discard API
    responseData.value = responseData.value.filter(
      (n) => n.id !== notificationId
    ); // Remove the discarded notification from the list
    $q.notify({
      color: 'positive',
      message: t('notificationDiscardedSuccess'),
      icon: 'check',
    });
  } catch (error) {
    console.error('Error discarding notification:', error);
    $q.notify({
      color: 'negative',
      message: t('notificationDiscardedError'),
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
</style>
