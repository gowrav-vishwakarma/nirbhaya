<template>
  <q-page class="q-pa-md">
    <div class="row q-col-gutter-md q-mb-md">
      <div class="col-12">
        <q-input
          v-model="address"
          label="Location"
          :loading="addressLoading"
          :readonly="addressLoading"
          class="q-mb-sm"
        >
          <template v-slot:append>
            <q-btn
              round
              dense
              flat
              :icon="$t('icons.myLocation')"
              @click="getCurrentLocation"
              :loading="locationLoading"
            />
          </template>
        </q-input>
      </div>
      <div class="col-12">
        <q-slider
          v-model="range"
          :min="100"
          :max="5000"
          :step="100"
          label
          label-always
          :label-value="`${range}m`"
          class="q-mt-md"
        />
      </div>
    </div>

    <div class="volunteer-map" ref="volunteerMap">
      <div class="map-center">
        <q-icon :name="$t('icons.myLocation')" size="24px" color="primary" />
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
      <p>{{ volunteers.length }} volunteers found within {{ range }}m</p>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { useQuasar, debounce } from 'quasar'; // Import debounce from Quasar
import { useI18n } from 'vue-i18n';
import { api } from 'src/boot/axios';
import { Geolocation } from '@capacitor/geolocation';

const $q = useQuasar();
const { t } = useI18n();

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
      message: t('locationError'),
      icon: 'error',
    });
  } finally {
    locationLoading.value = false;
  }
};

const fetchVolunteers = async () => {
  try {
    const response = await api.get('/auth/volunteers-nearby', {
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
      message: t('fetchVolunteersError'),
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
  const x = (volunteer.location.coordinates[0] + 180) * (mapWidth / 360);
  const y = (90 - volunteer.location.coordinates[1]) * (mapHeight / 180);
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

onMounted(() => {
  getCurrentLocation();
});
</script>

<style scoped>
.volunteer-map {
  position: relative;
  width: 100%;
  height: 300px;
  border: 1px solid #ccc;
  border-radius: 8px;
  overflow: hidden;
}

.map-center {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.volunteer-icon {
  position: absolute;
  transform: translate(-50%, -50%);
}
</style>
