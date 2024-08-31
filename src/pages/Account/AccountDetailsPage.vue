<template>
  <q-page>
    <q-card
      class="q-mt-lg"
      style="
        background-color: white;
        border-radius: 20px 20px 0 0;
        height: 100%;
        bottom: 0;
        left: 0;
        top: 5px;
        width: 100%;
        overflow-y: auto;
      "
    >
      <div class="row q-pa-md">
        <!-- Language switcher -->
        <div class="col-12 q-mb-md">
          <h6 class="q-ma-none q-ml-xs">{{ $t('language') }}</h6>
          <q-select
            v-model="languageStore.currentLanguage"
            :options="languageOptions"
            outlined
            emit-value
            map-options
            @update:model-value="languageStore.setLanguage"
            class="q-mt-sm"
            style="border-radius: 20px"
          />
        </div>

        <!-- Basic profile information -->
        <div class="col-12 q-mb-md">
          <h6 class="q-ma-none q-ml-xs">{{ $t('name') }}</h6>
          <q-input
            class="q-mt-sm"
            outlined
            v-model="values.name"
            :label="$t('name')"
            style="border-radius: 20px"
          />
        </div>
        <div class="col-12 q-mb-md">
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
        <div class="col-12 q-mb-md">
          <h6 class="q-ma-none q-ml-xs">{{ $t('city') }}</h6>
          <q-input
            class="q-mt-sm"
            outlined
            v-model="values.city"
            :label="$t('city')"
            style="border-radius: 20px"
          />
        </div>

        <!-- Emergency contacts -->
        <div class="col-12 q-mb-md">
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
            v-if="values.emergencyContacts.length < 3"
            @click="addEmergencyContact"
            class="q-mt-sm primaryBackGroundColor text-white"
            icon="add_circle"
          >
            <span class="q-ml-xs">{{ $t('addEmergencyContact') }}</span>
          </q-btn>
        </div>

        <!-- Notification locations -->
        <div class="col-12 q-mb-md">
          <div class="flex items-center">
            <h6 class="q-ma-none q-ml-xs">{{ $t('notificationLocations') }}</h6>
            <q-icon name="help" size="xs" class="q-ml-sm">
              <q-tooltip>{{ $t('notificationLocationsHelp') }}</q-tooltip>
            </q-icon>
          </div>
          <div
            v-for="(location, index) in values.locations"
            :key="index"
            class="q-mt-sm"
          >
            <div class="row q-col-gutter-sm">
              <div class="col">
                <q-input
                  outlined
                  v-model="location.name"
                  :label="$t('locationName')"
                  :hint="getLocationHint(location)"
                  class="q-mb-sm"
                  style="border-radius: 20px"
                />
              </div>
              <div class="col-auto">
                <q-btn
                  flat
                  round
                  color="primary"
                  icon="my_location"
                  @click="updateLocationCoordinates(index)"
                >
                  <q-tooltip>{{ $t('useCurrentLocation') }}</q-tooltip>
                </q-btn>
              </div>
              <div class="col-auto">
                <q-btn
                  flat
                  round
                  color="negative"
                  icon="delete"
                  @click="removeNotificationLocation(index)"
                />
              </div>
            </div>
            <p
              v-if="
                location.location.coordinates[1] &&
                location.location.coordinates[0]
              "
              class="text-caption q-mt-sm"
            >
              {{ $t('coordinates') }}: {{ location.location.coordinates[1] }},
              {{ location.location.coordinates[0] }}
            </p>
          </div>
          <q-btn
            v-if="values.locations.length < 2"
            @click="addNotificationLocation"
            class="q-mt-sm primaryBackGroundColor text-white"
            icon="add_circle"
          >
            <span class="q-ml-xs">{{ $t('addNotificationLocation') }}</span>
          </q-btn>
        </div>

        <!-- Live SOS event checking toggle -->
        <div class="col-12 q-mb-md">
          <div class="flex items-center justify-between">
            <div>
              <h6 class="q-ma-none q-ml-xs">
                {{ $t('liveSosEventChecking') }}
              </h6>
              <p class="text-caption q-mb-sm">
                {{ $t('liveSosEventCheckingDescription') }}
              </p>
            </div>
            <q-toggle v-model="values.liveSosEventChecking" color="primary" />
          </div>
        </div>

        <!-- Save button -->
        <div class="col-12 q-mt-lg">
          <q-btn
            :loading="updateProfileIsLoading"
            @click="saveChanges"
            style="width: 100%"
            class="bg-green text-white"
          >
            <b class="q-ml-xs q-my-md">{{ $t('saveChanges') }}</b>
          </q-btn>
        </div>
      </div>
    </q-card>
  </q-page>
</template>

<script lang="ts" setup>
import { computed, ref, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useLanguageStore } from 'src/stores/languageStore';
import { Capacitor } from '@capacitor/core';
import { Geolocation } from '@capacitor/geolocation';
import { useQuasar } from 'quasar';
import { api } from 'src/boot/axios';
import { useForm } from 'src/qnatk/composibles/use-form';
import { useUserStore } from 'src/stores/user-store';

const { t } = useI18n();
const languageStore = useLanguageStore();
const $q = useQuasar();

const userStore = useUserStore();

const languageOptions = computed(() =>
  languageStore.availableLanguages.map((lang) => ({
    value: lang,
    label: t(`languages.${lang}`),
  }))
);

// Use useForm for the main profile form
const {
  values,
  errors,
  isLoading: updateProfileIsLoading,
  validateAndSubmit: updateProfileValidateAndSubmit,
  callbacks: updateProfileCallbacks,
} = useForm(api, 'auth/user-profile-update', {
  name: userStore.user.name,
  phoneNumber: userStore.user.phoneNumber,
  city: userStore.user.city,
  emergencyContacts: userStore.user.emergencyContacts,
  locations: userStore.user.locations,
  liveSosEventChecking: userStore.user.liveSosEventChecking,
});

onMounted(() => {
  // Initialize form values with user store data
  values.name = userStore.user.name;
  values.phoneNumber = userStore.user.phoneNumber;
  values.city = userStore.user.city;
  values.emergencyContacts = userStore.user.emergencyContacts;
  values.locations = userStore.user.locations;
  values.liveSosEventChecking = userStore.user.liveSosEventChecking;
});

// Update callbacks for the profile update
updateProfileCallbacks.onSuccess = (updatedUser) => {
  // Update the user store with the new data
  userStore.updateUser({
    name: updatedUser.name,
    city: updatedUser.city,
    liveSosEventChecking: updatedUser.liveSosEventChecking,
    emergencyContacts: updatedUser.emergencyContacts,
    locations: updatedUser.locations,
  });

  $q.notify({
    color: 'positive',
    message: t('profileUpdateSuccess'),
    icon: 'check',
  });
};

updateProfileCallbacks.onError = (error) => {
  console.log(error.response.data);
  if (error.response.data.message === 'Validation Exception') {
    Object.keys(error.response.data.response.errors).forEach((key) => {
      $q.notify({
        color: 'negative',
        message: `${key}: ${t('notAMember', { contactPhone: key })}`,
        icon: 'error',
      });
      const index = values.emergencyContacts.findIndex(
        (contact) => contact.contactPhone === key
      );
      if (index !== -1) {
        values.emergencyContacts.splice(index, 1);
      }
    });
  } else {
    console.error('Error updating profile', error);
    $q.notify({
      color: 'negative',
      message: t('profileUpdateError'),
      icon: 'error',
    });
  }
};

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

const addNotificationLocation = () => {
  if (values.locations.length < 2) {
    values.locations.push({
      name: '',
      location: {
        type: 'Point',
        coordinates: [null, null],
      },
    });
  }
};

const removeNotificationLocation = (index: number) => {
  values.locations.splice(index, 1);
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

    values.locations[index].location.coordinates = [
      position.coords.longitude,
      position.coords.latitude,
    ];
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
  location: { coordinates: [number, number] };
}) => {
  const [longitude, latitude] = location.location.coordinates;
  if (latitude && longitude) {
    return `${t('coordinates')}: ${latitude.toFixed(6)}, ${longitude.toFixed(
      6
    )}`;
  }
  return t('noLocationSet');
};

const saveChanges = async () => {
  await updateProfileValidateAndSubmit();
};

// You can add more custom logic or error handling as needed
</script>

<style scoped>
/* Add any scoped styles here */
</style>
