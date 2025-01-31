<template>
  <div>
    <q-btn
      round
      :color="isJoined ? 'primary' : 'grey'"
      :icon="$t('common.icons.volumeUp')"
      @click="toggleConference"
      :loading="isLoading"
      :disable="isLoading"
    >
      <q-tooltip>{{ $t(isJoined ? 'muteAudio' : 'unmuteAudio') }}</q-tooltip>
    </q-btn>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { useQuasar } from 'quasar';
import { useI18n } from 'vue-i18n';
import { Jitsi } from 'capacitor-jitsi-meet';

const props = defineProps<{
  sosEventId: number;
}>();

const emit = defineEmits(['audioStatusChange']);
const $q = useQuasar();
const { t } = useI18n();

const isLoading = ref(false);
const isJoined = ref(false);

window.addEventListener('onParticipantsInfoRetrieved', (data: any) => {
  // do things here
  console.log('participant joined Rakesh', JSON.stringify(data));
});

const joinConference = async () => {
  try {
    const displayName = 'SOS by';
    const roomName = `sosbharat_event_${props.sosEventId}`;
    const result = await Jitsi.joinConference({
      roomName,
      url: process.env.SOS_JISTI_MEET_URL,
      featureFlags: {
        'prejoinpage.enabled': false,
        'recording.enabled': false,
        'live-streaming.enabled': false,
        'android.screensharing.enabled': false,
      },
      startWithAudioMuted: false, // SOS initiator starts unmuted
      startWithVideoMuted: false,
      chatEnabled: false,
      inviteEnabled: false,
      displayName: displayName,
    });

    if (result.success) {
      console.log('Successfully joined Jitsi conference');
      isJoined.value = true;
      emit('audioStatusChange', 'success');
    }
  } catch (error) {
    console.error('Error joining Jitsi conference:', error);
    emit('audioStatusChange', 'error');
    $q.notify({
      color: 'negative',
      message: t('common.errorTogglingAudio'),
      icon: 'warning',
      position: 'top-right',
    });
  }
};

const leaveConference = async () => {
  try {
    await Jitsi.leaveConference();
    isJoined.value = false;
    emit('audioStatusChange', 'pending');
  } catch (error) {
    console.error('Error leaving conference:', error);
  }
};

const toggleConference = async () => {
  isLoading.value = true;
  try {
    if (!isJoined.value) {
      await joinConference();
    } else {
      await leaveConference();
    }
  } catch (error) {
    console.error('Error toggling conference:', error);
    $q.notify({
      color: 'negative',
      message: t('common.errorTogglingAudio'),
      icon: 'warning',
      position: 'top-right',
    });
  } finally {
    isLoading.value = false;
  }
};

// Auto-join conference on mount for SOS initiator
onMounted(async () => {
  await joinConference();
});

// Cleanup on unmount
onUnmounted(async () => {
  if (isJoined.value) {
    await leaveConference();
  }
});
</script>
