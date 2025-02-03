<template>
  <q-page class="dashboard-page q-pa-md">
    <div class="dashboard-content">
      <WelcomeCard :user-name="userName" />
      <PromotingAppInstall
        v-if="isDialogOpen"
        ref="promotingAppInstall"
      ></PromotingAppInstall>

      <!-- Emergency Contact Warning Banner -->
      <q-banner
        v-if="!hasEmergencyContacts"
        class="bg-warning text-white q-mb-sm q-mt-sm animate-bounce"
        @click="goToAddEmergency"
      >
        <template v-slot:avatar>
          <q-icon name="warning" color="white" />
        </template>
        Add an emergency contact to use SOS features.
      </q-banner>

      <!-- Volunteer Location Warning Banner -->
      <q-banner
        v-if="!hasVolunteer"
        class="bg-warning text-white q-mb-sm q-mt-sm animate-bounce"
        @click="goToAddVolunteers"
      >
        <template v-slot:avatar>
          <q-icon name="warning" color="white" />
        </template>
        Set location for volunteer opportunities.
      </q-banner>

      <!-- Buttons Section -->
      <!-- <div class="row q-col-gutter-md">
        <div class="col-12" v-if="!hasEmergencyContacts || !hasVolunteer">
          <q-btn
            v-if="!hasEmergencyContacts"
            :class="{
              'nearby-btn text-white full-width': true,
              'attention-required': !hasEmergencyContacts,
              'animate-bounce': !hasEmergencyContacts,
            }"
            icon="mdi-human-greeting-proximity"
            label="Add Emergency"
            @click="goToAddEmergency"
          >
            <q-tooltip> Please add emergency contacts for safety </q-tooltip>
          </q-btn>

          <q-btn
            v-if="!hasVolunteer"
            :class="{
              'nearby-btn text-white full-width': true,
              'attention-required': !hasVolunteer,
              'animate-bounce': !hasVolunteer,
            }"
            icon="volunteer_activism"
            label="Become Volunteer"
            @click="goToAddVolunteers"
          >
            <q-tooltip>
              Please add your location to become a volunteer
            </q-tooltip>
          </q-btn>
        </div>
      </div> -->

      <SOSButtons v-if="hasEmergencyContacts" @initiate-sos="handleSOSClick" />
      <SOSButtons v-else @initiate-sos="handleSOSClick" disabled />

      <div class="row justify-center q-mt-md">
        <q-btn
          class="nearby-btn text-white"
          icon="emoji_people"
          label="Find Nearby Volunteers"
          @click="goToVolunteersPage"
        />
      </div>
      <div class="beta-notice" @click="goToCommunityRoute">
        {{ $t('common.betaNotice') }}
        <q-icon
          class="bg-white"
          style="border-radius: 50%"
          color="primary"
          name="arrow_forward"
        ></q-icon>
      </div>
      <EmergencyContacts />
      <TrustStatsCard />
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { computed, defineAsyncComponent, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from 'src/stores/user-store';
import { useSOSMode } from 'src/composables/useSOSMode';
import { useQuasar } from 'quasar';

const isDialogOpen = process.env.SHOW_INSTALL_PROMPT == 'true';
const router = useRouter();
const WelcomeCard = defineAsyncComponent(
  () => import('./components/WelcomeCard.vue')
);
const SOSButtons = defineAsyncComponent(
  () => import('./components/SOSButtons.vue')
);
const EmergencyContacts = defineAsyncComponent(
  () => import('./components/EmergencyContacts.vue')
);
const TrustStatsCard = defineAsyncComponent(
  () => import('./components/TrustStatsCard.vue')
);
const PromotingAppInstall = defineAsyncComponent(
  () => import('src/components/PromotingAppInstall.vue')
);

const userStore = useUserStore();
const { initiateSOSMode } = useSOSMode();
const $q = useQuasar();
const promotingAppInstall = ref();

const userName = computed(() => userStore.user.name || 'User');
const hasEmergencyContacts = computed(() => {
  return (
    userStore.user.emergencyContacts &&
    userStore.user.emergencyContacts.length > 0
  );
});

const hasVolunteer = computed(() => {
  return (
    userStore.user.locations.length && userStore.user.locations[0].location
  );
});

const goToCommunityRoute = () => {
  router.push('/community');
};

const goToVolunteersPage = () => {
  router.push('/volunteers');
};
const goToAddEmergency = () => {
  router.push('/account?open=emergency');
};

const goToAddVolunteers = () => {
  router.push('/account?open=volunteers');
};

const handleSOSClick = (contactsOnly: boolean) => {
  if (!hasEmergencyContacts.value) {
    $q.notify({
      color: 'negative',
      message: 'Please add emergency contacts first.',
      icon: 'warning',
      position: 'top-right',
    });
    return;
  }
  initiateSOSMode(contactsOnly);
};

onMounted(async () => {
  setTimeout(() => {
    if (promotingAppInstall.value?.dialogRef) {
      promotingAppInstall.value.dialogRef.show();
    }
  }, 1000);
});
</script>

<style lang="scss" scoped>
@use 'sass:color';

.dashboard-page {
  // background: linear-gradient(135deg, $primary, darken($primary, 20%));
  background: linear-gradient(
    135deg,
    $primary,
    color.adjust($primary, $lightness: -20%)
  );
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

.nearby-btn {
  width: 100%;
  padding: 10px;
  border-radius: 8px;
}

.volunteerBtn {
  padding-left: 8px;
}

/* Warning banner customization */
.q-banner {
  border-radius: 8px;
  background: linear-gradient(135deg, #ff9800, #f57c00) !important;
}

/* Attention required effect */
.attention-required {
  border: 2px solid #ff4081;
  box-shadow: 0 0 15px rgba(255, 64, 129, 0.5);
  position: relative;

  &::after {
    content: '';
    position: absolute;
    top: -3px;
    left: -3px;
    right: -3px;
    bottom: -3px;
    border-radius: 10px;
    border: 2px solid #fff;
    animation: pulse 2s infinite;
  }
}

@keyframes pulse {
  0% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.1);
    opacity: 0.5;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

.animate-bounce {
  animation: bounce 2s infinite;
}

@keyframes bounce {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}
.full-width {
  width: 100%;
  margin-top: 10px;
}
</style>
