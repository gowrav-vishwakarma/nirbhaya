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
  businessName: string;
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

const placeOrder = async (
  items: { slideId: number; text: string; title: string }[]
) => {
  try {
    await api.post('/community/orders', {
      businessUserId: props.businessUserId,
      order: items.map((item) => ({
        slideId: item.slideId,
        text: item.text,
        title: item.title,
      })),
    });

    $q.notify({
      type: 'positive',
      message: 'Order placed successfully!',
    });

    if (props.whatsappNumber?.length === 10) {
      const formattedItems = items
        .map((item, index) => `${index + 1}. ${item.text}`)
        .join('\n');

      const text = `\n\nHi ${props.businessName},\n\nYou have a new order from the user of SOSBharat app! Here’s the list of items:\n\n${formattedItems}\n\n----\n\nPlease check and confirm the order and prepare the items for delivery.\n\n Thanks You \n\n Team SOSBharat\n\n----`;
      const encodedText = encodeURIComponent(text);

      const universalUrl = `https://wa.me/91${props.whatsappNumber}?text=${encodedText}`;
      const appUrl = `whatsapp://send?phone=91${props.whatsappNumber}&text=${encodedText}`;

      try {
        const openApp = async () => {
          const a = document.createElement('a');
          a.href = appUrl;
          a.style.display = 'none';
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
        };

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
