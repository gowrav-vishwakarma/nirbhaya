<template>
  <div v-if="isNavigatorMediaSupported" class="text-center q-mb-lg">
    <q-btn
      round
      size="xl"
      :color="isAudioOpen ? 'primary' : 'grey'"
      :icon="$t('icons.mic')"
      @click="toggleAudio"
    />
    <q-btn
      round
      size="xl"
      v-if="isAudioOpen"
      :color="isSpeakerOn ? 'primary' : 'grey'"
      :icon="$t('icons.speaker')"
      @click="toggleSpeaker"
      class="q-ml-sm"
    />
    <div class="text-subtitle1 q-mt-sm">
      {{ isAudioOpen ? $t('audioConnected') : $t('clickToOpenAudio') }}
    </div>
    <div class="text-subtitle1 q-mt-sm" v-if="isAudioOpen">
      {{ isSpeakerOn ? $t('speakerOn') : $t('speakerOff') }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import Peer from 'peerjs';
import { socket } from 'boot/socket';
import { useUserStore } from 'src/stores/user-store';

const userStore = useUserStore();
const { t } = useI18n();

const props = defineProps<{
  sosEventId: number;
}>();

const isAudioOpen = ref(false);
const isSpeakerOn = ref(true);
const peer = ref<Peer | null>(null);
const peerId = 'sos_' + userStore.user.phoneNumber;
const audioStream = ref<MediaStream | null>(null);
const connectedPeers = ref<Set<string>>(new Set());
const audioElements = ref<{ [key: string]: HTMLAudioElement }>({});

const isNavigatorMediaSupported = computed(() => {
  return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
});

const initializePeer = () => {
  peer.value = new Peer(peerId, {
    // debug: 3,
  });

  peer.value.on('open', (id) => {
    console.log('Victim peer ID is:', id);
  });

  peer.value.on('error', (error) => {
    console.error('PeerJS error:', error);
  });

  peer.value.on('call', (call) => {
    console.log('Received call from:', call.peer);
    call.answer(audioStream.value);
    call.on('stream', (remoteStream) => {
      handleRemoteStream(call.peer, remoteStream);
    });
  });
};

const joinSosRoom = () => {
  socket.emit('join_sos_room', {
    peerId: peerId,
    sosEventId: props.sosEventId,
    isSos: true,
  });
};

const handlePeersInRoom = (peerIds: string[]) => {
  console.log('Peers in room:', peerIds);
  peerIds.forEach((remotePeerId) => {
    if (
      remotePeerId !== peer.value?.id &&
      !connectedPeers.value.has(remotePeerId) &&
      audioStream.value &&
      remotePeerId.startsWith('vol_') // Only call volunteer peers
    ) {
      callPeer(remotePeerId);
    }
  });
};

const callPeer = (remotePeerId: string) => {
  if (audioStream.value && peer.value) {
    try {
      const call = peer.value.call(remotePeerId, audioStream.value);
      if (call) {
        call.on('stream', (remoteStream) => {
          handleRemoteStream(remotePeerId, remoteStream);
        });
        call.on('error', (error) => {
          console.error(`Error in call to ${remotePeerId}:`, error);
        });
        connectedPeers.value.add(remotePeerId);
        console.log(`Successfully called peer: ${remotePeerId}`);
      } else {
        console.error(
          `Failed to establish call with ${remotePeerId}: Call object is undefined`
        );
      }
    } catch (error) {
      console.error(`Error calling peer ${remotePeerId}:`, error);
    }
  } else {
    console.error('Cannot call peer: audioStream or peer is not available');
  }
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
    await stopAudioStream();
    isAudioOpen.value = false;
    socket.emit('sos_audio_stopped', { sosEventId: props.sosEventId });
  } else {
    const success = await startAudioStream();
    if (success) {
      isAudioOpen.value = true;
      joinSosRoom();
      socket.emit('sos_audio_started', { sosEventId: props.sosEventId });
    }
  }
};

const startAudioStream = async (): Promise<boolean> => {
  try {
    audioStream.value = await navigator.mediaDevices.getUserMedia({
      audio: true,
    });
    console.log('Audio stream started successfully');
    return true;
  } catch (error) {
    console.error('Failed to get audio stream:', error);
    return false;
  }
};

const stopAudioStream = async () => {
  if (audioStream.value) {
    audioStream.value.getTracks().forEach((track) => track.stop());
    audioStream.value = null;
  }
  connectedPeers.value.clear();
  Object.values(audioElements.value).forEach((audio) => audio.pause());
  audioElements.value = {};
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

onMounted(() => {
  initializePeer();
  socket.on('peers_in_room', handlePeersInRoom);
});

onUnmounted(() => {
  stopAudioStream();
  socket.off('peers_in_room', handlePeersInRoom);
  peer.value?.destroy();
});
</script>
