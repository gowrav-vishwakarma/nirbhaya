<template><span></span></template>

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

const emit = defineEmits(['audioStatusChange']);

const $q = useQuasar();
const { t } = useI18n();
const userStore = useUserStore();

const peer = ref<Peer | null>(null);
const peerId = ref<string>('');
const sosPeerId = ref<string | null>(null);
const activeSosPeerId = ref<string | null>(null);
const stream = ref<MediaStream | null>(null);

const isNavigatorMediaSupported = computed(() => {
  return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
});

onMounted(async () => {
  try {
    await initializeAudioBroadcast();
  } catch (error) {
    console.error('Error during initialization:', error);
    updateAudioStatus('error');
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

const initializeAudioBroadcast = async () => {
  if (!isNavigatorMediaSupported.value) {
    console.error('Navigator media not supported');
    updateAudioStatus('error');
    return;
  }

  try {
    stream.value = await navigator.mediaDevices.getUserMedia({ audio: true });
    await initializePeer();
    joinSosRoom();
    registerSocketEvents();
    updateAudioStatus('success');
  } catch (error) {
    console.error('Error initializing audio broadcast:', error);
    updateAudioStatus('error');
  }
};

const initializePeer = async () => {
  peerId.value = 'sos_' + socket.id;
  peer.value = new Peer(peerId.value);

  return new Promise<void>((resolve, reject) => {
    const timeout = setTimeout(() => {
      reject(new Error('Peer initialization timed out'));
    }, 20000);

    peer.value!.on('open', (id) => {
      console.log('SOS peer ID is:', id);
      clearTimeout(timeout);
      resolve();
    });

    peer.value!.on('call', (call) => {
      call.answer(stream.value!);
    });

    peer.value!.on('error', (error) => {
      console.error('PeerJS error:', error);
      clearTimeout(timeout);
      reject(error);
    });
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

const handlePeersInRoom = (peerIds: string[]) => {
  console.log('Peers in room:', peerIds);
  // Instead of calling peers, we could just log their presence
  peerIds.forEach((peerId) => {
    if (peerId.startsWith('vol_')) {
      console.log('Volunteer peer available:', peerId);
    }
  });
};

// Remove the callPeer function if it's not needed elsewhere

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
  stream.value?.getTracks().forEach((track) => track.stop());
  stream.value = null;
};

const updateAudioStatus = (status: string) => {
  emit('audioStatusChange', status);
};
</script>
