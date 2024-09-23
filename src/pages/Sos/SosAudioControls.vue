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
import Peer from 'peerjs';
import { socket } from 'boot/socket';
import { useUserStore } from 'src/stores/user-store';
import { useAudioHandler } from 'src/composables/useAudioHandler';

const userStore = useUserStore();
const { t } = useI18n();

const props = defineProps<{
  sosEventId: number;
}>();

const isSpeakerOn = ref(true);
const peer = ref<Peer | null>(null);
const peerId = 'sos_' + userStore.user.phoneNumber + '_' + Date.now();
const connectedPeers = ref<Set<string>>(new Set());
const audioElements = ref<{ [key: string]: HTMLAudioElement }>({});

const isNavigatorMediaSupported = computed(() => {
  return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
});

const initializePeer = () => {
  if (peer.value) return;

  peer.value = new Peer(peerId, {
    // debug: 3,
  });

  peer.value.on('open', (id) => {
    console.log('SOS peer ID is:', id);
    joinSosRoom();
  });

  peer.value.on('error', (error) => {
    console.error('PeerJS error:', error);
    // Attempt to reinitialize after a delay
    setTimeout(initializePeer, 5000);
  });

  peer.value.on('call', (call) => {
    console.log('Received call from:', call.peer);
    if (audioStream.value) {
      call.answer(audioStream.value);
      call.on('stream', (remoteStream) => {
        handleRemoteStream(call.peer, remoteStream);
      });
    } else {
      console.error('No audio stream available to answer call');
    }
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
          // Retry connection after a short delay
          setTimeout(() => callPeer(remotePeerId), 2000);
        });
        connectedPeers.value.add(remotePeerId);
        console.log(`Successfully called peer: ${remotePeerId}`);
      } else {
        console.error(
          `Failed to establish call with ${remotePeerId}: Call object is undefined`
        );
        // Retry connection after a short delay
        setTimeout(() => callPeer(remotePeerId), 2000);
      }
    } catch (error) {
      console.error(`Error calling peer ${remotePeerId}:`, error);
      // Retry connection after a short delay
      setTimeout(() => callPeer(remotePeerId), 2000);
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
      audio.play().catch((error) => {
        console.error('Error playing audio:', error);
      });
    }
  } else {
    audioElements.value[remotePeerId].srcObject = remoteStream;
    if (isSpeakerOn.value) {
      audioElements.value[remotePeerId].play().catch((error) => {
        console.error('Error playing audio:', error);
      });
    }
  }
};

const toggleSpeaker = () => {
  isSpeakerOn.value = !isSpeakerOn.value;
  Object.values(audioElements.value).forEach((audio) => {
    audio.muted = !isSpeakerOn.value;
    if (isSpeakerOn.value) {
      audio.play().catch((error) => {
        console.error('Error playing audio:', error);
      });
    } else {
      audio.pause();
    }
  });

  // Reconnect to peers if speaker is turned on
  if (isSpeakerOn.value) {
    reconnectToPeers();
  }
};

const reconnectToPeers = () => {
  connectedPeers.value.forEach((remotePeerId) => {
    if (peer.value && audioStream.value) {
      const call = peer.value.call(remotePeerId, audioStream.value);
      call.on('stream', (remoteStream) => {
        handleRemoteStream(remotePeerId, remoteStream);
      });
      call.on('error', (error) => {
        console.error(`Error in call to ${remotePeerId}:`, error);
      });
    }
  });
};

const { startAudioStream, stopAudioStream, audioStream } = useAudioHandler();

onMounted(async () => {
  await startAudioStream();
  initializePeer();
  socket.on('peers_in_room', handlePeersInRoom);
  socket.emit('sos_audio_started', {
    sosEventId: props.sosEventId,
    peerId: peerId,
  });
});

onUnmounted(() => {
  stopAudioStream();
  socket.off('peers_in_room', handlePeersInRoom);
  peer.value?.destroy();
  peer.value = null;
});
</script>
