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

const router = useRouter();
const $q = useQuasar();
const { t } = useI18n();

const userName = ref('User');

const permissions = ref([
  { name: 'location', granted: false, denied: false },
  { name: 'camera', granted: false, denied: false },
  { name: 'microphone', granted: false, denied: false },
  { name: 'notifications', granted: false, denied: false },
]);

const allPermissionsGranted = computed(() =>
  permissions.value.every((permission) => permission.granted)
);

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

const requestPermission = async (permissionName: string) => {
  try {
    let result;
    if (Capacitor.isNativePlatform()) {
      switch (permissionName) {
        case 'location':
          result = await Geolocation.requestPermissions();
          break;
        case 'camera':
          result = await Camera.requestPermissions();
          break;
        case 'microphone':
          result = await Plugins.Permissions.requestPermissions({
            permissions: ['microphone'],
          });
          break;
        case 'notifications':
          result = await Plugins.PushNotifications.requestPermission();
          break;
      }
    } else {
      // Web API fallback
      switch (permissionName) {
        case 'location':
          result = await navigator.permissions.query({ name: 'geolocation' });
          break;
        case 'camera':
        case 'microphone':
          result = await navigator.mediaDevices.getUserMedia({
            video: permissionName === 'camera',
            audio: permissionName === 'microphone',
          });
          break;
        case 'notifications':
          result = await Notification.requestPermission();
          break;
      }
    }

    updatePermissionStatus(permissionName, true, false);
    $q.notify({
      color: 'positive',
      message: t('permissionGranted', { permission: t(permissionName) }),
      icon: 'check',
    });
  } catch (error) {
    console.error(`Error requesting ${permissionName} permission:`, error);
    updatePermissionStatus(permissionName, false, true);
    $q.notify({
      color: 'negative',
      message: t('permissionDenied', { permission: t(permissionName) }),
      icon: 'error',
    });
  }
};

const updatePermissionStatus = (
  name: string,
  granted: boolean,
  denied: boolean
) => {
  const index = permissions.value.findIndex((p) => p.name === name);
  if (index !== -1) {
    permissions.value[index].granted = granted;
    permissions.value[index].denied = denied;
  }
};

const goToHelp = (permissionName: string) => {
  router.push({ path: '/help', query: { section: permissionName } });
};

onMounted(async () => {
  // Check initial permission states
  for (const permission of permissions.value) {
    try {
      let result;
      if (Capacitor.isNativePlatform()) {
        switch (permission.name) {
          case 'location':
            result = await Geolocation.checkPermissions();
            updatePermissionStatus(
              permission.name,
              result.location === 'granted',
              result.location === 'denied'
            );
            break;
          case 'camera':
            result = await Camera.checkPermissions();
            updatePermissionStatus(
              permission.name,
              result.camera === 'granted',
              result.camera === 'denied'
            );
            break;
          case 'microphone':
            result = await Plugins.Permissions.query({ name: 'microphone' });
            updatePermissionStatus(
              permission.name,
              result.state === 'granted',
              result.state === 'denied'
            );
            break;
          case 'notifications':
            result = await Plugins.PushNotifications.checkPermissions();
            updatePermissionStatus(
              permission.name,
              result.receive === 'granted',
              result.receive === 'denied'
            );
            break;
        }
      } else {
        // Web API fallback
        if (permission.name === 'location') {
          result = await navigator.permissions.query({ name: 'geolocation' });
          updatePermissionStatus(
            permission.name,
            result.state === 'granted',
            result.state === 'denied'
          );
        } else if (permission.name === 'notifications') {
          updatePermissionStatus(
            permission.name,
            Notification.permission === 'granted',
            Notification.permission === 'denied'
          );
        } else {
          try {
            await navigator.mediaDevices.getUserMedia({
              video: permission.name === 'camera',
              audio: permission.name === 'microphone',
            });
            updatePermissionStatus(permission.name, true, false);
          } catch {
            updatePermissionStatus(permission.name, false, true);
          }
        }
      }
    } catch (error) {
      console.error(`Error checking ${permission.name} permission:`, error);
    }
  }
});
</script>

<style scoped>
.sos-button {
  width: 150px;
  height: 150px;
}
</style>
