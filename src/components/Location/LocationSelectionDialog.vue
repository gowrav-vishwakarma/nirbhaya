<template>
  <q-dialog v-model="isOpen" position="top" persistent>
    <q-card class="dialog-card">
      <q-card-section class="row items-center q-pb-none">
        <div class="text-h6">Select Location</div>
        <q-space />
        <q-btn icon="close" flat round dense v-close-popup />
      </q-card-section>

      <q-card-section class="q-pt-md">
        <q-list>
          <q-item clickable v-ripple @click="handleLocationSelect" class="location-item">
            <q-item-section avatar>
              <q-icon :name="isLoading ? 'sync' : 'my_location'" color="primary" size="24px"
                :class="{ 'rotate': isLoading }" />
            </q-item-section>
            <q-item-section>
              <q-item-label>Use Current Location</q-item-label>
            </q-item-section>
          </q-item>
        </q-list>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useQuasar } from 'quasar';
import { Geolocation } from '@capacitor/geolocation';

const $q = useQuasar();

const props = defineProps<{
  modelValue: boolean;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void;
  (e: 'location-selected', location: {
    latitude: number;
    longitude: number;
    address: string;
  }): void;
}>();

const isOpen = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
});

const isLoading = ref(false);

const handleLocationSelect = async () => {
  try {
    isLoading.value = true;

    const position = await Geolocation.getCurrentPosition({
      enableHighAccuracy: true,
      timeout: 10000,
    });

    if (position) {
      const { latitude, longitude } = position.coords;

      // Get address using reverse geocoding
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
      );
      const data = await response.json();

      emit('location-selected', {
        latitude,
        longitude,
        address: data.display_name
      });

      isOpen.value = false;
    }
  } catch (error) {
    console.error('Location error:', error);
    $q.notify({
      type: 'negative',
      message: 'Failed to get location',
      position: 'top',
      timeout: 3000
    });
  } finally {
    isLoading.value = false;
  }
};
</script>

<style lang="scss" scoped>
.dialog-card {
  width: 100%;
  max-width: 400px;
  border-radius: 8px;
}

.location-item {
  border-radius: 8px;
  margin: 4px 0;
  transition: all 0.3s ease;

  &:hover {
    background: rgba(0, 0, 0, 0.03);
  }
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
