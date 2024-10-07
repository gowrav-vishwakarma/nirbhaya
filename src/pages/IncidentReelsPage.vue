<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { useQuasar } from 'quasar';
import { api } from 'src/boot/axios';
import IncidentReelPlayer from 'components/IncidentReelPlayer.vue';
import AddIncidentFab from 'components/AddIncidentFab.vue';

const $q = useQuasar();

const reels = ref<any[]>([]);
const currentReelIndex = ref(0);
const isLoading = ref(false);
const page = ref(1);
const pageSize = 10;

const fetchReels = async () => {
  if (isLoading.value) return;
  isLoading.value = true;
  try {
    const response = await api.get('/incidents/reels', {
      params: { page: page.value, pageSize },
    });
    reels.value.push(...response.data);
    page.value++;
  } catch (error) {
    console.error('Error fetching reels:', error);
    $q.notify({
      color: 'negative',
      message: 'Failed to load reels. Please try again.',
      icon: 'error',
    });
  } finally {
    isLoading.value = false;
  }
};

const handleScroll = (index: number) => {
  currentReelIndex.value = index;
  if (reels.value.length - index <= 3) {
    fetchReels();
  }
};

onMounted(() => {
  fetchReels();
});

watch(currentReelIndex, (newIndex) => {
  if (reels.value.length - newIndex <= 3) {
    fetchReels();
  }
});
</script>

<template>
  <q-page class="incident-reels-page">
    <q-scroll-area class="full-height" @scroll="handleScroll">
      <IncidentReelPlayer v-for="(reel, index) in reels" :key="reel.id" :reel="reel"
        :is-active="index === currentReelIndex" />
    </q-scroll-area>
    <AddIncidentFab @incident-added="fetchReels" />
  </q-page>
</template>

<style lang="scss" scoped>
.incident-reels-page {
  background-color: $dark;
  height: 100vh;
}
</style>
