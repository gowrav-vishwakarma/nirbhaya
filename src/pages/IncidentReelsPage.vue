<template>
  <q-page class="incident-reels-page">
    <div class="reels-container" ref="reelsContainerRef" @wheel="handleWheel">
      <div v-for="(reel, index) in reels" :key="reel.id" class="reel-item">
        <IncidentReelPlayer :reel="reel" :isActive="index === currentReelIndex" />
      </div>
    </div>
    <AddIncidentFab @incident-added="fetchReels" />
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
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
const isScrolling = ref(false);

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

const smoothScrollTo = (target: number, duration: number) => {
  const container = reelsContainerRef.value;
  if (!container) return;

  const start = container.scrollTop;
  const change = target - start;
  const startTime = performance.now();

  const animateScroll = (currentTime: number) => {
    const elapsedTime = currentTime - startTime;
    const progress = Math.min(elapsedTime / duration, 1);
    const easeProgress = easeInOutCubic(progress);

    container.scrollTop = start + change * easeProgress;

    if (progress < 1) {
      requestAnimationFrame(animateScroll);
    } else {
      isScrolling.value = false;
    }
  };

  requestAnimationFrame(animateScroll);
};

const easeInOutCubic = (t: number): number => {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
};

const handleWheel = (event: WheelEvent) => {
  event.preventDefault();
  if (isScrolling.value) return;

  const direction = event.deltaY > 0 ? 1 : -1;
  const newIndex = Math.max(0, Math.min(reels.value.length - 1, currentReelIndex.value + direction));

  if (newIndex !== currentReelIndex.value) {
    isScrolling.value = true;
    currentReelIndex.value = newIndex;
    const targetScroll = newIndex * window.innerHeight;
    smoothScrollTo(targetScroll, 500); // 500ms duration for smooth scroll
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

<style lang="scss">
.incident-reels-page {
  background-color: $dark;
  height: 100vh;
  overflow: hidden;
}

.reels-container {
  height: 100%;
  overflow-y: scroll;
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
