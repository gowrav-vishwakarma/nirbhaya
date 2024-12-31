<template>
  <q-dialog v-model="dialogModel" maximized>
    <q-card class="column full-height">
      <!-- Header -->
      <q-card-section class="row items-center q-pb-none">
        <div>
          <div class="text-h6">{{ userName }}'s Catalog</div>
          <div class="text-caption q-mt-sm">
            <q-icon
              :name="doesDeliver ? 'local_shipping' : 'close'"
              :color="doesDeliver ? 'positive' : 'negative'"
              size="xs"
            />
            <span class="q-ml-sm">{{ deliveryText }}</span>
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

        <div v-else class="full-height">
          <!-- Image Carousel -->
          <q-carousel
            v-model="slide"
            animated
            arrows
            navigation
            infinite
            class="q-mb-md rounded-borders full-height"
            navigation-position="bottom"
            padding
          >
            <q-carousel-slide
              v-for="item in catalogItems"
              :key="item.id"
              :name="item.id"
              class="column no-wrap full-height"
            >
              <div class="absolute-full custom-caption">
                <div class="text-h6">{{ item.title }}</div>
              </div>
              <q-img
                :src="imageCdn + item.imageUrl"
                class="full-height"
                fit="contain"
              />
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
        @add-item="addToCart"
        @show-cart="showCartDialog = true"
        @order-placed="showCartDialog = false"
      />

      <!-- New Cart Dialog -->
      <q-dialog v-model="showCartDialog">
        <q-card style="min-width: 350px">
          <q-card-section class="row items-center">
            <div class="text-h6">Cart Items</div>
            <q-space />
            <q-btn icon="close" flat round dense v-close-popup />
          </q-card-section>

          <q-card-section class="q-pa-none">
            <q-list>
              <q-item v-for="(item, index) in cartItems" :key="index">
                <q-item-section>
                  <q-input v-model="item.text" dense outlined class="q-pa-sm" />
                </q-item-section>
                <q-item-section side>
                  <q-btn
                    flat
                    round
                    color="negative"
                    icon="delete"
                    @click="cartItems.splice(index, 1)"
                  />
                </q-item-section>
              </q-item>
            </q-list>
          </q-card-section>

          <q-card-actions align="right" class="bg-white">
            <q-btn color="primary" label="Place Order" @click="placeOrder" />
          </q-card-actions>
        </q-card>
      </q-dialog>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { api } from 'src/boot/axios';
import CartInput from './CartInput.vue';
import { useQuasar } from 'quasar';

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
}

const props = defineProps<{
  userId: number;
  userName: string;
  isOpen: boolean;
  doesDeliver: boolean;
  deliveryText: string;
}>();

const emit = defineEmits(['update:isOpen']);

const catalogItems = ref<CatalogItem[]>([]);
const loading = ref(true);
const slide = ref(1);
const cartItems = ref<CartItem[]>([]);
const showCartDialog = ref(false);
const cartInputRef = ref();
const $q = useQuasar();

// Create a computed property for the dialog model
const dialogModel = computed({
  get: () => props.isOpen,
  set: (value) => emit('update:isOpen', value),
});

const loadCatalogItems = async () => {
  try {
    loading.value = true;
    const response = await api.get(
      `/community/business-catalog/${props.userId}`
    );
    catalogItems.value = response.data.catalogItems || []; // Changed from items to catalogItems
    if (catalogItems.value.length > 0) {
      slide.value = catalogItems.value[0].id;
    }
  } catch (error) {
    console.error('Error loading catalog items:', error);
    catalogItems.value = [];
  } finally {
    loading.value = false;
  }
};

const addToCart = (itemText: string) => {
  cartItems.value.push({
    slideId: slide.value,
    text: itemText,
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

// Load items when dialog opens
watch(
  () => props.isOpen,
  (newValue) => {
    if (newValue) {
      loadCatalogItems();
    }
  },
  { immediate: true }
);
</script>

<style lang="scss" scoped>
.q-carousel {
  height: calc(
    100vh - 150px
  ); // Adjust this value based on your header and input row heights
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
</style>
