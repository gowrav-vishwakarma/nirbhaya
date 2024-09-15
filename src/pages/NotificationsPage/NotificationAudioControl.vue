<template>
  <q-btn
    round
    :color="isAudioOpen ? 'primary' : 'grey'"
    :icon="$t('icons.volumeUp')"
    @click="toggleAudio"
  >
    <q-tooltip>{{ $t(isAudioOpen ? 'muteAudio' : 'unmuteAudio') }}</q-tooltip>
  </q-btn>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
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
const audioElements = ref<{ [key: string]: HTMLAudioElement }>({});
const connectedPeers = ref<Set<string>>(new Set());
const isAudioOpen = ref(false);
const isSpeakerOn = ref(false);

onMounted(() => {
  initializePeer();
});

onUnmounted(() => {
  closePeerConnection();
});

const initializePeer = () => {
  peer.value = new Peer(peerId);

  peer.value.on('open', (id) => {
    console.log('Volunteer peer ID is:', id);
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
  });
};

const handlePeersInRoom = (peerIds: string[]) => {
  console.log('Peers in room:', peerIds);
};

const handleRemoteStream = (
  remotePeerId: string,
  remoteStream: MediaStream
) => {
  if (!audioElements.value[remotePeerId]) {
    const audio = new Audio();
    audio.srcObject = remoteStream;
    audio.muted = !isSpeakerOn.value;
    audioElements.value[remotePeerId] = audio;
    if (isSpeakerOn.value) {
      audio.play();
    }
  }
};

const toggleAudio = async () => {
  if (isAudioOpen.value) {
    leaveSosRoom();
  } else {
    joinSosRoom();
  }
  isAudioOpen.value = !isAudioOpen.value;
};

const leaveSosRoom = () => {
  socket.emit('leave_sos_room', {
    peerId: peerId,
    sosEventId: props.sosEventId.toString(),
  });
  Object.values(audioElements.value).forEach((audio) => audio.pause());
  audioElements.value = {};
  connectedPeers.value.clear();
};

const toggleSpeaker = () => {
  isSpeakerOn.value = !isSpeakerOn.value;
  Object.values(audioElements.value).forEach((audio) => {
    audio.muted = !isSpeakerOn.value;
    if (isSpeakerOn.value) {
      audio.play();
    } else {
      audio.pause();
    }
  });
};

const closePeerConnection = () => {
  peer.value?.disconnect();
  peer.value?.destroy();
};

socket.on('peers_in_room', handlePeersInRoom);
</script>
