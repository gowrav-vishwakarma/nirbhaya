<template>
  <div>
    <h1>SOS Event Details</h1>
    <p><strong>SOS Event ID:</strong> {{ sosEventId }}</p>
    <p><strong>Location:</strong> {{ location }}</p>
  </div>
</template>

<script setup>
import { defineProps } from 'vue';

const props = defineProps({
  sosEventId: {
    type: String,
    required: true,
  },
  location: {
    type: String,
    required: true,
  },
});
</script>

<style scoped>
h1 {
  color: #333;
}
</style>
