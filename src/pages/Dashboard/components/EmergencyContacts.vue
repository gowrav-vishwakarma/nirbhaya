<template>
  <q-card class="emergency-contacts-card q-mb-md">
    <q-card-section>
      <p class="text-h6 text-weight-bold q-mb-sm">
        {{ $t('common.emergencyServices') }}
      </p>
      <div class="row">
        <div v-for="service in emergencyServices" :key="service.name" class="flex">
          <q-btn class="button-background q-mx-xs q-mb-sm" @click="callEmergencyService(service.number)" size="sm"
            style="border-radius: 30px;">
            <q-btn size="sm" :style="{
              marginLeft: '-10px',

              backgroundColor: `${service.color}`,
            }" round>
              <q-icon :name="service.icon" style="color: whitesmoke"></q-icon>
            </q-btn>
            <span class="q-ml-xs" style="font-weight: bold">{{
              $t(service.name)
              }}</span>
          </q-btn>
        </div>
      </div>
    </q-card-section>
  </q-card>
</template>

<script setup lang="ts">
import { useEmergencyServices } from 'src/composables/useEmergencyServices';

const { emergencyServices, callEmergencyService } = useEmergencyServices();
</script>

<style lang="scss" scoped>
.emergency-contacts-card {
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.button-background {
  background: linear-gradient(135deg,
      white,
      darken(rgb(255, 255, 255), 0%)) !important;
  border: 1px solid rgba(221, 218, 218, 0.418) !important;
  width: 150px;
  align-items: self-start;
}
</style>
