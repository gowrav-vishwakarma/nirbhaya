<template>
  <q-page padding>
    <h1 class="text-h4 q-mb-md">Notifications</h1>
    <q-list v-if="responseData.length > 0" bordered separator>
      <q-item
        v-for="notification in responseData"
        :key="notification.id"
        class="q-py-md"
      >
        <q-item-section>
          <q-item-label class="text-weight-bold">
            {{ getNotificationTitle(notification) }}
          </q-item-label>
          <q-item-label caption>
            {{ formatDate(notification.createdAt) }}
          </q-item-label>
          <q-item-label v-if="notification.sosEvent" caption>
            Status: {{ notification.sosEvent.status }}
            <template v-if="notification.sosEvent.location">
              | Location: {{ formatLocation(notification.sosEvent.location) }}
            </template>
          </q-item-label>
          <q-item-label
            v-if="notification.sosEvent && notification.sosEvent.threat"
            caption
          >
            Threat: {{ notification.sosEvent.threat }}
          </q-item-label>
        </q-item-section>
        <q-item-section side v-if="notification.status === 'sent'">
          <q-btn
            color="primary"
            label="Accept"
            @click="acceptNotification(notification.id)"
          />
        </q-item-section>
        <q-item-section side v-else>
          <q-chip
            :color="getStatusColor(notification.status)"
            text-color="white"
          >
            {{ notification.status }}
          </q-chip>
        </q-item-section>
      </q-item>
    </q-list>
    <p v-else>No notifications found.</p>
  </q-page>
</template>

<script setup lang="ts">
import { onMounted, watch } from 'vue';
import { useForm } from 'src/qnatk/composibles/use-form';
import { api } from 'boot/axios';
import { useQuasar } from 'quasar';
import { useBackgroundNotifications } from 'src/composables/useBackgroundNotifications';

interface SosEvent {
  id: number;
  location: {
    type: string;
    coordinates: number[];
  };
  status: string;
  threat: string | null;
}

interface Notification {
  id: number;
  eventId: number;
  recipientId: number;
  recipientType: 'volunteer' | 'emergency_contact';
  status: 'sent' | 'received' | 'accepted' | 'ignored';
  createdAt: string;
  updatedAt: string;
  sosEvent: SosEvent;
}

const $q = useQuasar();
const { unreadNotificationCount, fetchUnreadNotificationCount } =
  useBackgroundNotifications();

const { responseData, validateAndSubmit, isLoading } = useForm<Notification>(
  api,
  '/auth/notifications',
  {},
  'get'
);

onMounted(async () => {
  await validateAndSubmit(false);
});

// Refresh notifications when unreadNotificationCount changes
watch(unreadNotificationCount, async () => {
  await validateAndSubmit(false);
});

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleString();
};

const formatLocation = (location: { type: string; coordinates: number[] }) => {
  if (location && location.coordinates) {
    return `${location.coordinates[1].toFixed(
      6
    )}, ${location.coordinates[0].toFixed(6)}`;
  }
  return 'Unknown';
};

const getNotificationTitle = (notification: Notification) => {
  const eventType = notification.sosEvent?.threat || 'SOS';
  if (notification.recipientType === 'volunteer') {
    return `Nearby ${eventType} alert`;
  } else {
    return `Emergency contact ${eventType} alert`;
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'sent':
      return 'blue';
    case 'received':
      return 'orange';
    case 'accepted':
      return 'green';
    case 'ignored':
      return 'red';
    default:
      return 'grey';
  }
};

const acceptNotification = async (notificationId: number) => {
  try {
    // Implement the API call to accept the notification
    await api.post(`/auth/notifications/${notificationId}/accept`);

    // Update the local state
    const index = responseData.value.findIndex((n) => n.id === notificationId);
    if (index !== -1) {
      responseData.value[index].status = 'accepted';
    }

    $q.notify({
      color: 'positive',
      message: 'Notification accepted successfully',
      icon: 'check',
    });
  } catch (error) {
    console.error('Error accepting notification:', error);
    $q.notify({
      color: 'negative',
      message: 'Failed to accept notification',
      icon: 'error',
    });
  }
};
</script>

<style scoped>
h1 {
  color: #333;
}
</style>
