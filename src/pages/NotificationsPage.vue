<template>
  <q-page padding>
    <h1 class="text-h4 q-mb-md">{{ $t('notifications') }}</h1>
    <q-list v-if="responseData.length > 0" bordered separator>
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
            {{ formatDate(notification.createdAt) }}
          </q-item-label>
          <q-item-label v-if="notification.sosEvent" caption>
            {{ $t('status') }}:
            {{ $t(`sosStatus.${notification.sosEvent.status}`) }}
            <template v-if="notification.sosEvent.location">
              | {{ $t('location') }}:
              {{ formatLocation(notification.sosEvent.location) }}
            </template>
          </q-item-label>
          <q-item-label
            v-if="notification.sosEvent && notification.sosEvent.threat"
            caption
          >
            {{ $t('threat') }}:
            {{ $t(notification.sosEvent.threat) }}
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
  createdAt: string;
  updatedAt: string;
  sosEvent: SosEvent;
}

const $q = useQuasar();
const { unreadNotificationCount, fetchUnreadNotificationCount } =
  useBackgroundNotifications();

const { responseData, validateAndSubmit } = useForm<Notification>(
  api,
  '/auth/notifications',
  {},
  'get'
);

const peerConnection = ref<RTCPeerConnection | null>(null);
const audioContext = ref<AudioContext | null>(null);
const audioSource = ref<AudioBufferSourceNode | null>(null);

const { t } = useI18n();

const isAudioOpen = reactive({});

onMounted(async () => {
  await validateAndSubmit(false);
  initializeWebSocket();
});

onUnmounted(() => {
  closeWebSocket();
  closePeerConnection();
});

// Refresh notifications when unreadNotificationCount changes
watch(unreadNotificationCount, async () => {
  await validateAndSubmit(false);
});

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleString();
};

const formatLocation = (location: { type: string; coordinates: number[] }) => {
  if (location && location.coordinates) {
    return `${location.coordinates[1].toFixed(
      6
    )}, ${location.coordinates[0].toFixed(6)}`;
  }
  return 'Unknown';
};

const getNotificationTitle = (notification: Notification) => {
  const eventType = notification.sosEvent?.threat || 'SOS';
  if (notification.recipientType === 'volunteer') {
    return t('notificationTitles.volunteerNearby', {
      eventType: t(`${eventType}`),
    });
  } else {
    return t('notificationTitles.emergencyContact', {
      eventType: t(`${eventType}`),
    });
  }
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

const initializeWebSocket = () => {
  if (socket) {
    socket.on('webrtc_signal', handleWebRTCSignal);
    socket.on('audio_data', handleAudioData);
  }
};

const closeWebSocket = () => {
  if (socket) {
    socket.off('webrtc_signal', handleWebRTCSignal);
    socket.off('audio_data', handleAudioData);
  }
};

const toggleAudio = async (sosEventId: number) => {
  if (isAudioOpen[sosEventId]) {
    await disconnectAudio(sosEventId);
  } else {
    await connectAudio(sosEventId);
  }
  isAudioOpen[sosEventId] = !isAudioOpen[sosEventId];
};

const connectAudio = async (sosEventId: number) => {
  try {
    console.log('Connecting audio for SOS event:', sosEventId);
    if (Capacitor.isNativePlatform()) {
      await connectNativeAudio(sosEventId);
    } else {
      await connectWebAudio(sosEventId);
    }
    console.log('Audio connection successful');
    $q.notify({
      color: 'positive',
      message: t('audioConnectedSuccess'),
      icon: 'volume_up',
    });
  } catch (error) {
    console.error('Error connecting audio:', error);
    $q.notify({
      color: 'negative',
      message: t('audioConnectedError'),
      icon: 'error',
    });
  }
};

const disconnectAudio = async (sosEventId: number) => {
  // Implement disconnection logic here
  closePeerConnection();
  if (socket) {
    socket.emit('leave_sos_room', sosEventId);
  }
  console.log('Audio disconnected');
};

const connectNativeAudio = async (sosEventId: number) => {
  console.log('Connecting native audio');
  if (socket) {
    socket.emit('join_sos_room', sosEventId);
  }
  audioContext.value = new (window.AudioContext ||
    (window as any).webkitAudioContext)();
  console.log('Native audio context created');
};

const connectWebAudio = async (sosEventId: number) => {
  console.log('Connecting web audio');
  if (socket) {
    socket.emit('join_sos_room', sosEventId);
  }
  await createPeerConnection(sosEventId);
  console.log('Web audio peer connection created');
};

const createPeerConnection = async (sosEventId: number) => {
  console.log('Creating peer connection');
  peerConnection.value = new RTCPeerConnection();

  peerConnection.value.ontrack = (event) => {
    console.log('Received audio track');
    const audioElement = new Audio();
    audioElement.srcObject = event.streams[0];
    audioElement.play();
  };

  peerConnection.value.onicecandidate = (event) => {
    if (event.candidate && socket) {
      console.log('Sending ICE candidate');
      socket.emit('webrtc_signal', {
        sosEventId,
        signal: { type: 'ice_candidate', candidate: event.candidate },
      });
    }
  };

  const offer = await peerConnection.value.createOffer();
  await peerConnection.value.setLocalDescription(offer);

  if (socket) {
    console.log('Sending offer');
    socket.emit('webrtc_signal', {
      sosEventId,
      signal: { type: 'offer', sdp: offer },
    });
  }
};

const handleWebRTCSignal = async (data: {
  sosEventId: string;
  signal: {
    type: string;
    sdp?: RTCSessionDescriptionInit;
    candidate?: RTCIceCandidate;
  };
}) => {
  console.log('Received WebRTC signal:', data);

  if (!peerConnection.value) {
    console.log('Creating new peer connection');
    peerConnection.value = new RTCPeerConnection();

    peerConnection.value.ontrack = (event) => {
      console.log('Received track:', event.track.kind);
      const audioElement = new Audio();
      audioElement.srcObject = event.streams[0];
      audioElement.play().catch(console.error);
      console.log('Started playing audio');
    };
  }

  if (data.signal.type === 'offer' && data.signal.sdp) {
    console.log('Received offer, setting remote description');
    await peerConnection.value.setRemoteDescription(
      new RTCSessionDescription(data.signal.sdp)
    );
    console.log('Creating answer');
    const answer = await peerConnection.value.createAnswer();
    await peerConnection.value.setLocalDescription(answer);
    console.log('Sending answer');
    if (socket) {
      socket.emit('webrtc_signal', {
        sosEventId: data.sosEventId,
        signal: { type: 'answer', sdp: answer },
      });
    }
  } else if (data.signal.type === 'ice_candidate' && data.signal.candidate) {
    console.log('Received ICE candidate, adding to peer connection');
    await peerConnection.value.addIceCandidate(
      new RTCIceCandidate(data.signal.candidate)
    );
  }
};

const handleAudioData = async (data: { audioData: string }) => {
  if (Capacitor.isNativePlatform() && audioContext.value) {
    const arrayBuffer = Uint8Array.from(atob(data.audioData), (c) =>
      c.charCodeAt(0)
    ).buffer;
    const audioBuffer = await audioContext.value.decodeAudioData(arrayBuffer);

    if (audioSource.value) {
      audioSource.value.stop();
    }

    audioSource.value = audioContext.value.createBufferSource();
    audioSource.value.buffer = audioBuffer;
    audioSource.value.connect(audioContext.value.destination);
    audioSource.value.start();
  }
};

const closePeerConnection = () => {
  if (peerConnection.value) {
    peerConnection.value.close();
    peerConnection.value = null;
  }
};
</script>

<style scoped>
h1 {
  color: #333;
}
</style>
