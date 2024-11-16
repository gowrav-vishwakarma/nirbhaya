<template>
  <div class="page">
    <!-- <header class="header">
      <h1>SOS History</h1>
    </header> -->

    <main class="content">
      <div class="history-container">
        <div v-if="loading" class="loading-spinner">
          <div class="spinner"></div>
        </div>

        <div v-else-if="sosHistory.length === 0" class="no-history">
          <h4>No SOS history found</h4>
        </div>

        <div v-else class="history-list">
          <div v-for="sos in sosHistory" :key="sos.id" class="history-item">
            <div class="history-card">
              <div class="card-header">
                <div class="card-title text-capitalize">{{ sos.threat ? sos.threat : 'Emergency Alert' }}</div>
              </div>
              <div class="card-subtitle" style="margin-top: -20px; margin-bottom: 10px;">
                {{ formatDate(sos.createdAt) }}
              </div>
              <div class="card-subtitle" style="margin-top: -10px; margin-bottom: 10px;"
                :style="{ color: sos.status === 'resolved' ? '#4CAF50' : '#F44336' }">
                {{ sos.status }}
              </div>

              <div class="card-content">
                <!-- <div class="helper-info">
                  <div class="avatar">
                    <img
                      src="https://icons-for-free.com/iff/png/512/profile+profile+page+user+icon-1320186864367220794.png"
                      alt="Helper" />
                  </div>
                  <div class="helper-details">
                    <h3>{{ sos.helper?.name || 'Unknown Helper' }}</h3>
                    <p>{{ sos.status }}</p>
                  </div>
                </div> -->

                <div class="location-info">
                  <span class="material-icons">location_on</span>
                  <p>{{ sos.location?.address || 'Location not available' }}</p>
                </div>

                <button :disabled="sos.status == 'cancelled'" v-if="!sos.isRated" class="rate-button"
                  @click="goToRating(sos.id)">
                  Rate Helper
                </button>
                <p v-else class="rated-text">Already rated</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { api } from 'src/boot/axios';
import { useRouter } from 'vue-router';
import { useUserStore } from 'src/stores/user-store';
const userStore = useUserStore();

interface Helper {
  _id: string;
  name: string;
  profileImage?: string;
}

interface Location {
  address: string;
  coordinates?: [number, number];
}



const router = useRouter();
const sosHistory = ref([]);
const loading = ref(true);

const fetchSosHistory = async () => {
  try {
    const userId = userStore.user.id;
    const response = await api.get('/sos/sos-history', {
      params: {
        userId: userId,
      },
    });
    sosHistory.value = response.data;
  } catch (error) {
    console.error('Error fetching SOS history:', error);
  } finally {
    loading.value = false;
  }
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const goToRating = (sosId: string) => {
  // router.push(`/sos/rating/${sosId}`);
  console.log('sosId...........', sosId);

  router.push({ path: '/feedback', query: { eventId: sosId } }); // Redirect to feedback with event ID

};

onMounted(() => {
  fetchSosHistory();
});
</script>

<style scoped>
.page {
  height: 100vh;
  display: flex;
  flex-direction: column;
}

.header {
  background: #ffffff;
  padding: 1rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.header h1 {
  margin: 0;
  font-size: 1.5rem;
  color: #333;
}

.content {
  flex: 1;
  overflow-y: auto;
  background: #f5f5f5;
}

.history-container {
  padding: 16px;
}

.loading-spinner {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
}

.spinner {
  border: 4px solid #f3f3f3;
  border-top: 4px solid #3498db;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
}

.no-history {
  text-align: center;
  padding: 40px;
  color: #666;
}

.history-card {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  margin: 10px 0;
  padding: 16px;
}

.card-header {
  margin-bottom: 16px;
}

.card-subtitle {
  color: #666;
  font-size: 0.9rem;
}

.card-title {
  font-size: 1.2rem;
  font-weight: 500;
  margin-top: 4px;
}

.helper-info {
  display: flex;
  align-items: center;
  margin-bottom: 16px;
}

.avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  overflow: hidden;
}

.avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.helper-details {
  margin-left: 12px;
}

.helper-details h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 500;
}

.helper-details p {
  margin: 4px 0 0;
  color: #666;
  font-size: 14px;
}

.location-info {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
}

.material-icons {
  color: #666;
  font-size: 20px;
}

.location-info p {
  margin: 0;
  color: #666;
  font-size: 14px;
}

.rate-button {
  width: 100%;
  padding: 5px;
  background: #3498db;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
  transition: background 0.3s;
}

.rate-button:hover {
  background: #2980b9;
}

.rated-text {
  text-align: center;
  color: #666;
  margin: 12px 0;
}
</style>
