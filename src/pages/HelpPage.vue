<template>
  <q-page class="q-pa-md">
    <h1 class="text-h4 q-mb-md">{{ $t('help') }}</h1>

    <div v-for="section in helpSections" :key="section.id" class="q-mb-lg">
      <h2 :id="section.id" class="text-h5 q-mb-sm">{{ $t(section.title) }}</h2>
      <p>{{ $t(section.content) }}</p>
      <q-btn
        v-if="section.action"
        :label="$t(section.action.label)"
        color="primary"
        @click="section.action.handler"
        class="q-mt-sm"
      />
    </div>
  </q-page>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useQuasar } from 'quasar';
import { useI18n } from 'vue-i18n';
import { Capacitor, Plugins } from '@capacitor/core';
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
      label: 'requestLocationPermission',
      handler: () => requestPermission('location'),
    },
  },
  {
    id: 'camera',
    title: 'cameraPermission',
    content: 'cameraPermissionHelp',
    action: {
      label: 'requestCameraPermission',
      handler: () => requestPermission('camera'),
    },
  },
  {
    id: 'microphone',
    title: 'microphonePermission',
    content: 'microphonePermissionHelp',
    action: {
      label: 'requestMicrophonePermission',
      handler: () => requestPermission('microphone'),
    },
  },
  {
    id: 'notifications',
    title: 'notificationPermission',
    content: 'notificationPermissionHelp',
    action: {
      label: 'requestNotificationPermission',
      handler: () => requestPermission('notifications'),
    },
  },
]);

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

    $q.notify({
      color: 'positive',
      message: t('permissionGranted', { permission: t(permissionName) }),
      icon: 'check',
    });
  } catch (error) {
    console.error(`Error requesting ${permissionName} permission:`, error);
    $q.notify({
      color: 'negative',
      message: t('permissionDenied', { permission: t(permissionName) }),
      icon: 'error',
    });
  }
};

onMounted(() => {
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
