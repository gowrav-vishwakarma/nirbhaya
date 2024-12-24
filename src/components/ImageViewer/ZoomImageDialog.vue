<template>
  <q-dialog v-model="isOpen" full-width full-height>
    <q-card class="zoom-dialog">
      <q-card-section class="zoom-header">
        <q-btn flat round icon="close" v-close-popup />
      </q-card-section>

      <q-card-section class="zoom-content">
        <q-img
          :src="imageUrl"
          spinner-color="primary"
          spinner-size="82px"
          class="zoomed-image"
          ref="zoomPanRef"
          @touchstart="handleTouchStart"
          @touchmove="handleTouchMove"
          @touchend="handleTouchEnd"
          :style="transformStyle"
        >
          <template v-slot:loading>
            <q-spinner-dots color="primary" size="40px" />
          </template>
        </q-img>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';

const props = defineProps<{
  modelValue: boolean;
  imageUrl: string;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void;
}>();

// Zoom and pan state
const initialDistance = ref(0);
const currentScale = ref(1);
const isDragging = ref(false);
const startPos = ref({ x: 0, y: 0 });
const currentPos = ref({ x: 0, y: 0 });

// Computed property for v-model binding
const isOpen = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
});

// Transform style computed property
const transformStyle = computed(() => ({
  transform: `scale(${currentScale.value}) translate(${currentPos.value.x}px, ${currentPos.value.y}px)`,
  transition: isDragging.value ? 'none' : 'transform 0.3s ease',
}));

// Touch handlers
const handleTouchStart = (event: TouchEvent) => {
  if (event.touches.length === 2) {
    // Pinch to zoom
    const touch1 = event.touches[0];
    const touch2 = event.touches[1];
    initialDistance.value = Math.hypot(
      touch2.clientX - touch1.clientX,
      touch2.clientY - touch1.clientY
    );
  } else if (event.touches.length === 1) {
    // Pan
    isDragging.value = true;
    startPos.value = {
      x: event.touches[0].clientX - currentPos.value.x,
      y: event.touches[0].clientY - currentPos.value.y,
    };
  }
};

const handleTouchMove = (event: TouchEvent) => {
  if (event.touches.length === 2) {
    // Handle pinch zoom
    const touch1 = event.touches[0];
    const touch2 = event.touches[1];
    const currentDistance = Math.hypot(
      touch2.clientX - touch1.clientX,
      touch2.clientY - touch1.clientY
    );

    if (initialDistance.value > 0) {
      const newScale =
        (currentDistance / initialDistance.value) * currentScale.value;
      currentScale.value = Math.min(Math.max(1, newScale), 3); // Limit zoom between 1x and 3x
    }
  } else if (event.touches.length === 1 && isDragging.value) {
    // Handle pan
    currentPos.value = {
      x: event.touches[0].clientX - startPos.value.x,
      y: event.touches[0].clientY - startPos.value.y,
    };
  }
};

const handleTouchEnd = () => {
  initialDistance.value = 0;
  isDragging.value = false;
};

// Reset zoom when dialog closes
watch(isOpen, (newVal) => {
  if (!newVal) {
    currentScale.value = 1;
    currentPos.value = { x: 0, y: 0 };
  }
});
</script>

<style scoped lang="scss">
.zoom-dialog {
  background: rgba(0, 0, 0, 0.9);
  max-width: 100vw !important;
  max-height: 100vh !important;
  width: 100vw !important;
  height: 100vh !important;
}

.zoom-header {
  position: absolute;
  top: 0;
  right: 0;
  z-index: 2000;
  padding: 8px;

  .q-btn {
    background: rgba(255, 255, 255, 0.2);
    color: white;

    &:hover {
      background: rgba(255, 255, 255, 0.3);
    }
  }
}

.zoom-content {
  height: 100vh;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.zoomed-image {
  max-width: 100%;
  max-height: 100vh;
  object-fit: contain;

  :deep(.q-img__content) {
    background: transparent;
  }

  :deep(img) {
    object-fit: contain;
    cursor: move;
  }
}

// Add touch support for mobile
@media (max-width: 600px) {
  .zoomed-image {
    :deep(img) {
      cursor: grab;
    }
  }
}
</style>
