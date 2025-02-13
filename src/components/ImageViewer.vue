<template>
  <q-dialog
    v-model="isOpen"
    full-width
    full-height
    maximized
    class="image-viewer-dialog"
    @hide="resetZoom"
  >
    <q-card class="image-viewer-card">
      <q-card-section class="image-viewer-content">
        <!-- Zoom Level Display -->
        <div class="zoom-level">{{ Math.round(zoomLevel * 100) }}%</div>

        <!-- Control Buttons -->
        <div class="controls">
          <q-btn
            flat
            round
            color="white"
            icon="add"
            @click="handleZoomIn"
            :disable="zoomLevel >= MAX_ZOOM"
          />
          <q-btn
            flat
            round
            color="white"
            icon="remove"
            @click="handleZoomOut"
            :disable="zoomLevel <= MIN_ZOOM"
          />
          <q-btn
            flat
            round
            color="white"
            icon="close"
            @click="isOpen = false"
          />
        </div>

        <div
          class="image-container"
          ref="imageContainer"
          @touchstart.prevent="handleTouchStart"
          @touchmove.prevent="handleTouchMove"
          @touchend.prevent="handleTouchEnd"
          @touchcancel.prevent="handleTouchEnd"
          @wheel.prevent="handleWheel"
          @click.stop
        >
          <img
            :src="currentImage"
            :style="imageStyle"
            @load="initializeImage"
            ref="image"
            draggable="false"
            alt="Viewer image"
          />
        </div>

        <!-- Centered Slider Button and Index Display -->
        <div class="slider-info">
          <q-btn
            flat
            round
            color="white"
            icon="chevron_left"
            @click="handlePreviousImage"
            :disable="currentIndex === 0"
          />
          <span class="image-index"
            >{{ currentIndex + 1 }} / {{ props.imageSrc.length }}</span
          >
          <q-btn
            flat
            round
            color="white"
            icon="chevron_right"
            @click="handleNextImage"
            :disable="currentIndex === props.imageSrc.length - 1"
          />
        </div>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';

const props = defineProps<{
  modelValue: boolean;
  imageSrc: string[];
}>();

const emit = defineEmits(['update:modelValue']);

// Constants
const MIN_ZOOM = 1;
const MAX_ZOOM = 3;
const ZOOM_STEP = 0.2;

// Component refs and state
const imageContainer = ref<HTMLElement | null>(null);
const image = ref<HTMLImageElement | null>(null);
const zoomLevel = ref(1);
const panPosition = ref({ x: 0, y: 0 });

// Touch handling state
const touchStartPosition = ref({ x: 0, y: 0 });
const lastTouchDistance = ref(0);
const touchStartZoom = ref(1);
const isZooming = ref(false);
const isPanning = ref(false);
const lastTapTime = ref(0);
const initialTouchCenter = ref({ x: 0, y: 0 });

const currentIndex = ref(0);

// Computed properties
const isOpen = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
});

const currentImage = computed(() => props.imageSrc[currentIndex.value]);

const imageStyle = computed(() => ({
  transform: `translate(${panPosition.value.x}px, ${panPosition.value.y}px) scale(${zoomLevel.value})`,
  transition:
    isPanning.value || isZooming.value ? 'none' : 'transform 0.2s ease-out',
  transformOrigin: 'center center',
  willChange: 'transform',
}));

// Core functions
const resetZoom = () => {
  zoomLevel.value = MIN_ZOOM;
  panPosition.value = { x: 0, y: 0 };
};

const initializeImage = () => {
  resetZoom();
};

// Pan position constraints
const constrainPan = (x: number, y: number) => {
  const container = imageContainer.value;
  const img = image.value;
  if (!container || !img) return { x: 0, y: 0 };

  const rect = container.getBoundingClientRect();
  const imgRect = img.getBoundingClientRect();

  const maxX = Math.max(0, (imgRect.width - rect.width) / 2);
  const maxY = Math.max(0, (imgRect.height - rect.height) / 2);

  return {
    x: Math.min(Math.max(x, -maxX), maxX),
    y: Math.min(Math.max(y, -maxY), maxY),
  };
};

// Zoom control functions
const handleZoomIn = () => {
  if (zoomLevel.value < MAX_ZOOM) {
    const newZoom = Math.min(zoomLevel.value + ZOOM_STEP, MAX_ZOOM);
    const container = imageContainer.value;
    if (container) {
      const rect = container.getBoundingClientRect();
      zoomToPoint(rect.width / 2, rect.height / 2, newZoom);
    }
  }
};

const handleZoomOut = () => {
  if (zoomLevel.value > MIN_ZOOM) {
    const newZoom = Math.max(zoomLevel.value - ZOOM_STEP, MIN_ZOOM);
    const container = imageContainer.value;
    if (container) {
      const rect = container.getBoundingClientRect();
      zoomToPoint(rect.width / 2, rect.height / 2, newZoom);
    }
  }
};

// Touch handlers
const handleTouchStart = (e: TouchEvent) => {
  if (e.touches.length === 2) {
    // Pinch zoom start
    isZooming.value = true;
    const touch1 = e.touches[0];
    const touch2 = e.touches[1];
    lastTouchDistance.value = Math.hypot(
      touch2.clientX - touch1.clientX,
      touch2.clientY - touch1.clientY
    );
    touchStartZoom.value = zoomLevel.value;
    initialTouchCenter.value = {
      x: (touch1.clientX + touch2.clientX) / 2,
      y: (touch1.clientY + touch2.clientY) / 2,
    };
  } else if (e.touches.length === 1) {
    // Handle double tap zoom
    const now = Date.now();
    const touch = e.touches[0];

    if (now - lastTapTime.value < 300) {
      if (zoomLevel.value > 1) {
        resetZoom();
      } else {
        const rect = imageContainer.value?.getBoundingClientRect();
        if (rect) {
          const x = touch.clientX - rect.left;
          const y = touch.clientY - rect.top;
          zoomToPoint(x, y, DOUBLE_TAP_ZOOM);
        }
      }
    } else if (zoomLevel.value > 1) {
      // Start panning
      isPanning.value = true;
      touchStartPosition.value = {
        x: touch.clientX - panPosition.value.x,
        y: touch.clientY - panPosition.value.y,
      };
    }

    lastTapTime.value = now;
  }
};

const handleTouchMove = (e: TouchEvent) => {
  if (e.touches.length === 2 && isZooming.value) {
    // Handle pinch zoom
    const touch1 = e.touches[0];
    const touch2 = e.touches[1];
    const currentDistance = Math.hypot(
      touch2.clientX - touch1.clientX,
      touch2.clientY - touch1.clientY
    );

    const scale = currentDistance / lastTouchDistance.value;
    const newZoom = Math.min(
      Math.max(touchStartZoom.value * scale, MIN_ZOOM),
      MAX_ZOOM
    );

    // Calculate current center point
    const currentCenter = {
      x: (touch1.clientX + touch2.clientX) / 2,
      y: (touch1.clientY + touch2.clientY) / 2,
    };

    if (newZoom !== zoomLevel.value) {
      const rect = imageContainer.value?.getBoundingClientRect();
      if (rect) {
        const dx = currentCenter.x - initialTouchCenter.value.x;
        const dy = currentCenter.y - initialTouchCenter.value.y;

        zoomLevel.value = newZoom;
        const constrained = constrainPan(
          panPosition.value.x + dx,
          panPosition.value.y + dy
        );
        panPosition.value = constrained;

        initialTouchCenter.value = currentCenter;
      }
    }
  } else if (e.touches.length === 1 && isPanning.value && zoomLevel.value > 1) {
    // Handle panning
    const touch = e.touches[0];
    const newX = touch.clientX - touchStartPosition.value.x;
    const newY = touch.clientY - touchStartPosition.value.y;
    const constrained = constrainPan(newX, newY);
    panPosition.value = constrained;
  }
};

const handleTouchEnd = () => {
  isZooming.value = false;
  isPanning.value = false;
  touchStartZoom.value = zoomLevel.value;

  if (zoomLevel.value <= MIN_ZOOM) {
    resetZoom();
  }
};

const zoomToPoint = (x: number, y: number, targetZoom: number) => {
  const container = imageContainer.value;
  if (!container) return;

  const rect = container.getBoundingClientRect();
  const centerX = rect.width / 2;
  const centerY = rect.height / 2;

  const offsetX = x - centerX;
  const offsetY = y - centerY;

  zoomLevel.value = targetZoom;
  panPosition.value = constrainPan(
    -offsetX * (targetZoom - 1),
    -offsetY * (targetZoom - 1)
  );
};

// Wheel zoom handler for testing
const handleWheel = (e: WheelEvent) => {
  if (e.ctrlKey) {
    e.preventDefault();
    const delta = -e.deltaY;
    const rect = imageContainer.value?.getBoundingClientRect();
    if (!rect) return;

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const scaleFactor = 1 + (delta > 0 ? ZOOM_STEP : -ZOOM_STEP);
    const newZoom = Math.min(
      Math.max(zoomLevel.value * scaleFactor, MIN_ZOOM),
      MAX_ZOOM
    );

    if (newZoom !== zoomLevel.value) {
      zoomToPoint(x, y, newZoom);
    }
  }
};

const handleNextImage = () => {
  if (currentIndex.value < props.imageSrc.length - 1) {
    currentIndex.value++;
  }
};

const handlePreviousImage = () => {
  if (currentIndex.value > 0) {
    currentIndex.value--;
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
  height: 100vh;
  height: calc(var(--vh, 1vh) * 100);
  display: flex;
  flex-direction: column;
  padding: 0;
}

.image-viewer-content {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  padding: 0;
  overflow: hidden;
  touch-action: none;
}

.image-container {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  touch-action: none;
  -webkit-touch-callout: none;
  -webkit-user-select: none;
  user-select: none;
}

img {
  max-width: 100%;
  max-height: 100%;
  pointer-events: none;
  user-select: none;
  -webkit-user-select: none;
  -webkit-touch-callout: none;
}

.controls {
  position: absolute;
  top: 16px;
  right: 16px;
  display: flex;
  gap: 8px;
  z-index: 10;
  background: rgba(0, 0, 0, 0.5);
  padding: 8px;
  border-radius: 24px;
  backdrop-filter: blur(8px);
}

.zoom-level {
  position: absolute;
  top: 16px;
  left: 16px;
  background: rgba(0, 0, 0, 0.5);
  color: white;
  padding: 6px 12px;
  border-radius: 16px;
  font-size: 14px;
  font-weight: 500;
  backdrop-filter: blur(8px);
  z-index: 10;
}

.slider-info {
  position: absolute;
  bottom: 20px; /* Adjust as needed */
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: 16px;
  z-index: 10;
  background: rgba(0, 0, 0, 0.5);
  padding: 8px 16px;
  border-radius: 24px;
}

.image-index {
  color: white;
  font-size: 16px;
  font-weight: 500;
}

@supports (-webkit-touch-callout: none) {
  .image-viewer-card {
    height: -webkit-fill-available;
  }
}
</style>
