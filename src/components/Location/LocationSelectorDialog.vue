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
import { Geolocation } from '@capacitor/geolocation';
import { useQuasar } from 'quasar';
import { Loader } from '@googlemaps/js-api-loader';

const $q = useQuasar();

const props = defineProps<{
  modelValue: boolean;
  zoom?: number;
  initialLocation?: {
    type: string;
    coordinates: number[];
  };
  userLocations?: Array<{
    id?: string | number;
    name: string;
    location: {
      type: string;
      coordinates: number[];
    };
    isBusinessLocation?: boolean;
  }>;
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
const map = ref<google.maps.Map | null>(null);
const marker = ref<google.maps.Marker | null>(null);
const searchBox = ref<google.maps.places.SearchBox | null>(null);
const isLoading = ref(true);
const selectedLocation = ref<{ lat: number; lng: number } | null>(null);
const coordinatesInput = ref('');
const coordinatesError = ref('');
const isProcessingCoordinates = ref(false);
const showCoordinatesDialog = ref(false);
const markers = ref<google.maps.Marker[]>([]);

const defaultZoom = computed(() => props.zoom || 15);

const searchInput = ref<HTMLInputElement | null>(null);
const searchResults = ref<google.maps.places.PlaceResult[]>([]);
const isSearching = ref(false);
const showSearchResults = ref(false);

const initMap = async (center: { lat: number; lng: number }) => {
  if (!mapContainer.value) return;

  try {
    const loader = new Loader({
      apiKey: process.env.GOOGLE_MAPS_API_KEY!,
      version: 'weekly',
      libraries: ['places'],
    });

    const google = await loader.load();
    const { Map } = (await google.maps.importLibrary(
      'maps'
    )) as google.maps.MapsLibrary;

    map.value = new Map(mapContainer.value, {
      center,
      zoom: defaultZoom.value,
      mapTypeControl: false,
      streetViewControl: false,
      clickableIcons: false,
    });

    map.value.setOptions({
      draggableCursor: 'crosshair',
    });

    const searchContainer = document.createElement('div');
    searchContainer.className = 'search-container';

    const input = document.createElement('input');
    input.className = 'map-search-input';
    input.placeholder = 'Search for a location...';
    searchInput.value = input;

    const resultsContainer = document.createElement('div');
    resultsContainer.className = 'search-results-container';

    searchContainer.appendChild(input);
    searchContainer.appendChild(resultsContainer);

    map.value.controls[google.maps.ControlPosition.TOP_LEFT].push(
      searchContainer
    );

    searchBox.value = new google.maps.places.SearchBox(input);

    searchBox.value.addListener('places_changed', () => {
      isSearching.value = true;
      const places = searchBox.value?.getPlaces();
      if (!places?.length) return;

      searchResults.value = places;
      showSearchResults.value = true;

      resultsContainer.innerHTML = '';
      places.forEach((place, index) => {
        const resultItem = document.createElement('div');
        resultItem.className = 'search-result-item';
        resultItem.innerHTML = `
          <div class="result-name">${place.name || ''}</div>
          <div class="result-address">${place.formatted_address || ''}</div>
        `;

        resultItem.addEventListener('click', () => {
          selectSearchResult(place);
          showSearchResults.value = false;
          resultsContainer.innerHTML = '';
          if (searchInput.value) searchInput.value.value = place.name || '';
        });

        resultsContainer.appendChild(resultItem);
      });

      isSearching.value = false;
    });

    document.addEventListener('click', (e) => {
      if (!searchContainer.contains(e.target as Node)) {
        showSearchResults.value = false;
        resultsContainer.innerHTML = '';
      }
    });

    map.value.addListener('click', (e: google.maps.MapMouseEvent) => {
      if (e.latLng) {
        updateMarker(e.latLng);
      }
    });

    if (center) {
      updateMarker(new google.maps.LatLng(center.lat, center.lng));
    }

    // Add Indian boundary overlay if needed
    // ... (you can keep this if required)
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

const updateMarker = (position: google.maps.LatLng) => {
  if (!map.value) return;

  // Remove all existing markers
  markers.value.forEach((marker) => marker.setMap(null));
  markers.value = [];

  // Create new marker
  const newMarker = new google.maps.Marker({
    position,
    map: map.value,
    animation: google.maps.Animation.DROP,
    draggable: true,
  });

  // Add drag end listener
  newMarker.addListener('dragend', (e: google.maps.MapMouseEvent) => {
    if (e.latLng) {
      selectedLocation.value = {
        lat: e.latLng.lat(),
        lng: e.latLng.lng(),
      };
    }
  });

  markers.value.push(newMarker);
  marker.value = newMarker;

  selectedLocation.value = {
    lat: position.lat(),
    lng: position.lng(),
  };

  map.value.panTo(position);
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
    const position = {
      lat: location.latitude,
      lng: location.longitude,
    };
    map.value.setCenter(position);
    map.value.setZoom(defaultZoom.value);
    updateMarker(new google.maps.LatLng(position.lat, position.lng));
  }
  isLoading.value = false;
};

const zoomIn = () => {
  if (map.value) {
    map.value.setZoom((map.value.getZoom() || 0) + 1);
  }
};

const zoomOut = () => {
  if (map.value) {
    map.value.setZoom((map.value.getZoom() || 0) - 1);
  }
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
  // Remove all markers
  markers.value.forEach((marker) => marker.setMap(null));
  markers.value = [];
  marker.value = null;

  if (map.value) {
    map.value = null;
  }
  if (searchBox.value) {
    searchBox.value = null;
  }
  selectedLocation.value = null;
  coordinatesInput.value = '';
  coordinatesError.value = '';
  showCoordinatesDialog.value = false;
};

const handleCoordinatesInput = async (trigger: 'enter' | 'button' | 'blur') => {
  if (!coordinatesInput.value) return;

  if (trigger === 'blur' && isProcessingCoordinates.value) return;

  coordinatesError.value = '';
  isProcessingCoordinates.value = true;

  try {
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
      updateMarker(new google.maps.LatLng(lat, lng));
      showCoordinatesDialog.value = false;

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

const selectSearchResult = (place: google.maps.places.PlaceResult) => {
  if (!map.value || !place.geometry?.location) return;

  map.value.setCenter(place.geometry.location);
  map.value.setZoom(defaultZoom.value);
  updateMarker(place.geometry.location);
};

watch(
  () => isOpen.value,
  async (newValue) => {
    if (newValue) {
      await nextTick();
      isLoading.value = true;
      cleanupMap();

      // Use initialLocation if provided, otherwise get user location
      let defaultCenter;
      if (props.initialLocation?.coordinates) {
        defaultCenter = {
          lat: props.initialLocation.coordinates[1], // latitude is second in GeoJSON
          lng: props.initialLocation.coordinates[0], // longitude is first in GeoJSON
        };
      } else {
        const location = await getUserLocation();
        defaultCenter = location
          ? {
              lat: location.latitude,
              lng: location.longitude,
            }
          : {
              lat: 20.5937,
              lng: 78.9629,
            };
      }

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

<style>
.search-container {
  position: relative;
  margin: 10px;
  width: calc(100% - 20px);
  max-width: 500px;
  z-index: 1000000;
  background-color: white;
}

.map-search-input {
  width: 100%;
  padding: 12px 16px;
  border-radius: 8px;
  border: 1px solid #ddd;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  font-size: 16px;
  background: white;
  transition: all 0.3s ease;
}

.map-search-input:focus {
  outline: none;
  border-color: var(--q-primary);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.search-results-container {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background-color: white !important;
  border-radius: 8px;
  margin-top: 4px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  max-height: 300px;
  overflow-y: auto;
  border: 1px solid #e0e0e0;
  padding: 4px 0;
}

.search-result-item {
  padding: 12px 16px;
  cursor: pointer;
  border-bottom: 1px solid #e0e0e0;
  transition: all 0.2s ease;
  background: white;
  margin: 0;
  position: relative;
}

.search-result-item:last-child {
  border-bottom: none;
}

.search-result-item:not(:last-child)::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 1px;
  background-color: #e0e0e0;
}

.search-result-item:hover {
  background-color: #f5f5f5;
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.search-result-item:active {
  transform: translateY(0);
  background-color: #eeeeee;
}

.result-name {
  font-weight: 500;
  color: #333;
  margin-bottom: 4px;
  font-size: 14px;
}

.result-address {
  font-size: 12px;
  color: #666;
  line-height: 1.4;
}

.map-container {
  height: 100%;
  width: 100%;
  position: relative;
  z-index: 1;
  cursor: crosshair;
}

.map-controls {
  position: absolute;
  bottom: 20px;
  right: 20px;
  z-index: 1001;
  display: flex;
  flex-direction: column;
  align-items: center;
  background: white;
  border-radius: 8px;
  padding: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

/* Update scrollbar styles */
.search-results-container::-webkit-scrollbar {
  width: 6px;
}

.search-results-container::-webkit-scrollbar-track {
  background: #f5f5f5;
  border-radius: 3px;
}

.search-results-container::-webkit-scrollbar-thumb {
  background: #ddd;
  border-radius: 3px;
}

.search-results-container::-webkit-scrollbar-thumb:hover {
  background: #bbb;
}
</style>
