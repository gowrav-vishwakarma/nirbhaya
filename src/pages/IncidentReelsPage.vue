<template>
  <q-page class="incident-reels-page">
    <div class="reels-container" ref="reelsContainerRef">
      <div v-for="(reel, index) in reels" :key="reel.uniqueKey" class="reel-item"
        v-intersection="(entry) => onReelIntersect(entry, index)">
        <IncidentReelPlayer :reel="reel" :isActive="index === currentReelIndex" :isVisible="!!visibleReels[index]"
          :key="reel.uniqueKey" ref="reelRefs" />
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, onBeforeUnmount, nextTick } from 'vue';
import { useQuasar } from 'quasar';
import { api } from 'src/boot/axios';
import IncidentReelPlayer from 'components/IncidentReelPlayer.vue';

const $q = useQuasar();
const reelRefs = ref([]);

interface Reel {
  id: number;
  uniqueKey?: string;
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
const pageSize = 5;
const reelsContainerRef = ref<HTMLElement | null>(null);
const visibleReels = ref<{ [key: number]: boolean }>({});

const fetchReels = async () => {
  if (isLoading.value) return;
  isLoading.value = true;

  try {
    const response = await api.get<Reel[]>('/incidents/reels', {
      params: { page: page.value, pageSize },
    });

    console.log('fetched..............', response);


    const newReels = response.data.map((reel, idx) => ({
      ...reel,
      uniqueKey: `${reel.id}-${page.value}-${idx}`
    }));

    reels.value.push(...newReels);

    // Initialize visibility state for first page
    if (page.value === 1) {
      await nextTick();
      currentReelIndex.value = 0;

      // Initialize visibility state for all reels
      const initialVisibleState: { [key: number]: boolean } = {};
      newReels.forEach((_, idx) => {
        initialVisibleState[idx] = idx === 0;
      });
      visibleReels.value = initialVisibleState;

      console.log('Initial reel state:', {
        currentIndex: 0,
        visibleStates: visibleReels.value
      });
    }

    page.value++;
  } catch (error) {
    console.error('Error fetching reels:', error);
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
  const threshold = containerHeight * 0.5; // 50% threshold for changing reels

  // Calculate current index based on scroll position with threshold
  const rawIndex = scrollPosition / containerHeight;
  const index = Math.floor(rawIndex + 0.5); // Round to nearest whole number

  if (index !== currentReelIndex.value) {
    currentReelIndex.value = Math.max(0, Math.min(reels.value.length - 1, index));

    // Update visibility states
    Object.keys(visibleReels.value).forEach((idx) => {
      const i = parseInt(idx);
      visibleReels.value[i] = i === currentReelIndex.value;
    });
  }
};

// Update the onReelIntersect function
const onReelIntersect = (entry: IntersectionObserverEntry, index: number): boolean => {
  const isIntersecting = entry.isIntersecting;
  const intersectionRatio = entry.intersectionRatio;

  // Only update if the reel is mostly visible (> 50%)
  if (isIntersecting && intersectionRatio > 0.5) {
    currentReelIndex.value = index;

    // Update visibility states
    const newVisibleState: { [key: number]: boolean } = {};
    reels.value.forEach((_, idx) => {
      newVisibleState[idx] = idx === index;
    });
    visibleReels.value = newVisibleState;

    // Smooth scroll to the current reel
    if (reelsContainerRef.value) {
      reelsContainerRef.value.scrollTo({
        top: index * reelsContainerRef.value.clientHeight,
        behavior: 'smooth'
      });
    }
  }

  return isIntersecting;
};

// Add a watch for reels to initialize visibility
watch(reels, (newReels) => {
  newReels.forEach((_, index) => {
    visibleReels.value[index] = index === currentReelIndex.value;
  });
}, { immediate: true });

// Update the watch for currentReelIndex
watch(currentReelIndex, (newIndex, oldIndex) => {
  console.log(`Current reel index changed from ${oldIndex} to ${newIndex}`);

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
  -webkit-overflow-scrolling: touch;
}

.reels-container {
  height: 100%;
  overflow-y: auto;
  scroll-snap-type: y mandatory;
  scroll-behavior: smooth;
  -webkit-overflow-scrolling: touch;
  -ms-overflow-style: none;
  scrollbar-width: none;
  will-change: transform;
  transform: translateZ(0);

  &::-webkit-scrollbar {
    display: none;
  }
}

.reel-item {
  height: 100vh;
  width: 100%;
  scroll-snap-align: center;
  scroll-snap-stop: always;
  position: relative;
  overflow: hidden;
  transform: translateZ(0);

  &>* {
    width: 100%;
    height: 100%;
  }
}

@media (hover: none) and (pointer: coarse) {
  .reels-container {
    touch-action: pan-y pinch-zoom;
    -webkit-overflow-scrolling: touch;
    overscroll-behavior-y: contain;
  }

  .reel-item {
    user-select: none;
    -webkit-user-select: none;
  }
}
</style>
