<template>
  <div>
    <!-- Notification locations -->
    <div class="q-mb-md">
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
            location.location.coordinates[1] && location.location.coordinates[0]
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
  </div>
</template>

<script lang="ts" setup>
import { useI18n } from 'vue-i18n';
import { useQuasar } from 'quasar';
import { Capacitor } from '@capacitor/core';
import { Geolocation } from '@capacitor/geolocation';
import { useUserStore } from 'src/stores/user-store';

const { t } = useI18n();
const $q = useQuasar();
const userStore = useUserStore();

const values = userStore.user;

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
</script>
