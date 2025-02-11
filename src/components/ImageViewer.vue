<template>
  <q-dialog
    v-model="isOpen"
    full-width
    full-height
    maximized
    class="image-viewer-dialog"
    @hide="resetZoom"
  >
    <q-card class="image-viewer-card" @click="handleBackgroundClick">
      <q-card-section class="image-viewer-header q-mt-md" @click.stop>
        <div class="zoom-controls">
          <q-btn flat round color="white" icon="remove" @click="zoomOut" />
          <span class="zoom-level">{{ Math.round(zoomLevel * 100) }}%</span>
          <q-btn flat round color="white" icon="add" @click="zoomIn" />
        </div>
        <div class="image-counter" v-if="images.length > 1">
          {{ currentImageIndex + 1 }} / {{ images.length }}
        </div>
        <q-btn flat round color="white" icon="close" v-close-popup />
      </q-card-section>

      <q-card-section
        class="image-viewer-content"
        @click="handleBackgroundClick"
      >
        <div
          class="image-container"
          ref="imageContainer"
          @wheel="handleWheel"
          @mousedown="startPan"
          @mousemove="pan"
          @mouseup="endPan"
          @mouseleave="endPan"
          @touchstart="handleTouchStart"
          @touchmove="handleTouchMove"
          @touchend="handleTouchEnd"
          @touchcancel="handleTouchEnd"
          @dblclick.stop.prevent="handleDoubleClick"
          @click.stop
        >
          <img
            :src="currentImage"
            :style="imageStyle"
            @load="initializeImage"
            ref="image"
            draggable="false"
          />
        </div>

        <!-- Navigation Arrows -->
        <q-btn
          v-if="images.length > 1 && currentImageIndex > 0"
          class="navigation-arrow left-arrow"
          round
          flat
          color="white"
          icon="chevron_left"
          @click="previousImage"
        />
        <q-btn
          v-if="images.length > 1 && currentImageIndex < images.length - 1"
          class="navigation-arrow right-arrow"
          round
          flat
          color="white"
          icon="chevron_right"
          @click="nextImage"
        />
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';

const props = defineProps<{
  modelValue: boolean;
  imageSrc: string;
  images?: string[];
  currentIndex?: number;
}>();

const emit = defineEmits(['update:modelValue']);

const isOpen = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
});

// Image slider functionality
const images = computed(() => props.images || [props.imageSrc]);
const currentImageIndex = ref(0);

// Watch for changes in props.currentIndex and update currentImageIndex
watch(
  () => props.currentIndex,
  (newIndex) => {
    if (newIndex !== undefined) {
      currentImageIndex.value = newIndex;
    }
  },
  { immediate: true }
);

const currentImage = computed(() => images.value[currentImageIndex.value]);

const nextImage = () => {
  if (currentImageIndex.value < images.value.length - 1) {
    currentImageIndex.value++;
    resetZoom();
  }
};

const previousImage = () => {
  if (currentImageIndex.value > 0) {
    currentImageIndex.value--;
    resetZoom();
  }
};

// Add keyboard navigation
const handleKeydown = (event: KeyboardEvent) => {
  if (!isOpen.value) return;

  switch (event.key) {
    case 'ArrowLeft':
      previousImage();
      break;
    case 'ArrowRight':
      nextImage();
      break;
    case 'Escape':
      isOpen.value = false;
      break;
  }
};

// Add and remove keyboard event listeners
watch(isOpen, (newValue) => {
  if (newValue) {
    window.addEventListener('keydown', handleKeydown);
  } else {
    window.removeEventListener('keydown', handleKeydown);
  }
});

const zoomLevel = ref(1);
const panPosition = ref({ x: 0, y: 0 });
const isPanning = ref(false);
const startPanPos = ref({ x: 0, y: 0 });
const imageContainer = ref<HTMLElement | null>(null);
const image = ref<HTMLImageElement | null>(null);

// Zoom controls
const MIN_ZOOM = 0.5;
const MAX_ZOOM = 3;
const ZOOM_STEP = 0.1;

const zoomIn = () => {
  if (zoomLevel.value < MAX_ZOOM) {
    zoomLevel.value = Math.min(zoomLevel.value + ZOOM_STEP, MAX_ZOOM);
  }
};

const zoomOut = () => {
  if (zoomLevel.value > MIN_ZOOM) {
    zoomLevel.value = Math.max(zoomLevel.value - ZOOM_STEP, MIN_ZOOM);
  }
};

const handleWheel = (e: WheelEvent) => {
  e.preventDefault();
  if (e.deltaY < 0) {
    zoomIn();
  } else {
    zoomOut();
  }
};

// Pan controls
const startPan = (e: MouseEvent | TouchEvent) => {
  if (zoomLevel.value <= 1) return;

  isPanning.value = true;
  const point = e instanceof MouseEvent ? e : e.touches[0];
  startPanPos.value = {
    x: point.clientX - panPosition.value.x,
    y: point.clientY - panPosition.value.y,
  };
};

const pan = (e: MouseEvent | TouchEvent) => {
  if (!isPanning.value) return;

  const point = e instanceof MouseEvent ? e : e.touches[0];
  const newX = point.clientX - startPanPos.value.x;
  const newY = point.clientY - startPanPos.value.y;

  // Get container dimensions
  const container = imageContainer.value;
  const img = image.value;
  if (!container || !img) return;

  const containerRect = container.getBoundingClientRect();
  const imgRect = img.getBoundingClientRect();

  // Calculate bounds
  const maxX = (imgRect.width - containerRect.width) / 2;
  const maxY = (imgRect.height - containerRect.height) / 2;

  // Constrain panning within bounds
  panPosition.value = {
    x: Math.max(Math.min(newX, maxX), -maxX),
    y: Math.max(Math.min(newY, maxY), -maxY),
  };
};

const endPan = () => {
  isPanning.value = false;
};

const resetZoom = () => {
  zoomLevel.value = 1;
  panPosition.value = { x: 0, y: 0 };
};

const initializeImage = () => {
  resetZoom();
};

const DOUBLE_CLICK_ZOOM = 2.5; // Increased zoom level for better visibility

// Touch handling
const lastTouchDistance = ref(0);
const initialTouchZoom = ref(1);
const lastTouchCenter = ref({ x: 0, y: 0 });

const handleTouchStart = (e: TouchEvent) => {
  if (e.touches.length === 2) {
    // Start pinch zoom
    const touch1 = e.touches[0];
    const touch2 = e.touches[1];
    lastTouchDistance.value = Math.hypot(
      touch2.clientX - touch1.clientX,
      touch2.clientY - touch1.clientY
    );
    initialTouchZoom.value = zoomLevel.value;

    // Calculate center point
    lastTouchCenter.value = {
      x: (touch1.clientX + touch2.clientX) / 2,
      y: (touch1.clientY + touch2.clientY) / 2,
    };
  } else if (e.touches.length === 1 && zoomLevel.value > 1) {
    // Start panning
    startPan(e);
  }
};

const handleTouchMove = (e: TouchEvent) => {
  e.preventDefault(); // Prevent default scrolling

  if (e.touches.length === 2) {
    // Handle pinch zoom
    const touch1 = e.touches[0];
    const touch2 = e.touches[1];
    const currentDistance = Math.hypot(
      touch2.clientX - touch1.clientX,
      touch2.clientY - touch1.clientY
    );

    // Calculate new zoom level
    const scale = currentDistance / lastTouchDistance.value;
    const newZoom = Math.min(
      Math.max(initialTouchZoom.value * scale, MIN_ZOOM),
      MAX_ZOOM
    );

    // Calculate current center point
    const currentCenter = {
      x: (touch1.clientX + touch2.clientX) / 2,
      y: (touch1.clientY + touch2.clientY) / 2,
    };

    // Update zoom and adjust pan position to keep the center point stable
    if (imageContainer.value) {
      // const rect = imageContainer.value.getBoundingClientRect();
      const dx = currentCenter.x - lastTouchCenter.value.x;
      const dy = currentCenter.y - lastTouchCenter.value.y;

      zoomLevel.value = newZoom;
      panPosition.value = {
        x: panPosition.value.x + dx,
        y: panPosition.value.y + dy,
      };

      lastTouchCenter.value = currentCenter;
    }
  } else if (e.touches.length === 1 && isPanning.value) {
    // Handle panning
    pan(e);
  }
};

const handleTouchEnd = () => {
  lastTouchDistance.value = 0;
  initialTouchZoom.value = zoomLevel.value;
  endPan();
};

// Update double click zoom
const handleDoubleClick = (event: MouseEvent) => {
  event.preventDefault();
  event.stopPropagation();

  if (zoomLevel.value > 1) {
    resetZoom();
  } else {
    const rect = imageContainer.value?.getBoundingClientRect();
    if (!rect) return;

    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    // Calculate the center point of the container
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    // Calculate the offset from center
    const offsetX = x - centerX;
    const offsetY = y - centerY;

    // Set zoom level
    zoomLevel.value = DOUBLE_CLICK_ZOOM;

    // Set pan position to center on the clicked point
    panPosition.value = {
      x: -offsetX * (DOUBLE_CLICK_ZOOM - 1),
      y: -offsetY * (DOUBLE_CLICK_ZOOM - 1),
    };
  }
};

const imageStyle = computed(() => ({
  transform: `translate(${panPosition.value.x}px, ${panPosition.value.y}px) scale(${zoomLevel.value})`,
  cursor: zoomLevel.value > 1 ? 'grab' : 'zoom-in',
  transition: isPanning.value
    ? 'none'
    : 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  transformOrigin: 'center center',
}));

const handleBackgroundClick = (event: MouseEvent) => {
  // Only close if clicking directly on the background
  if (event.target === event.currentTarget) {
    isOpen.value = false;
  }
};
</script>

<style lang="scss" scoped>
.image-viewer-dialog {
  background: rgba(0, 0, 0, 0.9) !important;
}

.image-viewer-card {
  background: transparent !important;
  box-shadow: none !important;
  cursor: default;
  height: 100vh;
  max-height: -webkit-fill-available;
}

.image-viewer-header {
  position: fixed;
  top: env(safe-area-inset-top, 0);
  left: 0;
  right: 0;
  z-index: 2000;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  padding-top: max(12px, env(safe-area-inset-top, 12px));
  background: linear-gradient(to bottom, rgba(0, 0, 0, 0.7), transparent);
  -webkit-backdrop-filter: blur(10px);
  backdrop-filter: blur(10px);
}

.zoom-controls {
  display: flex;
  align-items: center;
  gap: 8px;
  color: white;
  z-index: 2001;
}

.zoom-level {
  min-width: 60px;
  text-align: center;
  font-size: 14px;
  color: white;
}

.image-viewer-content {
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  cursor: default;
}

.image-container {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  user-select: none;
  -webkit-user-select: none;
  touch-action: pan-x pan-y;
  cursor: default;

  &:active {
    cursor: grabbing;
  }
}

img {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  transform-origin: center;
  will-change: transform;
  user-select: none;
  -webkit-user-select: none;

  &:active {
    cursor: grabbing;
  }
}

.navigation-arrow {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(0, 0, 0, 0.5);
  transition: all 0.3s ease;

  &:hover {
    background: rgba(0, 0, 0, 0.8);
  }

  &.left-arrow {
    left: 16px;
  }

  &.right-arrow {
    right: 16px;
  }
}

.image-counter {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.5);
  color: white;
  padding: 4px 12px;
  border-radius: 16px;
  font-size: 14px;
  z-index: 2001;
}

@media (max-width: 600px) {
  .navigation-arrow {
    &.left-arrow {
      left: 8px;
    }
    &.right-arrow {
      right: 8px;
    }
  }
}

// Add iOS-specific styles
@supports (-webkit-touch-callout: none) {
  .image-viewer-card {
    height: -webkit-fill-available;
  }

  .image-viewer-header {
    padding-top: env(safe-area-inset-top, 44px);
  }
}
</style>
