<template>
  <q-page class="volunteering-page q-pa-md">
    <div class="volunteering-content">
      <q-card class="volunteering-card q-mb-md">
        <q-card-section>
          <div class="text-h6 text-weight-bold q-mb-md">
            {{ $t('common.volunteeringSettings') }}
          </div>

          <q-form @submit.prevent="handleSubmit">
            <!-- Notification locations -->
            <div class="q-mb-lg">
              <div class="text-subtitle1 text-weight-bold q-mb-sm">
                {{ $t('common.notificationLocations') }}
                <q-icon
                  :name="$t('common.icons.help')"
                  size="xs"
                  class="q-ml-sm"
                >
                  <q-tooltip>{{
                    $t('common.notificationLocationsHelp')
                  }}</q-tooltip>
                </q-icon>
              </div>
              <q-list bordered separator>
                <q-item
                  v-for="(location, index) in values.locations"
                  :key="index"
                >
                  <q-item-section>
                    <q-input
                      outlined
                      dense
                      v-model="location.name"
                      :label="$t('common.locationName')"
                      :error="!isLocationValid(location)"
                      :error-message="$t('common.pleaseSelectLocation')"
                      class="full-width"
                      :disable="!values.availableForCommunity"
                    >
                    </q-input>
                    <div
                      v-if="isLocationValid(location)"
                      class="text-caption q-mt-sm"
                    >
                      {{ getLocationCoordinates(location) }}
                    </div>
                  </q-item-section>
                  <q-item-section side top>
                    <q-btn-group spread>
                      <q-btn
                        flat
                        color="primary"
                        :icon="$t('common.icons.myLocation')"
                        @click="updateLocationCoordinates(index)"
                        :loading="locationLoading[index]"
                        :disable="!values.availableForCommunity"
                      >
                        <q-tooltip>{{
                          $t('common.useCurrentLocation')
                        }}</q-tooltip>
                      </q-btn>
                      <q-btn
                        flat
                        color="negative"
                        :icon="$t('common.icons.delete')"
                        @click="removeNotificationLocation(index)"
                        :disable="!values.availableForCommunity"
                      />
                    </q-btn-group>
                    <q-space />
                    <q-btn
                      flat
                      dense
                      round
                      icon="map"
                      :disable="
                        !isLocationValid(location) ||
                        !values.availableForCommunity
                      "
                      @click="openGoogleMaps(location.location.coordinates)"
                      class="q-mb-0"
                    >
                      <q-tooltip>{{ $t('common.viewOnMap') }}</q-tooltip>
                    </q-btn>
                  </q-item-section>
                </q-item>
              </q-list>
              <div class="text-center q-mt-sm">
                <q-btn
                  v-if="values.locations.length < 10"
                  @click="addNotificationLocation"
                  color="primary"
                  :icon="$t('common.icons.addCircle')"
                  :label="$t('common.addNotificationLocation')"
                  no-caps
                  :disable="!values.availableForCommunity"
                />
              </div>
            </div>

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
                      />
                    </q-item-section>
                  </q-item>
                  <q-item tag="label" v-ripple>
                    <q-item-section>
                      <q-item-label>{{
                        $t('common.availableForPaidProfessionalService')
                      }}</q-item-label>
                      <q-item-label caption>{{
                        $t(
                          'common.availableForPaidProfessionalServiceDescription'
                        )
                      }}</q-item-label>
                    </q-item-section>
                    <q-item-section side>
                      <q-toggle
                        v-model="values.availableForPaidProfessionalService"
                        color="primary"
                      />
                    </q-item-section>
                  </q-item>
                </q-list>
              </q-card-section>
            </q-card>

            <!-- Save button -->
            <div class="q-mt-lg">
              <q-btn
                type="submit"
                :loading="isLoading"
                color="primary"
                class="full-width"
                :disable="!isFormValid"
                no-caps
              >
                <b>{{ $t('common.saveChanges') }}</b>
              </q-btn>
            </div>
          </q-form>
        </q-card-section>
      </q-card>
    </div>
  </q-page>
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
      message: t('common.locationUpdated'),
      icon: 'check',
    });
  } catch (error) {
    console.error('Error getting location', error);
    $q.notify({
      color: 'negative',
      message: t('common.locationError'),
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

callbacks.onSuccess = (data) => {
  userStore.updateUser(data.user);
  loadUserData(); // Reload user data from the store
  $q.notify({
    color: 'positive',
    message: t('common.volunteeringUpdateSuccess'),
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
    message: t('common.volunteeringUpdateError'),
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
      message: t('common.pleaseSelectAllLocations'),
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

<style lang="scss" scoped>
.volunteering-page {
  background: linear-gradient(135deg, $primary, darken($primary, 20%));
  min-height: 100vh;
}

.volunteering-content {
  max-width: 600px;
  margin: 0 auto;
}

.volunteering-card {
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.q-item {
  border-radius: 8px;
}

.q-btn-group {
  border-radius: 8px;
  overflow: hidden;
}

.q-input {
  width: 100%;
}
</style>
