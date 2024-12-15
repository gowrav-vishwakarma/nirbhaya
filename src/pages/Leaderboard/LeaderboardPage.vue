<template>
  <q-page class="leaderboard-page">
    <div class="leaderboard-content">
      <q-card flat class="q-mb-md score-breakdown-card">
        <q-card-section class="relative-position">
          <div class="text-h6 text-weight-bold q-mb-md">
            {{ $t('common.yourScore') }}
            <span class="text-primary text-h5 q-ml-sm">
              {{ currentUserScore?.scoreBreakdown?.totalScore || 0 }}
            </span>
          </div>

          <div class="row q-col-gutter-md">
            <div class="col-12 col-sm-6">
              <q-list dense>
                <q-item>
                  <q-item-section>
                    <q-item-label>{{ $t('common.referrals') }}</q-item-label>
                    <q-item-label caption>
                      <span class="text-weight-medium">{{
                        currentUserScore?.scoreBreakdown?.referrals?.count || 0
                      }}</span>
                      {{ $t('common.peopleReferred') }}
                      <br />
                      <span class="text-primary">
                        +{{
                          currentUserScore?.scoreBreakdown?.referrals?.score ||
                          0
                        }}
                        {{ $t('common.points') }}
                      </span>
                    </q-item-label>
                  </q-item-section>
                </q-item>

                <q-item>
                  <q-item-section>
                    <q-item-label>{{
                      $t('common.referralLocations')
                    }}</q-item-label>
                    <q-item-label caption>
                      <span class="text-weight-medium">
                        {{
                          currentUserScore?.scoreBreakdown?.referralLocations
                            ?.count || 0
                        }}
                      </span>
                      {{ $t('common.locationsAdded') }}
                      <br />
                      <span class="text-primary">
                        +{{
                          currentUserScore?.scoreBreakdown?.referralLocations
                            ?.score || 0
                        }}
                        {{ $t('common.points') }}
                      </span>
                    </q-item-label>
                  </q-item-section>
                </q-item>

                <q-item>
                  <q-item-section>
                    <q-item-label>{{
                      $t('common.volunteerLocations')
                    }}</q-item-label>
                    <q-item-label caption>
                      <span class="text-weight-medium">
                        {{
                          currentUserScore?.scoreBreakdown?.volunteerLocations
                            ?.count || 0
                        }}
                      </span>
                      {{ $t('common.locationsVolunteering') }}
                      <br />
                      <span class="text-primary">
                        +{{
                          currentUserScore?.scoreBreakdown?.volunteerLocations
                            ?.score || 0
                        }}
                        {{ $t('common.points') }}
                      </span>
                    </q-item-label>
                  </q-item-section>
                </q-item>
              </q-list>
            </div>

            <div class="col-12 col-sm-6">
              <q-list dense>
                <q-item>
                  <q-item-section>
                    <q-item-label>{{ $t('common.yourActivity') }}</q-item-label>
                    <q-item-label caption>
                      <span class="text-weight-medium">
                        {{
                          currentUserScore?.scoreBreakdown?.selfActivity
                            ?.daysActive || 0
                        }}
                      </span>
                      {{ $t('common.daysActive') }}
                      <br />
                      <span class="text-primary">
                        +{{
                          currentUserScore?.scoreBreakdown?.selfActivity
                            ?.score || 0
                        }}
                        {{ $t('common.points') }}
                      </span>
                    </q-item-label>
                  </q-item-section>
                </q-item>

                <q-item>
                  <q-item-section>
                    <q-item-label>{{
                      $t('common.referralsActivity')
                    }}</q-item-label>
                    <q-item-label caption>
                      <span class="text-weight-medium">
                        {{
                          currentUserScore?.scoreBreakdown?.referralsActivity
                            ?.totalDaysActive || 0
                        }}
                      </span>
                      {{ $t('common.totalDaysActive') }}
                      <br />
                      <span class="text-primary">
                        +{{
                          currentUserScore?.scoreBreakdown?.referralsActivity
                            ?.score || 0
                        }}
                        {{ $t('common.points') }}
                      </span>
                    </q-item-label>
                  </q-item-section>
                </q-item>
              </q-list>
            </div>
          </div>

          <div v-if="loading" class="loader-overlay">
            <q-spinner color="primary" size="2em" />
          </div>
        </q-card-section>
      </q-card>

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
            <q-tab
              v-for="location in volunteeringLocations"
              :key="location.value.join(',')"
              :name="location.value.join(',')"
              :label="location.label"
            />
          </q-tabs>

          <div v-if="loading" class="text-center q-pa-md">
            <q-spinner color="primary" size="2em" />
          </div>

          <div
            v-else-if="leaderboardData.length"
            class="leaderboard-list q-mt-md"
          >
            <q-list separator>
              <div v-for="(item, index) in leaderboardData" :key="index">
                <q-item
                  clickable
                  :class="{ 'bg-yellow-1': item.isCurrentUser }"
                  @click="item.showBreakdown = !item.showBreakdown"
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
                  <q-item-section side>
                    <q-icon
                      :name="item.showBreakdown ? 'expand_less' : 'expand_more'"
                      size="24px"
                    />
                  </q-item-section>
                </q-item>

                <q-slide-transition>
                  <div
                    v-show="item.showBreakdown"
                    class="score-breakdown-details"
                  >
                    <q-list dense padding class="q-px-md bg-grey-1">
                      <q-item>
                        <q-item-section>
                          <q-item-label>{{
                            $t('common.referrals')
                          }}</q-item-label>
                          <q-item-label caption>
                            <span class="text-weight-medium">
                              {{ item.scoreBreakdown.referrals.count }}
                            </span>
                            {{ $t('common.peopleReferred') }}
                            <br />
                            <span class="text-primary">
                              +{{ item.scoreBreakdown.referrals.score }}
                              {{ $t('common.points') }}
                            </span>
                          </q-item-label>
                        </q-item-section>
                      </q-item>

                      <q-item>
                        <q-item-section>
                          <q-item-label>{{
                            $t('common.referralLocations')
                          }}</q-item-label>
                          <q-item-label caption>
                            <span class="text-weight-medium">
                              {{ item.scoreBreakdown.referralLocations.count }}
                            </span>
                            {{ $t('common.locationsAdded') }}
                            <br />
                            <span class="text-primary">
                              +{{ item.scoreBreakdown.referralLocations.score }}
                              {{ $t('common.points') }}
                            </span>
                          </q-item-label>
                        </q-item-section>
                      </q-item>

                      <q-item>
                        <q-item-section>
                          <q-item-label>{{
                            $t('common.volunteerLocations')
                          }}</q-item-label>
                          <q-item-label caption>
                            <span class="text-weight-medium">
                              {{ item.scoreBreakdown.volunteerLocations.count }}
                            </span>
                            {{ $t('common.locationsVolunteering') }}
                            <br />
                            <span class="text-primary">
                              +{{
                                item.scoreBreakdown.volunteerLocations.score
                              }}
                              {{ $t('common.points') }}
                            </span>
                          </q-item-label>
                        </q-item-section>
                      </q-item>

                      <q-item>
                        <q-item-section>
                          <q-item-label>{{
                            $t('common.yourActivity')
                          }}</q-item-label>
                          <q-item-label caption>
                            <span class="text-weight-medium">
                              {{ item.scoreBreakdown.selfActivity.daysActive }}
                            </span>
                            {{ $t('common.daysActive') }}
                            <br />
                            <span class="text-primary">
                              +{{ item.scoreBreakdown.selfActivity.score }}
                              {{ $t('common.points') }}
                            </span>
                          </q-item-label>
                        </q-item-section>
                      </q-item>

                      <q-item>
                        <q-item-section>
                          <q-item-label>{{
                            $t('common.referralsActivity')
                          }}</q-item-label>
                          <q-item-label caption>
                            <span class="text-weight-medium">
                              {{
                                item.scoreBreakdown.referralsActivity
                                  .totalDaysActive
                              }}
                            </span>
                            {{ $t('common.totalDaysActive') }}
                            <br />
                            <span class="text-primary">
                              +{{ item.scoreBreakdown.referralsActivity.score }}
                              {{ $t('common.points') }}
                            </span>
                          </q-item-label>
                        </q-item-section>
                      </q-item>
                    </q-list>
                  </div>
                </q-slide-transition>
              </div>
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

interface ScoreBreakdown {
  totalScore: number;
  referrals: {
    count: number;
    score: number;
  };
  referralLocations: {
    count: number;
    score: number;
  };
  volunteerLocations: {
    count: number;
    score: number;
  };
  selfActivity: {
    daysActive: number;
    score: number;
  };
  referralsActivity: {
    totalDaysActive: number;
    score: number;
  };
}

interface LeaderboardEntry {
  id: string;
  name: string;
  score: number;
  isCurrentUser: boolean;
  scoreBreakdown?: ScoreBreakdown;
  showBreakdown: boolean;
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
  if (userStore.user.city) {
    selectedTab.value = 'city';
  } else if (userStore.user.state) {
    selectedTab.value = 'state';
  } else if (volunteeringLocations.value.length > 0) {
    selectedTab.value = volunteeringLocations.value[0].value.join(',');
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
  leaderboardData.value = []; // Clear existing data while loading

  try {
    const params = selectedTab.value.includes(',')
      ? {
          scope: 'location',
          coordinates: selectedTab.value.split(',').map(Number),
          radius: 5000,
        }
      : {
          scope: 'administrative',
          region: selectedTab.value,
          city: userStore.user.city,
          state: userStore.user.state,
        };

    const response = await api.get('/leaderboard', { params });
    // Add showBreakdown property to each item
    leaderboardData.value = response.data.map((item: LeaderboardEntry) => ({
      ...item,
      showBreakdown: false,
    }));
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    $q.notify({
      color: 'negative',
      message: t('common.errorFetchingLeaderboard'),
      icon: 'error',
    });
    leaderboardData.value = [];
  } finally {
    loading.value = false;
  }
};

// Watch for tab changes and fetch new data
watch(selectedTab, () => {
  fetchLeaderboard();
});

const currentUserScore = computed(() => {
  return leaderboardData.value.find((entry) => entry.isCurrentUser);
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

.score-breakdown-card {
  border-radius: 12px;
  background-color: #f5f5f5;
}

.score-breakdown-details {
  border-bottom: 1px solid #e0e0e0;
}

:deep(.q-slide-transition) {
  .q-item {
    min-height: 40px;
  }
}

.loader-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1;
}

.relative-position {
  position: relative;
}
</style>
