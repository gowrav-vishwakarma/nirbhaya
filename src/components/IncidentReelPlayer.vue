<template>
  <div class="incident-reel-player" v-intersection="onIntersect">
    <div class="reelText">
      Shorts <q-icon name="mdi-chevron-down"></q-icon>
    </div>
    <video v-if="reel.videoSource === 'normal'" ref="videoRef" :src="reel.videoUrl" loop
      :muted="!isVisible || !isActive" playsinline preload="auto" @loadedmetadata="onVideoLoaded"></video>
    <div v-else class="youtube-container">
      <div :id="youtubeIframeId"></div>
    </div>

    <!-- <div class="reel-info">
      <h3>{{ reel.title }}</h3>
      <p>{{ reel.description }}</p>
    </div> -->
    <div class="reel-actions" style="text-align: center;">
      <q-icon @click="handleLike(reel)" :class="{ 'heartbeat': wasLiked }"
        :style="{ marginBottom: '2px', color: isLiked ? 'red' : 'white' }" class="action-font-size"
        :name="isLiked ? 'mdi-heart' : 'mdi-heart-outline'"></q-icon>
      <br />
      <span class="text-white">{{ reel.likes }}</span>
      <br />
      <q-btn color="white" style="margin-top: 7px;" flat round @click="showComments(reel, true)">
        <q-icon class="action-font-size" name="mdi-message-outline"></q-icon>
      </q-btn>
      <br />
      <span class="text-white">{{ reel.comments }}</span>
      <br />
      <q-btn color="white" style="margin-top: 3px; margin-bottom: 4px;" flat round @click="handleShare(reel)">
        <q-icon style="transform: rotate(-20deg);" class="action-font-size" name="mdi-send"></q-icon>
      </q-btn>
      <br />
      <span class="text-white marginLeftone">{{ reel.shares }}</span>
    </div>
    <div>
      <q-dialog v-model="commentDialog" position="bottom">
        <q-card style="width: 100%;">
          <div class="">
            <div v-if="allComments.length">
              <h6 class="q-ma-none q-mt-sm q-ml-sm q-mb-sm">Comments</h6>
              <div class="comments-container" style="max-height:60vh; overflow-y: auto;" ref="commentsContainer">
                <div v-for="comment in allComments" :key="comment.id">
                  <div class="q-px-sm">
                    <q-chat-message bg-color="pink-1"
                      :name="userStore.user.id === comment.userId ? 'You' : comment.user.name"
                      avatar="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSm7wK5SMj8ezoK-caLkRu5P7vwbLyfbGShLXdbUaEtj5_jifktQUqHdtBDKXF3zJDh4HI&usqp=CAU"
                      :text="[comment.comment_text]" :sent="false" />
                  </div>
                </div>
              </div>
            </div>
            <div style="width: 100%;" class="q-px-md q-pb-xs">
              <q-input style="width: 100%;" v-model="newComment" label="Add a comment"
                @keyup.enter="submitComment(reel)">
                <template v-slot:append>
                  <q-icon name="mdi-send" color="pink" @click="submitComment(reel)" class="cursor-pointer" />
                </template>
              </q-input>
            </div>
          </div>
        </q-card>
      </q-dialog>
    </div>
    <div class="centered-div" @click="handleClick">
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted, nextTick, computed } from 'vue';
import { api } from 'src/boot/axios';
import { useUserStore } from 'src/stores/user-store';
import type { YTPlayer, YT } from '../youtube';
// import { useIntersectionObserver } from '@vueuse/core'

const props = defineProps<{
  reel: any;
  isActive: boolean;
  isVisible: boolean;
}>();

const isYTReady = ref(false);
const player = ref<YTPlayer | null>(null);
const youtubeIframeId = computed(() => `youtube-player-${props.reel.id}-${Date.now()}`);
const playerState = ref<number | null>(null);
const canTogglePlayPause = ref(false);
const isInitializing = ref(false);
const isPlayerReady = ref(false);

// Add imports for Quasar
import { useQuasar } from 'quasar';
const $q = useQuasar();

// Add window.YT type declaration
declare global {
  interface Window {
    YT: typeof YT;
    onYouTubeIframeAPIReady: () => void;
  }
}

// Update the YouTube embed URL function
const getYoutubeEmbedUrl = (videoId: string) => {
  // Extract video ID if full URL is provided
  const extractVideoId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : url;
  };

  const id = extractVideoId(videoId);
  return `https://www.youtube.com/embed/${id}?enablejsapi=1&controls=0&rel=0&playsinline=1&origin=${window.location.origin}&autoplay=1&mute=1`;
};

let ytPlayer: YTPlayer | null = null;

// Update the loadYouTubeAPI function
const loadYouTubeAPI = () => {
  return new Promise<void>((resolve) => {
    if (window.YT && window.YT.Player) {
      isYTReady.value = true;
      resolve();
      return;
    }

    // Define the callback before loading the script
    window.onYouTubeIframeAPIReady = () => {
      isYTReady.value = true;
      resolve();
    };

    // Only load the script if it hasn't been loaded yet
    if (!document.querySelector('script[src*="youtube.com/iframe_api"]')) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      if (firstScriptTag?.parentNode) {
        firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
      }
    }
  });
};

// Update the createYoutubePlayer function
const createYoutubePlayer = async () => {
  if (isInitializing.value || !props.reel.videoUrl) return;
  isInitializing.value = true;

  try {
    await loadYouTubeAPI();
    await nextTick();

    // Wait for container to be available
    const maxAttempts = 5;
    let attempts = 0;
    const waitForContainer = async () => {
      const container = document.getElementById(youtubeIframeId.value);
      if (container) {
        return container;
      }
      if (attempts >= maxAttempts) {
        throw new Error('Container not found after maximum attempts');
      }
      attempts++;
      await new Promise(resolve => setTimeout(resolve, 100));
      return waitForContainer();
    };

    const container = await waitForContainer();
    if (!container) {
      console.error('YouTube container not found');
      return;
    }

    // Clean up existing player
    if (player.value) {
      try {
        player.value.destroy();
      } catch (error) {
        console.error('Error destroying player:', error);
      }
      player.value = null;
    }

    const videoId = extractVideoId(props.reel.videoUrl);
    console.log(`Creating player for reel ${props.reel.id}`, {
      videoId,
      containerId: youtubeIframeId.value,
      isActive: props.isActive,
      isVisible: props.isVisible
    });

    const playerConfig = {
      videoId,
      playerVars: {
        autoplay: 1,
        controls: 0,
        rel: 0,
        playsinline: 1,
        mute: 1,
        loop: 1,
        playlist: videoId,
        enablejsapi: 1,
        origin: window.location.origin
      },
      events: {
        onReady: (event: { target: YTPlayer }) => {
          console.log(`Player ready for reel ${props.reel.id}`);
          isPlayerReady.value = true;

          if (props.isActive && props.isVisible) {
            event.target.playVideo();
            setTimeout(() => {
              if (props.isActive && props.isVisible) {
                event.target.unMute();
              }
            }, 500);
          }
        },
        onStateChange: (event: { target: YTPlayer; data: number }) => {
          playerState.value = event.data;

          if (event.data === window.YT.PlayerState.ENDED) {
            event.target.seekTo(0);
            if (props.isActive && props.isVisible) {
              event.target.playVideo();
            }
          }
        },
        onError: (event: any) => {
          console.error('YouTube player error:', event);
          isPlayerReady.value = false;
        }
      }
    };

    player.value = new window.YT.Player(youtubeIframeId.value, playerConfig);
  } catch (error) {
    console.error('Error creating YouTube player:', error);
    isPlayerReady.value = false;
  } finally {
    isInitializing.value = false;
  }
};

// Update the toggleYoutubePlayPause function
const toggleYoutubePlayPause = () => {
  if (!player.value || typeof player.value.playVideo !== 'function') {
    console.error('YouTube player not initialized or playVideo is not a function');
    createYoutubePlayer();
    return;
  }

  try {
    const YT = window.YT;
    const currentState = playerState.value;

    if (currentState === YT.PlayerState.PLAYING) {
      player.value.pauseVideo();
    } else {
      player.value.playVideo();
    }
  } catch (error) {
    console.error('Error toggling YouTube video:', error);
    createYoutubePlayer();
  }
};

// Initialize YouTube player when API is ready
window.onYouTubeIframeAPIReady = () => {
  console.log('YouTube API is ready');
  isYTReady.value = true;
  nextTick(() => {
    createYoutubePlayer();
  });
};

// Clean up on unmount
onUnmounted(() => {
  if (player.value) {
    try {
      player.value.destroy();
    } catch (error) {
      console.error('Error destroying YouTube player:', error);
    }
    player.value = null;
  }

  if (intervalId.value) {
    clearInterval(intervalId.value);
  }
});

const userStore = useUserStore();
const isLiked = ref(false);
const wasLiked = ref(false);
const commentDialog = ref(false);
const allComments = ref<Comment[]>([]);
const newComment = ref('');
const videoRef = ref<HTMLVideoElement | null>(null);
const isVideoLoaded = ref(false);
const commentsContainer = ref<HTMLElement | null>(null);

const play = async () => {
  if (!videoRef.value || !isVideoLoaded.value) {
    console.log('Video not ready to play');
    return;
  }

  try {
    console.log('Attempting to play video:', props.reel.title);
    await videoRef.value.play();
    console.log('Video playing successfully');
  } catch (error) {
    console.error('Error playing video:', error);
    // Retry once with muted state if autoplay was blocked
    try {
      videoRef.value.muted = true;
      await videoRef.value.play();
      console.log('Video playing in muted state');
    } catch (retryError) {
      console.error('Retry failed:', retryError);
    }
  }
};

const pause = () => {
  if (videoRef.value) {
    console.log('Pausing video:', props.reel.title);
    videoRef.value.pause();
  }
};

const onVideoLoaded = () => {
  console.log(`Video loaded for reel ${props.reel.id}`);
  isVideoLoaded.value = true;

  if (props.isActive && props.isVisible) {
    console.log('Playing video after load');
    play();
  }
};

// Add this function for normal video toggle
const togglePlayPause = () => {
  if (videoRef.value) {
    if (videoRef.value.paused) {
      play();
    } else {
      pause();
    }
  }
};

const handleLike = async (reel: any) => {
  wasLiked.value = true;
  isLiked.value = !isLiked.value;

  setTimeout(() => {
    wasLiked.value = false;
  }, 1000);

  await api.post('/incidents/like-incident', {
    userId: userStore.user.id,
    incidentId: reel.id,
    isLiked: isLiked.value
  });
  if (isLiked.value) {
    reel.likes++
  } else {
    reel.likes--
  }
};

const handleShare = async (reel: { videoUrl: string; id: string; shares: number; }) => {
  try {
    if (navigator.share && navigator.canShare) {
      const shareData = {
        title: props.reel.title || 'Check out this video',
        text: props.reel.description || 'Watch this interesting video',
        url: reel.videoUrl
      };

      if (navigator.canShare(shareData)) {
        await navigator.share(shareData);
        const res = await api.post('/incidents/log-share', {
          incidentId: props.reel.id,
          userId: userStore.user.id,
        });
        if (res) {
          reel.shares++;
        }
      } else {
        fallbackShare(reel);
      }
    } else {
      fallbackShare(reel);
    }
  } catch (error) {
    console.error('Error sharing:', error);
    fallbackShare(reel);
  }
};

const fallbackShare = (reel: { videoUrl: string }) => {
  // Create a temporary input to copy the URL
  const tempInput = document.createElement('input');
  tempInput.value = reel.videoUrl;
  document.body.appendChild(tempInput);
  tempInput.select();
  document.execCommand('copy');
  document.body.removeChild(tempInput);

  // Show notification
  $q.notify({
    message: 'Link copied to clipboard!',
    color: 'positive',
    position: 'top',
    timeout: 2000
  });
};

const scrollToBottom = () => {
  nextTick(() => {
    if (commentsContainer.value) {
      commentsContainer.value.scrollTop = commentsContainer.value.scrollHeight;
    }
  });
};

const showComments = async (reel: { id: string; }, runScroolToBottom = true) => {
  commentDialog.value = true;
  const response = await api.get('/incidents/reels-comments', {
    params: { incidentId: reel.id, limit: 50 }, // Fetch the latest 5 comments
  });

  if (Array.isArray(response.data)) {
    allComments.value = response.data;
    if (runScroolToBottom) {
      await nextTick();
      scrollToBottom();
    }
  } else {
    console.error('Expected an array but received:', response.data);
    allComments.value = [];
  }
};

const submitComment = async (reel: { id: string; comments: number; }) => {
  if (newComment.value.trim()) {
    const res = await api.post('/incidents/add-comment', {
      incidentId: props.reel.id,
      userId: userStore.user.id,
      comment_text: newComment.value,
    });
    newComment.value = '';
    if (res) {
      reel.comments++
    }
    await showComments(props.reel, true);
  }
};

// watch(allComments, () => {
//   scrollToBottom();
// });

watch(
  () => props.isActive,
  (newValue) => {
    console.log('isActive changed:', newValue);
    if (newValue && isVideoLoaded.value) {
      play();
    } else {
      pause();
    }
  }
);

// Expose the play and pause methods
defineExpose({ play, pause });

// Function to check if the reel was liked in the past
const checkIfLiked = async () => {
  try {
    const response = await api.get('/incidents/check-like', {
      params: {
        userId: userStore.user.id,
        incidentId: props.reel.id,
      },
    });
    console.log('response,,,,,,,,,', response);


    isLiked.value = response.data;
  } catch (error) {
    console.error('Error checking if liked:', error);
  }
};

const intervalId = ref<ReturnType<typeof setInterval> | null>(null);

onMounted(async () => {
  if (props.reel.videoSource !== 'normal') {
    if (props.isActive && props.isVisible) {
      console.log(`Initializing YouTube player for reel ${props.reel.id} on mount`);
      await createYoutubePlayer();
    }
  }
  checkIfLiked();

  intervalId.value = setInterval(() => {
    if (commentDialog.value) {
      showComments(props.reel, false);
    }
  }, 5000);
});

// Clear the interval on component unmount
onUnmounted(() => {
  if (intervalId.value) {
    clearInterval(intervalId.value);
  }
});

// Watch for changes in commentDialog to clear the interval when closed
watch(commentDialog, (newValue) => {
  if (!newValue) {
    if (intervalId.value) { // Check if intervalId is defined
      clearInterval(intervalId.value);
    }
  }
});

onUnmounted(() => {
  pause();
});

// Update the click handler
const handleClick = async () => {
  if (props.reel.videoSource === 'normal') {
    togglePlayPause();
    return;
  }

  if (!player.value || !isPlayerReady.value) {
    console.warn('Initializing YouTube player...');
    await createYoutubePlayer();
    return;
  }

  try {
    const state = playerState.value;
    if (state === window.YT.PlayerState.PLAYING) {
      player.value.pauseVideo();
    } else {
      player.value.playVideo();
    }
  } catch (error) {
    console.error('Error toggling YouTube video:', error);
    await createYoutubePlayer();
  }
};

// Watch for active state changes
watch(
  () => [props.isActive, props.isVisible],
  async ([isActive, isVisible]) => {
    console.log(`Reel ${props.reel.id} visibility changed:`, {
      isActive,
      isVisible,
      hasPlayer: !!player.value,
      isPlayerReady: isPlayerReady.value
    });

    if (props.reel.videoSource !== 'normal') {
      if (isActive && isVisible) {
        await nextTick();
        if (!player.value || !isPlayerReady.value) {
          await createYoutubePlayer();
        } else {
          try {
            player.value.playVideo();
            setTimeout(() => {
              if (props.isActive && props.isVisible) {
                player.value?.unMute();
              }
            }, 500);
          } catch (error) {
            console.error('Error playing video:', error);
            await createYoutubePlayer();
          }
        }
      } else if (player.value) {
        try {
          player.value.mute();
          player.value.pauseVideo();
        } catch (error) {
          console.error('Error pausing video:', error);
        }
      }
    }
  },
  { immediate: true }
);

// Update onUnmounted to properly cleanup both video types
onUnmounted(() => {
  // Stop normal video
  pause();

  // Cleanup YouTube player
  if (player.value) {
    try {
      player.value.pauseVideo();
      player.value.destroy();
    } catch (error) {
      console.error('Error destroying YouTube player:', error);
    }
    player.value = null;
  }

  // Clear interval if exists
  if (intervalId.value) {
    clearInterval(intervalId.value);
  }
});

// Add the intersection handler
const onIntersect = (entry: IntersectionObserverEntry): boolean => {
  handleVisibilityChange(entry.isIntersecting);
  return entry.isIntersecting;
};

// Update the handleVisibilityChange function
const handleVisibilityChange = (isVisible: boolean) => {
  if (props.reel.videoSource === 'normal') {
    if (isVisible && props.isActive) {
      play();
    } else {
      pause();
    }
  } else {
    if (!player.value || typeof player.value.playVideo !== 'function') {
      createYoutubePlayer();
      return;
    }

    try {
      if (isVisible && props.isActive) {
        player.value.unMute();
        player.value.playVideo();
      } else {
        player.value.mute();
        player.value.pauseVideo();
      }
    } catch (error) {
      console.error('Error handling YouTube visibility change:', error);
      createYoutubePlayer();
    }
  }
};

// Add interface for Comment type
interface Comment {
  id: number;
  userId: number;
  comment_text: string;
  user: {
    id: number;
    name: string;
  };
}

// Extract video ID function
const extractVideoId = (url: string) => {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : url;
};

// Add this at the top of the script section
const logVisibilityChange = () => {
  console.log(`Reel ${props.reel.id} - Visibility changed:`, {
    isActive: props.isActive,
    isVisible: props.isVisible,
    isVideoLoaded: isVideoLoaded.value,
    playerState: playerState.value
  });
};

// Add to watch section
watch(
  () => [props.isActive, props.isVisible],
  () => {
    logVisibilityChange();
  },
  { immediate: true }
);
</script>

<style lang="scss">
.incident-reel-player {
  height: 100%;
  width: 100%;
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  margin: auto;

  video {
    width: 100%;
    height: 100vh;
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

  .comments-container {
    padding-bottom: 60px;
    scroll-behavior: smooth;
  }

  .q-card {
    display: flex;
    flex-direction: column;
    height: 100%;
  }

  .q-px-md.q-pb-xs {
    position: sticky;
    bottom: 0;
    background-color: white;
    z-index: 1;
  }

  iframe {
    width: 100%;
    height: 100vh;
    object-fit: cover;
  }

  .youtube-container {
    width: 100%;
    height: 100vh;
    position: relative;
    overflow: hidden;

    div {
      width: 100%;
      height: 100%;
    }

    iframe {
      width: 100%;
      height: 100%;
      position: absolute;
      top: 0;
      left: 0;
      object-fit: cover;
    }
  }
}

.centered-div {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 200px;
  height: 200px;
  border-radius: 50%;
  background-color: transparent;
}
</style>
