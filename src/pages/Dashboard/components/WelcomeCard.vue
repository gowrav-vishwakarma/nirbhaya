<template>
  <q-card class="welcome-card">
    <q-card-section>
      <h4 class="text-h6 text-weight-bold text-primary q-ma-none">
        {{ $t('common.welcome', { name: userName }) }}
      </h4>
      <div class="text-subtitle2 text-grey-7">
        {{ $t('common.dashboardSubtitle') }}
      </div>
    </q-card-section>
  </q-card>
</template>

<script setup lang="ts">
defineProps<{
  userName: string;
}>();
</script>

<style lang="scss" scoped>
.welcome-card {
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}
</style>
