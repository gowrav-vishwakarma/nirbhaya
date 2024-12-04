<template>
  <q-card class="trust-stats-card q-mb-md q-mt-lg" style="border-radius: 15px">
    <q-card-section>
      <div class="text-h6 text-white q-mb-md" style="font-weight: 700">
        {{ $t('community.CommunityImpact.title') }}
      </div>

      <div class="stats-grid">
        <div class="stat-item" v-if="totalVolunteers">
          <q-icon name="mdi-account-group" size="2rem" color="white" />
          <div class="stat-value">{{ formatNumber(totalVolunteers) }}+</div>
          <div class="stat-label">
            {{ $t('community.CommunityImpact.activeVolunteers') }}
          </div>
        </div>

        <div class="stat-item" v-if="activeLocations">
          <q-icon name="mdi-map-marker-multiple" size="2rem" color="white" />
          <div class="stat-value">{{ formatNumber(activeLocations) }}+</div>
          <div class="stat-label">
            {{ $t('community.CommunityImpact.activeLocations') }}
          </div>
        </div>

        <div class="stat-item" v-if="successRate">
          <q-icon name="verified" size="2rem" color="white" />
          <div class="stat-value">{{ successRate }}%</div>
          <div class="stat-label">
            {{ $t('community.CommunityImpact.successRate') }}
          </div>
        </div>

        <div class="stat-item" v-if="avgResponseTime">
          <q-icon name="timer" size="2rem" color="white" />
          <div class="stat-value">{{ avgResponseTime }} min</div>
          <div class="stat-label">
            {{ $t('community.CommunityImpact.responseTime') }}
          </div>
        </div>
        <div class="stat-item" v-if="totalHelped">
          <q-icon name="mdi-heart" size="2rem" color="white" />
          <div class="stat-value">{{ formatNumber(totalHelped) }}+</div>
          <div class="stat-label">
            {{ $t('community.CommunityImpact.totalHelped') }}
          </div>
        </div>
        <div class="stat-item" v-if="activeMember">
          <q-icon name="mdi-account-group" size="2rem" color="white" />
          <div class="stat-value">{{ formatNumber(activeMember) }}+</div>
          <div class="stat-label">
            {{ $t('community.CommunityImpact.activeMember') }}
          </div>
        </div>
      </div>
    </q-card-section>
  </q-card>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { api } from 'src/boot/axios';
import { stat } from 'fs';

const totalHelped = ref(0);
const totalVolunteers = ref(0);
const successRate = ref(0);
const avgResponseTime = ref(0);
const activeLocations = ref(0);
const activeMember = ref(0);

function formatNumber(num: number): string {
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return String(num);
}

async function fetchTrustStats() {
  try {
    const response = await api.get('/sos/trust-stats-count');
    const stats = response.data;
    console.log('totalVolunteers........', stats);
    // return {
    //     totalVolunteers,
    //     activeLocations,
    //     totalHelped,
    //     successRate,
    //     avgResponseTime,
    //     activeMember,
    //   };
    totalVolunteers.value = stats.totalVolunteers ?? 0;
    totalHelped.value = stats.totalHelped ?? 0;
    successRate.value = stats.successRate ?? 0;
    avgResponseTime.value = stats.avgResponseTime ?? 0;
    activeLocations.value = stats.activeLocations ?? 0;
    activeMember.value = stats.activeMember ?? 0;
  } catch (error) {
    console.error('Error fetching trust stats:', error);
    // You might want to show an error message to the user
  }
}

onMounted(() => {
  fetchTrustStats();
});
</script>

<style lang="scss" scoped>
.trust-stats-card {
  background: linear-gradient(
    135deg,
    rgba(255, 255, 255, 0.1),
    rgba(255, 255, 255, 0.05)
  );
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);

  .stats-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 1.5rem;

    .stat-item {
      text-align: center;
      color: white;

      .stat-value {
        font-size: 1.5rem;
        font-weight: bold;
        margin: 0.5rem 0;
      }

      .stat-label {
        font-size: 0.9rem;
        opacity: 0.9;
      }
    }
  }
}
</style>
