<template>
  <div class="cart-input-container">
    <div
      class="cart-input-container row items-center justify-between q-px-md q-py-sm"
    >
      <q-btn
        flat
        round
        color="primary"
        class="q-mr-md"
        @click="$emit('show-cart')"
      >
        <q-icon name="shopping_cart" />
        <q-badge color="red" floating>{{ itemCount }}</q-badge>
      </q-btn>

      <q-input
        v-model="itemText"
        dense
        outlined
        placeholder="Enter item name"
        class="col"
        @keyup.enter="addItem"
      />

      <q-btn
        flat
        round
        color="primary"
        icon="add"
        class="q-ml-md"
        @click="addItem"
        :disable="!itemText.trim()"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { api } from 'src/boot/axios';
import { useQuasar } from 'quasar';

const props = defineProps<{
  itemCount: number;
  currentSlide: number;
  businessUserId: number;
  whatsappNumber: string | null;
}>();

const emit = defineEmits(['add-item', 'show-cart', 'order-placed']);

const $q = useQuasar();
const itemText = ref('');

const addItem = () => {
  if (itemText.value.trim()) {
    emit('add-item', itemText.value);
    itemText.value = '';
  }
};

const placeOrder = async (items: { slideId: number; text: string }[]) => {
  try {
    await api.post('/community/orders', {
      businessUserId: props.businessUserId,
      order: items,
    });

    $q.notify({
      type: 'positive',
      message: 'Order placed successfully!',
    });

    // Only proceed with WhatsApp if we have a valid number
    if (props.whatsappNumber?.length === 10) {
      // Format order items for WhatsApp
      const formattedItems = items
        .map((item, index) => `${index + 1}. ${item.text}`)
        .join('\n');

      const text = `New Order:\n\n${formattedItems}\n\nPlease confirm my order.`;
      const encodedText = encodeURIComponent(text);

      // Create both universal and app-specific URLs
      const universalUrl = `https://wa.me/91${props.whatsappNumber}?text=${encodedText}`;
      const appUrl = `whatsapp://send?phone=91${props.whatsappNumber}&text=${encodedText}`;

      try {
        // Try to open WhatsApp app first
        const openApp = async () => {
          const a = document.createElement('a');
          a.href = appUrl;
          a.style.display = 'none';
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
        };

        // Fallback to universal link after a short delay
        await openApp();
        setTimeout(() => {
          window.location.href = universalUrl;
        }, 500);
      } catch (error) {
        console.error('Error opening WhatsApp:', error);
        $q.notify({
          message: 'Unable to connect via WhatsApp',
          color: 'negative',
          position: 'top-right',
        });
      }
    } else {
      // notify whatsapp number not found
      $q.notify({
        type: 'negative',
        message:
          'WhatsApp number not found. Please add a WhatsApp number to your profile.',
      });
    }

    emit('order-placed');
  } catch (error) {
    console.error('Error placing order:', error);
    $q.notify({
      type: 'negative',
      message: 'Failed to place order. Please try again.',
    });
  }
};

defineExpose({ placeOrder });
</script>

<style lang="scss" scoped>
.cart-input-container {
  border-top: 1px solid #ddd;
  background: white;
}
</style>
