<template>
  <div
    class="cart-input-container row items-center justify-between q-px-md q-py-sm"
  >
    <q-btn flat round color="primary" class="q-mr-md">
      <q-icon name="shopping_cart" />
      <q-badge color="red" floating>{{ itemCount }}</q-badge>
    </q-btn>

    <q-input
      v-model="itemText"
      dense
      outlined
      placeholder="Enter item name"
      class="col"
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
</template>

<script setup lang="ts">
import { ref } from 'vue';

const props = defineProps<{
  itemCount: number;
}>();

const emit = defineEmits(['add-item']);

const itemText = ref('');

const addItem = () => {
  if (itemText.value.trim()) {
    emit('add-item', itemText.value);
    itemText.value = '';
  }
};
</script>

<style lang="scss" scoped>
.cart-input-container {
  border-top: 1px solid #ddd;
  background: white;
}
</style>
