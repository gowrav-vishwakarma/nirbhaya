<template>
  <q-page class="incident-reels-page">
    <vue-scroll-snap>
      <div class="reels-container">
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

const smoothScrollTo = (target: number) => {
  const container = document.querySelector('.reels-container') as HTMLElement;
  const start = container.scrollTop;
  const change = target - start;
  const duration = 1000; // Duration in ms
  let startTime: number | null = null;

  const animateScroll = (currentTime: number) => {
    if (startTime === null) startTime = currentTime;
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    container.scrollTop = start + change * easeInOutQuad(progress);
    if (progress < 1) requestAnimationFrame(animateScroll);
  };

  const easeInOutQuad = (t: number) => {
    return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
  };

  requestAnimationFrame(animateScroll);
};

const isScrolling = ref(false); // Flag to track if scrolling is in progress

const handleScroll = (event: WheelEvent) => {
  event.preventDefault(); // Prevent default scroll behavior
  if (isScrolling.value) return; // If already scrolling, exit

  const delta = event.deltaY; // Get the scroll direction

  isScrolling.value = true; // Set scrolling to true

  if (delta > 0) {

    // Scrolling down
    if (currentReelIndex.value < reels.value.length - 1) {
      currentReelIndex.value++;
    }
    console.log('currentReelIndex.value', currentReelIndex.value);

  } else {
    // Scrolling up
    if (currentReelIndex.value > 0) {
      currentReelIndex.value--;
    }
  }

  // Calculate target scroll position and smooth scroll to it
  const targetScrollPosition = currentReelIndex.value * window.innerHeight;
  smoothScrollTo(targetScrollPosition);

  // Reset the scrolling flag after the animation duration
  setTimeout(() => {
    isScrolling.value = false; // Allow scrolling again after the duration
  }, 1000); // Match this duration with the smoothScrollTo duration
};

// Add the scroll event listener
onMounted(() => {
  fetchReels();
  const container = document.querySelector('.reels-container') as HTMLElement;
  container.addEventListener('wheel', handleScroll, { passive: false });
});

// Clean up the event listener on unmount
onBeforeUnmount(() => {
  const container = document.querySelector('.reels-container') as HTMLElement;
  container.removeEventListener('wheel', handleScroll);
});

watch(currentReelIndex, (newIndex) => {
  if (reels.value.length - newIndex <= 3) {
    fetchReels();
  }

  // Call smoothScrollTo when currentReelIndex changes
  const targetScrollPosition = newIndex * window.innerHeight; // Calculate target position
  smoothScrollTo(targetScrollPosition); // Call the smooth scroll function
});

// Call smoothScrollTo when you want to scroll to a specific index
// Example: smoothScrollTo(currentReelIndex.value * window.innerHeight);
</script>

<style lang="scss">
.incident-reels-page {
  background-color: $dark;
  height: 100vh; // Ensure full height for snap scrolling
  overflow: hidden; // Prevent overflow
}

.reels-container {
  height: 100%;
  overflow-y: auto; // Allow vertical scrolling
  scroll-snap-type: y mandatory; // Enable snap scrolling
  scroll-behavior: smooth; // Add smooth scrolling behavior

  /* Hide scrollbar for WebKit browsers */
  &::-webkit-scrollbar {
    display: none; // Hide scrollbar
  }
}

.reel-item {
  height: 100vh; // Each reel takes full viewport height
  scroll-snap-align: start; // Align to start for snapping
}
</style>
