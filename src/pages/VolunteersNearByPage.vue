<template>
  <q-page class="volunteers-nearby-page q-pa-md">
    <location-handler />
    <div class="volunteers-nearby-content">
      <q-card class="volunteers-nearby-card q-mb-md">
        <q-card-section>
          <div class="text-h6 text-weight-bold q-mb-md">
            {{ $t('common.nearbyVolunteers') }}
          </div>

          <div class="row q-col-gutter-md q-mb-md">
            <div class="col-12">
              <q-input
                v-model="address"
                :label="$t('common.location')"
                :loading="addressLoading"
                :readonly="addressLoading"
                outlined
                dense
              >
                <template v-slot:append>
                  <q-btn
                    round
                    dense
                    flat
                    :icon="$t('common.icons.myLocation')"
                    @click="getCurrentLocation"
                    :loading="locationLoading"
                  >
                    <q-tooltip>{{ $t('common.useCurrentLocation') }}</q-tooltip>
                  </q-btn>
                </template>
              </q-input>
            </div>
            <div class="col-12">
              <div class="text-subtitle2 q-mb-sm">
                {{ $t('common.searchRadius') }}
              </div>
              <q-slider
                v-model="range"
                :min="100"
                :max="5000"
                :step="100"
                label
                label-always
                :label-value="`${range}m`"
                color="primary"
              />
            </div>
          </div>

          <div class="volunteer-map q-mb-md" ref="volunteerMap">
            <div class="map-center">
              <q-icon
                :name="$t('common.icons.myLocation')"
                size="24px"
                color="primary"
              />
            </div>
            <div class="north-indicator">
              <q-icon name="north" size="24px" color="red" />
            </div>
            <div
              v-for="volunteer in volunteers"
              :key="volunteer.id"
              class="volunteer-icon"
              :style="getVolunteerPosition(volunteer)"
            >
              <q-icon
                :name="getVolunteerIcon(volunteer)"
                size="20px"
                :color="getVolunteerColor(volunteer)"
              />
              <q-tooltip>
                {{ volunteer.profession }}
              </q-tooltip>
            </div>
          </div>

          <div class="text-center q-mt-md">
            <p class="text-subtitle1">
              {{ volunteers.length }} {{ $t('common.volunteersFound') }}
              {{ range }}m
            </p>
          </div>

          <!-- <q-list bordered separator>
            <q-item v-for="volunteer in volunteers" :key="volunteer.id">
              <q-item-section avatar>
                <q-icon
                  :name="getVolunteerIcon(volunteer)"
                  :color="getVolunteerColor(volunteer)"
                />
              </q-item-section>
              <q-item-section>
                <q-item-label>{{ volunteer.profession }}</q-item-label>
                <q-item-label caption>
                  {{ $t('common.distance') }}:
                  {{ calculateDistance(volunteer) }}m
                </q-item-label>
              </q-item-section>
            </q-item>
          </q-list> -->
          <div class="text-center q-mt-md">
            <q-btn
              class="volunteers-bg-color"
              @click="router.push('/sos-events-map')"
            >
              <span class="text-bold"> View SOS Events Map </span>
            </q-btn>
          </div>
        </q-card-section>
      </q-card>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { useQuasar, debounce } from 'quasar'; // Import debounce from Quasar
import { useI18n } from 'vue-i18n';
import { api } from 'src/boot/axios';
import { Geolocation } from '@capacitor/geolocation';
import { useUserStore } from 'src/stores/user-store';
import { useRouter } from 'vue-router';
import LocationHandler from 'src/components/LocationHandler.vue';

const $q = useQuasar();
const { t } = useI18n();
const userStore = useUserStore();

const router = useRouter();

const address = ref('');
const range = ref(500);
const volunteers = ref([]);
const addressLoading = ref(false);
const locationLoading = ref(false);
const volunteerMap = ref(null);

const getCurrentLocation = async () => {
  locationLoading.value = true;
  try {
    const position = await Geolocation.getCurrentPosition();
    address.value = `${position.coords.latitude}, ${position.coords.longitude}`;
    fetchVolunteers();
  } catch (error) {
    console.error('Error getting location', error);
    $q.notify({
      color: 'negative',
      message: t('common.locationError'),
      icon: 'error',
    });
  } finally {
    locationLoading.value = false;
  }
};

const fetchVolunteers = async () => {
  try {
    const response = await api.get('/community/volunteers-nearby', {
      params: {
        location: address.value,
        range: range.value,
      },
    });
    volunteers.value = response.data;
  } catch (error) {
    console.error('Error fetching volunteers', error);
    $q.notify({
      color: 'negative',
      message: t('common.fetchVolunteersError'),
      icon: 'error',
    });
  }
};

// Debounce the fetchVolunteers function using Quasar's debounce utility
const debouncedFetchVolunteers = debounce(fetchVolunteers, 500);

watch(range, debouncedFetchVolunteers, { deep: true });

const getVolunteerPosition = (volunteer) => {
  const mapWidth = volunteerMap.value?.offsetWidth || 300;
  const mapHeight = volunteerMap.value?.offsetHeight || 300;

  // Use the current position as the center
  const [latitude, longitude] = address.value.split(',').map(Number); // Your latitude and longitude

  // Calculate the distance from the center to the volunteer's location
  const distanceX = volunteer.location.coordinates[0] - longitude; // Longitude difference
  const distanceY = volunteer.location.coordinates[1] - latitude; // Latitude difference

  // Convert degrees to meters (approximate)
  const scaleX = distanceX * 111320 * (mapWidth / (range.value * 2)); // Scale based on range
  const scaleY = distanceY * 110574 * (mapHeight / (range.value * 2)); // Scale based on range

  const x = mapWidth / 2 + scaleX; // Center the map
  const y = mapHeight / 2 - scaleY; // Invert Y for correct positioning

  return {
    left: `${x}px`,
    top: `${y}px`,
  };
};

const getVolunteerIcon = (volunteer) => {
  const professionIcons = {
    hospital: 'local_hospital',
    'Doctor General': 'local_hospital',
    'Doctor Emergency': 'local_hospital',
    '2 Wheeler Mechanic': 'build',
    '4 Wheeler Mechanic': 'build',
    '2&4 Wheeler Mechanic': 'build',
    Nurse: 'local_hospital',
    Other: 'person',
  };
  return professionIcons[volunteer.profession] || 'person';
};

const getVolunteerColor = (volunteer) => {
  // Map professions to colors
  const professionColors = {
    doctor: 'red',
    police: 'blue',
    firefighter: 'orange',
    default: 'green',
  };
  return professionColors[volunteer.profession] || professionColors.default;
};

// const calculateDistance = (volunteer) => {
//   const [latitude, longitude] = address.value.split(',').map(Number);
//   const volunteerLat = volunteer.location.coordinates[1];
//   const volunteerLng = volunteer.location.coordinates[0];

//   const R = 6371; // Radius of the earth in kilometers
//   const dLat = (volunteerLat - latitude) * (Math.PI / 180);
//   const dLng = (volunteerLng - longitude) * (Math.PI / 180);
//   const a =
//     Math.sin(dLat / 2) * Math.sin(dLat / 2) +
//     Math.cos(latitude * (Math.PI / 180)) *
//     Math.cos(volunteerLat * (Math.PI / 180)) *
//     Math.sin(dLng / 2) *
//     Math.sin(dLng / 2);
//   const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
//   const distance = R * c * 1000; // Convert to meters

//   return Math.round(distance);
// };

onMounted(() => {
  if (!userStore.isLoggedIn) {
    $q.notify({
      color: 'negative',
      message: t('common.loginToViewVolunteers'),
      icon: 'error',
    });
    router.push('/login');
  } else {
    getCurrentLocation();
  }
});
</script>

<style lang="scss" scoped>
.volunteers-nearby-page {
  background: linear-gradient(135deg, $primary, darken($primary, 20%));
  min-height: 100vh;
}

.volunteers-nearby-content {
  max-width: 600px;
  margin: 0 auto;
}

.volunteers-nearby-card {
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.volunteer-map {
  position: relative;
  width: 100%;
  height: 300px;
  border: 1px solid #ccc;
  border-radius: 8px;
  overflow: hidden;
  background-color: #f0f0f0;
}

.map-center {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.north-indicator {
  position: absolute;
  top: 10px;
  left: 50%;
  transform: translateX(-50%);
  background-color: rgba(255, 255, 255, 0.7);
  border-radius: 50%;
  padding: 4px;
}

.volunteer-icon {
  position: absolute;
  transform: translate(-50%, -50%);
}

.q-item {
  transition: background-color 0.3s;

  &:hover {
    background-color: #f0f0f0;
  }
}

.volunteers-bg-color {
  background: linear-gradient(135deg, $primary, darken($primary, 10%));
  color: whitesmoke;
}
</style>
