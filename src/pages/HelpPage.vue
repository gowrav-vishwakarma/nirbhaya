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
import { PushNotifications } from '@capacitor/push-notifications';

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
    permissionGranted: false,
  },
  {
    id: 'camera',
    title: 'cameraPermission',
    content: 'cameraPermissionHelp',
    action: {
      handler: () => requestPermission('camera'),
    },
    permissionGranted: false,
  },
  {
    id: 'microphone',
    title: 'microphonePermission',
    content: 'microphonePermissionHelp',
    action: {
      handler: () => requestPermission('microphone'),
    },
    permissionGranted: false,
  },
  {
    id: 'notifications',
    title: 'notificationPermission',
    content: 'notificationPermissionHelp',
    action: {
      handler: () => requestPermission('notifications'),
    },
    permissionGranted: false,
  },
]);

const checkPermissionStatus = async (
  permissionName: string
): Promise<boolean> => {
  try {
    switch (permissionName) {
      case 'location':
        const { location } = await Geolocation.checkPermissions();
        return location === 'granted';
      case 'camera':
        const { camera } = await Camera.checkPermissions();
        return camera === 'granted';
      case 'microphone':
        const { microphone } = await Camera.checkPermissions();
        return microphone === 'granted';
      case 'notifications':
        const { receive } = await PushNotifications.checkPermissions();
        return receive === 'granted';
      default:
        return false;
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
    switch (permissionName) {
      case 'location':
        result = await Geolocation.requestPermissions();
        break;
      case 'camera':
      case 'microphone':
        result = await Camera.requestPermissions();
        break;
      case 'notifications':
        result = await PushNotifications.requestPermissions();
        break;
      default:
        throw new Error('Invalid permission name');
    }

    const granted = await checkPermissionStatus(permissionName);

    if (granted) {
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
