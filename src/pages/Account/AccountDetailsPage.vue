<template>
  <q-page>
    <q-card class="q-mt-lg" style="
        background-color: white;
        border-radius: 20px 20px 0 0;
        height: 100%;
        bottom: 0;
        left: 0;
        top: 5px;
        width: 100%;
        overflow-y: auto;
      ">
      <div class="row q-pa-md">
        <!-- Language switcher -->
        <div class="col-12 q-mb-md">
          <h6 class="q-ma-none q-ml-xs">{{ $t('language') }}</h6>
          <q-select v-model="languageStore.currentLanguage" :options="languageOptions" outlined emit-value map-options
            @update:model-value="languageStore.setLanguage" class="q-mt-sm" style="border-radius: 20px" />
        </div>

        <!-- Basic profile information -->
        <div class="col-12 q-mb-md">
          <h6 class="q-ma-none q-ml-xs">{{ $t('name') }}</h6>
          <q-input class="q-mt-sm" outlined v-model="profile.name" :label="$t('name')" style="border-radius: 20px" />
        </div>
        <div class="col-12 q-mb-md">
          <h6 class="q-ma-none q-ml-xs">{{ $t('mobileNumber') }}</h6>
          <q-input readonly disable class="q-mt-sm" outlined v-model="profile.mobileNumber" :label="$t('mobileNumber')"
            style="border-radius: 20px" />
        </div>
        <div class="col-12 q-mb-md">
          <h6 class="q-ma-none q-ml-xs">{{ $t('city') }}</h6>
          <q-input class="q-mt-sm" outlined v-model="profile.city" :label="$t('city')" style="border-radius: 20px" />
        </div>

        <!-- Emergency contacts -->
        <div class="col-12 q-mb-md">
          <div class="flex items-center">
            <h6 class="q-ma-none q-ml-xs">{{ $t('emergencyContacts') }}</h6>
            <q-icon name="help" size="xs" class="q-ml-sm">
              <q-tooltip>{{ $t('emergencyContactsHelp') }}</q-tooltip>
            </q-icon>
          </div>
          <div v-for="(contact, index) in profile.emergencyContacts" :key="index" class="q-mt-sm">
            <q-input outlined v-model="contact.name" :label="$t('name')" class="q-mb-sm" style="border-radius: 20px" />
            <q-input outlined v-model="contact.number" :label="$t('number')" class="q-mb-sm"
              style="border-radius: 20px" />
            <q-btn flat round color="primary" icon="save" @click="saveEmergencyContact(index)"
              :loading="contact.saving">
              <q-tooltip>{{ $t('saveContact') }}</q-tooltip>
            </q-btn>
            <q-btn flat round color="negative" icon="delete" @click="removeEmergencyContact(index)" />
          </div>
          <q-btn v-if="profile.emergencyContacts.length < 3" @click="addEmergencyContact"
            class="q-mt-sm primaryBackGroundColor text-white" icon="add_circle">
            <span class="q-ml-xs">{{ $t('addEmergencyContact') }}</span>
          </q-btn>
        </div>

        <!-- Location sharing options -->
        <div class="col-12 q-mb-md">
          <div class="flex items-center">
            <h6 class="q-ma-none q-ml-xs">
              {{ $t('volunteerLocationSharing') }}
            </h6>
            <q-icon name="help" size="xs" class="q-ml-sm">
              <q-tooltip>{{ $t('volunteerLocationSharingHelp') }}</q-tooltip>
            </q-icon>
          </div>
          <p class="text-caption q-mb-sm">
            {{ $t('volunteerLocationSharingDescription') }}
          </p>
          <q-option-group v-model="profile.locationSharingOption" :options="locationSharingOptions" color="primary" />
        </div>

        <!-- Notification locations -->
        <div class="col-12 q-mb-md">
          <div class="flex items-center">
            <h6 class="q-ma-none q-ml-xs">{{ $t('notificationLocations') }}</h6>
            <q-icon name="help" size="xs" class="q-ml-sm">
              <q-tooltip>{{ $t('notificationLocationsHelp') }}</q-tooltip>
            </q-icon>
          </div>
          <div v-for="(location, index) in profile.notificationLocations" :key="index" class="q-mt-sm">
            <div class="row q-col-gutter-sm">
              <div class="col">
                <q-input outlined v-model="location.name" :label="$t('locationName')" :hint="getLocationHint(location)"
                  class="q-mb-sm" style="border-radius: 20px" />
              </div>
              <div class="col-auto">
                <q-btn flat round color="primary" icon="my_location" @click="updateLocationCoordinates(index)">
                  <q-tooltip>{{ $t('useCurrentLocation') }}</q-tooltip>
                </q-btn>
              </div>
              <div class="col-auto">
                <q-btn flat round color="negative" icon="delete" @click="removeNotificationLocation(index)" />
              </div>
            </div>
            <p v-if="location.latitude && location.longitude" class="text-caption q-mt-sm">
              {{ $t('coordinates') }}: {{ location.latitude }},
              {{ location.longitude }}
            </p>
          </div>
          <q-btn v-if="profile.notificationLocations.length < 2" @click="addNotificationLocation"
            class="q-mt-sm primaryBackGroundColor text-white" icon="add_circle">
            <span class="q-ml-xs">{{ $t('addNotificationLocation') }}</span>
          </q-btn>
        </div>

        <!-- Save button -->
        <div class="col-12 q-mt-lg">
          <q-btn :loading="updateProfileIsLoading" @click="saveChanges" style="width: 100%" class="bg-green text-white">
            <b class="q-ml-xs q-my-md">{{ $t('saveChanges') }}</b>
          </q-btn>
        </div>
      </div>
    </q-card>
  </q-page>
</template>

<script lang="ts" setup>
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useLanguageStore } from 'src/stores/languageStore';
import { Capacitor } from '@capacitor/core';
import { Geolocation } from '@capacitor/geolocation';
import { useQuasar } from 'quasar';
import { api } from 'src/boot/axios'; // Make sure you have this import
import { useUserForm } from 'src/composables/use-user-form';


const { t } = useI18n();
const languageStore = useLanguageStore();
const $q = useQuasar();

const languageOptions = computed(() =>
  languageStore.availableLanguages.map((lang) => ({
    value: lang,
    label: t(`languages.${lang}`),
  }))
);

const profile = ref({
  name: 'bhashkar',
  mobileNumber: '9639567903',
  city: 'Ahmedabad',
  emergencyContacts: [] as Array<{
    name: string;
    number: string;
    saving: boolean;
    saved: boolean;
  }>,
  locationSharingOption: 'none',
  notificationLocations: [],
});

const locationSharingOptions = computed(() => [
  { label: t('alwaysAvailable'), value: 'always' },
  { label: t('periodicallyCheck'), value: 'periodicallyCheck' },
  { label: t('notAvailable'), value: 'none' },
]);

const addEmergencyContact = () => {
  if (profile.value.emergencyContacts.length < 3) {
    profile.value.emergencyContacts.push({ name: '', number: '' });
  }
};

const removeEmergencyContact = (index: number) => {
  profile.value.emergencyContacts.splice(index, 1);
};

const addNotificationLocation = () => {
  if (profile.value.notificationLocations.length < 2) {
    profile.value.notificationLocations.push({
      name: '',
      latitude: null,
      longitude: null,
    });
  }
};

const removeNotificationLocation = (index: number) => {
  profile.value.notificationLocations.splice(index, 1);
};

const updateLocationCoordinates = async (index: number) => {
  try {
    let position;
    if (Capacitor.isNativePlatform()) {
      position = await Geolocation.getCurrentPosition({
        enableHighAccuracy: true,
        timeout: 10000,
      });
    } else {
      // Fallback for web browsers
      position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
        });
      });
    }

    profile.value.notificationLocations[index].latitude =
      position.coords.latitude;
    profile.value.notificationLocations[index].longitude =
      position.coords.longitude;
    $q.notify({
      color: 'positive',
      message: t('locationUpdated'),
      icon: 'check',
    });
  } catch (error) {
    console.error('Error getting location', error);
    $q.notify({
      color: 'negative',
      message: t('locationError'),
      icon: 'error',
    });
  }
};

const getLocationHint = (location: {
  latitude: number | null;
  longitude: number | null;
}) => {
  if (location.latitude && location.longitude) {
    return `${t('coordinates')}: ${location.latitude.toFixed(
      6
    )}, ${location.longitude.toFixed(6)}`;
  }
  return t('noLocationSet');
};

const {
  values: updateProfileValues,
  validateAndSubmit: updateProfileValidateAndSubmit,
  errors: updateProfileErrors,
  callbacks: updateProfileCallbacks,
  isLoading: updateProfileIsLoading,
} = useUserForm('auth/user-profile-update', {})
updateProfileCallbacks.beforeSubmit = (data) => {
  data = profile.value
  return data
}

const saveChanges = () => {
  // TODO: Implement API call to save profile changes
  updateProfileValidateAndSubmit()
  console.log('Profile saved:', profile.value);
};


const {
  values,
  validateAndSubmit,
  errors,
  callbacks,
  isLoading,
} = useUserForm('auth/user-emergency-contect-add', {
  number: '',
  name: '',
  userId: 1,
})

const saveEmergencyContact = async (index: number) => {
  const contact = profile.value.emergencyContacts[index];
  contact.saving = true;
  values.value.number = contact.number;
  values.value.name = contact.name;
  try {
    // Call API to check if the number exists
    await validateAndSubmit()
    // if (response.data.exists) {
    //   // Number exists, save the contact
    //   contact.saved = true;
    //   $q.notify({
    //     color: 'positive',
    //     message: t('emergencyContactSaved'),
    //     icon: 'check',
    //   });
    // } else {
    //   console.log('eee');

    //   // Number doesn't exist
    //   // $q.notify({
    //   //   color: 'negative',
    //   //   message: t('emergencyContactNotFound'),
    //   //   icon: 'error',
    //   // });
    // }
  } catch (error) {
    console.error('Error checking emergency contact number', error);
    // $q.notify({
    //   color: 'negative',
    //   message: t('errorCheckingContact'),
    //   icon: 'error',
    // });
  } finally {
    contact.saving = false;
  }
};
</script>

<style scoped>
/* Add any scoped styles here */
</style>
