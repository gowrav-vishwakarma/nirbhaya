<template>
  <q-btn
    round
    :color="isAudioOpen ? 'primary' : 'grey'"
    :icon="$t('common.icons.volumeUp')"
    @click="toggleAudio"
    :loading="isLoading"
    v-if="isNavigatorMediaSupported"
  >
    <q-tooltip>{{ $t(isAudioOpen ? 'muteAudio' : 'unmuteAudio') }}</q-tooltip>
  </q-btn>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue';
import { socket } from 'boot/socket';
import { useI18n } from 'vue-i18n';
import { useAudioHandler } from 'src/composables/useAudioHandler';

const { t } = useI18n();
const props = defineProps<{ sosEventId: number }>();

const peerConnection = ref<RTCPeerConnection | null>(null);
const audioElement = ref<HTMLAudioElement | null>(null);
const isAudioOpen = ref(false);
const isLoading = ref(false);
const sosPeerId = ref<string | null>(null);

const { stopAudioStream } = useAudioHandler();
const isNavigatorMediaSupported = computed(() => !!navigator.mediaDevices?.getUserMedia);

const initializeConnection = () => {
  peerConnection.value = new RTCPeerConnection();

  peerConnection.value.ontrack = (event) => {
    handleRemoteStream(event.streams[0]);
  };

  peerConnection.value.onicecandidate = (event: RTCPeerConnectionIceEvent) => {
    if (event.candidate) {
      socket.emit('ice_candidate', { peerId: sosPeerId.value, candidate: event.candidate });
    }
  };
};

const handleRemoteStream = (remoteStream: MediaStream) => { // Specify remoteStream type
  if (!audioElement.value) {
    audioElement.value = new Audio();
    audioElement.value.srcObject = remoteStream;
    audioElement.value.play();
  }
};

const toggleAudio = async () => {
  isLoading.value = true;
  if (!isAudioOpen.value) {
    initializeConnection();
    socket.emit('request_sos_audio', { sosEventId: props.sosEventId });
    isAudioOpen.value = true;
  } else {
    closeConnection();
    isAudioOpen.value = false;
  }
  isLoading.value = false;
};

const closeConnection = () => {
  if (audioElement.value) {
    audioElement.value.pause();
    audioElement.value.srcObject = null;
  }
  if (peerConnection.value) {
    peerConnection.value.close();
    peerConnection.value = null;
  }
};

socket.on('offer', async ({ sosPeerId: remoteSosPeerId, offer }: { sosPeerId: string; offer: RTCSessionDescriptionInit }) => { // Specify parameter types
  sosPeerId.value = remoteSosPeerId;
  if (peerConnection.value) {
    await peerConnection.value.setRemoteDescription(new RTCSessionDescription(offer));
    const answer = await peerConnection.value.createAnswer();
    await peerConnection.value.setLocalDescription(answer);
    socket.emit('answer', { peerId: sosPeerId.value, answer });
  }
});

socket.on('ice_candidate', ({ candidate }: { candidate: RTCIceCandidateInit }) => { // Specify parameter type
  if (peerConnection.value) {
    peerConnection.value.addIceCandidate(new RTCIceCandidate(candidate));
  }
});

onMounted(() => {
  socket.on('sos_audio_started', ({ sosPeerId: remoteSosPeerId }) => {
    sosPeerId.value = remoteSosPeerId;
  });
});

onUnmounted(() => {
  closeConnection();
  stopAudioStream();
});
</script>
