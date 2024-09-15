<template>
  <q-btn
    round
    :color="isAudioOpen ? 'primary' : 'grey'"
    :icon="$t('icons.volumeUp')"
    @click="toggleAudio"
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

const props = defineProps<{
  sosEventId: number;
}>();

const $q = useQuasar();
const { t } = useI18n();
const userStore = useUserStore();

const peer = ref<Peer | null>(null);
const peerId = 'vol_' + userStore.user.phoneNumber;
const audioElement = ref<HTMLAudioElement | null>(null);
const isAudioOpen = ref(false);
const sosPeerId = ref<string | null>(null);

const isNavigatorMediaSupported = computed(() => {
  return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
});

onMounted(() => {
  initializePeer();
  socket.on('sos_audio_started', handleSosAudioStarted);
  socket.on('sos_audio_stopped', handleSosAudioStopped);
});

onUnmounted(() => {
  closePeerConnection();
  socket.off('sos_audio_started', handleSosAudioStarted);
  socket.off('sos_audio_stopped', handleSosAudioStopped);
});

const initializePeer = () => {
  peer.value = new Peer(peerId);

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
};

const joinSosRoom = () => {
  socket.emit('join_sos_room', {
    peerId: peerId,
    sosEventId: props.sosEventId,
    isSos: false,
  });
};

const handlePeersInRoom = (peerIds: string[]) => {
  console.log('Peers in room:', peerIds);
  const sosPeer = peerIds.find((id) => id.startsWith('sos_'));
  if (sosPeer && sosPeer !== sosPeerId.value) {
    sosPeerId.value = sosPeer;
    if (isAudioOpen.value) {
      connectToSosPeer();
    }
  }
};

const handleRemoteStream = (
  remotePeerId: string,
  remoteStream: MediaStream
) => {
  if (remotePeerId === sosPeerId.value) {
    audioElement.value = new Audio();
    audioElement.value.srcObject = remoteStream;
    audioElement.value.muted = !isAudioOpen.value;
    audioElement.value.play();
  }
};

const toggleAudio = () => {
  isAudioOpen.value = !isAudioOpen.value;
  if (audioElement.value) {
    audioElement.value.muted = !isAudioOpen.value;
  }
  if (isAudioOpen.value && sosPeerId.value) {
    connectToSosPeer();
  }
};

const connectToSosPeer = () => {
  if (sosPeerId.value && peer.value) {
    const call = peer.value.call(sosPeerId.value, null);
    call.on('stream', (remoteStream) => {
      handleRemoteStream(sosPeerId.value!, remoteStream);
    });
  }
};

const handleSosAudioStarted = () => {
  $q.notify({
    message: t('sosAudioStarted'),
    color: 'info',
  });
};

const handleSosAudioStopped = () => {
  $q.notify({
    message: t('sosAudioStopped'),
    color: 'warning',
  });
  if (audioElement.value) {
    audioElement.value.pause();
    audioElement.value = null;
  }
};

const closePeerConnection = () => {
  peer.value?.disconnect();
  peer.value?.destroy();
  if (audioElement.value) {
    audioElement.value.pause();
    audioElement.value = null;
  }
};

socket.on('peers_in_room', handlePeersInRoom);
</script>
