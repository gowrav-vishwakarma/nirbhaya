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
      <q-card-section class="image-viewer-header" @click.stop>
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
          @touchstart="startPinchZoom"
          @touchmove="pinchZoom"
          @touchend="endPinchZoom"
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
const startPan = (e: MouseEvent) => {
  if (zoomLevel.value > 1) {
    isPanning.value = true;
    startPanPos.value = {
      x: e.clientX - panPosition.value.x,
      y: e.clientY - panPosition.value.y,
    };
  }
};

const pan = (e: MouseEvent) => {
  if (isPanning.value) {
    panPosition.value = {
      x: e.clientX - startPanPos.value.x,
      y: e.clientY - startPanPos.value.y,
    };
  }
};

const endPan = () => {
  isPanning.value = false;
};

// Touch zoom controls
const touchDistance = ref(0);
const initialZoom = ref(1);

const startPinchZoom = (e: TouchEvent) => {
  if (e.touches.length === 2) {
    const touch1 = e.touches[0];
    const touch2 = e.touches[1];
    touchDistance.value = Math.hypot(
      touch2.clientX - touch1.clientX,
      touch2.clientY - touch1.clientY
    );
    initialZoom.value = zoomLevel.value;
  }
};

const pinchZoom = (e: TouchEvent) => {
  if (e.touches.length === 2) {
    const touch1 = e.touches[0];
    const touch2 = e.touches[1];
    const currentDistance = Math.hypot(
      touch2.clientX - touch1.clientX,
      touch2.clientY - touch1.clientY
    );

    const scale = currentDistance / touchDistance.value;
    const newZoom = Math.min(
      Math.max(initialZoom.value * scale, MIN_ZOOM),
      MAX_ZOOM
    );
    zoomLevel.value = newZoom;
  }
};

const endPinchZoom = () => {
  touchDistance.value = 0;
};

const resetZoom = () => {
  zoomLevel.value = 1;
  panPosition.value = { x: 0, y: 0 };
};

const initializeImage = () => {
  resetZoom();
};

const imageStyle = computed(() => ({
  transform: `translate(${panPosition.value.x}px, ${panPosition.value.y}px) scale(${zoomLevel.value})`,
  cursor: zoomLevel.value > 1 ? 'grab' : 'default',
  transition: isPanning.value ? 'none' : 'transform 0.2s ease',
}));

const handleBackgroundClick = (event: MouseEvent) => {
  // Only close if clicking directly on the background
  if (event.target === event.currentTarget) {
    isOpen.value = false;
  }
};

// const openImageViewer = (imageUrl: string, post: Post, index = 0) => {
//   if (post.mediaUrls) {
//     selectedImages.value = Array.isArray(post.mediaUrls)
//       ? post.mediaUrls.map((url) => imageCdn + url)
//       : [imageCdn + post.mediaUrls];
//     selectedImageIndex.value = index; // Sets the correct index
//   } else {
//     selectedImages.value = [imageCdn + imageUrl];
//     selectedImageIndex.value = 0;
//   }
//   showImageViewer.value = true;
// };
</script>

<style lang="scss" scoped>
.image-viewer-dialog {
  background: rgba(0, 0, 0, 0.9);
}

.image-viewer-card {
  background: transparent;
  box-shadow: none;
  cursor: default;
}

.image-viewer-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 2000;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  background: linear-gradient(to bottom, rgba(0, 0, 0, 0.5), transparent);
}

.zoom-controls {
  display: flex;
  align-items: center;
  gap: 8px;
  color: white;
}

.zoom-level {
  min-width: 60px;
  text-align: center;
  font-size: 14px;
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
  touch-action: none;
  cursor: default;
}

img {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  transform-origin: center;
  will-change: transform;
  user-select: none;
  -webkit-user-select: none;
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
</style>
