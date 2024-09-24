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
import { ref, onMounted, onUnmounted, computed } from 'vue';
import { useQuasar } from 'quasar';
import { socket } from 'boot/socket';
import Peer from 'peerjs';
import { useUserStore } from 'src/stores/user-store';
import { useI18n } from 'vue-i18n';

const props = defineProps<{
  sosEventId: number;
}>();

const $q = useQuasar();
const { t } = useI18n();
const userStore = useUserStore();

const peer = ref<Peer | null>(null);
const peerId = ref<string>('');
const isAudioOpen = ref(true);
const sosPeerId = ref<string | null>(null);
const isLoading = ref(false);
const activeSosPeerId = ref<string | null>(null);

const isNavigatorMediaSupported = computed(() => {
  return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
});

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
  try {
    await ensurePeerInitialized();
    joinSosRoom();
    registerSocketEvents();
    startAudioBroadcast(); // Start audio broadcast on page load
  } catch (error) {
    console.error('Error during peer initialization on mount:', error);
  }
});

onUnmounted(() => {
  closePeerConnection();
  unregisterSocketEvents();
  if (socket.connected) {
    console.log('Leaving SOS room');
    socket.emit('leave_sos_room', {
      peerId: peerId.value,
      sosEventId: props.sosEventId,
    });
  } else {
    console.warn('Socket disconnected before leaving SOS room');
  }
});

const initializePeer = () => {
  if (peer.value) return;

  peerId.value = 'sos_' + socket.id;
  peer.value = new Peer(peerId.value);

  peer.value.on('open', (id) => {
    console.log('SOS peer ID is:', id);
  });

  peer.value.on('call', (call) => {
    // Ignore incoming streams
    call.answer();
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
    isSos: true,
  });
};

const handlePeersInRoom = (peerIds: string[]) => {
  console.log('Peers in room:', peerIds);
  peerIds.forEach((peerId) => {
    if (peerId.startsWith('vol_')) {
      callPeer(peerId);
    }
  });
};

const callPeer = async (volPeerId: string) => {
  if (!peer.value) return;

  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const call = peer.value.call(volPeerId, stream);
    // Ignore incoming streams
  } catch (error) {
    console.error('Error calling peer:', error);
  }
};

const startAudioBroadcast = async () => {
  if (!isNavigatorMediaSupported.value) {
    console.error('Navigator media not supported');
    return;
  }

  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    peer.value?.call('volunteer_peer_id', stream); // Replace 'volunteer_peer_id' with actual volunteer peer ID
  } catch (error) {
    console.error('Error starting audio broadcast:', error);
  }
};

const toggleAudio = async () => {
  try {
    isLoading.value = true;
    isAudioOpen.value = !isAudioOpen.value;
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
};

const closePeerConnection = () => {
  peer.value?.disconnect();
  peer.value?.destroy();
  peer.value = null;
};
</script>
