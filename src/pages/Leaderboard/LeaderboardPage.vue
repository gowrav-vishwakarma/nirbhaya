<template>
  <q-page class="leaderboard-page">
    <div class="leaderboard-content">
      <q-card flat class="leaderboard-card">
        <q-card-section>
          <div class="text-h6 text-weight-bold q-mb-md">
            {{ $t('common.leaderboard') }}
          </div>

          <q-tabs
            v-model="selectedTab"
            dense
            class="text-grey"
            active-color="primary"
            indicator-color="primary"
            align="justify"
            narrow-indicator
          >
            <q-tab
              v-for="location in volunteeringLocations"
              :key="location.value.join(',')"
              :name="location.value.join(',')"
              :label="location.label"
            />
            <q-tab
              v-if="userStore.user.city"
              :name="'city'"
              :label="userStore.user.city"
            />
            <q-tab
              v-if="userStore.user.state"
              :name="'state'"
              :label="userStore.user.state"
            />
            <q-tab name="country" label="India" />
          </q-tabs>

          <div v-if="loading" class="text-center q-pa-md">
            <q-spinner color="primary" size="2em" />
          </div>

          <div
            v-else-if="leaderboardData.length"
            class="leaderboard-list q-mt-md"
          >
            <q-list separator>
              <q-item
                v-for="(item, index) in leaderboardData"
                :key="index"
                :class="{ 'bg-yellow-1': item.isCurrentUser }"
              >
                <q-item-section avatar>
                  <div
                    class="text-weight-bold"
                    :class="getRankClass(index + 1)"
                  >
                    #{{ index + 1 }}
                  </div>
                </q-item-section>
                <q-item-section>
                  <q-item-label>{{ item.name }}</q-item-label>
                  <q-item-label caption>
                    {{ $t('common.score') }}: {{ item.score }}
                  </q-item-label>
                </q-item-section>
                <q-item-section side v-if="item.isCurrentUser">
                  <q-chip color="primary" text-color="white">
                    {{ $t('common.you') }}
                  </q-chip>
                </q-item-section>
              </q-item>
            </q-list>
          </div>

          <div v-else class="text-center q-pa-md text-grey">
            {{ $t('common.noLeaderboardData') }}
          </div>
        </q-card-section>
      </q-card>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useQuasar } from 'quasar';
import { api } from 'src/boot/axios';
import { useUserStore } from 'src/stores/user-store';

const { t } = useI18n();
const $q = useQuasar();
const userStore = useUserStore();

interface LeaderboardEntry {
  id: string;
  name: string;
  score: number;
  isCurrentUser: boolean;
}

const loading = ref(false);
const leaderboardData = ref<LeaderboardEntry[]>([]);
const selectedTab = ref('');

const volunteeringLocations = computed(() => {
  return (userStore.user.locations || [])
    .filter((loc) => !loc.isBusinessLocation)
    .map((loc, index) => ({
      label: loc.name || `${t('common.location')} ${index + 1}`,
      value: loc.location.coordinates,
      coordinates: loc.location.coordinates,
    }));
});

// Set initial tab based on available options
onMounted(() => {
  if (volunteeringLocations.value.length > 0) {
    selectedTab.value = volunteeringLocations.value[0].value.join(',');
  } else if (userStore.user.city) {
    selectedTab.value = 'city';
  } else if (userStore.user.state) {
    selectedTab.value = 'state';
  } else {
    selectedTab.value = 'country';
  }
});

const getRankClass = (rank: number) => {
  if (rank === 1) return 'text-amber';
  if (rank === 2) return 'text-grey-6';
  if (rank === 3) return 'text-brown-5';
  return '';
};

const fetchLeaderboard = async () => {
  loading.value = true;
  try {
    const params = selectedTab.value.includes(',')
      ? {
          scope: 'location',
          coordinates: selectedTab.value.split(',').map(Number),
          radius: 5, // Fixed 5KM radius
        }
      : {
          scope: 'administrative',
          region: selectedTab.value,
          city: userStore.user.city,
          state: userStore.user.state,
        };

    const response = await api.get('/leaderboard', { params });
    leaderboardData.value = response.data;
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    $q.notify({
      color: 'negative',
      message: t('common.errorFetchingLeaderboard'),
      icon: 'error',
    });
  } finally {
    loading.value = false;
  }
};

// Watch for tab changes and fetch new data
watch(selectedTab, () => {
  fetchLeaderboard();
});
</script>

<style lang="scss" scoped>
.leaderboard-page {
  min-height: 100vh;
  padding: 20px;
}

.leaderboard-content {
  max-width: 600px;
  margin: 0 auto;
}

.leaderboard-card {
  border-radius: 12px;
}

.leaderboard-list {
  max-height: 60vh;
  overflow-y: auto;
}

:deep(.q-tabs) {
  overflow-x: auto;
}

:deep(.q-tab) {
  min-width: 100px;
}
</style>
