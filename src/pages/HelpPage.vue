<template>
  <q-page class="q-pa-md">
    <h1 class="text-h4 q-mb-md">{{ $t('help') }}</h1>

    <div v-for="section in helpSections" :key="section.id" class="q-mb-lg">
      <h2 :id="section.id" class="text-h5 q-mb-sm">{{ $t(section.title) }}</h2>
      <p>{{ $t(section.content) }}</p>
      <q-btn
        v-if="section.action"
        :label="
          section.permissionGranted
            ? $t('permissionGranted')
            : $t('requestPermission')
        "
        :color="section.permissionGranted ? 'positive' : 'primary'"
        @click="section.action.handler"
        class="q-mt-sm"
        :disable="section.permissionGranted"
      />
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useQuasar } from 'quasar';
import { useI18n } from 'vue-i18n';
import { Capacitor } from '@capacitor/core';
import { Geolocation } from '@capacitor/geolocation';
import { Camera } from '@capacitor/camera';

const route = useRoute();
const $q = useQuasar();
const { t } = useI18n();

const helpSections = ref([
  {
    id: 'location',
    title: 'locationPermission',
    content: 'locationPermissionHelp',
    action: {
      handler: () => requestPermission('location'),
    },
  },
  {
    id: 'camera',
    title: 'cameraPermission',
    content: 'cameraPermissionHelp',
    action: {
      handler: () => requestPermission('camera'),
    },
  },
  {
    id: 'microphone',
    title: 'microphonePermission',
    content: 'microphonePermissionHelp',
    action: {
      handler: () => requestPermission('microphone'),
    },
  },
  {
    id: 'notifications',
    title: 'notificationPermission',
    content: 'notificationPermissionHelp',
    action: {
      handler: () => requestPermission('notifications'),
    },
  },
]);

const checkPermissionStatus = async (
  permissionName: string
): Promise<boolean> => {
  try {
    if (Capacitor.isNativePlatform()) {
      // ... existing native platform code ...
    } else {
      // Web API fallback
      switch (permissionName) {
        case 'location':
          const result = await navigator.permissions.query({
            name: 'geolocation',
          });
          return result.state === 'granted';
        case 'camera':
        case 'microphone':
          const mediaResult = await navigator.mediaDevices.getUserMedia({
            video: permissionName === 'camera',
            audio: permissionName === 'microphone',
          });
          return !!mediaResult;
        case 'notifications':
          return Notification.permission === 'granted';
        default:
          return false;
      }
    }
  } catch (error) {
    console.error(`Error checking ${permissionName} permission:`, error);
    return false;
  }
};

const updatePermissionStatus = async () => {
  for (const section of helpSections.value) {
    if (section.action) {
      section.permissionGranted = await checkPermissionStatus(section.id);
    }
  }
};

const requestPermission = async (permissionName: string) => {
  try {
    let result;
    if (Capacitor.isNativePlatform()) {
      switch (permissionName) {
        case 'location':
          result = await Geolocation.requestPermissions();
          console.log('Location permission result:', result);
          break;
        case 'camera':
          result = await Camera.requestPermissions();
          console.log('Camera permission result:', result);
          break;
        case 'microphone':
          result = await navigator.mediaDevices.getUserMedia({
            video: false,
            audio: true,
          });
          console.log('Microphone permission result:', result);
          break;
        case 'notifications':
          result = await PushNotifications.requestPermissions();
          console.log('Notifications permission result:', result);
          break;
        // ... other cases ...
      }
    } else {
      // Web API fallback
      // ... existing web API code ...
    }

    // Check the permission status immediately after requesting
    const granted = await checkPermissionStatus(permissionName);

    if (granted) {
      // Update the specific section's permissionGranted status
      const section = helpSections.value.find((s) => s.id === permissionName);
      if (section) {
        section.permissionGranted = true;
      }

      $q.notify({
        color: 'positive',
        message: t('permissionGranted', { permission: t(permissionName) }),
        icon: 'check',
      });
    } else {
      throw new Error('Permission not granted');
    }
  } catch (error) {
    console.error(`Error requesting ${permissionName} permission:`, error);
    $q.notify({
      color: 'negative',
      message: t('permissionDenied', { permission: t(permissionName) }),
      icon: 'error',
    });
  }
  await updatePermissionStatus();
};

onMounted(async () => {
  await updatePermissionStatus();
  const section = route.query.section as string;
  if (section) {
    const element = document.getElementById(section);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
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
