<template>
  <div>
    <!-- Notification locations -->
    <div class="q-mb-md">
      <div class="flex items-center">
        <h6 class="q-ma-none q-ml-xs">{{ $t('notificationLocations') }}</h6>
        <q-icon :name="$t('icons.help')" size="xs" class="q-ml-sm">
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
              :error="!isLocationValid(location)"
              :error-message="$t('pleaseSelectLocation')"
            />
          </div>
          <div class="col-auto">
            <q-btn
              flat
              round
              color="primary"
              :icon="$t('icons.myLocation')"
              @click="updateLocationCoordinates(index)"
              :loading="locationLoading[index]"
            >
              <q-tooltip>{{ $t('useCurrentLocation') }}</q-tooltip>
            </q-btn>
          </div>
          <div class="col-auto">
            <q-btn
              flat
              round
              color="negative"
              :icon="$t('icons.delete')"
              @click="removeNotificationLocation(index)"
            />
          </div>
        </div>
        <p
          v-if="
            location.location.coordinates[1] && location.location.coordinates[0]
          "
          class="text-caption q-mt-sm"
        >
          {{ $t('coordinates') }}: {{ location.location.coordinates[1] }},
          {{ location.location.coordinates[0] }}
          <q-btn
            flat
            icon="map"
            label="Check: location"
            @click="openGoogleMaps(location.location.coordinates)"
            class="q-ml-sm"
          />
        </p>
      </div>
      <q-btn
        v-if="values.locations.length < 10"
        @click="addNotificationLocation"
        class="q-mt-sm bg-primary text-white"
        :icon="$t('icons.addCircle')"
      >
        <span class="q-ml-xs">{{ $t('addNotificationLocation') }}</span>
      </q-btn>
    </div>

    <!-- Available for community toggle -->
    <div class="q-mb-md">
      <div class="flex items-center justify-between">
        <div>
          <h6 class="q-ma-none q-ml-xs">
            {{ $t('availableForCommunity') }}
          </h6>
          <p class="text-caption q-mb-sm">
            {{ $t('availableForCommunityDescription') }}
          </p>
        </div>
        <q-toggle v-model="values.availableForCommunity" color="primary" />
      </div>
    </div>

    <!-- Available for paid professional service toggle -->
    <div class="q-mb-md">
      <div class="flex items-center justify-between">
        <div>
          <h6 class="q-ma-none q-ml-xs">
            {{ $t('availableForPaidProfessionalService') }}
          </h6>
          <p class="text-caption q-mb-sm">
            {{ $t('availableForPaidProfessionalServiceDescription') }}
          </p>
        </div>
        <q-toggle
          v-model="values.availableForPaidProfessionalService"
          color="primary"
        />
      </div>
    </div>

    <!-- Add save button at the bottom -->
    <div class="q-mt-md">
      <q-btn
        :loading="isLoading"
        @click="handleSubmit"
        style="width: 100%"
        class="bg-green text-white"
        :disable="!isFormValid"
      >
        <b class="q-ml-xs q-my-md">{{ $t('saveChanges') }}</b>
      </q-btn>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { onMounted, watch, ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useQuasar } from 'quasar';
import { Capacitor } from '@capacitor/core';
import { Geolocation } from '@capacitor/geolocation';
import { useUserStore } from 'src/stores/user-store';
import { api } from 'src/boot/axios';
import { useForm } from 'src/qnatk/composibles/use-form';

const { t } = useI18n();
const $q = useQuasar();
const userStore = useUserStore();

const { values, isLoading, validateAndSubmit, callbacks } = useForm(
  api,
  'auth/user-profile-update',
  {
    locations: [],
    availableForCommunity: false,
  }
);

const locationLoading = ref<boolean[]>([]);

const loadUserData = () => {
  const userData = userStore.user;
  values.value.locations = userData.locations || [];
  values.value.availableForCommunity = userData.availableForCommunity || false;
  values.value.availableForPaidProfessionalService =
    userData.availableForPaidProfessionalService || false;
  locationLoading.value = new Array(values.value.locations.length).fill(false);
};

onMounted(loadUserData);

const addNotificationLocation = () => {
  if (values.value.locations.length < 10) {
    values.value.locations.push({
      name: '',
      location: {
        type: 'Point',
        coordinates: [null, null],
      },
    });
    locationLoading.value.push(false);
  }
};

const removeNotificationLocation = (index: number) => {
  values.value.locations.splice(index, 1);
  locationLoading.value.splice(index, 1);
};

const updateLocationCoordinates = async (index: number) => {
  locationLoading.value[index] = true;
  try {
    const position = await Geolocation.getCurrentPosition({
      enableHighAccuracy: true,
      timeout: 10000,
    });

    values.value.locations[index].location.coordinates = [
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
  } finally {
    locationLoading.value[index] = false;
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

const isLocationValid = (location: {
  location: { coordinates: [number | null, number | null] };
}) => {
  const [longitude, latitude] = location.location.coordinates;
  return latitude !== null && longitude !== null;
};

const isFormValid = computed(() => {
  return values.value.locations.every(isLocationValid);
});

callbacks.onSuccess = (data) => {
  userStore.updateUser(data.user);
  loadUserData(); // Reload user data from the store
  $q.notify({
    color: 'positive',
    message: t('volunteeringUpdateSuccess'),
    icon: 'check',
  });
};

// Watch for changes in the userStore and update local values
watch(
  () => userStore.user,
  (newUserData) => {
    values.value.locations = newUserData.locations || [];
    values.value.availableForCommunity =
      newUserData.availableForCommunity || false;
    locationLoading.value = new Array(values.value.locations.length).fill(
      false
    );
  },
  { deep: true }
);

callbacks.onError = (error) => {
  console.error('Error updating volunteering info', error);
  $q.notify({
    color: 'negative',
    message: t('volunteeringUpdateError'),
    icon: 'error',
  });
};

// Modify the validateAndSubmit call to prevent form reset
const handleSubmit = () => {
  if (isFormValid.value) {
    validateAndSubmit(false); // Pass false to prevent form reset
  } else {
    $q.notify({
      color: 'negative',
      message: t('pleaseSelectAllLocations'),
      icon: 'error',
    });
  }
};

const openGoogleMaps = (coordinates: [number, number]) => {
  const [longitude, latitude] = coordinates;
  const url = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;
  window.open(url, '_blank');
};
</script>
