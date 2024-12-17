<template>
  <q-dialog
    v-model="isOpen"
    position="top"
    style="padding-top: env(safe-area-inset-top)"
    @hide="$emit('update:modelValue', false)"
    @touchstart="handleTouchStart"
    @touchmove.prevent="handleTouchMove"
    @touchend="handleTouchEnd"
    @click="checkSwipeToClose"
    persistent
    :maximized="false"
    transition-show="slide-down"
    transition-hide="slide-up"
  >
    <q-card
      class="dialog-card"
      :style="{ '--swipe-progress': swipeProgress }"
      @touchstart="handleTouchStart"
      @touchmove="handleTouchMove"
      @touchend="handleTouchEnd"
      @click="checkSwipeToClose"
    >
      <q-card-section class="row items-center q-pb-none">
        <div class="text-h6">Select Location</div>
        <q-space />
        <q-btn icon="close" flat round dense v-close-popup />
      </q-card-section>

      <q-card-section class="q-pt-md">
        <q-list>
          <div @click="handleLocationSelect('current')">
            <q-item
              clickable
              v-ripple
              class="location-item"
              :class="{ selected: selectedLocationId === 'current' }"
            >
              <q-item-section avatar>
                <q-icon
                  :name="
                    isLoading && selectedLocationId === 'current'
                      ? 'sync'
                      : 'my_location'
                  "
                  color="primary"
                  size="24px"
                  :class="{
                    rotate: isLoading && selectedLocationId === 'current',
                  }"
                />
              </q-item-section>
              <q-item-section>
                <q-item-label>Current Location</q-item-label>
                <!-- <q-item-label caption>{{ currentLocationName || 'Get posts from your current location' }}</q-item-label> -->
              </q-item-section>
              <q-item-section side v-if="selectedLocationId === 'current'">
                <q-icon name="check" color="primary" />
              </q-item-section>
            </q-item>
          </div>

          <div @click="openMapSelector">
            <q-item
              clickable
              v-ripple
              class="location-item"
              :class="{ selected: selectedLocationId === 'map' }"
            >
              <q-item-section avatar>
                <q-icon name="map" color="primary" size="24px" />
              </q-item-section>
              <q-item-section>
                <q-item-label>Select on Map</q-item-label>
                <q-item-label caption>Choose a custom location</q-item-label>
              </q-item-section>
            </q-item>
          </div>

          <!-- <q-separator spaced /> -->
          <q-item
            v-for="location in userLocations"
            :key="location.id"
            clickable
            v-ripple
            class="location-item"
            :class="{
              selected: selectedLocationId === location.id?.toString(),
            }"
          >
            <div
              @click="handleLocationSelect('stored', location)"
              style="width: 100%; display: flex"
            >
              <q-item-section avatar>
                <q-icon name="location_on" color="primary" size="24px" />
              </q-item-section>
              <q-item-section>
                <q-item-label class="text-capitalize">{{
                  location.name ? location.name : 'Location'
                }}</q-item-label>

                <q-item-label caption>Saved Location</q-item-label>
              </q-item-section>

              <q-item-section
                side
                v-if="selectedLocationId === location.id?.toString()"
              >
                <q-icon name="check" color="primary" />
              </q-item-section>
              <q-separator spaced />
            </div>
          </q-item>

          <q-item v-if="!userLocations?.length" class="location-item disabled">
            <q-item-section avatar>
              <q-icon name="location_off" color="grey" size="24px" />
            </q-item-section>
            <q-item-section>
              <q-item-label>No Saved Locations</q-item-label>
              <q-item-label caption>Add locations in your profile</q-item-label>
            </q-item-section>
          </q-item>
        </q-list>
      </q-card-section>
    </q-card>
  </q-dialog>

  <LocationSelectorDialog
    v-model="showMapSelector"
    :zoom="15"
    @location-selected="handleMapLocationSelected"
  />
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useQuasar } from 'quasar';
import { Geolocation } from '@capacitor/geolocation';
import LocationSelectorDialog from './LocationSelectorDialog.vue';

interface UserLocation {
  id?: string | number;
  name: string;
  location: {
    type: 'Point';
    coordinates: [number, number]; // [longitude, latitude]
  };
}

const $q = useQuasar();
const currentLocationName = ref('');

const props = defineProps<{
  modelValue: boolean;
  userLocations?: UserLocation[];
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void;
  (
    e: 'location-selected',
    location: {
      type: string;
      latitude: number;
      longitude: number;
      name?: string;
      source?: 'current' | 'stored';
    }
  ): void;
}>();

const isOpen = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
});

const touchStartY = ref(0);
const touchEndY = ref(0);
const minSwipeDistance = 100;
const swipeProgress = ref(0);

const isLoading = ref(false);
const selectedLocationId = ref(''); // No default selection

const handleTouchStart = (event: TouchEvent) => {
  touchStartY.value = event.touches[0].clientY;
};

const handleTouchMove = (event: TouchEvent) => {
  event.preventDefault();
  touchEndY.value = event.touches[0].clientY;
  const progress = Math.min(
    Math.max((touchStartY.value - touchEndY.value) / minSwipeDistance, 0),
    1
  );
  swipeProgress.value = progress;
};

const handleTouchEnd = () => {
  const swipeDistance = touchEndY.value - touchStartY.value;
  if (swipeDistance < -minSwipeDistance) {
    isOpen.value = false;
  }
  swipeProgress.value = 0;
};

const checkSwipeToClose = (event: MouseEvent) => {
  event.stopPropagation();
};

const handleLocationSelect = async (
  locationType: 'current' | 'stored',
  storedLocation?: UserLocation
) => {
  try {
    if (locationType === 'current') {
      // Just emit with source='current' and close dialog immediately
      emit('location-selected', {
        type: 'Point',
        latitude: null,
        longitude: null,
        name: '',
        source: 'current',
      });
      isOpen.value = false;
    } else if (storedLocation && storedLocation.location) {
      // For stored locations, emit complete data
      emit('location-selected', {
        type: 'Point',
        latitude: storedLocation.location.coordinates[1],
        longitude: storedLocation.location.coordinates[0],
        name: storedLocation.name,
        source: 'stored' as const,
      });
      isOpen.value = false;
    }
  } catch (error) {
    console.error('Location selection failed:', error);
    $q.notify({
      type: 'negative',
      message: 'Failed to get location',
      position: 'top-right',
      timeout: 3000,
      color: 'black',
      icon: 'error',
    });
  }
};

const showMapSelector = ref(false);

const openMapSelector = () => {
  showMapSelector.value = true;
  selectedLocationId.value = 'map';
};

const handleMapLocationSelected = (location: {
  type: string;
  coordinates: number[];
}) => {
  emit('location-selected', {
    type: 'Point',
    latitude: location.coordinates[1],
    longitude: location.coordinates[0],
    name: 'Custom Location',
    source: 'map',
  });
  isOpen.value = false;
};
</script>

<style lang="scss" scoped>
:deep(body) {
  overscroll-behavior-y: contain;
  overflow: hidden;
  position: fixed;
  width: 100%;
  height: 100%;
}

.dialog-card {
  width: 100%;
  max-width: 600px;
  border-radius: 0 0 16px 16px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  position: relative;
  touch-action: none;
  overscroll-behavior-y: contain;

  &::before {
    content: '';
    position: absolute;
    bottom: 8px;
    left: 50%;
    transform: translateX(-50%);
    width: 40px;
    height: 4px;
    background: #{rgba(#000, calc(0.1 + var(--swipe-progress, 0) * 0.3))};
    border-radius: 2px;
    z-index: 1;
    transition: background-color 0.1s ease;
  }
}

.location-dialog {
  width: 100%;
  max-width: 400px;
  border-radius: 8px;
}

.location-item {
  border-radius: 8px;
  margin: 4px 0;
  transition: all 0.3s ease;

  &:hover:not(.disabled) {
    background: rgba(0, 0, 0, 0.03);
  }

  &.disabled {
    opacity: 0.6;
    pointer-events: none;
  }

  .q-icon {
    font-size: 24px;
  }

  &.selected {
    background: rgba(0, 0, 0, 0.05);
  }
}

.q-item__label {
  font-weight: 500;

  &.text-capitalize {
    text-transform: capitalize;
  }
}

.q-item__label--caption {
  color: rgba(0, 0, 0, 0.6);
}

.rotate {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
}
</style>
