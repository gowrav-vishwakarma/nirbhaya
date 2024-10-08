<template>
  <div class="incident-reel-player">
    <video ref="videoRef" :src="reel.videoUrl" loop muted playsinline preload="auto"></video>
    <div class="reel-info">
      <h3>{{ reel.title }}</h3>
      <p>{{ reel.description }}</p>
    </div>
    <div class="reel-actions">
      <q-btn color="red" flat round @click="handleLike">
        <q-icon class="action-font-size " name="favorite"></q-icon>
      </q-btn>
      <br />
      <q-btn color="white" flat round @click="handleShare">
        <q-icon class="action-font-size " name="mdi-share"></q-icon>
      </q-btn>
    </div>
  </div>
</template>
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



<style lang="scss" scoped>
.incident-reel-player {
  height: 100%;
  width: 100%;
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  margin: auto;

  video {
    width: auto;
    height: 100%;
    max-height: 100%;
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
    bottom: 170px;
    right: 26px;
  }

  .action-font-size {
    font-size: 35px;
  }
}
</style>
