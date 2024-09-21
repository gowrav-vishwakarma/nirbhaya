<template>
  <q-page class="help-page q-pa-md">
    <div class="help-content">
      <q-card class="help-card q-mb-md">
        <q-card-section>
          <div class="text-h5 text-weight-bold q-mb-md">
            {{ $t('common.help') }}
          </div>

          <q-tabs
            v-model="activeTab"
            dense
            class="text-grey"
            active-color="primary"
            indicator-color="primary"
            align="justify"
            narrow-indicator
          >
            <q-tab name="app" :label="$t('common.appHelp')" />
            <q-tab name="permissions" :label="$t('common.permissionsHelp')" />
          </q-tabs>

          <q-separator />

          <q-tab-panels v-model="activeTab" animated>
            <q-tab-panel name="app">
              <div
                v-for="section in appHelpSections"
                :key="section.id"
                class="q-mb-lg"
              >
                <h2 :id="section.id" class="text-h6 q-mb-sm">
                  {{ $t(section.title) }}
                </h2>
                <p>{{ $t(section.content) }}</p>
                <q-btn
                  v-if="section.videoUrl"
                  :label="$t('common.watchVideo')"
                  color="primary"
                  outline
                  @click="openVideoModal(section.videoUrl)"
                  class="q-mt-sm"
                />
              </div>
            </q-tab-panel>

            <q-tab-panel name="permissions">
              <div
                v-for="section in helpSections"
                :key="section.id"
                class="q-mb-lg"
              >
                <h2 :id="section.id" class="text-h6 q-mb-sm">
                  {{ $t(section.title) }}
                </h2>
                <p>{{ $t(section.content) }}</p>
                <div class="row q-col-gutter-sm q-mt-sm">
                  <div class="col-12 col-sm-6">
                    <q-btn
                      v-if="section.action"
                      :label="
                        section.permissionGranted
                          ? $t('common.permissionGranted')
                          : $t('common.requestPermission')
                      "
                      :color="
                        section.permissionGranted ? 'positive' : 'primary'
                      "
                      @click="section.action.handler"
                      class="full-width"
                      :disable="section.permissionGranted"
                    />
                  </div>
                  <div class="col-12 col-sm-6">
                    <q-btn
                      :label="$t('common.howToEnable')"
                      color="secondary"
                      outline
                      @click="showPlatformSpecificHelp(section.id)"
                      class="full-width"
                    />
                  </div>
                </div>
              </div>
            </q-tab-panel>
          </q-tab-panels>
        </q-card-section>
      </q-card>
    </div>

    <q-dialog v-model="videoModalOpen">
      <q-card style="width: 700px; max-width: 80vw">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6">{{ $t('common.helpVideo') }}</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section>
          <div class="video-container">
            <iframe
              :src="currentVideoUrl"
              frameborder="0"
              allowfullscreen
            ></iframe>
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>

    <q-dialog v-model="platformHelpOpen">
      <q-card style="width: 700px; max-width: 80vw">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6">{{ $t('common.platformSpecificHelp') }}</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section>
          <div v-html="currentPlatformHelp"></div>
        </q-card-section>
      </q-card>
    </q-dialog>
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

const activeTab = ref('app');
const videoModalOpen = ref(false);
const currentVideoUrl = ref('');
const platformHelpOpen = ref(false);
const currentPlatformHelp = ref('');

const appHelpSections = [
  {
    id: 'getting-started',
    title: 'common.gettingStarted',
    content: 'common.gettingStartedContent',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
  },
  {
    id: 'using-sos',
    title: 'common.usingSOS',
    content: 'common.usingSOSContent',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
  },
  {
    id: 'volunteering',
    title: 'common.volunteeringHelp',
    content: 'common.volunteeringHelpContent',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
  },
];

const helpSections = ref([
  {
    id: 'location',
    title: 'common.locationPermission',
    content: 'common.locationPermissionHelp',
    action: {
      handler: () => requestPermission('location'),
    },
    permissionGranted: false,
  },
  {
    id: 'camera',
    title: 'common.cameraPermission',
    content: 'common.cameraPermissionHelp',
    action: {
      handler: () => requestPermission('camera'),
    },
    permissionGranted: false,
  },
  {
    id: 'microphone',
    title: 'common.microphonePermission',
    content: 'common.microphonePermissionHelp',
    action: {
      handler: () => requestPermission('microphone'),
    },
    permissionGranted: false,
  },
  {
    id: 'notifications',
    title: 'common.notificationPermission',
    content: 'common.notificationPermissionHelp',
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
    if (Capacitor.isNativePlatform()) {
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
          // For native platforms, you might need to implement a different way to check notification permissions
          return Notification.permission === 'granted';
        default:
          return false;
      }
    } else {
      // Web platform
      switch (permissionName) {
        case 'location':
          const locationStatus = await navigator.permissions.query({
            name: 'geolocation',
          });
          return locationStatus.state === 'granted';
        case 'camera':
        case 'microphone':
          try {
            await navigator.mediaDevices.getUserMedia({
              [permissionName]: true,
            });
            return true;
          } catch {
            return false;
          }
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
    let granted = false;
    if (Capacitor.isNativePlatform()) {
      switch (permissionName) {
        case 'location':
          const locationResult = await Geolocation.requestPermissions();
          granted = locationResult.location === 'granted';
          break;
        case 'camera':
        case 'microphone':
          const cameraResult = await Camera.requestPermissions();
          granted = cameraResult[permissionName] === 'granted';
          break;
        case 'notifications':
          // For native platforms, you might need to implement a different way to request notification permissions
          const notificationResult = await Notification.requestPermission();
          granted = notificationResult === 'granted';
          break;
        default:
          throw new Error('Invalid permission name');
      }
    } else {
      // Web platform
      switch (permissionName) {
        case 'location':
          const locationStatus = await navigator.permissions.query({
            name: 'geolocation',
          });
          if (locationStatus.state === 'prompt') {
            await new Promise((resolve) =>
              navigator.geolocation.getCurrentPosition(resolve, resolve)
            );
          }
          granted = locationStatus.state === 'granted';
          break;
        case 'camera':
        case 'microphone':
          try {
            await navigator.mediaDevices.getUserMedia({
              [permissionName]: true,
            });
            granted = true;
          } catch {
            granted = false;
          }
          break;
        case 'notifications':
          const result = await Notification.requestPermission();
          granted = result === 'granted';
          break;
        default:
          throw new Error('Invalid permission name');
      }
    }

    if (granted) {
      const section = helpSections.value.find((s) => s.id === permissionName);
      if (section) {
        section.permissionGranted = true;
      }

      $q.notify({
        color: 'positive',
        message: t('common.permissionGranted', {
          permission: t(permissionName),
        }),
        icon: 'check',
      });
    } else {
      throw new Error('Permission not granted');
    }
  } catch (error) {
    console.error(`Error requesting ${permissionName} permission:`, error);
    $q.notify({
      color: 'negative',
      message: t('common.permissionDenied', { permission: t(permissionName) }),
      icon: 'error',
    });
  }
  await updatePermissionStatus();
};

const openVideoModal = (videoUrl: string) => {
  currentVideoUrl.value = videoUrl;
  videoModalOpen.value = true;
};

const showPlatformSpecificHelp = (permissionName: string) => {
  const platform = Capacitor.getPlatform();
  const isIOS = platform === 'ios';
  const isAndroid = platform === 'android';
  const isPWA = !isIOS && !isAndroid;

  let helpContent = '';

  switch (permissionName) {
    case 'location':
      if (isIOS) {
        helpContent = t('common.iosLocationHelp');
      } else if (isAndroid) {
        helpContent = t('common.androidLocationHelp');
      } else {
        helpContent = t('common.pwaLocationHelp');
      }
      break;
    case 'camera':
      if (isIOS) {
        helpContent = t('common.iosCameraHelp');
      } else if (isAndroid) {
        helpContent = t('common.androidCameraHelp');
      } else {
        helpContent = t('common.pwaCameraHelp');
      }
      break;
    // Add similar cases for other permissions
  }

  currentPlatformHelp.value = helpContent;
  platformHelpOpen.value = true;
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

<style lang="scss" scoped>
.help-page {
  background: linear-gradient(135deg, $primary, darken($primary, 20%));
  min-height: 100vh;
}

.help-content {
  max-width: 800px;
  margin: 0 auto;
}

.help-card {
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.video-container {
  position: relative;
  padding-bottom: 56.25%;
  height: 0;
  overflow: hidden;

  iframe {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
  }
}
</style>
