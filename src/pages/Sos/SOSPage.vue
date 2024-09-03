<template>
  <div>
    <h1>SOS Event Details</h1>
    <p><strong>SOS Event ID:</strong> {{ sosEventId }}</p>
    <p><strong>Location:</strong> {{ location }}</p>
    <q-btn
      v-if="status === 'sent'"
      color="primary"
      label="Accept"
      @click="acceptSOS"
    />
    <q-btn
      v-if="status === 'accepted'"
      color="secondary"
      label="Follow"
      @click="followLocation"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { defineProps } from 'vue';
import { api } from 'boot/axios';
import { useQuasar } from 'quasar';

const $q = useQuasar();

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

const status = ref('sent');

const acceptSOS = async () => {
  try {
    await api.post(`/auth/sos-events/${props.sosEventId}/accept`);
    status.value = 'accepted';
    $q.notify({
      color: 'positive',
      message: 'SOS event accepted successfully',
      icon: 'check',
    });
  } catch (error) {
    console.error('Error accepting SOS event:', error);
    $q.notify({
      color: 'negative',
      message: 'Failed to accept SOS event',
      icon: 'error',
    });
  }
};

const followLocation = () => {
  const [lat, lng] = props.location.split(',').map((coord) => coord.trim());
  const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
  window.open(url, '_blank');
};
</script>

<style scoped>
h1 {
  color: #333;
}
</style>
