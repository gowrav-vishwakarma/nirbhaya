<template>
  <q-dialog v-model="dialogModel" maximized>
    <q-card class="column full-height">
      <!-- Header -->
      <q-card-section class="row items-center q-pb-none">
        <div>
          <div class="text-h6">{{ userName }}'s Catalog</div>
          <div class="text-caption q-mb-sm">
            <q-icon
              :name="doesDeliver ? 'local_shipping' : 'close'"
              :color="doesDeliver ? 'positive' : 'negative'"
              size="xs"
            />
            <span class="q-ml-sm">{{
              doesDeliver ? deliveryText : 'Do not deliver'
            }}</span>
          </div>
        </div>
        <q-space />
        <q-btn icon="close" flat round dense v-close-popup />
      </q-card-section>

      <!-- Content -->
      <q-card-section class="col q-pa-none">
        <div v-if="loading" class="full-width row flex-center q-pa-md">
          <q-spinner-dots color="primary" size="40px" />
        </div>

        <div
          v-else-if="!catalogItems?.length"
          class="full-width row flex-center q-pa-md"
        >
          <div class="text-center">
            <q-icon name="inventory_2" size="48px" color="grey-5" />
            <p class="text-grey-7 q-mt-sm">No catalog items available</p>
          </div>
        </div>

        <div v-else class="catalog-container">
          <q-carousel
            v-model="slide"
            animated
            arrows
            navigation
            infinite
            :swipeable="canSwipe"
            class="rounded-borders full-height"
            navigation-position="bottom"
          >
            <q-carousel-slide
              v-for="item in catalogItems"
              :key="item.id"
              :name="item.id"
              class="column no-wrap"
            >
              <div class="image-controls">
                <q-btn-group flat>
                  <q-btn flat round icon="add" @click="zoomIn" />
                  <q-btn flat round icon="remove" @click="zoomOut" />
                  <q-btn flat round icon="refresh" @click="resetZoom" />
                </q-btn-group>
              </div>

              <div
                class="image-container"
                v-touch-pan.mouse.prevent="onPan"
                @touchstart="onTouchStart"
                @touchmove="onTouchMove"
                @touchend="onTouchEnd"
              >
                <q-img
                  :src="imageCdn + item.imageUrl"
                  class="catalog-image"
                  :style="imageTransform"
                  fit="contain"
                  :draggable="false"
                  @wheel.prevent="onWheel"
                >
                  <div class="absolute-bottom custom-caption">
                    <div class="text-h6">{{ item.title }}</div>
                  </div>
                </q-img>
              </div>
            </q-carousel-slide>
          </q-carousel>
        </div>
      </q-card-section>

      <!-- Cart Input Component -->
      <CartInput
        ref="cartInputRef"
        :item-count="cartItems.length"
        :current-slide="slide"
        :business-user-id="userId"
        :whatsapp-number="whatsappNumber"
        @add-item="addToCart"
        @show-cart="showCartDialog = true"
        @order-placed="showCartDialog = false"
      />

      <!-- New Cart Dialog -->
      <q-dialog v-model="showCartDialog">
        <q-card
          style="
            min-width: 350px;
            max-height: 80vh;
            display: flex;
            flex-direction: column;
          "
        >
          <!-- Fixed Header -->
          <q-card-section class="row items-center q-pb-none">
            <div class="text-h6">
              Cart Items
              <span
                v-if="cartItems.length > 0"
                class="text-caption text-grey-7 q-ml-sm"
              >
                ({{ cartItems.length }}
                {{ cartItems.length === 1 ? 'item' : 'items' }})
              </span>
            </div>
            <q-space />
            <q-btn icon="close" flat round dense v-close-popup />
          </q-card-section>

          <!-- Scrollable Content -->
          <q-card-section class="scroll" style="flex: 1; overflow: auto">
            <q-list dense>
              <q-item dense v-for="(item, index) in cartItems" :key="index">
                <q-item-section>
                  <q-input
                    v-model="item.text"
                    dense
                    outlined
                    :hint="`Ref image: ${item.title}`"
                    class="q-my-xs"
                    style="min-height: 40px"
                  >
                  </q-input>
                </q-item-section>
                <q-item-section side class="items-start">
                  <q-btn
                    flat
                    round
                    dense
                    color="negative"
                    icon="delete"
                    @click="cartItems.splice(index, 1)"
                  />
                </q-item-section>
              </q-item>
            </q-list>
          </q-card-section>
          <q-separator />
          <!-- Fixed Footer -->
          <q-card-actions align="right" class="bg-white q-pa-md">
            <q-btn color="primary" label="Place Order" @click="placeOrder" />
          </q-card-actions>
        </q-card>
      </q-dialog>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch, onBeforeUnmount, reactive } from 'vue';
import { api } from 'src/boot/axios';
import CartInput from './CartInput.vue';
import { useQuasar } from 'quasar';
import { useDraggable } from '@vueuse/core';

// Add CDN URL constant
const imageCdn =
  'https://xavoc-technocrats-pvt-ltd.blr1.cdn.digitaloceanspaces.com/';

interface CatalogItem {
  id: number;
  title: string; // Changed from name to title to match API response
  imageUrl: string;
  sequence: number;
  // price and description are not in the API response, so removing them
}

interface CartItem {
  slideId: number;
  text: string;
  title: string;
}

const props = defineProps<{
  userId: number;
  userName: string;
  isOpen: boolean;
}>();

const emit = defineEmits(['update:isOpen']);

// Move dialogModel definition here, before it's used in any watchers
const dialogModel = computed({
  get: () => props.isOpen,
  set: (value) => {
    if (!value && cartItems.value.length > 0) {
      $q.dialog({
        title: 'Items in Cart',
        message: 'You have items in your cart. Are you sure you want to leave?',
        cancel: true,
        persistent: true,
      })
        .onOk(() => {
          cartItems.value = [];
          emit('update:isOpen', false);
        })
        .onCancel(() => {
          // Keep the dialog open
          emit('update:isOpen', true);
        });
    } else {
      emit('update:isOpen', value);
    }
  },
});

// Add these refs to store delivery information
const doesDeliver = ref(false);
const deliveryText = ref('');
const catalogItems = ref<CatalogItem[]>([]);
const whatsappNumber = ref('');
const loading = ref(true);
const slide = ref(1);
const cartItems = ref<CartItem[]>([]);
const showCartDialog = ref(false);
const cartInputRef = ref();
const $q = useQuasar();

// Add new refs and reactive state for zoom/pan
const zoom = ref(1);
const positionX = ref(0);
const positionY = ref(0);
const isDragging = ref(false);

// Zoom controls
const MIN_ZOOM = 1;
const MAX_ZOOM = 3;
const ZOOM_STEP = 0.2;

const zoomIn = () => {
  zoom.value = Math.min(zoom.value + ZOOM_STEP, MAX_ZOOM);
};

const zoomOut = () => {
  zoom.value = Math.max(zoom.value - ZOOM_STEP, MIN_ZOOM);
};

const resetZoom = () => {
  zoom.value = 1;
  positionX.value = 0;
  positionY.value = 0;
};

// Add transform computed property for better performance
const imageTransform = computed(() => {
  return {
    transform: `translate3d(${positionX.value}px, ${positionY.value}px, 0) scale(${zoom.value})`,
    cursor:
      zoom.value > 1 ? (isDragging.value ? 'grabbing' : 'grab') : 'default',
    willChange: 'transform',
    '-webkit-backface-visibility': 'hidden',
    'backface-visibility': 'hidden',
    '-webkit-transform-style': 'preserve-3d',
    'transform-style': 'preserve-3d',
  };
});

// Replace the onPan handler with this new implementation
const onPan = (evt: any) => {
  if (zoom.value <= 1) return;
  isDragging.value = true;

  const maxPanX = ((zoom.value - 1) * window.innerWidth) / 1.8;
  const maxPanY = ((zoom.value - 1) * window.innerHeight) / 1.8;

  // Use requestAnimationFrame for smooth updates
  requestAnimationFrame(() => {
    const newX = positionX.value + evt.delta.x;
    const newY = positionY.value + evt.delta.y;

    // Apply constraints with easing
    positionX.value = Math.min(Math.max(newX, -maxPanX), maxPanX);
    positionY.value = Math.min(Math.max(newY, -maxPanY), maxPanY);
  });

  if (evt.isFinal) {
    isDragging.value = false;
  }
};

// Mouse wheel zoom handler
const onWheel = (evt: WheelEvent) => {
  evt.preventDefault();
  const delta = evt.deltaY > 0 ? -ZOOM_STEP : ZOOM_STEP;
  const newZoom = zoom.value + delta;

  if (newZoom >= MIN_ZOOM && newZoom <= MAX_ZOOM) {
    zoom.value = newZoom;
  }
};

// Add these variables for pinch tracking
const initialDistance = ref(0);
const initialZoom = ref(1);

// Add this function to calculate distance between touch points
const getDistance = (touches: TouchList) => {
  if (touches.length < 2) return 0;
  const dx = touches[0].clientX - touches[1].clientX;
  const dy = touches[0].clientY - touches[1].clientY;
  return Math.sqrt(dx * dx + dy * dy);
};

// Add a new ref to track pinch state
const isPinching = ref(false);

// Modify the canSwipe computed property to consider pinching state
const canSwipe = computed(() => zoom.value <= 1 && !isPinching.value);

// Update touch handlers to manage pinch state
const onTouchStart = (evt: TouchEvent) => {
  if (evt.touches.length === 2) {
    isPinching.value = true;
    initialDistance.value = getDistance(evt.touches);
    initialZoom.value = zoom.value;
    evt.preventDefault();
  }
};

const onTouchMove = (evt: TouchEvent) => {
  if (evt.touches.length === 2 && isPinching.value) {
    const currentDistance = getDistance(evt.touches);
    if (initialDistance.value > 0) {
      const scale = currentDistance / initialDistance.value;
      const newZoom = initialZoom.value * scale;

      if (newZoom >= MIN_ZOOM && newZoom <= MAX_ZOOM) {
        zoom.value = newZoom;

        // Calculate center point of the pinch
        const centerX = (evt.touches[0].clientX + evt.touches[1].clientX) / 2;
        const centerY = (evt.touches[0].clientY + evt.touches[1].clientY) / 2;

        // Adjust position based on pinch center
        const maxPanX = ((zoom.value - 1) * window.innerWidth) / 1.8;
        const maxPanY = ((zoom.value - 1) * window.innerHeight) / 1.8;

        positionX.value = Math.min(
          Math.max(positionX.value, -maxPanX),
          maxPanX
        );
        positionY.value = Math.min(
          Math.max(positionY.value, -maxPanY),
          maxPanY
        );
      }
    }
    evt.preventDefault();
  }
};

const onTouchEnd = () => {
  isPinching.value = false;
  initialDistance.value = 0;
};

// Reset zoom and position when slide changes
watch(slide, () => {
  resetZoom();
});

// Reset zoom and position when dialog closes
watch(dialogModel, (newVal) => {
  if (!newVal) {
    resetZoom();
  }
});

const loadCatalogItems = async () => {
  try {
    loading.value = true;
    const response = await api.get(
      `/community/business-catalog/${props.userId}`
    );
    catalogItems.value = response.data.catalogItems || [];
    if (catalogItems.value.length > 0) {
      slide.value = catalogItems.value[0].id;
    }
    whatsappNumber.value = response.data.whatsappNumber;
    // Set delivery information from API response
    doesDeliver.value = response.data.doesDelivery;
    deliveryText.value = response.data.deliveryText;
  } catch (error) {
    console.error('Error loading catalog items:', error);
    catalogItems.value = [];
  } finally {
    loading.value = false;
  }
};

const addToCart = (itemText: string) => {
  // Find the current catalog item
  const currentItem = catalogItems.value.find(
    (item) => item.id === slide.value
  );
  if (!currentItem) return;

  cartItems.value.push({
    slideId: slide.value,
    text: itemText,
    title: currentItem.title,
  });
};

const placeOrder = async () => {
  try {
    await cartInputRef.value?.placeOrder(cartItems.value);
    showCartDialog.value = false;
    cartItems.value = [];
  } catch (error) {
    console.error('Error placing order:', error);
    $q.notify({
      type: 'negative',
      message: 'Failed to place order. Please try again.',
    });
  }
};

// Replace the separate watchers with a single combined watcher
watch(
  // Watch both isOpen and userId together
  [() => props.isOpen, () => props.userId],
  ([isOpen, userId]) => {
    console.log('Watch triggered:', { isOpen, userId }); // Add logging for debugging
    if (isOpen && userId) {
      loadCatalogItems();
    }
  },
  { immediate: true } // Add immediate option back to ensure it runs on mount
);

// Add before component unmount handler
onBeforeUnmount(() => {
  if (cartItems.value.length > 0) {
    $q.dialog({
      title: 'Items in Cart',
      message: 'You have items in your cart. Are you sure you want to leave?',
      cancel: true,
      persistent: true,
    })
      .onOk(() => {
        cartItems.value = [];
      })
      .onCancel(() => {
        // Keep the dialog open
        dialogModel.value = true;
      });
  }
});
</script>

<style lang="scss" scoped>
.catalog-container {
  height: calc(100vh - 220px);
  position: relative;
}

.q-carousel {
  height: 100%;
}

.custom-caption {
  background: linear-gradient(
    to top,
    rgba(0, 0, 0, 0.7) 20%,
    rgba(0, 0, 0, 0) 80%
  );
  padding: 12px;
  color: white;
  display: flex;
  align-items: flex-end;
}

:deep(.q-carousel__navigation) {
  background: rgba(0, 0, 0, 0.3);
  padding: 4px 0;
}

:deep(.q-carousel__arrow) {
  background: rgba(0, 0, 0, 0.3);
  opacity: 0.7;
  transition: opacity 0.3s;

  &:hover {
    opacity: 1;
  }
}

:deep(.q-img) {
  height: 100%;
}

:deep(.q-img__content) {
  background: transparent;
}

.image-container {
  position: relative;
  height: 100%;
  overflow: hidden;
  touch-action: none;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #000;
  transform: translateZ(0);
  -webkit-transform: translateZ(0);
}

.catalog-image {
  transition: transform 0.1s cubic-bezier(0.4, 0, 0.2, 1);
  will-change: transform;
  max-width: 100%;
  max-height: 100%;
  -webkit-backface-visibility: hidden;
  backface-visibility: hidden;
  transform-style: preserve-3d;
  perspective: 1000px;
}

.image-controls {
  position: absolute;
  top: 16px;
  right: 16px;
  z-index: 2;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 8px;
  padding: 4px;

  .q-btn {
    color: white;
    opacity: 0.8;
    &:hover {
      opacity: 1;
    }
  }
}

:deep(.cart-input-container) {
  position: sticky;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 3;
  background: white;
  box-shadow: 0 -2px 4px rgba(0, 0, 0, 0.1);
}

.q-carousel {
  background: #000;
}
</style>
