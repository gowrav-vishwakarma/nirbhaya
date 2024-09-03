<template>
  <q-page class="flex flex-center">
    <q-card class="q-pa-lg" style="width: 100%; max-width: 400px">
      <h2 class="text-center q-mb-xl">
        {{ $t('welcome', { name: userName }) }}
      </h2>

      <div class="flex justify-center q-mb-lg">
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

      <!-- Permission checks and buttons -->
      <div v-if="!allPermissionsGranted" class="q-mt-md">
        <h6 class="text-center">{{ $t('missingPermissions') }}</h6>
        <div
          v-for="permission in permissions"
          :key="permission.name"
          class="q-mt-sm"
        >
          <q-btn
            v-if="!permission.granted && !permission.denied"
            :label="$t('request', { permission: $t(permission.name) })"
            color="primary"
            @click="requestPermission(permission.name)"
            class="full-width"
          />
          <q-btn
            v-if="permission.denied"
            :label="$t('helpFor', { permission: $t(permission.name) })"
            color="secondary"
            @click="goToHelp(permission.name)"
            class="full-width"
          />
        </div>
      </div>
    </q-card>
  </q-page>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useUserForm } from 'src/composables/use-user-form';
import { useQuasar } from 'quasar';
import { useI18n } from 'vue-i18n';
import { Capacitor, Plugins } from '@capacitor/core';
import { Geolocation } from '@capacitor/geolocation';
import { Camera } from '@capacitor/camera';
import { usePermissions } from 'src/composables/usePermissions';

const router = useRouter();
const $q = useQuasar();
const { t } = useI18n();

const userName = ref('User');

const {
  permissions,
  allPermissionsGranted,
  checkPermissions,
  requestPermission,
} = usePermissions();

const initiateSOSMode = async () => {
  try {
    await sendInitialSOSRequest();
    router.push('sos-mode');
  } catch (error) {
    console.error('Failed to send initial SOS request:', error);
    $q.notify({
      color: 'negative',
      message: t('sosRequestFailed'),
      icon: 'error',
    });
  }
};

const { validateAndSubmit, callbacks } = useUserForm('auth/sos-location-crud', {
  status: 'created',
});

callbacks.onSuccess = () => {
  console.log('SOS log started');
};

const sendInitialSOSRequest = async () => {
  validateAndSubmit();
  console.log('Sending initial SOS request');
};

onMounted(async () => {
  await checkPermissions();
});

const goToHelp = (permissionName: string) => {
  router.push({ path: '/help', query: { section: permissionName } });
};
</script>

<style scoped>
.sos-button {
  width: 150px;
  height: 150px;
}
</style>
