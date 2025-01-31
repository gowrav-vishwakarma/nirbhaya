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
import { ref, onUnmounted } from 'vue';
import { useQuasar } from 'quasar';
import { useI18n } from 'vue-i18n';
import { Jitsi } from 'capacitor-jitsi-meet';

const props = defineProps<{
  sosEventId: number;
}>();

const emit = defineEmits(['audio-closed']);
const $q = useQuasar();
const { t } = useI18n();

const isLoading = ref(false);
const isJoined = ref(false);

const joinConference = async () => {
  try {
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
      startWithAudioMuted: true, // Volunteers start muted
      startWithVideoMuted: true,
      chatEnabled: false,
      inviteEnabled: false,
      displayName: 'Volunteer',
    });

    if (result.success) {
      console.log('Successfully joined Jitsi conference');
      isJoined.value = true;
    }
  } catch (error) {
    console.error('Error joining Jitsi conference:', error);
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
    emit('audio-closed');
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

// Cleanup on unmount
onUnmounted(async () => {
  if (isJoined.value) {
    await leaveConference();
  }
});
</script>
