<template>
  <q-page class="sos-events-map-page q-pa-md">
    <div class="sos-events-map-content">
      <q-card class="sos-events-map-card q-mb-md">
        <q-card-section>
          <div class="text-h6 text-weight-bold q-mb-md">
            {{ $t('common.sosEventsMap') }}
          </div>

          <div class="row q-col-gutter-md q-mb-md">
            <div class="col-12 col-md-6">
              <q-select
                v-model="eventType"
                :options="eventTypeOptions"
                :label="$t('common.eventType')"
                outlined
                dense
                emit-value
                map-options
              />
            </div>
            <div class="col-12 col-md-6">
              <q-select
                v-model="timeRange"
                :options="timeRangeOptions"
                :label="$t('common.timeRangeLabel')"
                outlined
                dense
                emit-value
                map-options
                @update:model-value="handleTimeRangeChange"
              />
            </div>
          </div>

          <div v-if="showDatePicker" class="row q-col-gutter-md q-mb-md">
            <div class="col-12 col-md-6">
              <q-date
                v-model="dateRange"
                range
                :title="$t('common.selectDateRange')"
                :subtitle="$t('common.tapToSelect')"
                @update:model-value="handleDateRangeChange"
              />
            </div>
          </div>

          <div class="sos-events-map q-mb-md" ref="sosEventsMap">
            <q-inner-loading :showing="isLoading || !mapInitialized">
              <q-spinner-gears size="50px" color="primary" />
            </q-inner-loading>
          </div>

          <div class="map-controls q-gutter-sm">
            <q-btn icon="add" round color="primary" @click="zoomIn" />
            <q-btn icon="remove" round color="primary" @click="zoomOut" />
            <q-btn icon="pan_tool" round color="primary" @click="togglePan" />
            <q-btn
              :icon="$t('common.icons.myLocation')"
              round
              color="primary"
              @click="centerOnUserLocation"
            />
            <NotificationAudioControl
              v-if="activeAudioEventId !== null"
              :key="activeAudioEventId"
              :sos-event-id="activeAudioEventId"
              @audio-closed="handleAudioClosed"
            />
          </div>
        </q-card-section>
      </q-card>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, onUnmounted, toRaw } from 'vue';
import { useQuasar, debounce } from 'quasar';
import { useI18n } from 'vue-i18n';
import { api } from 'src/boot/axios';
import L from 'leaflet';
import 'leaflet.markercluster';
import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import { Geolocation } from '@capacitor/geolocation';
import NotificationAudioControl from './NotificationsPage/NotificationAudioControl.vue';

// Add this function to fix the Leaflet zoom issue
const fixLeafletZoomIssue = () => {
  L.Marker.prototype._animateZoom = function (opt) {
    if (!this._map) {
      return;
    }
    const pos = this._map
      ._latLngToNewLayerPoint(this._latlng, opt.zoom, opt.center)
      .round();
    this._setPos(pos);
  };
};

const $q = useQuasar();
const { t } = useI18n();

const sosEventsMap = ref(null);
const eventType = ref('active');
const timeRange = ref('live');
const dateRange = ref({ from: '', to: '' });
const showDatePicker = ref(false);
const map = ref(null);
const markerClusterGroup = ref(null);
const userLocation = ref(null);
const isLoading = ref(true);
const mapInitialized = ref(false);

const initialZoom = ref(10); // Adjust this value to get approximately 20km radius view
const searchRadius = ref(20000); // 20km in meters
const isInitialFetch = ref(true);

const eventTypeOptions = [
  { label: t('common.eventStatus.active'), value: 'active' },
  { label: t('common.eventStatus.all'), value: 'all' },
  { label: t('common.eventStatus.resolved'), value: 'resolved' },
  { label: t('common.eventStatus.cancelled'), value: 'cancelled' },
];

const timeRangeOptions = [
  { label: t('common.timeRange.live'), value: 'live' },
  { label: t('common.timeRange.last3Hours'), value: 'last3Hours' },
  { label: t('common.timeRange.today'), value: 'today' },
  { label: t('common.timeRange.last2Days'), value: 'last2Days' },
  { label: t('common.timeRange.last7Days'), value: 'last7Days' },
  { label: t('common.timeRange.last30Days'), value: 'last30Days' },
  { label: t('common.timeRange.custom'), value: 'custom' },
];

const handleTimeRangeChange = (value) => {
  showDatePicker.value = value === 'custom';
  if (value !== 'custom') {
    fetchSOSEvents();
  }
};

const handleDateRangeChange = () => {
  if (dateRange.value.from && dateRange.value.to) {
    fetchSOSEvents();
  }
};

const initMap = () => {
  // Don't initialize the map here, just prepare the configuration
  map.value = {
    center: [20.5937, 78.9629],
    zoom: initialZoom.value,
  };
};

const createMap = (center: L.LatLngExpression) => {
  if (mapInitialized.value) return;

  map.value = L.map(sosEventsMap.value).setView(center, initialZoom.value);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors',
    maxZoom: 22,
  }).addTo(toRaw(map.value));

  markerClusterGroup.value = L.markerClusterGroup();
  toRaw(map.value).addLayer(markerClusterGroup.value);

  // Add event listeners for map movement
  toRaw(map.value).on('moveend', updateSearchCircle);
  toRaw(map.value).on('zoomend', updateSearchCircle);

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
      }).addTo(toRaw(map.value));
    });

  // Add a disclaimer
  L.control
    .attribution({
      prefix: 'Map boundaries as per Survey of India',
    })
    .addTo(toRaw(map.value));

  mapInitialized.value = true;
};

const updateSearchCircle = async () => {
  if (!mapInitialized.value) return;

  const center = map.value.getCenter();
  const bounds = map.value.getBounds();

  // Calculate the radius based on the distance from the center to the northeast corner of the map
  const radius = center.distanceTo(bounds.getNorthEast());

  searchRadius.value = radius;
  isInitialFetch.value = false;

  await debouncedFetchSOSEvents();
};

const fetchSOSEvents = async () => {
  try {
    isLoading.value = true;
    let center;

    if (mapInitialized.value) {
      center = map.value.getCenter();
    } else if (userLocation.value) {
      center = {
        lat: userLocation.value.latitude,
        lng: userLocation.value.longitude,
      };
    } else {
      // Default to a central point in India if no location is available
      center = { lat: 20.5937, lng: 78.9629 };
    }

    const params = {
      eventType: eventType.value,
      timeRange: timeRange.value,
      latitude: center.lat,
      longitude: center.lng,
      radius: searchRadius.value,
    };

    if (timeRange.value === 'custom') {
      params.startDate = dateRange.value.from;
      params.endDate = dateRange.value.to;
    }

    const response = await api.get('/sos/sos-events', { params });

    if (!mapInitialized.value) {
      createMap([center.lat, center.lng]);
    }

    updateMapMarkers(response.data);
    isInitialFetch.value = false;
  } catch (error) {
    console.error('Error fetching SOS events', error);
    $q.notify({
      color: 'negative',
      message: t('common.fetchSOSEventsError'),
      icon: 'error',
    });
  } finally {
    isLoading.value = false;
  }
};

// Create a debounced version of fetchSOSEvents
const debouncedFetchSOSEvents = debounce(fetchSOSEvents, 300);

const activeAudioEventId = ref<number | null>(null);

// Define custom icons
const createCustomIcon = (color: string) => {
  return L.divIcon({
    html: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 0C7.58 0 4 3.58 4 8C4 13.54 12 24 12 24C12 24 20 13.54 20 8C20 3.58 16.42 0 12 0Z" fill="${color}"/>
      <circle cx="12" cy="8" r="4" fill="white"/>
    </svg>`,
    className: 'custom-div-icon',
    iconSize: [24, 24],
    iconAnchor: [12, 24],
    popupAnchor: [0, -24],
  });
};

const icons = {
  active: createCustomIcon('#FF0000'),
  resolved: createCustomIcon('#00FF00'),
  cancelled: createCustomIcon('#808080'),
  default: createCustomIcon('#0000FF'),
};

const updateMapMarkers = (events) => {
  markerClusterGroup.value.clearLayers();

  events.forEach((event) => {
    const icon = icons[event.status] || icons.default;
    const marker = L.marker(
      [event.location.coordinates[1], event.location.coordinates[0]],
      { icon }
    );

    const popupContent = L.DomUtil.create('div');
    popupContent.innerHTML = `
      <b>${t('common.eventType')}:</b> ${event.status}<br>
      <b>${t('common.threat')}:</b> ${t(
      'common.' + event.threat || 'common.unknown'
    )}<br>
      <b>${t('common.createdAt')}:</b> ${new Date(
      event.createdAt
    ).toLocaleString()}
    `;

    marker.bindPopup(popupContent);

    marker.on('click', () => {
      if (event.status === 'active') {
        toggleAudio(event.id);
      }
    });

    markerClusterGroup.value.addLayer(marker);
  });
};

const toggleAudio = (eventId: number) => {
  if (activeAudioEventId.value === eventId) {
    activeAudioEventId.value = null;
  } else {
    activeAudioEventId.value = eventId;
  }
};

const handleAudioClosed = () => {
  activeAudioEventId.value = null;
};

const zoomIn = () => {
  map.value.zoomIn();
};

const zoomOut = () => {
  map.value.zoomOut();
};

const togglePan = () => {
  if (map.value.dragging.enabled()) {
    map.value.dragging.disable();
  } else {
    map.value.dragging.enable();
  }
};

const getUserLocation = async () => {
  try {
    isLoading.value = true;
    const position = await Geolocation.getCurrentPosition({ timeout: 10000 }); // 10 seconds timeout
    userLocation.value = {
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
    };
    return userLocation.value;
  } catch (error) {
    console.error('Error getting user location', error);
    $q.notify({
      color: 'negative',
      message: t('common.locationError'),
      icon: 'error',
    });
    return null;
  } finally {
    isLoading.value = false;
  }
};

const centerOnUserLocation = async () => {
  isLoading.value = true;
  const location = await getUserLocation();
  if (location) {
    map.value.setView([location.latitude, location.longitude], 10);
    updateSearchCircle();
  }
  isLoading.value = false;
};

// Use the debounced function in the watch
watch([eventType, timeRange], () => {
  isLoading.value = true;
  debouncedFetchSOSEvents();
});

onMounted(async () => {
  isLoading.value = true;
  fixLeafletZoomIssue();
  initMap();
  await getUserLocation(); // This will set userLocation.value if available
  await fetchSOSEvents(); // This will now use the initial 20km radius and create the map
  isLoading.value = false;
});

onUnmounted(() => {
  // Ensure audio is disconnected when component is unmounted
  activeAudioEventId.value = null;
});
</script>

<style lang="scss" scoped>
.sos-events-map-page {
  background: linear-gradient(135deg, $primary, darken($primary, 20%));
  min-height: 100vh;
}

.sos-events-map-content {
  max-width: 1200px;
  margin: 0 auto;
}

.sos-events-map-card {
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.sos-events-map {
  height: 450px;
  width: 100%;
  border: 1px solid #ccc;
  border-radius: 8px;
  position: relative;
}

.map-controls {
  display: flex;
  justify-content: flex-end;
  margin-top: 10px;
  align-items: center;
}

.custom-div-icon {
  background: none;
  border: none;
}
</style>
<style>
.leaflet-bottom {
  display: none !important;
}
</style>
