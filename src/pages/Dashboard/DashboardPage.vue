<template>
  <q-page class="flex flex-center">
    <q-card class="q-pa-lg" style="width: 100%; max-width: 400px">
      <h2 class="text-center q-mb-xl">
        {{ $t('welcome', { name: userName }) }}
      </h2>

      <div class="flex justify-center">
        <q-btn
          round
          color="red"
          size="xl"
          class="sos-button"
          @click="initiateSOSMode"
        >
          <span class="text-h5">SOS</span>
        </q-btn>
      </div>
    </q-card>
  </q-page>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';

const router = useRouter();
const { t } = useI18n();

const userName = ref('User');

const initiateSOSMode = async () => {
  try {
    // TODO: Implement API call to send initial SOS request
    await sendInitialSOSRequest();
    router.push('sos-mode');
  } catch (error) {
    console.error('Failed to send initial SOS request:', error);
    // TODO: Show error message to user
  }
};

const sendInitialSOSRequest = async () => {
  // TODO: Implement actual API call
  console.log('Sending initial SOS request');
};
</script>

<style scoped>
.sos-button {
  width: 150px;
  height: 150px;
}
</style>
