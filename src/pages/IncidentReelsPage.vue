<template>
  <q-page class="incident-reels-page">
    <vue-scroll-snap>
      <div class="reels-container" ref="reelsContainerRef">
        <div v-for="(reel, index) in reels" :key="reel.id" class="reel-item">
          <IncidentReelPlayer :reel="reel" :isActive="index == currentReelIndex" />
        </div>
      </div>
    </vue-scroll-snap>
    <AddIncidentFab @incident-added="fetchReels" />
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, onBeforeUnmount } from 'vue';
import { useQuasar } from 'quasar';
import { api } from 'src/boot/axios';
import IncidentReelPlayer from 'components/IncidentReelPlayer.vue';
import AddIncidentFab from 'components/AddIncidentFab.vue';

const $q = useQuasar();

interface Reel {
  id: number;
  userId: number;
  title: string | null;
  description: string | null;
  videoUrl: string;
  location: {
    x: number;
    y: number;
  };
  likes: number | null;
  shares: number | null;
  createdAt: string;
  updatedAt: string;
  user: {
    id: number;
    name: string;
  };
}

const reels = ref<Reel[]>([]);
const currentReelIndex = ref(0);
const isLoading = ref(false);
const page = ref(1);
const pageSize = 10;
const reelsContainerRef = ref<HTMLElement | null>(null);

const fetchReels = async () => {
  if (isLoading.value) return;
  isLoading.value = true;
  try {
    const response = await api.get<Reel[]>('/incidents/reels', {
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

let lastScrollTop = 0;
let lastScrollTime = 0;

const handleScroll = () => {
  if (!reelsContainerRef.value) return;

  const containerHeight = reelsContainerRef.value.clientHeight;
  const scrollPosition = reelsContainerRef.value.scrollTop;
  const currentTime = performance.now();
  const timeDelta = currentTime - lastScrollTime;
  const scrollDelta = scrollPosition - lastScrollTop;

  // Calculate the number of steps to move based on scroll speed
  const speed = Math.abs(scrollDelta / timeDelta);
  const stepMultiplier = Math.min(Math.floor(speed * 10), 3); // Adjust multiplier and max steps as needed

  const newIndex = Math.round(scrollPosition / containerHeight) + stepMultiplier * Math.sign(scrollDelta);

  if (newIndex !== currentReelIndex.value) {
    currentReelIndex.value = Number(Math.max(0, Math.min(reels.value.length - 1, newIndex)));
    console.log(currentReelIndex.value);

  }

  lastScrollTop = scrollPosition;
  lastScrollTime = currentTime;
};

onMounted(() => {
  fetchReels();
  if (reelsContainerRef.value) {
    reelsContainerRef.value.addEventListener('scroll', handleScroll);
  }
});

onBeforeUnmount(() => {
  if (reelsContainerRef.value) {
    reelsContainerRef.value.removeEventListener('scroll', handleScroll);
  }
});

watch(currentReelIndex, (newIndex) => {
  if (reels.value.length - newIndex <= 3) {
    fetchReels();
  }
});
</script>

<style lang="scss">
.incident-reels-page {
  background-color: $dark;
  height: 100vh;
  overflow: hidden;
}

.reels-container {
  height: 100%;
  overflow-y: auto;
  scroll-snap-type: y mandatory;
  scroll-behavior: smooth;

  &::-webkit-scrollbar {
    display: none;
  }
}

.reel-item {
  height: 100vh;
  scroll-snap-align: start;
}
</style>
