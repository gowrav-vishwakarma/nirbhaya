<template>
  <div>
    <!-- Language switcher -->
    <div class="q-mb-md">
      <LanguageSelector />
    </div>

    <!-- Basic profile information -->
    <div class="q-mb-md">
      <h6 class="q-ma-none q-ml-xs">{{ $t('name') }}</h6>
      <q-input
        class="q-mt-sm"
        outlined
        v-model="values.name"
        :label="$t('name')"
        style="border-radius: 20px"
      />
    </div>
    <div class="q-mb-md">
      <h6 class="q-ma-none q-ml-xs">{{ $t('mobileNumber') }}</h6>
      <q-input
        readonly
        disable
        class="q-mt-sm"
        outlined
        v-model="values.phoneNumber"
        :label="$t('mobileNumber')"
        style="border-radius: 20px"
      />
    </div>
    <div class="q-mb-md">
      <h6 class="q-ma-none q-ml-xs">{{ $t('city') }}</h6>
      <q-input
        class="q-mt-sm"
        outlined
        v-model="values.city"
        :label="$t('city')"
        style="border-radius: 20px"
      />
    </div>

    <!-- User type dropdown -->
    <div class="q-mb-md">
      <h6 class="q-ma-none q-ml-xs">{{ $t('userType') }}</h6>
      <q-select
        class="q-mt-sm"
        outlined
        v-model="values.userType"
        :options="userTypeOptions"
        :label="$t('userType')"
        style="border-radius: 20px"
      />
    </div>

    <!-- Emergency contacts -->
    <div class="q-mb-md">
      <div class="flex items-center">
        <h6 class="q-ma-none q-ml-xs">{{ $t('emergencyContacts') }}</h6>
        <q-icon name="help" size="xs" class="q-ml-sm">
          <q-tooltip>{{ $t('emergencyContactsHelp') }}</q-tooltip>
        </q-icon>
      </div>
      <div
        v-for="(contact, index) in values.emergencyContacts"
        :key="index"
        class="q-mt-sm"
      >
        <q-input
          outlined
          v-model="contact.contactName"
          :label="$t('name')"
          class="q-mb-sm"
          style="border-radius: 20px"
        />
        <q-input
          outlined
          v-model="contact.contactPhone"
          :label="$t('number')"
          class="q-mb-sm"
          style="border-radius: 20px"
        />

        <q-btn
          flat
          round
          color="negative"
          icon="delete"
          @click="removeEmergencyContact(index)"
        />
      </div>
      <q-btn
        v-if="values.emergencyContacts?.length < 3"
        @click="addEmergencyContact"
        class="q-mt-sm primaryBackGroundColor text-white"
        icon="add_circle"
      >
        <span class="q-ml-xs">{{ $t('addEmergencyContact') }}</span>
      </q-btn>
    </div>

    <!-- Permissions section -->
    <div class="q-mb-md">
      <h6 class="q-ma-none q-ml-xs">{{ $t('appPermissions') }}</h6>
      <div
        v-for="(permission, index) in permissions"
        :key="index"
        class="q-mt-sm"
      >
        <div class="flex items-center justify-between">
          <span>{{ $t(permission.name) }}</span>
          <q-btn
            :label="$t(permission.granted ? 'granted' : 'requestPermission')"
            :color="permission.granted ? 'positive' : 'primary'"
            @click="requestPermission(permission.name)"
            :disable="permission.granted"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useQuasar } from 'quasar';
import { useUserStore } from 'src/stores/user-store';
import LanguageSelector from 'src/components/LanguageSelector.vue';
import { Capacitor, Plugins } from '@capacitor/core';
import { Geolocation } from '@capacitor/geolocation';
import { Camera } from '@capacitor/camera';

const { t } = useI18n();
const $q = useQuasar();
const userStore = useUserStore();

const userTypeOptions = [
  'Girl',
  'Child',
  'Elder Woman',
  'Elder Man',
  'Youth',
  // Add more options as needed
];

const values = userStore.user;

const addEmergencyContact = () => {
  if (values.emergencyContacts.length < 3) {
    values.emergencyContacts.push({
      contactName: '',
      contactPhone: '',
      relationship: '',
      isAppUser: false,
      priority: 0,
    });
  }
};

const removeEmergencyContact = (index: number) => {
  values.emergencyContacts.splice(index, 1);
};

const permissions = ref([
  { name: 'location', granted: false },
  { name: 'camera', granted: false },
  { name: 'microphone', granted: false },
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
          break;
        case 'camera':
        case 'microphone':
          result = await navigator.mediaDevices.getUserMedia({
            video: permissionName === 'camera',
            audio: permissionName === 'microphone',
          });
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

onMounted(async () => {
  // Check initial permission states
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
});
</script>
