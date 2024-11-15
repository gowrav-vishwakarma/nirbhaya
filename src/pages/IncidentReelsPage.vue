<template>
  <q-page class="incident-reels-page">
    <div class="reels-container" ref="reelsContainerRef">
      <div v-for="(reel, index) in reels" :key="reel.id" class="reel-item"
        v-intersection="(entry) => onReelIntersect(entry, index)">
        <IncidentReelPlayer :reel="reel" :isActive="index === currentReelIndex" :isVisible="!!visibleReels[index]"
          ref="reelRefs" />
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, onBeforeUnmount } from 'vue';
import { useQuasar } from 'quasar';
import { api } from 'src/boot/axios';
import IncidentReelPlayer from 'components/IncidentReelPlayer.vue';

const $q = useQuasar();
const reelRefs = ref([]);

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
const visibleReels = ref<{ [key: number]: boolean }>({});

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

  // Calculate current index based on scroll position
  const index = Math.round(scrollPosition / containerHeight);

  if (index !== currentReelIndex.value) {
    currentReelIndex.value = Math.max(0, Math.min(reels.value.length - 1, index));

    // Smooth scroll to the selected reel
    reelsContainerRef.value.scrollTo({
      top: currentReelIndex.value * containerHeight,
      behavior: 'smooth'
    });

    // Update visibility states
    Object.keys(visibleReels.value).forEach((idx) => {
      const i = parseInt(idx);
      visibleReels.value[i] = i === currentReelIndex.value;
    });
  }
};

// Update the intersection observer handler
const onReelIntersect = (entry: IntersectionObserverEntry, index: number): boolean => {
  visibleReels.value[index] = entry.isIntersecting;

  if (entry.isIntersecting) {
    currentReelIndex.value = index;

    // Force update visibility states
    Object.keys(visibleReels.value).forEach((idx) => {
      const i = parseInt(idx);
      visibleReels.value[i] = i === index;
    });
  }

  return entry.isIntersecting;
};

// Add a watch for reels to initialize visibility
watch(reels, (newReels) => {
  newReels.forEach((_, index) => {
    visibleReels.value[index] = index === currentReelIndex.value;
  });
}, { immediate: true });

// Watch for current index changes
watch(currentReelIndex, (newIndex) => {
  // Load more reels if needed
  if (reels.value.length - newIndex <= 2) {
    fetchReels();
  }

  // Update visibility states
  Object.keys(visibleReels.value).forEach((idx) => {
    const i = parseInt(idx);
    visibleReels.value[i] = i === newIndex;
  });
}, { immediate: true });

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
  visibleReels.value = {};
});
</script>

<style lang="scss">
.incident-reels-page {
  background-color: $dark;
  height: 100vh;
  overflow: hidden;
  position: relative;
}

.reels-container {
  height: 100%;
  overflow-y: auto;
  scroll-snap-type: y mandatory;
  scroll-behavior: smooth;
  -webkit-overflow-scrolling: touch;

  &::-webkit-scrollbar {
    display: none;
  }

  -ms-overflow-style: none;
  scrollbar-width: none;
}

.reel-item {
  height: 100vh;
  width: 100%;
  scroll-snap-align: start;
  scroll-snap-stop: always;
  position: relative;
  overflow: hidden;

  &>* {
    width: 100%;
    height: 100%;
  }
}

@media (hover: none) and (pointer: coarse) {
  .reels-container {
    touch-action: pan-y pinch-zoom;
  }
}
</style>
