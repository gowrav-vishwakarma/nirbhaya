<template>
  <q-btn
    round
    :color="isAudioOpen ? 'primary' : 'grey'"
    :icon="$t('common.icons.volumeUp')"
    @click="toggleAudio"
    :loading="isLoading"
    :disable="isLoading"
    v-if="isNavigatorMediaSupported"
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
import { useAudioHandler } from 'src/composables/useAudioHandler';

const props = defineProps<{
  sosEventId: number;
}>();

const $q = useQuasar();
const { t } = useI18n();
const userStore = useUserStore();

const peer = ref<Peer | null>(null);
const peerId = ref<string>('');
const audioElement = ref<HTMLAudioElement | null>(null);
const isAudioOpen = ref(false);
const sosPeerId = ref<string | null>(null);
const isConnecting = ref(false);
const isLoading = ref(false);
const activeSosPeerId = ref<string | null>(null);
const outgoingStream = ref<MediaStream | null>(null);

const isNavigatorMediaSupported = computed(() => {
  return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
});

onMounted(async () => {
  await ensurePeerInitialized();
  socket.on('sos_audio_started', handleSosAudioStarted);
  socket.on('sos_audio_stopped', handleSosAudioStopped);
  socket.on('peers_in_room', handlePeersInRoom);
});

onUnmounted(() => {
  closePeerConnection();
  socket.off('sos_audio_started', handleSosAudioStarted);
  socket.off('sos_audio_stopped', handleSosAudioStopped);
  socket.off('peers_in_room', handlePeersInRoom);
});

const initializePeer = () => {
  if (peer.value) return;

  peerId.value = 'vol_' + userStore.user.phoneNumber;
  peer.value = new Peer(peerId.value);

  peer.value.on('open', (id) => {
    console.log('Volunteer peer ID is:', id);
    joinSosRoom();
  });

  peer.value.on('call', (call) => {
    call.answer(null);
    call.on('stream', (remoteStream) => {
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
  if (remotePeerId === sosPeerId.value) {
    if (!audioElement.value) {
      audioElement.value = new Audio();
    }
    audioElement.value.srcObject = remoteStream;
    audioElement.value.muted = !isAudioOpen.value;
    audioElement.value.play().catch((error) => {
      console.error('Error playing audio:', error);
    });
  }
};

const toggleAudio = async () => {
  try {
    isLoading.value = true;
    if (!isAudioOpen.value) {
      await ensurePeerInitialized();
      await connectToSosPeer();
      isAudioOpen.value = true;
    } else {
      disconnectFromSosPeer();
      isAudioOpen.value = false;
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

const ensurePeerInitialized = async () => {
  if (!peer.value) {
    initializePeer();
    // Wait for the peer to be initialized
    await new Promise<void>((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Peer initialization timed out'));
      }, 10000); // 10 seconds timeout

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

const connectToSosPeer = async () => {
  if (isConnecting.value) return;

  if (activeSosPeerId.value && peer.value) {
    isConnecting.value = true;
    try {
      await startAudioStream();

      const call = peer.value.call(activeSosPeerId.value, audioStream.value!);
      if (!call) {
        throw new Error('Failed to create call object');
      }
      await new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('Call timed out'));
        }, 10000);

        call.on('stream', (remoteStream) => {
          clearTimeout(timeout);
          handleRemoteStream(activeSosPeerId.value!, remoteStream);
          resolve(null);
        });
        call.on('error', (err) => {
          clearTimeout(timeout);
          reject(err);
        });
        call.on('close', () => {
          clearTimeout(timeout);
          reject(new Error('Call closed unexpectedly'));
        });
      });
    } catch (error) {
      console.error('Call error:', error);
      $q.notify({
        color: 'negative',
        message: t('common.errorConnectingToSos'),
        icon: 'warning',
      });
      isAudioOpen.value = false;
      // Retry connection after a short delay
      setTimeout(connectToSosPeer, 2000);
    } finally {
      isConnecting.value = false;
    }
  } else {
    console.log('Waiting for SOS peer to start broadcasting...');
  }
};

const disconnectFromSosPeer = () => {
  if (audioElement.value) {
    audioElement.value.pause();
    audioElement.value.srcObject = null;
  }
  stopAudioStream();
};

const handleSosAudioStarted = (sosPeerId: string) => {
  activeSosPeerId.value = sosPeerId;
  $q.notify({
    message: t('common.sosAudioStarted'),
    color: 'info',
  });
  if (isAudioOpen.value) {
    connectToSosPeer();
  }
};

const handleSosAudioStopped = () => {
  activeSosPeerId.value = null;
  $q.notify({
    message: t('common.sosAudioStopped'),
    color: 'warning',
  });
  disconnectFromSosPeer();
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

const { startAudioStream, stopAudioStream, audioStream } = useAudioHandler();
</script>
