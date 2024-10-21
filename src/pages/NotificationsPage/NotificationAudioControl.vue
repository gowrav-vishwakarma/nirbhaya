<template>
  <q-btn
    round
    :color="isAudioOpen ? 'primary' : 'grey'"
    :icon="$t('common.icons.volumeUp')"
    @click="toggleAudio"
    :loading="isLoading"
    :disable="isLoading"
  >
    <q-tooltip>{{ $t(isAudioOpen ? 'muteAudio' : 'unmuteAudio') }}</q-tooltip>
  </q-btn>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue';
import { useQuasar } from 'quasar';
import { socket } from 'boot/socket';
import Peer from 'peerjs';
// import { useUserStore } from 'src/stores/user-store';
import { useI18n } from 'vue-i18n';

const props = defineProps<{
  sosEventId: number;
}>();

const emit = defineEmits(['audio-closed']);

const $q = useQuasar();
const { t } = useI18n();
// const userStore = useUserStore();

const peer = ref<Peer | null>(null);
const peerId = ref<string>('');
const audioElement = ref<HTMLAudioElement | null>(null);
const isAudioOpen = ref(false);
const sosPeerId = ref<string | null>(null);
const isLoading = ref(false);
const activeSosPeerId = ref<string | null>(null);

// const isNavigatorMediaSupported = computed(() => {
//   return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
// });

const registerSocketEvents = () => {
  socket.on('sos_audio_started', handleSosAudioStarted);
  socket.on('sos_audio_stopped', handleSosAudioStopped);
  socket.on('peers_in_room', handlePeersInRoom);
};

const unregisterSocketEvents = () => {
  socket.off('sos_audio_started', handleSosAudioStarted);
  socket.off('sos_audio_stopped', handleSosAudioStopped);
  socket.off('peers_in_room', handlePeersInRoom);
};

onMounted(async () => {
  console.log(
    'NotificationAudioControl mounted for eventId:',
    props.sosEventId
  );
  try {
    await ensurePeerInitialized();
  } catch (error) {
    console.error('Error during peer initialization on mount:', error);
  }
});

onUnmounted(() => {
  closeAudio();
  closePeerConnection();
});

const initializePeer = () => {
  if (peer.value) return;

  peerId.value = 'vol_' + socket.id;
  peer.value = new Peer(peerId.value);

  peer.value.on('open', (id) => {
    console.log('Volunteer peer ID is:', id);
  });

  peer.value.on('call', (call) => {
    call.answer();
    call.on('stream', (remoteStream) => {
      console.log('Received stream from SOS peer');
      handleRemoteStream(call.peer, remoteStream);
    });
  });

  peer.value.on('error', (error) => {
    console.error('PeerJS error:', error);
    // Attempt to reinitialize after a delay
    setTimeout(initializePeer, 5000);
  });
};

const joinSosRoom = () => {
  if (!peer.value) return;

  socket.emit('join_sos_room', {
    peerId: peerId.value,
    sosEventId: props.sosEventId,
    isSos: false,
  });
};

const handlePeersInRoom = (peerIds: string[]) => {
  console.log('Peers in room:', peerIds);
  const sosPeer = peerIds.find((id) => id.startsWith('sos_'));
  if (sosPeer) {
    sosPeerId.value = sosPeer;
  }
};

const handleRemoteStream = (
  remotePeerId: string,
  remoteStream: MediaStream
) => {
  if (!audioElement.value) {
    audioElement.value = new Audio();
  }
  audioElement.value.srcObject = remoteStream;
  audioElement.value.muted = !isAudioOpen.value;
  audioElement.value.play().catch((error) => {
    console.error('Error playing audio:', error);
  });
};

watch(
  () => props.sosEventId,
  () => {
    // When sosEventId changes, reset the audio connection
    closePeerConnection();
    isAudioOpen.value = false;
    initializePeer();
  }
);

const toggleAudio = async () => {
  try {
    isLoading.value = true;
    if (!isAudioOpen.value) {
      await ensurePeerInitialized();
      joinSosRoom();
      registerSocketEvents();
      isAudioOpen.value = true;
      if (audioElement.value) {
        audioElement.value.muted = false;
        audioElement.value.play().catch((error) => {
          console.error('Error playing audio:', error);
        });
      }
    } else {
      closeAudio();
    }
  } catch (error) {
    console.error('Error toggling audio:', error);
    $q.notify({
      color: 'negative',
      message: t('common.errorTogglingAudio'),
      icon: 'warning',
    });
    isAudioOpen.value = false;
  } finally {
    isLoading.value = false;
  }
};

const closeAudio = () => {
  isAudioOpen.value = false;
  if (audioElement.value) {
    audioElement.value.muted = true;
    audioElement.value.pause();
  }
  unregisterSocketEvents();
  socket.emit('leave_sos_room', {
    peerId: peerId.value,
    sosEventId: props.sosEventId,
  });
  emit('audio-closed');
};

const ensurePeerInitialized = async () => {
  if (!peer.value) {
    initializePeer();
    // Wait for the peer to be initialized
    await new Promise<void>((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Peer initialization timed out'));
      }, 20000); // 20 seconds timeout

      const checkPeer = () => {
        if (peer.value && peer.value.id) {
          clearTimeout(timeout);
          resolve();
        } else if (!peer.value) {
          clearTimeout(timeout);
          reject(new Error('Peer initialization failed'));
        } else {
          setTimeout(checkPeer, 100);
        }
      };
      checkPeer();
    });
  }
};

const handleSosAudioStarted = (sosPeerId: string) => {
  activeSosPeerId.value = sosPeerId;
  $q.notify({
    message: t('common.sosAudioStarted'),
    color: 'info',
  });
};

const handleSosAudioStopped = () => {
  activeSosPeerId.value = null;
  $q.notify({
    message: t('common.sosAudioStopped'),
    color: 'warning',
  });
  if (audioElement.value) {
    audioElement.value.pause();
    audioElement.value.srcObject = null;
  }
};

const closePeerConnection = () => {
  peer.value?.disconnect();
  peer.value?.destroy();
  peer.value = null;
  if (audioElement.value) {
    audioElement.value.pause();
    audioElement.value.srcObject = null;
  }
};
</script>
