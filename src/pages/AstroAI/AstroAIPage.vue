<template>
  <q-page
    class="bg-grey-1"
    style="
      padding-top: env(safe-area-inset-top);
      padding-bottom: env(safe-area-inset-bottom);
    "
  >
    <div class="container">
      <!-- Header -->
      <div class="row items-center justify-between q-pa-md">
        <div>
          <h4 class="text-h5 text-weight-bold q-my-none text-primary">
            AstroAI
          </h4>
          <p class="text-grey-7 q-mt-sm">Your Personal Astrology Assistant</p>
        </div>
      </div>

      <!-- Tabs -->
      <div class="q-px-md">
        <q-tabs
          v-model="currentTab"
          class="text-primary"
          active-color="primary"
          indicator-color="primary"
          align="justify"
          narrow-indicator
          dense
        >
          <q-tab name="today" label="Today" />
          <q-tab name="profile" label="Profile" />
          <q-tab name="events" label="Events" />
          <q-tab name="prediction" label="Prediction" />
        </q-tabs>
      </div>
      <q-separator />

      <!-- Tab Panels -->
      <div class="q-pa-md">
        <component :is="currentComponent" />
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import TodayComponent from 'src/components/AstroAI/Today/TodayComponent.vue';
import ProfileComponent from 'src/components/AstroAI/Profile/ProfileComponent.vue';
import EventsComponent from 'src/components/AstroAI/Events/EventsComponent.vue';
import PredictionComponent from 'src/components/AstroAI/Prediction/PredictionComponent.vue';

const currentTab = ref('today');

const currentComponent = computed(() => {
  switch (currentTab.value) {
    case 'profile':
      return ProfileComponent;
    case 'events':
      return EventsComponent;
    case 'prediction':
      return PredictionComponent;
    default:
      return TodayComponent;
  }
});
</script>

<style lang="scss" scoped>
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0;
}

:deep(.q-tabs) {
  background: white;
  border-radius: 8px;
  margin-bottom: 1px;

  .q-tab {
    min-height: 48px;
    padding: 0 24px;

    &__label {
      font-weight: 500;
      font-size: 14px;
    }

    &--active {
      color: $primary;
      font-weight: 600;
    }
  }
}

:deep(.q-tab-panels) {
  background: transparent;
}
</style>
