<script setup lang="ts">
import { ref, watch, onMounted } from 'vue';
import { useQuasar } from 'quasar';

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

const props = defineProps<{
  reel: Reel;
  isActive: boolean;
}>();

const emit = defineEmits<{
  (e: 'swipe-up'): void;
  (e: 'swipe-down'): void;
}>();

const videoRef = ref<HTMLVideoElement | null>(null);
const isVideoLoaded = ref(false);
const isVideoError = ref(false);

let touchStartY = 0;

const handleTouchStart = (event: TouchEvent) => {
  touchStartY = event.touches[0].clientY;
};

const handleTouchEnd = (event: TouchEvent) => {
  const touchEndY = event.changedTouches[0].clientY;
  const deltaY = touchEndY - touchStartY;

  if (deltaY < -50) {
    emit('swipe-up');
  } else if (deltaY > 50) {
    emit('swipe-down');
  }
};

const handleVideoError = () => {
  isVideoError.value = true;
  $q.notify({
    color: 'negative',
    message: 'Failed to load video. Please try again later.',
    icon: 'error',
  });
};

const handleVideoLoaded = () => {
  isVideoLoaded.value = true;
};

watch(
  () => props.isActive,
  (newIsActive) => {
    if (newIsActive && videoRef.value && isVideoLoaded.value) {
      videoRef.value.play().catch((error) => {
        console.error('Error playing video:', error);
      });
    } else if (videoRef.value) {
      videoRef.value.pause();
    }
  }
);

onMounted(() => {
  if (videoRef.value) {
    videoRef.value.load();
  }
});
</script>

<template>
  <div
    class="reel-player"
    @touchstart="handleTouchStart"
    @touchend="handleTouchEnd"
  >
    <video
      ref="videoRef"
      :src="reel.videoUrl"
      loop
      muted
      playsinline
      @error="handleVideoError"
      @loadeddata="handleVideoLoaded"
    ></video>
    <div v-if="isVideoError" class="video-error">
      <q-icon name="error" size="lg" color="negative" />
      <p>Video failed to load</p>
    </div>
    <div v-else-if="!isVideoLoaded" class="video-loading">
      <q-spinner color="white" size="3em" />
    </div>
    <div v-else class="reel-info">
      <h3>{{ reel.user.name }}</h3>
      <p>{{ reel.description }}</p>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.reel-player {
  position: relative;
  width: 100%;
  height: 100%;
  background-color: $dark;

  video {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }

  .reel-info {
    position: absolute;
    bottom: 20px;
    left: 20px;
    color: white;
    text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
  }

  .video-error,
  .video-loading {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    text-align: center;
    color: white;
  }
}
</style>
