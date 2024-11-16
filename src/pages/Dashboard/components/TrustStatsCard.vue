<template>
  <q-card class="trust-stats-card q-mb-md">
    <q-card-section>
      <div class="text-h6 text-white q-mb-md" style="font-weight: 700;">Community Impact</div>

      <div class="stats-grid">
        <div class="stat-item">
          <q-icon name="mdi-account-group" size="2rem" color="white" />
          <div class="stat-value">{{ formatNumber(totalVolunteers) }}+</div>
          <div class="stat-label">Active Volunteers</div>
        </div>

        <div class="stat-item">
          <q-icon name="mdi-map-marker-multiple" size="2rem" color="white" />
          <div class="stat-value">{{ formatNumber(totalHelped) }}+</div>
          <div class="stat-label">Active Locations</div>
        </div>
        <!-- <div class="stat-item">
          <q-icon name="people" size="2rem" color="white" />
          <div class="stat-value">{{ formatNumber(totalHelped) }}+</div>
          <div class="stat-label">People Helped</div>
        </div> -->



        <div class="stat-item">
          <q-icon name="verified" size="2rem" color="white" />
          <div class="stat-value">{{ successRate }}%</div>
          <div class="stat-label">Success Rate</div>
        </div>

        <div class="stat-item">
          <q-icon name="timer" size="2rem" color="white" />
          <div class="stat-value">{{ avgResponseTime }} min</div>
          <div class="stat-label">Avg. Response Time</div>
        </div>
      </div>
    </q-card-section>
  </q-card>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { api } from 'src/boot/axios';

const totalHelped = ref(45);
const totalVolunteers = ref(50);
const successRate = ref(95);
const avgResponseTime = ref('5');

function formatNumber(num: number): string {
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return (num);
}

async function fetchTrustStats() {
  try {
    const response = await api.get('/sos/trust-stats-count');
    const stats = response.data;
    console.log('totalVolunteers........', stats);


    totalVolunteers.value = stats.totalVolunteers;
    totalHelped.value = stats.totalVolunteers - 1;
    successRate.value = 95;
    avgResponseTime.value = 5;
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
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05));
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
