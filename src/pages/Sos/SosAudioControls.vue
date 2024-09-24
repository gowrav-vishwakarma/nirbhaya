<template>
  <div v-if="isNavigatorMediaSupported" class="text-center q-mb-lg">
    <q-btn
      round
      size="xl"
      :color="isSpeakerOn ? 'primary' : 'grey'"
      :icon="$t('common.icons.speaker')"
      @click="toggleSpeaker"
      class="q-ml-sm"
    />
    <div class="text-subtitle1 q-mt-sm">
      {{ $t('common.audioConnected') }}
    </div>
    <div class="text-subtitle1 q-mt-sm">
      {{ isSpeakerOn ? $t('common.speakerOn') : $t('common.speakerOff') }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { socket } from 'boot/socket';
import { useAudioHandler } from 'src/composables/useAudioHandler';

const { t } = useI18n();
const props = defineProps<{ sosEventId: number }>();

const isSpeakerOn = ref(true);
const peerConnections = ref<{ [key: string]: RTCPeerConnection }>({});
const audioElements = ref<{ [key: string]: HTMLAudioElement }>({});
const remoteStreams = ref<{ [key: string]: MediaStream }>({});

const { startAudioStream, stopAudioStream, audioStream } = useAudioHandler();

const isNavigatorMediaSupported = computed(() => !!navigator.mediaDevices?.getUserMedia);

const initializeConnection = (peerId: string) => { // Specify peerId type
  const peerConnection = new RTCPeerConnection();
  peerConnections.value[peerId] = peerConnection;

  // Add the local stream (SOS audio) to the connection
  if (audioStream.value) { // Ensure audioStream is available
    audioStream.value.getTracks().forEach((track: MediaStreamTrack) => { // Specify track type
      peerConnection.addTrack(track, audioStream.value);
    });
  }

  peerConnection.ontrack = (event) => {
    handleRemoteStream(peerId, event.streams[0]);
  };

  peerConnection.onicecandidate = (event) => {
    if (event.candidate) {
      socket.emit('ice_candidate', { peerId, candidate: event.candidate });
    }
  };

  return peerConnection;
};

const handleRemoteStream = (peerId: string, remoteStream: MediaStream) => { // Specify parameter types
  if (!audioElements.value[peerId]) {
    const audio = new Audio();
    audio.srcObject = remoteStream;
    audio.muted = !isSpeakerOn.value;
    audioElements.value[peerId] = audio;
    if (isSpeakerOn.value) audio.play();
    remoteStreams.value[peerId] = remoteStream;
  }
};

const toggleSpeaker = () => {
  isSpeakerOn.value = !isSpeakerOn.value;
  Object.values(audioElements.value).forEach(audio => {
    audio.muted = !isSpeakerOn.value;
    if (isSpeakerOn.value) audio.play();
    else audio.pause();
  });
};

const handlePeersInRoom = (peerIds: string[]) => { // Specify peerIds type
  peerIds.forEach(async (peerId) => {
    if (!peerConnections.value[peerId]) {
      const peerConnection = initializeConnection(peerId);
      const offer = await peerConnection.createOffer();
      await peerConnection.setLocalDescription(offer);
      socket.emit('offer', { peerId, offer });
    }
  });
};

socket.on('answer', async ({ peerId, answer }: { peerId: string; answer: RTCSessionDescriptionInit }) => { // Specify parameter types
  const peerConnection = peerConnections.value[peerId];
  if (peerConnection) {
    await peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
  }
});

socket.on('offer', async ({ peerId, offer }: { peerId: string; offer: RTCSessionDescriptionInit }) => { // Specify parameter types
  const peerConnection = initializeConnection(peerId);
  await peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
  const answer = await peerConnection.createAnswer();
  await peerConnection.setLocalDescription(answer);
  socket.emit('answer', { peerId, answer });
});

socket.on('ice_candidate', ({ peerId, candidate }: { peerId: string; candidate: RTCIceCandidateInit }) => { // Specify parameter types
  const peerConnection = peerConnections.value[peerId];
  if (peerConnection) {
    peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
  }
});

onMounted(async () => {
  await startAudioStream(); // Ensure audio stream is started
  socket.emit('join_sos_room', { sosEventId: props.sosEventId });
  socket.on('peers_in_room', handlePeersInRoom);
});

onUnmounted(() => {
  stopAudioStream();
  Object.values(peerConnections.value).forEach(connection => connection.close());
  socket.emit('leave_sos_room', { sosEventId: props.sosEventId });
});
</script>
