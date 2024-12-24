<template>
  <q-card flat class="bg-white">
    <q-card-section>
      <div class="text-h6 text-weight-bold text-primary q-mb-md">
        Astrological Profile
      </div>
      <div class="row q-col-gutter-md">
        <div class="col-12">
          <q-card class="profile-card">
            <q-card-section>
              <q-input v-model="name" label="Name" />
              <q-input v-model="email" label="Email" type="email" />
              <q-input v-model="birthDate" label="Birth Date" type="date" />
              <q-input v-model="birthTime" label="Birth Time" type="time" />
              <q-select
                v-model="timezone"
                :options="timezones"
                label="Timezone"
              />
              <q-input v-model="birthPlace" label="Birth Place" />

              <div
                ref="mapContainer"
                style="height: 400px; width: 100%; margin-top: 20px"
              ></div>
              <div class="text-caption q-mt-sm">
                Click on the map to update your birth location
              </div>
            </q-card-section>

            <q-card-actions align="right">
              <q-btn
                label="Update Profile"
                color="primary"
                @click="updateProfile"
              />
            </q-card-actions>
          </q-card>
        </div>

        <div v-if="birthChart" class="col-12">
          <q-card class="profile-card">
            <q-card-section>
              <IndianBirthChart :birthChart="birthChart" />
            </q-card-section>
          </q-card>
        </div>
      </div>
    </q-card-section>
  </q-card>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { Loader } from '@googlemaps/js-api-loader';
import { timezones } from '../../../utils/timezones';
import IndianBirthChart from '../../../components/IndianBirthChart.vue';
import { api } from '../../../boot/axios';

const name = ref('');
const email = ref('');
const birthDate = ref('');
const birthTime = ref('');
const birthPlace = ref('');
const latitude = ref(0);
const longitude = ref(0);
const birthChart = ref(null);
const timezone = ref('UTC');

const mapContainer = ref<HTMLElement | null>(null);
let map: google.maps.Map;
let marker: google.maps.Marker;

onMounted(async () => {
  // Load user data
  try {
    const response = await api.get('/auth/profile');
    const userData = response.data;

    name.value = userData.name || '';
    email.value = userData.email || '';
    birthDate.value = userData.birth_date || '';
    birthTime.value = userData.birth_time || '';
    birthPlace.value = userData.birth_place || '';
    latitude.value = userData.birth_location?.latitude || 0;
    longitude.value = userData.birth_location?.longitude || 0;
    birthChart.value = userData.birth_chart;
    timezone.value = userData.timezone || 'UTC';
  } catch (error) {
    console.error('Error loading profile:', error);
  }

  // Initialize Google Maps
  const loader = new Loader({
    apiKey: process.env.GOOGLE_MAPS_API_KEY,
    version: 'weekly',
  });

  const google = await loader.load();
  const { Map } = (await google.maps.importLibrary(
    'maps'
  )) as google.maps.MapsLibrary;

  map = new Map(mapContainer.value!, {
    center: { lat: latitude.value || 0, lng: longitude.value || 0 },
    zoom: latitude.value && longitude.value ? 8 : 2,
  });

  map.addListener('click', (e: google.maps.MapMouseEvent) => {
    placeMarker(e.latLng!);
  });

  if (latitude.value && longitude.value) {
    placeMarker(new google.maps.LatLng(latitude.value, longitude.value));
  }
});

const placeMarker = (latLng: google.maps.LatLng) => {
  if (marker) {
    marker.setPosition(latLng);
  } else {
    marker = new google.maps.Marker({
      position: latLng,
      map: map,
    });
  }
  latitude.value = latLng.lat();
  longitude.value = latLng.lng();
};

const updateProfile = async () => {
  try {
    const response = await api.put('/auth/profile', {
      name: name.value,
      email: email.value,
      birth_date: birthDate.value,
      birth_time: birthTime.value.split(':').slice(0, 2).join(':') + ':00',
      birth_place: birthPlace.value,
      birth_location: {
        latitude: latitude.value,
        longitude: longitude.value,
      },
      timezone: timezone.value,
    });
    birthChart.value = response.data.birth_chart;
  } catch (error) {
    console.error('Error updating profile:', error);
  }
};
</script>

<style lang="scss" scoped>
.profile-card {
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  }
}
</style>
