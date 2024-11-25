<template>
  <div>
    <!-- Permissions section -->
    <!-- <div class="q-px-lg">
      <div class="text-subtitle1 text-weight-bold q-mb-sm">
        {{ $t('common.appPermissions') }}
      </div>
      <q-list bordered>
        <q-item v-for="(permission, index) in permissions" :key="index">
          <q-item-section>
            <q-item-label>{{ $t(permission.name) }}</q-item-label>
          </q-item-section>
          <q-item-section side>
            <q-btn :color="permission.granted ? 'positive' : 'primary'" @click="requestPermission(permission.name)"
              :disable="permission.granted" dense no-caps>
              <span class="q-px-md">
                {{
                  $t(
                    permission.granted
                      ? 'common.granted'
                      : 'common.requestPermission'
                  )
                }}
              </span>
            </q-btn>
          </q-item-section>
        </q-item>
      </q-list>
    </div> -->

    <!-- SOS Settings -->
    <div v-if="isNavigatorMediaSupported" class="q-px-lg q-mt-md">
      <!-- <div class="text-subtitle1 text-weight-bold q-mb-sm">
        {{ $t('common.sosSettings') }}
      </div> -->
      <q-list bordered>
        <q-item tag="label" v-ripple>
          <q-item-section>
            <q-item-label>{{
              $t('common.startAudioVideoRecordOnSos')
              }}</q-item-label>
          </q-item-section>
          <q-item-section side>
            <q-toggle v-model="values.startAudioVideoRecordOnSos"
              @update:model-value="handleSettingChange('startAudioVideoRecordOnSos')" />
          </q-item-section>
        </q-item>
        <q-item v-if="STREAM_SAVE" tag="label" v-ripple>
          <q-item-section>
            <q-item-label>{{
              $t('common.streamAudioVideoOnSos')
              }}</q-item-label>
          </q-item-section>
          <q-item-section side>
            <q-toggle v-model="values.streamAudioVideoOnSos"
              @update:model-value="handleSettingChange('streamAudioVideoOnSos')" />
          </q-item-section>
        </q-item>
        <q-item tag="label" v-ripple>
          <q-item-section>
            <q-item-label>{{
              $t('common.broadcastAudioOnSos')
              }}</q-item-label>
          </q-item-section>
          <q-item-section side>
            <q-toggle v-model="values.broadcastAudioOnSos"
              @update:model-value="handleSettingChange('broadcastAudioOnSos')" color="grey" :disable="true" />
          </q-item-section>
        </q-item>
      </q-list>
    </div>


  </div>
</template>

<script lang="ts" setup>
import { onMounted, ref, computed, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useQuasar } from 'quasar';
import { useUserStore } from 'src/stores/user-store';
import { api } from 'src/boot/axios';
import { useForm } from 'src/qnatk/composibles/use-form';
import LanguageSelector from 'src/components/LanguageSelector.vue';
import { Capacitor, Plugins } from '@capacitor/core';
import { Geolocation } from '@capacitor/geolocation';
import { Camera } from '@capacitor/camera';
import EmergencyContactRequestsDialog from 'components/EmergencyContactRequestsDialog.vue';
import SearchCity from 'src/components/SearchCity.vue';

// Define interface for values
interface SOSSettings {
  startAudioVideoRecordOnSos: boolean;
  streamAudioVideoOnSos: boolean;
  broadcastAudioOnSos: boolean;
}

// Define props and emits if needed
defineOptions({
  name: 'ProfileAppPermission'
});

// Get composition API utilities
const { t } = useI18n();
const $q = useQuasar();
const userStore = useUserStore();

// Initialize values from store immediately
const values = ref<SOSSettings>({
  startAudioVideoRecordOnSos: userStore.user?.startAudioVideoRecordOnSos ?? false,
  streamAudioVideoOnSos: userStore.user?.streamAudioVideoOnSos ?? false,
  broadcastAudioOnSos: userStore.user?.broadcastAudioOnSos ?? true,
});

// Sync values with store on mount
onMounted(() => {
  if (userStore.user) {
    values.value = {
      startAudioVideoRecordOnSos: userStore.user.startAudioVideoRecordOnSos ?? false,
      streamAudioVideoOnSos: userStore.user.streamAudioVideoOnSos ?? false,
      broadcastAudioOnSos: userStore.user.broadcastAudioOnSos ?? true,
    };
  }
  checkPermissions()
});

// Add STREAM_SAVE constant
const STREAM_SAVE = computed(() => process.env.STREAM_SAVE);

// Add isNavigatorMediaSupported computed property
const isNavigatorMediaSupported = computed(() => {
  return typeof navigator !== 'undefined' && navigator.mediaDevices !== undefined;
});

const permissions = ref([
  { name: 'common.location', granted: false },
  { name: 'common.camera', granted: false },
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
      }
    } else {
      // Web API fallback
      switch (permissionName) {
        case 'location':
          result = await navigator.permissions.query({ name: 'geolocation' });
          console.log('Location permission result:', result);
          break;
        case 'camera':
        case 'microphone':
          result = await navigator.mediaDevices.getUserMedia({
            video: permissionName === 'camera',
            audio: permissionName === 'microphone',
          });
          console.log(
            'Media (camera and microphone) permission result:',
            result
          );
          break;
      }
    }

    const permissionIndex = permissions.value.findIndex(
      (p) => p.name === permissionName
    );
    if (permissionIndex !== -1) {
      permissions.value[permissionIndex].granted = true;
    }

    $q.notify({
      color: 'positive',
      message: t('common.permissionGranted', { permission: t(permissionName) }),
      icon: 'check',
    });
  } catch (error) {
    console.error(`Error requesting ${permissionName} permission:`, error);
    $q.notify({
      color: 'negative',
      message: t('common.permissionDenied', { permission: t(permissionName) }),
      icon: 'error',
    });
  }
};

const checkPermissions = async () => {
  for (const permission of permissions.value) {
    try {
      let result;
      if (Capacitor.isNativePlatform()) {
        switch (permission.name) {
          case 'location':
            result = await Geolocation.checkPermissions();
            permission.granted = result.location === 'granted';
            break;
          case 'camera':
            result = await Camera.checkPermissions();
            permission.granted = result.camera === 'granted';
            break;
          case 'microphone':
            result = await Plugins.Permissions.query({ name: 'microphone' });
            permission.granted = result.state === 'granted';
            break;
        }
      } else {
        // Web API fallback
        if (permission.name === 'location') {
          result = await navigator.permissions.query({ name: 'geolocation' });
          permission.granted = result.state === 'granted';
        } else {
          try {
            await navigator.mediaDevices.getUserMedia({
              video: permission.name === 'camera',
              audio: permission.name === 'microphone',
            });
            permission.granted = true;
          } catch {
            permission.granted = false;
          }
        }
      }
    } catch (error) {
      console.error(`Error checking ${permission.name} permission:`, error);
    }
  }
};

const handleSettingChange = async (setting: keyof SOSSettings) => {
  try {
    // Update the store directly
    userStore.updateUserSettings({
      [setting]: values.value[setting]
    });

    // $q.notify({
    //   color: 'positive',
    //   message: t('common.settingsSaved'),
    //   icon: 'check'
    // });
  } catch (error) {
    console.error('Error updating settings:', error);
    // Revert the toggle if store update fails
    values.value[setting] = !values.value[setting];

    $q.notify({
      color: 'negative',
      message: t('common.errorSavingSettings'),
      icon: 'error'
    });
  }
};

// Add a watcher to sync values with store changes
watch(() => userStore.user, (newUser) => {
  if (newUser) {
    values.value = {
      startAudioVideoRecordOnSos: newUser.startAudioVideoRecordOnSos ?? false,
      streamAudioVideoOnSos: newUser.streamAudioVideoOnSos ?? false,
      broadcastAudioOnSos: newUser.broadcastAudioOnSos ?? true,
    };
  }
}, { deep: true });
</script>

<style scoped></style>
