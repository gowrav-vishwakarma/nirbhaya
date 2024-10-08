<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted } from 'vue';
import { useQuasar } from 'quasar';

const props = defineProps<{
  reel: any;
  isActive: boolean;
}>();

const $q = useQuasar();
const videoRef = ref<HTMLVideoElement | null>(null);

const playVideo = () => {
  if (videoRef.value && props.isActive) {
    videoRef.value.play().catch((error) => {
      console.error('Error playing video:', error);
    });
  }
};

const pauseVideo = () => {
  if (videoRef.value) {
    videoRef.value.pause();
  }
};

const handleLike = () => {
  // Implement like functionality
};

const handleShare = () => {
  // Implement share functionality
};

watch(
  () => props.isActive,
  (newValue) => {
    if (newValue) {
      playVideo();
    } else {
      pauseVideo();
    }
  }
);

onMounted(() => {
  if (props.isActive) {
    playVideo();
  }
});

onUnmounted(() => {
  pauseVideo();
});
</script>

<template>
  <div class="incident-reel-player">
    <video
      ref="videoRef"
      :src="reel.videoUrl"
      loop
      muted
      playsinline
      preload="auto"
    ></video>
    <div class="reel-info">
      <h3>{{ reel.title }}</h3>
      <p>{{ reel.description }}</p>
    </div>
    <div class="reel-actions">
      <q-btn icon="favorite" color="red" flat round @click="handleLike" />
      <q-btn icon="share" color="white" flat round @click="handleShare" />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.incident-reel-player {
  height: 100vh;
  width: 100%;
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;

  video {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .reel-info {
    position: absolute;
    bottom: 80px;
    left: 16px;
    color: white;
    text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
  }

  .reel-actions {
    position: absolute;
    bottom: 16px;
    right: 16px;
  }
}
</style>
