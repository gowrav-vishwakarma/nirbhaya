<template>
  <q-page class="incident-reels-page">
    <div ref="reelsContainerRef" class="reels-container" @wheel.prevent="handleWheel" @touchstart="handleTouchStart"
      @touchmove="handleTouchMove" @touchend="handleTouchEnd" @mousedown="handleMouseDown">
      <div v-for="(reel, index) in reels" :key="reel.id" class="reel-item">
        <IncidentReelPlayer :reel="reel" :is-active="index === currentReelIndex" />
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
const isScrolling = ref(false);

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

const scrollToReel = (index: number) => {
  if (reelsContainerRef.value && !isScrolling.value) {
    isScrolling.value = true;

    const targetReel = reelsContainerRef.value.children[index] as HTMLElement;
    if (targetReel) {
      targetReel.scrollIntoView({ behavior: 'smooth' });
      setTimeout(() => {
        isScrolling.value = false;
      }, 0); // Adjust this timeout based on your scroll animation duration
    }
  }
};

const handleScroll = (direction: 'up' | 'down') => {
  if (isScrolling.value) return;

  if (direction === 'down' && currentReelIndex.value < reels.value.length - 1) {
    currentReelIndex.value++;
    scrollToReel(currentReelIndex.value);
  } else if (direction === 'up' && currentReelIndex.value > 0) {
    currentReelIndex.value--;
    scrollToReel(currentReelIndex.value);
  }
};

const handleWheel = (event: WheelEvent) => {
  handleScroll(event.deltaY > 0 ? 'down' : 'up');
};

let touchStartY = 0;
let touchEndY = 0;

const handleTouchStart = (event: TouchEvent) => {
  touchStartY = event.touches[0].clientY;
};

const handleTouchMove = (event: TouchEvent) => {
  touchEndY = event.touches[0].clientY;
};

const handleTouchEnd = () => {
  const diff = touchStartY - touchEndY;
  if (Math.abs(diff) > 50) {
    handleScroll(diff > 0 ? 'down' : 'up');
  }
};

const handleMouseDown = (event: MouseEvent) => {
  const startY = event.clientY;
  const handleMouseMove = (moveEvent: MouseEvent) => {
    const currentY = moveEvent.clientY;
    const diff = startY - currentY;
    if (Math.abs(diff) > 50) {
      handleScroll(diff > 0 ? 'down' : 'up');
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    }
  };
  const handleMouseUp = () => {
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
  };
  document.addEventListener('mousemove', handleMouseMove);
  document.addEventListener('mouseup', handleMouseUp);
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

<style lang="scss" scoped>
.incident-reels-page {
  background-color: $dark;
  height: 10vh;
  /* Changed from 100px to 100vh */
  overflow: hidden;
}

.reels-container {
  height: 100%;
  overflow-y: hidden;
  scroll-snap-type: y mandatory;
}

.reel-item {
  height: 100vh;
  scroll-snap-align: start;
}
</style>











<!-- <script setup lang="ts">
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

const reelsContainerRef = ref<HTMLElement | null>(null);

const scrollToReel = (index: number) => {
  if (reelsContainerRef.value) {
    const targetReel = reelsContainerRef.value.children[index] as HTMLElement;
    if (targetReel) {
      targetReel.scrollIntoView({ behavior: 'smooth' });
    }
  }
};

const handleSwipe = (direction: 'up' | 'down') => {
  if (direction === 'up' && currentReelIndex.value < reels.value.length - 1) {
    currentReelIndex.value++;
    scrollToReel(currentReelIndex.value);
  } else if (direction === 'down' && currentReelIndex.value > 0) {
    currentReelIndex.value--;
    scrollToReel(currentReelIndex.value);
  }
};

const handleWheel = (event: WheelEvent) => {
  if (event.deltaY > 0 && currentReelIndex.value < reels.value.length - 1) {
    currentReelIndex.value++;
    scrollToReel(currentReelIndex.value);
  } else if (event.deltaY < 0 && currentReelIndex.value > 0) {
    currentReelIndex.value--;
    scrollToReel(currentReelIndex.value);
  }
  event.preventDefault();
};

let startY = 0;
let currentY = 0;

const handleMouseDown = (event: MouseEvent) => {
  startY = event.clientY;
  document.addEventListener('mousemove', handleMouseMove);
  document.addEventListener('mouseup', handleMouseUp);
};

const handleMouseMove = (event: MouseEvent) => {
  currentY = event.clientY;
};

const handleMouseUp = () => {
  const diff = startY - currentY;
  if (Math.abs(diff) > 50) {
    if (diff > 0 && currentReelIndex.value < reels.value.length - 1) {
      currentReelIndex.value++;
      scrollToReel(currentReelIndex.value);
    } else if (diff < 0 && currentReelIndex.value > 0) {
      currentReelIndex.value--;
      scrollToReel(currentReelIndex.value);
    }
  }
  document.removeEventListener('mousemove', handleMouseMove);
  document.removeEventListener('mouseup', handleMouseUp);
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
    <div ref="reelsContainerRef" class="reels-container" v-touch-swipe.mouse.vertical="handleSwipe" @wheel="handleWheel"
      @mousedown="handleMouseDown">
      <div v-for="(reel, index) in reels" :key="reel.id" class="reel-item">
        <IncidentReelPlayer :reel="reel" :is-active="index === currentReelIndex" />
      </div>
    </div>
    <AddIncidentFab @incident-added="fetchReels" />
  </q-page>
</template>

<style lang="scss" scoped>
.incident-reels-page {
  background-color: $dark;
  height: 100%;
  overflow: hidden;
}

.reels-container {
  height: 100%;
  overflow-y: auto;
  scroll-snap-type: y mandatory;
  -webkit-overflow-scrolling: touch;
}

.reel-item {
  height: 100vh;
  scroll-snap-align: start;
}
</style> -->
