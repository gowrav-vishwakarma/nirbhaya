<template>
  <q-page class="dashboard-page q-pa-md">
    <div class="dashboard-content">
      <WelcomeCard :user-name="userName" />
      <SOSButtons @initiate-sos="initiateSOSMode" />
      <EmergencyContacts />
      <!-- <NearbyVolunteers v-if="locationPermissionGranted" /> -->
      <!-- <MissingPermissions /> -->
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { computed, defineAsyncComponent, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from 'src/stores/user-store';
import { useSOSMode } from 'src/composables/useSOSMode';
import { usePermissions } from 'src/composables/usePermissions';
// import MissingPermissions from 'src/components/MissingPermissions.vue';

const WelcomeCard = defineAsyncComponent(
  () => import('./components/WelcomeCard.vue')
);
const SOSButtons = defineAsyncComponent(
  () => import('./components/SOSButtons.vue')
);
const EmergencyContacts = defineAsyncComponent(
  () => import('./components/EmergencyContacts.vue')
);
const NearbyVolunteers = defineAsyncComponent(
  () => import('./components/NearbyVolunteers.vue')
);

const router = useRouter();
const userStore = useUserStore();
const { initiateSOSMode } = useSOSMode();
const { permissions, checkPermissions } = usePermissions();

const userName = computed(() => userStore.user.name || 'User');

const locationPermissionGranted = computed(
  () =>
    permissions.value.find((p) => p.name === 'common.location')?.granted ||
    false
);

onMounted(async () => {
  // await checkPermissions();
});
</script>

<style lang="scss" scoped>
.dashboard-page {
  background: linear-gradient(135deg, $primary, darken($primary, 20%));
  min-height: 100vh;
}

.dashboard-content {
  max-width: 600px;
  margin: 0 auto;
}
</style>
