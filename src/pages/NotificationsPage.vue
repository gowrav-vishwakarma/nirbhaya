<template>
  <q-page padding>
    <h1 class="text-h4 q-mb-md">{{ $t('notifications') }}</h1>
    <q-spinner v-if="isLoading" color="primary" />
    <q-list v-if="!isLoading && responseData.length > 0" bordered separator>
      <q-item
        v-for="notification in responseData"
        :key="notification.id"
        class="q-py-md"
      >
        <q-item-section>
          <q-item-label class="text-weight-bold">
            {{ getNotificationTitle(notification) }}
          </q-item-label>
          <q-item-label caption>
            {{ formatRelativeTime(notification.createdAt) }}
          </q-item-label>
          <q-item-label v-if="notification.sosEvent" caption>
            {{ $t('status') }}:
            {{ $t(`sosStatus.${notification.sosEvent.status}`) }}
          </q-item-label>
          <q-item-label
            v-if="notification.sosEvent && notification.sosEvent.threat"
            caption
          >
            {{ $t('threat') }}: {{ $t(notification.sosEvent.threat) }}
          </q-item-label>
          <q-item-label
            v-if="notification.userLocationName && notification.distanceToEvent"
            caption
          >
            {{ formatDistance(notification.distanceToEvent) }}
            {{ $t('awayFrom') }} {{ notification.userLocationName }}
          </q-item-label>
        </q-item-section>
        <q-item-section side v-if="notification.status === 'sent'">
          <q-btn
            color="primary"
            :label="$t('accept')"
            @click="acceptNotification(notification.id)"
          />
        </q-item-section>
        <q-item-section side v-else-if="notification.status === 'accepted'">
          <q-btn-group spread>
            <q-btn
              color="secondary"
              :label="$t('follow')"
              @click="followLocation(notification.sosEvent.location)"
            />
            <q-btn
              round
              :color="
                isAudioOpen[notification.sosEvent.id] ? 'primary' : 'grey'
              "
              :icon="$t('icons.volumeUp')"
              @click="toggleAudio(notification.sosEvent.id)"
            />
          </q-btn-group>
        </q-item-section>
        <q-item-section side v-else>
          <q-chip
            :color="getStatusColor(notification.status)"
            text-color="white"
          >
            {{ $t(`notificationStatus.${notification.status}`) }}
          </q-chip>
        </q-item-section>
      </q-item>
    </q-list>
    <p v-else>{{ $t('noNotificationsFound') }}</p>
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
    return t('notificationTitles.emergencyContact', {
      eventType: t(`${eventType}`),
      victimName: notification.userLocationName, // Use victim's name here
    });
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
  peer.value = new Peer();

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
</script>

<style scoped>
h1 {
  color: #333;
}
</style>
