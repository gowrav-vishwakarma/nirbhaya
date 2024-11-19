<template>
  <q-page class="dashboard-page q-pa-md">
    <div class="dashboard-content">
      <WelcomeCard :user-name="userName" />
      <promoting-app-install ref="promotingAppInstall"></promoting-app-install>
      <div class="beta-notice" @click="goToCommunityRoute">
        {{ $t('common.betaNotice') }}
      </div>
      <SOSButtons @initiate-sos="initiateSOSMode" />
      <EmergencyContacts />
      <TrustStatsCard />
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
import PromotingAppInstall from 'src/components/PromotingAppInstall.vue';
// import { usePermissions } from 'src/composables/usePermissions';
// import MissingPermissions from 'src/components/MissingPermissions.vue';

const router = useRouter();
const allowedIdsStr = process.env.SHOW_INSTALL_PROMPT
const WelcomeCard = defineAsyncComponent(
  () => import('./components/WelcomeCard.vue')
);
const SOSButtons = defineAsyncComponent(
  () => import('./components/SOSButtons.vue')
);
const EmergencyContacts = defineAsyncComponent(
  () => import('./components/EmergencyContacts.vue')
);
// const NearbyVolunteers = defineAsyncComponent(
//   () => import('./components/NearbyVolunteers.vue')
// );
const TrustStatsCard = defineAsyncComponent(
  () => import('./components/TrustStatsCard.vue')
);

// const router = useRouter();
const userStore = useUserStore();
const { initiateSOSMode } = useSOSMode();
// const { permissions, checkPermissions } = usePermissions();

const userName = computed(() => userStore.user.name || 'User');

// const locationPermissionGranted = computed(
//   () =>
//     permissions.value.find((p) => p.name === 'common.location')?.granted ||
//     false
// );

const goToCommunityRoute = () => {
  router.push('/community');
};

const promotingAppInstall = ref();

onMounted(async () => {
  // Get the allowed IDs from env and convert to array of numbers
  const allowedIds = allowedIdsStr?.split(',').map(Number) || [];
  // console.log('allowedIds.........', allowedIds);

  // Only show prompt if user's ID is in the allowed list
  if (allowedIds.includes(userStore.user.id)) {
    setTimeout(() => {
      if (promotingAppInstall.value?.dialogRef) {
        promotingAppInstall.value.dialogRef.show();
      }
    }, 1000);
  }
});
</script>

<style lang="scss" scoped>
.dashboard-page {
  background: linear-gradient(135deg, $primary, darken($primary, 20%));
  min-height: 100vh;
}

.beta-notice {
  font-size: 1rem;
  color: $secondary;
  text-align: center;
  margin: 1rem 0;
}

.dashboard-content {
  max-width: 600px;
  margin: 0 auto;
}
</style>
