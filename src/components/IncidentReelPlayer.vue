<template>
  <div class="incident-reel-player">
    <div class="reelText">
      Reels <q-icon name="mdi-chevron-down"></q-icon>
    </div>
    <video ref="videoRef" :src="reel.videoUrl" loop muted playsinline preload="auto"></video>
    <div class="reel-info">
      <h3>{{ reel.title }}</h3>
      <p>{{ reel.description }}</p>
    </div>
    <div class="reel-actions" style="text-align: center;">
      <q-icon @click="handleLike" :class="{ 'heartbeat': wasLiked }"
        :style="{ marginBottom: '2px', color: isLiked ? 'red' : 'white' }" class="action-font-size"
        :name="isLiked ? 'mdi-heart' : 'mdi-heart-outline'"></q-icon>
      <br />
      <span class="text-white">165k</span>
      <br />
      <q-btn color="white" style="margin-top: 7px;" flat round>
        <q-icon class="action-font-size" name="mdi-message-outline"></q-icon>
      </q-btn>
      <br />
      <span class="text-white">180k</span>
      <br />
      <q-btn color="white" style="margin-top: 3px; margin-bottom: 4px;" flat round @click="handleShare">
        <q-icon style="transform: rotate(-20deg);" class="action-font-size" name="mdi-send"></q-icon>
      </q-btn>
      <br />
      <span class="text-white marginLeftone">100k</span>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted } from 'vue';
// import { useQuasar } from 'quasar';

const props = defineProps<{
  reel: any;
  isActive: boolean;
}>();
const isLiked = ref(false);
const wasLiked = ref(false); // Track the previous state for animation

// const $q = useQuasar();
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
  wasLiked.value = true; // Set wasLiked to true to trigger animation
  isLiked.value = !isLiked.value; // Toggle the like state

  // Reset wasLiked after the animation duration
  setTimeout(() => {
    wasLiked.value = false; // Reset after animation
  }, 1000); // Duration of the animation
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
    bottom: 110px;
    right: 26px;
  }

  .action-font-size {
    font-size: 35px;
  }

  .reelText {
    position: absolute;
    font-size: 22px;
    font-weight: bold;
    z-index: 1;
    top: 10px;
    left: 20px;
    text-align: start;
    color: whitesmoke;
  }

  .heartbeat {
    animation: heartbeat .6s ease forwards;
  }

  @keyframes heartbeat {

    0%,
    100% {
      transform: scale(1);
    }

    50% {
      transform: scale(1.2);
    }
  }
}
</style>
