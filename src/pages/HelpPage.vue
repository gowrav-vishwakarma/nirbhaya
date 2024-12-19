<template>
  <q-page class="help-page q-pa-md">
    <div class="help-content">
      <q-card class="help-card q-mb-md">
        <q-card-section>
          <div class="text-h5 text-weight-bold q-mb-md">
            {{ $t('common.help') }}
          </div>

          <q-tabs v-model="activeTab" dense class="text-grey" active-color="primary" indicator-color="primary"
            align="justify" narrow-indicator>
            <!-- <q-tab name="app" :label="$t('common.appHelp')" /> -->
            <q-tab name="permissions" :label="$t('common.permissionsHelp')" />
          </q-tabs>

          <q-separator />

          <q-tab-panels v-model="activeTab" animated>
            <!-- <q-tab-panel name="app">
              <div v-for="section in appHelpSections" :key="section.id" class="q-mb-lg">
                <h2 :id="section.id" class="text-h6 q-mb-sm">
                  {{ $t(section.title) }}
                </h2>
                <p>{{ $t(section.content) }}</p>
                <q-btn v-if="section.videoUrl" :label="$t('common.watchVideo')" color="primary" outline
                  @click="openVideoModal(section.videoUrl)" class="q-mt-sm" />
              </div>
            </q-tab-panel> -->

            <q-tab-panel name="permissions">
              <div v-for="permission in permissions" :key="permission.name" class="q-mb-lg">
                <h2 :id="permission.name" class="text-h6 q-mb-sm">
                  {{ $t(permission.name) }}
                </h2>
                <p>{{ $t(permission.name + 'PermissionHelp') }}</p>
                <div class="row q-col-gutter-sm q-mt-sm">
                  <div class="col-12 col-sm-6">
                    <q-btn :label="permission.granted
                      ? $t('common.permissionGranted')
                      : $t('common.requestPermission')
                      " :color="permission.granted ? 'positive' : 'primary'"
                      @click="handleRequestPermission(permission.name)" class="full-width"
                      :disable="permission.granted" />
                  </div>
                  <div class="col-12 col-sm-6">
                    <q-btn :label="$t('common.howToEnable')" color="secondary" outline
                      @click="showPlatformSpecificHelp(permission.name)" class="full-width" />
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
            <iframe :src="currentVideoUrl" frameborder="0" allowfullscreen></iframe>
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
import { usePermissions } from 'src/composables/usePermissions';

const route = useRoute();
const $q = useQuasar();
const { t } = useI18n();

const activeTab = ref('permissions');
const videoModalOpen = ref(false);
const currentVideoUrl = ref('');
const platformHelpOpen = ref(false);
const currentPlatformHelp = ref('');

const { permissions, checkPermissions, requestPermission } = usePermissions();

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

const handleRequestPermission = async (permissionName: string) => {
  const granted = await requestPermission(permissionName);
  if (granted) {
    $q.notify({
      color: 'black',
      message: t('common.permissionGranted', {
        permission: t(permissionName),
      }),
      icon: 'check',
      position:'top-right'
    });
  } else {
    $q.notify({
      color: 'negative',
      message: t('common.permissionDenied', { permission: t(permissionName) }),
      icon: 'error',
      position:'top-right'
    });
  }
  await checkPermissions();
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
    case 'common.location':
      if (isIOS) {
        helpContent = t('common.iosLocationHelp');
      } else if (isAndroid) {
        helpContent = t('common.androidLocationHelp');
      } else {
        helpContent = t('common.pwaLocationHelp');
      }
      break;
    case 'common.camera':
      if (isIOS) {
        helpContent = t('common.iosCameraHelp');
      } else if (isAndroid) {
        helpContent = t('common.androidCameraHelp');
      } else {
        helpContent = t('common.pwaCameraHelp');
      }
      break;
    case 'common.microphone':
      if (isIOS) {
        helpContent = t('common.iosMicrophoneHelp');
      } else if (isAndroid) {
        helpContent = t('common.androidMicrophoneHelp');
      } else {
        helpContent = t('common.pwaMicrophoneHelp');
      }
      break;
    case 'common.notifications':
      if (isIOS) {
        helpContent = t('common.iosNotificationsHelp');
      } else if (isAndroid) {
        helpContent = t('common.androidNotificationsHelp');
      } else {
        helpContent = t('common.pwaNotificationsHelp');
      }
      break;
  }

  currentPlatformHelp.value = helpContent;
  platformHelpOpen.value = true;
};

onMounted(async () => {
  await checkPermissions();
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
