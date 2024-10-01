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
              <q-slider
                v-model="duration"
                :min="0"
                :max="60"
                :step="1"
                label
                :label-value="`${getDurationLabel(duration)}`"
                color="primary"
              />
            </div>
          </div>

          <div class="sos-events-map q-mb-md" ref="sosEventsMap">
            <!-- Map will be rendered here -->
          </div>

          <div class="map-controls q-gutter-sm">
            <q-btn icon="add" round color="primary" @click="zoomIn" />
            <q-btn icon="remove" round color="primary" @click="zoomOut" />
            <q-btn icon="pan_tool" round color="primary" @click="togglePan" />
          </div>
        </q-card-section>
      </q-card>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { useQuasar } from 'quasar';
import { useI18n } from 'vue-i18n';
import { api } from 'src/boot/axios';
import L from 'leaflet';
import 'leaflet.markercluster';
import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';

const $q = useQuasar();
const { t } = useI18n();

const sosEventsMap = ref(null);
const eventType = ref('all');
const duration = ref(0);
const map = ref(null);
const markerClusterGroup = ref(null);

const eventTypeOptions = [
  { label: t('common.eventStatus.all'), value: 'all' },
  { label: t('common.eventStatus.active'), value: 'active' },
  { label: t('common.eventStatus.resolved'), value: 'resolved' },
  { label: t('common.eventStatus.cancelled'), value: 'cancelled' },
];

const getDurationLabel = (value: number) => {
  if (value === 0) return t('common.live');
  if (value === 1) return t('common.oneMinuteAgo');
  if (value === 5) return t('common.fiveMinutesAgo');
  if (value === 10) return t('common.tenMinutesAgo');
  return `${value} ${t('common.minutesAgo')}`;
};

const initMap = () => {
  map.value = L.map(sosEventsMap.value).setView([20.5937, 78.9629], 5);

  // Use OpenStreetMap tiles for the base map
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors',
    maxZoom: 18,
  }).addTo(map.value);

  markerClusterGroup.value = L.markerClusterGroup();
  map.value.addLayer(markerClusterGroup.value);

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
      }).addTo(map.value);
    });

  // Add a disclaimer
  L.control
    .attribution({
      prefix: 'Map boundaries as per Survey of India',
    })
    .addTo(map.value);
};

const fetchSOSEvents = async () => {
  try {
    const response = await api.get('/auth/sos-events', {
      params: {
        eventType: eventType.value,
        duration: duration.value,
      },
    });
    updateMapMarkers(response.data);
  } catch (error) {
    console.error('Error fetching SOS events', error);
    $q.notify({
      color: 'negative',
      message: t('common.fetchSOSEventsError'),
      icon: 'error',
    });
  }
};

const updateMapMarkers = (events) => {
  markerClusterGroup.value.clearLayers();

  events.forEach((event) => {
    const marker = L.marker([
      event.location.coordinates[1],
      event.location.coordinates[0],
    ]);
    marker.bindPopup(`
      <b>${t('common.eventType')}:</b> ${event.status}<br>
      <b>${t('common.threat')}:</b> ${
      event.threat || t('common.notSpecified')
    }<br>
      <b>${t('common.createdAt')}:</b> ${new Date(
      event.createdAt
    ).toLocaleString()}
    `);
    markerClusterGroup.value.addLayer(marker);
  });
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

watch([eventType, duration], fetchSOSEvents);

onMounted(() => {
  initMap();
  fetchSOSEvents();
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
  height: 600px;
  width: 100%;
  border: 1px solid #ccc;
  border-radius: 8px;
}

.map-controls {
  display: flex;
  justify-content: flex-end;
  margin-top: 10px;
}
</style>
