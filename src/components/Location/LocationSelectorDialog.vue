<template>
  <q-dialog v-model="isOpen" maximized>
    <q-card class="column no-wrap full-height">
      <q-card-section class="row items-center q-pb-none">
        <div class="text-h6">Select Location</div>
        <q-space />
        <q-btn icon="close" flat round dense v-close-popup />
      </q-card-section>

      <q-separator class="q-my-md" />

      <q-card-section class="col q-pt-none">
        <div class="map-container" ref="mapContainer">
          <q-inner-loading :showing="isLoading">
            <q-spinner-gears size="50px" color="primary" />
          </q-inner-loading>
        </div>

        <div class="map-controls">
          <div class="q-gutter-sm">
            <q-btn icon="add" round color="primary" @click="zoomIn" />
            <q-btn icon="remove" round color="primary" @click="zoomOut" />
            <q-btn
              icon="my_location"
              round
              color="primary"
              @click="centerOnUserLocation"
            />

            <!-- <q-btn
              icon="search"
              round
              color="primary"
              @click="showSearchDialog = true"
            /> -->
            <q-btn
              icon="edit_location"
              round
              color="primary"
              @click="showCoordinatesDialog = true"
            />
          </div>
        </div>
      </q-card-section>

      <q-card-section class="q-pa-none">
        <q-separator />
        <div class="row justify-end q-pa-md">
          <q-btn flat label="Cancel" v-close-popup class="q-mr-sm" />
          <q-btn
            unelevated
            color="primary"
            label="Select Location"
            @click="confirmLocation"
            :disable="!selectedLocation"
          />
        </div>
      </q-card-section>
    </q-card>
  </q-dialog>

  <q-dialog v-model="showSearchDialog" position="top">
    <q-card style="width: 90vw; max-width: 500px">
      <q-card-section>
        <div class="text-h6">Search Location</div>
      </q-card-section>

      <q-card-section class="q-pt-none">
        <q-input
          v-model="searchQuery"
          label="Search location"
          placeholder="Enter city, location, pin code"
          @update:model-value="searchLocation"
          :loading="isSearching"
          autofocus
        >
          <template v-slot:append>
            <q-icon name="search" />
          </template>
        </q-input>

        <q-list
          v-if="searchResults.length"
          bordered
          class="rounded-borders q-mt-sm"
        >
          <q-item
            v-for="result in searchResults"
            :key="`${result.place_id}-${result.osm_id}`"
            clickable
            v-ripple
            @click="selectSearchResult(result)"
          >
            <q-item-section>
              <q-item-label>{{ result.display_name }}</q-item-label>
            </q-item-section>
          </q-item>
        </q-list>
      </q-card-section>

      <q-card-actions align="right">
        <q-btn flat label="Close" color="primary" v-close-popup />
      </q-card-actions>
    </q-card>
  </q-dialog>

  <q-dialog v-model="showCoordinatesDialog" position="top">
    <q-card style="width: 90vw; max-width: 500px">
      <q-card-section>
        <div class="text-h6">Enter Coordinates</div>
      </q-card-section>

      <q-card-section class="q-pt-none">
        <q-input
          v-model="coordinatesInput"
          label="Enter coordinates (latitude longitude)"
          placeholder="e.g. 20.5937 78.9629 or 20.5937, 78.9629"
          @keyup.enter="() => handleCoordinatesInput('enter')"
          :error="!!coordinatesError"
          :error-message="coordinatesError"
          :loading="isProcessingCoordinates"
          autofocus
        >
          <template v-slot:append>
            <q-btn
              round
              dense
              flat
              icon="place"
              @click="() => handleCoordinatesInput('button')"
            />
          </template>
        </q-input>
      </q-card-section>

      <q-card-actions align="right">
        <q-btn flat label="Close" color="primary" v-close-popup />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed, watch, nextTick } from 'vue';
import L from 'leaflet';
import { Geolocation } from '@capacitor/geolocation';
import 'leaflet/dist/leaflet.css';
import { useQuasar } from 'quasar';
import { debounce } from 'lodash';
import type { NominatimResponse } from '@/types/location';

const $q = useQuasar();

const props = defineProps<{
  modelValue: boolean;
  zoom?: number;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void;
  (
    e: 'location-selected',
    location: {
      type: string;
      coordinates: number[];
    }
  ): void;
}>();

const isOpen = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
});

const mapContainer = ref<HTMLElement | null>(null);
const map = ref<L.Map | null>(null);
const marker = ref<L.Marker | null>(null);
const isLoading = ref(true);
const selectedLocation = ref<{ lat: number; lng: number } | null>(null);
const coordinatesInput = ref('');
const coordinatesError = ref('');
const isProcessingCoordinates = ref(false);
const searchQuery = ref('');
const searchResults = ref<NominatimResponse[]>([]);
const isSearching = ref(false);
const showSearchDialog = ref(false);
const showCoordinatesDialog = ref(false);

const defaultZoom = computed(() => props.zoom || 15);

const markerIcon = L.divIcon({
  html: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 0C7.58 0 4 3.58 4 8C4 13.54 12 24 12 24C12 24 20 13.54 20 8C20 3.58 16.42 0 12 0Z" fill="#FF0000"/>
    <circle cx="12" cy="8" r="4" fill="white"/>
  </svg>`,
  className: 'custom-div-icon',
  iconSize: [24, 24],
  iconAnchor: [12, 24],
});

const initMap = (center: L.LatLngExpression) => {
  if (!mapContainer.value) return;

  try {
    map.value = L.map(mapContainer.value).setView(center, defaultZoom.value);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 22,
    }).addTo(map.value);

    map.value.on('click', (e: L.LeafletMouseEvent) => {
      const { lat, lng } = e.latlng;
      updateMarker([lat, lng]);
    });

    // Add Indian boundary overlay
    fetch('/india_boundary.geojson')
      .then((response) => response.json())
      .then((data) => {
        L.geoJSON(data, {
          style: {
            color: '#ff7800',
            weight: 2,
            opacity: 0.65,
            fill: false,
          },
        }).addTo(map.value!);
      });

    // Force a resize after map is created
    setTimeout(() => {
      map.value?.invalidateSize();
    }, 250);
  } catch (error) {
    console.error('Error initializing map:', error);
    $q.notify({
      color: 'negative',
      message: 'Error initializing map',
      icon: 'error',
      position: 'top-right',
    });
  }
};

const updateMarker = (coordinates: [number, number]) => {
  if (!map.value) return;

  if (marker.value) {
    marker.value.remove();
  }

  marker.value = L.marker(coordinates, { icon: markerIcon }).addTo(map.value);
  selectedLocation.value = { lat: coordinates[0], lng: coordinates[1] };
};

const getUserLocation = async () => {
  try {
    const position = await Geolocation.getCurrentPosition({ timeout: 10000 });
    return {
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
    };
  } catch (error) {
    console.error('Error getting user location:', error);
    return null;
  }
};

const centerOnUserLocation = async () => {
  isLoading.value = true;
  const location = await getUserLocation();
  if (location && map.value) {
    map.value.setView(
      [location.latitude, location.longitude],
      defaultZoom.value
    );
    updateMarker([location.latitude, location.longitude]);
  }
  isLoading.value = false;
};

const zoomIn = () => {
  map.value?.zoomIn();
};

const zoomOut = () => {
  map.value?.zoomOut();
};

const confirmLocation = () => {
  if (selectedLocation.value) {
    emit('location-selected', {
      type: 'Point',
      coordinates: [selectedLocation.value.lng, selectedLocation.value.lat],
    });
    isOpen.value = false;
    cleanupMap();
  }
};

const cleanupMap = () => {
  if (map.value) {
    map.value.remove();
    map.value = null;
  }
  if (marker.value) {
    marker.value.remove();
    marker.value = null;
  }
  selectedLocation.value = null;
  coordinatesInput.value = '';
  coordinatesError.value = '';
  searchQuery.value = '';
  searchResults.value = [];
  showCoordinatesDialog.value = false;
};

const handleCoordinatesInput = async (trigger: 'enter' | 'button' | 'blur') => {
  if (!coordinatesInput.value) return;

  // Don't process on blur if coordinates were already processed by enter or button
  if (trigger === 'blur' && isProcessingCoordinates.value) return;

  // Clear previous error
  coordinatesError.value = '';
  isProcessingCoordinates.value = true;

  try {
    // Split by comma or space
    const coords = coordinatesInput.value.split(/[\s,]+/).filter(Boolean);

    if (coords.length !== 2) {
      coordinatesError.value = 'Please enter valid latitude and longitude';
      return;
    }

    const lat = parseFloat(coords[0]);
    const lng = parseFloat(coords[1]);

    if (isNaN(lat) || isNaN(lng)) {
      coordinatesError.value = 'Invalid coordinates format';
      return;
    }

    if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      coordinatesError.value = 'Coordinates out of valid range';
      return;
    }

    if (map.value) {
      await new Promise((resolve) => setTimeout(resolve, 500));
      map.value.setView([lat, lng], defaultZoom.value);
      updateMarker([lat, lng]);
      showCoordinatesDialog.value = false;

      // Blur input field if triggered by enter or button click
      if (trigger !== 'blur') {
        const input = document.querySelector(
          'input[type="text"]'
        ) as HTMLInputElement;
        input?.blur();
      }
    }
  } finally {
    isProcessingCoordinates.value = false;
  }
};

const searchLocation = debounce(async (query: string) => {
  if (!query.trim()) {
    searchResults.value = [];
    return;
  }

  isSearching.value = true;
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
        query
      )}&limit=5`
    );
    const data = await response.json();
    searchResults.value = data;
  } catch (error) {
    console.error('Error searching location:', error);
    $q.notify({
      color: 'negative',
      message: 'Error searching location',
      icon: 'error',
      position: 'top-right',
    });
  } finally {
    isSearching.value = false;
  }
}, 500);

const selectSearchResult = (result: NominatimResponse) => {
  const lat = parseFloat(result.lat);
  const lng = parseFloat(result.lon);

  if (map.value) {
    map.value.setView([lat, lng], defaultZoom.value);
    updateMarker([lat, lng]);
  }

  searchResults.value = [];
  searchQuery.value = '';
  showSearchDialog.value = false;
};

watch(
  () => isOpen.value,
  async (newValue) => {
    if (newValue) {
      // Wait for DOM to update
      await nextTick();
      isLoading.value = true;
      cleanupMap();
      const location = await getUserLocation();
      const defaultCenter: L.LatLngExpression = location
        ? [location.latitude, location.longitude]
        : [20.5937, 78.9629]; // India center coordinates
      initMap(defaultCenter);
      isLoading.value = false;
    } else {
      cleanupMap();
    }
  }
);

onUnmounted(() => {
  cleanupMap();
});
</script>

<style scoped>
.map-container {
  height: 100%;
  width: 100%;
  position: relative;
  z-index: 1;
}

.map-controls {
  position: absolute;
  bottom: 20px;
  right: 20px;
  z-index: 1001;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.custom-div-icon {
  background: none;
  border: none;
}

:deep(.leaflet-container) {
  height: 100%;
  width: 100%;
  z-index: 1;
}
</style>
