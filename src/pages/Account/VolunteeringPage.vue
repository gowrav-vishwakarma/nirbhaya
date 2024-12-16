<template>
  <q-page class="volunteering-page">
    <div class="volunteering-content">
      <h5 class="text-h6 q-mb-sm q-px-md q-mt-md q-ma-none">
        {{ $t('common.volunteeringSettings') }}
      </h5>
      <p class="q-px-md q-ma-none q-mb-sm">
        {{ $t('common.notificationLocationsHelp') }}
      </p>

      <!-- Availability toggles -->
      <q-card flat bordered class="q-mb-md">
        <q-card-section>
          <div class="text-subtitle1 text-weight-bold q-mb-sm">
            {{ $t('common.availabilitySettings') }}
          </div>
          <q-list>
            <q-item tag="label" v-ripple>
              <q-item-section>
                <q-item-label>{{
                  $t('common.availableForCommunity')
                }}</q-item-label>
                <q-item-label caption>{{
                  $t('common.availableForCommunityDescription')
                }}</q-item-label>
              </q-item-section>
              <q-item-section side>
                <q-toggle
                  v-model="values.availableForCommunity"
                  color="primary"
                  @update:model-value="handleAvailabilityToggle"
                />
              </q-item-section>
            </q-item>
          </q-list>
        </q-card-section>
      </q-card>

      <div class="scrollable-inputs q-px-md">
        <!-- Add Location Button -->
        <q-btn
          v-if="values.locations.length < 10"
          icon="add"
          color="primary"
          class="full-width custom-radius q-mb-md"
          @click="showInputFields = !showInputFields"
          :label="$t('common.addNotificationLocation')"
          style="border-radius: 10px !important;"
          :disable="!values.availableForCommunity"
        />

        <!-- New Location Input Fields -->
        <div v-if="showInputFields" class="input-fields">
          <div class="custom-input">
            <label>{{ $t('common.locationName') }}</label>
            <q-input
              v-model="newLocation.name"
              filled
              class="custom-radius"
              bg-color="pink-1"
              dense
              hide-bottom-space
            />
          </div>

          <div class="custom-input">
            <q-btn
              flat
              color="white"
              style="border-radius: 10px !important;"
              icon="my_location"
              class="full-width custom-radius bg-primary"
              @click="getCurrentLocationForNew"
              :loading="newLocationLoading"
            >
              {{ $t('common.useCurrentLocation') }}
            </q-btn>
            <div v-if="newLocation.location?.coordinates[0]" class="text-caption q-mt-sm">
              {{ getLocationCoordinates(newLocation) }}
            </div>
          </div>

          <div class="row q-col-gutter-sm">
            <div class="col-6">
              <q-btn
                label="Cancel"
                color="black"
                style="border-radius: 10px !important;"
                class="full-width custom-radius"
                @click="clearInputFields"
              />
            </div>
            <div class="col-6">
              <q-btn
                label="Add"
                color="primary"
                style="border-radius: 10px !important;"
                class="full-width custom-radius"
                @click="addNewLocation"
                :disabled="!isNewLocationValid"
                :loading="isAddingLocation"
              />
            </div>
          </div>
        </div>
        <q-separator v-if="showInputFields" class="q-mt-md" />

        <!-- Location Cards -->
        <div class="contact-cards q-mt-md" v-if="hasLocations">
          <q-card v-for="(location, index) in values.locations" :key="index" flat bordered class="contact-card q-mb-sm">
            <q-card-section class="row items-center" style="width: 100%;">
              <div class="col-auto">
                <q-avatar>
                  <img src='https://static.vecteezy.com/system/resources/thumbnails/051/222/604/small/3d-pink-location-pin-on-map-icon-png.png' alt='/profile.png' />
                </q-avatar>
              </div>
              <div class="col q-pl-sm">
                <div class="text-subtitle2">{{ location.name }}</div>
                <div class="text-caption" v-if="isLocationValid(location)">
                  {{ getLocationCoordinates(location) }}
                </div>
              </div>
              <div class="col-auto">
                <div class="text-center">
                  <q-btn
                    flat
                    dense
                    round
                    class="q-mb-0 text-blue q-mb-sm"
                    icon="mdi-directions"
                    :disable="!isLocationValid(location)"
                    @click="openGoogleMaps(location.location.coordinates)"
                  >
                    <q-tooltip>{{ $t('common.viewOnMap') }}</q-tooltip>
                  </q-btn>
                </div>
                <div>
                  <q-btn
                    class="remove-btn"
                    flat
                    label="Remove"
                    style="border-radius: 10px !important;"
                    @click="removeNotificationLocation(index)"
                  />
                </div>
              </div>
            </q-card-section>
          </q-card>
        </div>

        <p v-if="!hasLocations && values.availableForCommunity" class="text-negative q-mt-sm">
          No location Added
        </p>
      </div>
    </div>
  </q-page>
</template>

<script lang="ts" setup>
import { onMounted, ref, computed } from 'vue';
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

// Create a ref for $t to make it available in the template
const $t = (key: string) => t(key);

// Add this interface near the top of the script section
interface UserLocation {
  name: string;
  location: {
    type: 'Point';
    coordinates: [number | null, number | null];
  };
  isBusinessLocation?: boolean;
}

const { values, isLoading, validateAndSubmit, callbacks } = useForm(
  api,
  'user/user-profile-update',
  {
    locations: [],
    availableForCommunity: false,
  }
);

const locationLoading = ref<boolean[]>([]);

const loadUserData = () => {
  const userData = userStore.user;
  // Filter out business locations and create a deep copy
  values.value.locations = JSON.parse(
    JSON.stringify(
      (userData.locations || []).filter(
        (loc: UserLocation) => !loc.isBusinessLocation
      )
    )
  );
  values.value.availableForCommunity = userData.availableForCommunity || false;
  values.value.availableForPaidProfessionalService =
    userData.availableForPaidProfessionalService || false;
  locationLoading.value = new Array(values.value.locations.length).fill(false);
};

onMounted(loadUserData);

const addNotificationLocation = () => {
  if (values.value.locations.length < 10) {
    const newLocation = {
      name: '',
      location: {
        type: 'Point',
        coordinates: [null, null],
      },
    };
    values.value.locations.push(newLocation);
    locationLoading.value.push(false);
  }
};

const removeNotificationLocation = async (index: number) => {
  try {
    const updatedLocations = [...values.value.locations];
    updatedLocations.splice(index, 1);
    
    values.value.locations = updatedLocations;
    locationLoading.value.splice(index, 1);

    await validateAndSubmit(false);
    
    props.reloadComponents?.();
    emit('reloadComponents');
  } catch (error) {
    console.error('Error removing location:', error);
    loadUserData();
    $q.notify({
      color: 'negative',
      message: t('common.errorRemovingLocation'),
      icon: 'error',
      position: 'top-right'
    });
  }
};

// Add this helper function to calculate distance between coordinates
const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Distance in meters
};

// Update the updateLocationCoordinates function
const updateLocationCoordinates = async (index: number) => {
  locationLoading.value[index] = true;
  try {
    const position = await Geolocation.getCurrentPosition({
      enableHighAccuracy: true,
      timeout: 10000
    });

    const newLat = position.coords.latitude;
    const newLon = position.coords.longitude;
    
    // Check distance with all existing locations
    const tooClose = values.value.locations.some((loc, idx) => {
      if (idx === index || !isLocationValid(loc)) return false;

      const [existingLon, existingLat] = loc.location.coordinates;
      const distance = calculateDistance(
        newLat,
        newLon,
        existingLat,
        existingLon
      );

      return distance < 500; // Less than 500 meters
    });

    if (tooClose) {
      // Clear the location if too close
      values.value.locations[index].location.coordinates = [null, null];
      values.value.locations[index].name = '';

      $q.notify({
        color: 'negative',
        message: t('common.locationTooClose'),
        icon: 'error',
        position: 'top-right'
      });
      return;
    }

    // Update coordinates if location is valid
    values.value.locations[index].location.coordinates = [
      position.coords.longitude,
      position.coords.latitude
    ];

    await validateAndSubmit(false);
  } catch (error) {
    console.error('Error getting location', error);
    $q.notify({
      color: 'negative',
      message: t('common.locationError'),
      icon: 'error',
      position: 'top-right'
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
    return `${t('common.coordinates')}: ${latitude.toFixed(
      6
    )}, ${longitude.toFixed(6)}`;
  }
  return t('common.noLocationSet');
};

const isLocationValid = (location: {
  location: { coordinates: [number | null, number | null] };
}) => {
  const [longitude, latitude] = location.location.coordinates;
  return latitude !== null && longitude !== null;
};

const isFormValid = computed(() => {
  if (!values.value.availableForCommunity) {
    return true;
  }
  return values.value.locations.every(isLocationValid);
});

const getLocationCoordinates = (location: {
  location: { coordinates: [number, number] };
}) => {
  const [longitude, latitude] = location.location.coordinates;
  if (latitude && longitude) {
    return `${t('common.coordinates')}: ${latitude.toFixed(
      6
    )}, ${longitude.toFixed(6)}`;
  }
  return '';
};

// Add defineEmits near the top of the script setup section, after the imports
const props = defineProps<{
  reloadComponents?: () => void;
}>();

const emit = defineEmits(['reloadComponents']);

// Modify the callbacks.onSuccess to emit reloadComponents after successful update
callbacks.onSuccess = (data) => {
  userStore.updateUser(data.user);
  loadUserData(); // Reload user data from the store
  // Emit reloadComponents

  $q.notify({
    color: 'black',
    message: t('common.volunteeringUpdateSuccess'),
    icon: 'check',
    position: 'top-right',
  });
};

callbacks.onError = async (error: any) => {
  console.error('Error updating volunteering info', error);
  $q.notify({
    color: 'negative',
    message: t('common.volunteeringUpdateError'),
    icon: 'error',
    position: 'top-right',
  });
};

const handleSubmit = async () => {
  if (isFormValid.value) {
    try {
      await validateAndSubmit(false);
      // Call both the prop function and emit the event
      props.reloadComponents?.();
      emit('reloadComponents');
    } catch (error) {
      console.error('Form submission error:', error);
      $q.notify({
        color: 'negative',
        message: t('common.pleaseSelectAllLocations'),
        icon: 'error',
        position: 'top-right',
      });
    }
  } else {
    $q.notify({
      color: 'negative',
      message: t('common.pleaseSelectAllLocations'),
      icon: 'error',
      position: 'top-right',
    });
  }
};

const openGoogleMaps = (coordinates: [number, number]) => {
  const [longitude, latitude] = coordinates;
  const url = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;
  window.open(url, '_blank');
};

// Update defineExpose to include all needed template properties
defineExpose({
  $t,
  values,
  isLoading,
  locationLoading,
  isLocationValid,
  getLocationCoordinates,
  updateLocationCoordinates,
  removeNotificationLocation,
  openGoogleMaps,
  handleSubmit,
  isFormValid,
});

// Add these refs
const showInputFields = ref(false);
const newLocation = ref<UserLocation>({
  name: '',
  location: {
    type: 'Point',
    coordinates: [null, null]
  }
});
const newLocationLoading = ref(false);
const isAddingLocation = ref(false);

// Add these computed properties
const hasLocations = computed(() => values.value.locations.length > 0);
const isNewLocationValid = computed(() => {
  return newLocation.value.name.trim() !== '' && 
         newLocation.value.location.coordinates[0] !== null && 
         newLocation.value.location.coordinates[1] !== null;
});

// Add these methods
const handleAvailabilityToggle = async () => {
  try {
    await validateAndSubmit(false);
    props.reloadComponents?.();
    emit('reloadComponents');
  } catch (error) {
    console.error('Error updating availability:', error);
    $q.notify({
      color: 'negative',
      message: t('common.updateError'),
      icon: 'error',
      position: 'top-right'
    });
  }
};

const clearInputFields = () => {
  newLocation.value = {
    name: '',
    location: {
      type: 'Point',
      coordinates: [null, null]
    }
  };
  showInputFields.value = false;
};

const getCurrentLocationForNew = async () => {
  newLocationLoading.value = true;
  try {
    const position = await Geolocation.getCurrentPosition({
      enableHighAccuracy: true,
      timeout: 10000
    });

    const newLat = position.coords.latitude;
    const newLon = position.coords.longitude;

    // Check distance with existing locations
    const tooClose = values.value.locations.some((loc) => {
      if (!isLocationValid(loc)) return false;

      const [existingLon, existingLat] = loc.location.coordinates;
      if (!existingLat || !existingLon) return false;

      const distance = calculateDistance(newLat, newLon, existingLat, existingLon);
      return distance < 500; // Less than 500 meters
    });

    if (tooClose) {
      newLocation.value = {
        name: '',
        location: {
          type: 'Point',
          coordinates: [null, null]
        }
      };
      
      $q.notify({
        color: 'negative',
        message: t('common.locationTooClose'),
        icon: 'error',
        position: 'top-right'
      });
      return;
    }

    newLocation.value.location.coordinates = [position.coords.longitude, position.coords.latitude];

   
  } catch (error) {
    console.error('Error getting location', error);
    $q.notify({
      color: 'negative',
      message: t('common.locationError'),
      icon: 'error',
      position: 'top-right'
    });
  } finally {
    newLocationLoading.value = false;
  }
};

const addNewLocation = async () => {
  if (!isNewLocationValid.value) {
    $q.notify({
      color: 'negative',
      message: t('common.pleaseSelectLocation'),
      icon: 'error',
      position: 'top-right'
    });
    return;
  }

  isAddingLocation.value = true;

  try {
    const updatedLocations = [...values.value.locations, { ...newLocation.value }];
    values.value.locations = updatedLocations;
    await validateAndSubmit(false);
    clearInputFields();
    
    props.reloadComponents?.();
    emit('reloadComponents');
  } catch (error) {
    console.error('Error adding location:', error);
    loadUserData();
    $q.notify({
      color: 'negative',
      message: t('common.errorAddingLocation'),
      icon: 'error',
      position: 'top-right'
    });
  } finally {
    isAddingLocation.value = false;
  }
};
</script>

<style lang="scss" scoped>
.volunteering-page {
  min-height: auto !important;
  background-color: white;
}

.volunteering-content {
  max-width: 600px;
  margin: 0 auto;
}

.custom-input {
  margin-bottom: 20px;
}

.custom-input label {
  display: block;
  margin-bottom: 4px;
  font-size: 0.9rem;
  color: #666;
}

.contact-card {
  border-radius: 10px;
  display: flex;
  align-items: center;
}

.remove-btn {
  background-color: black;
  align-self: flex-end;
  border-radius: 10px;
  margin-left: 10px;
  color: white;
  font-size: 12px;
  text-transform: capitalize;
}

:deep(.custom-radius) .q-field__control {
  border-radius: 10px !important;
  height: 45px;
}

/* Add other styles from the reference component */
</style>
