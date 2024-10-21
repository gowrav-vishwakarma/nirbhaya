<template>
  <div class="incident-reel-player">
    <div class="reelText">
      Reels <q-icon name="mdi-chevron-down"></q-icon>
    </div>
    <video ref="videoRef" :src="reel.videoUrl" loop muted playsinline preload="auto"
      @loadedmetadata="onVideoLoaded"></video>
    <div class="reel-info">
      <h3>{{ reel.title }}</h3>
      <p>{{ reel.description }}</p>
    </div>
    <div class="reel-actions" style="text-align: center;">
      <q-icon @click="handleLike(reel)" :class="{ 'heartbeat': wasLiked }"
        :style="{ marginBottom: '2px', color: isLiked ? 'red' : 'white' }" class="action-font-size"
        :name="isLiked ? 'mdi-heart' : 'mdi-heart-outline'"></q-icon>
      <br />
      <span class="text-white">{{ reel.likes }}</span>
      <br />
      <q-btn color="white" style="margin-top: 7px;" flat round @click="showComments(reel)">
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
    <div class="centered-div" @click="togglePlayPause"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted, nextTick } from 'vue';
import { api } from 'src/boot/axios';
import { useUserStore } from 'src/stores/user-store';

const props = defineProps<{
  reel: any;
  isActive: boolean;
}>();

const userStore = useUserStore();
const isLiked = ref(false);
const wasLiked = ref(false);
const commentDialog = ref(false);
const allComments = ref<Comment[]>([]);
const newComment = ref('');

const videoRef = ref<HTMLVideoElement | null>(null);
const isVideoLoaded = ref(false);
const commentsContainer = ref<HTMLElement | null>(null);

const play = () => {
  if (videoRef.value && isVideoLoaded.value) {
    console.log('Playing video:', props.reel.title);
    videoRef.value.play().catch((error) => {
      console.error('Error playing video:', error);
    });
  }
};

const pause = () => {
  if (videoRef.value) {
    console.log('Pausing video:', props.reel.title);
    videoRef.value.pause();
  }
};

const onVideoLoaded = () => {
  isVideoLoaded.value = true;
  console.log('Video loaded:', props.reel.title);
  if (props.isActive) {
    play();
  }
};

const togglePlayPause = () => {
  if (videoRef.value) {
    if (videoRef.value.paused) {
      videoRef.value.play();
    } else {
      videoRef.value.pause();
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

const handleShare = (reel) => {
  if (navigator.share) {
    navigator.share({
      url: reel.videoUrl
    })
      .then(async () => {
        console.log('Share successful');
        const res = await api.post('/incidents/log-share', {
          incidentId: props.reel.id,
          userId: userStore.user.id,
        });
        if (res) {
          reel.shares++
        }
      })
      .catch((error) => {
        console.error('Error sharing:', error);
      });
  } else {
    console.log('Share not supported on this browser, fallback to other sharing methods.');
  }
};

const scrollToBottom = () => {
  nextTick(() => {
    if (commentsContainer.value) {
      commentsContainer.value.scrollTop = commentsContainer.value.scrollHeight;
    }
  });
};

const showComments = async (reel) => {
  commentDialog.value = true;
  const response = await api.get('/incidents/reels-comments', {
    params: { incidentId: reel.id, limit: 50 }, // Fetch the latest 5 comments
  });

  if (Array.isArray(response.data)) {
    allComments.value = response.data;
    await nextTick();
    scrollToBottom();
  } else {
    console.error('Expected an array but received:', response.data);
    allComments.value = [];
  }
};

const submitComment = async (reel) => {
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
    await showComments(props.reel);
  }
};

watch(allComments, () => {
  scrollToBottom();
});

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

onMounted(() => {
  if (props.isActive && isVideoLoaded.value) {
    play();
  }
  checkIfLiked();

  // Set up an interval to check if the comment dialog is open
  const intervalId = setInterval(() => {
    if (commentDialog.value) {
      showComments(props.reel);
    }
  }, 5000);

  // Clear the interval on component unmount
  onUnmounted(() => {
    clearInterval(intervalId);
  });
});

// Watch for changes in commentDialog to clear the interval when closed
watch(commentDialog, (newValue) => {
  if (!newValue) {
    clearInterval(intervalId);
  }
});

onUnmounted(() => {
  pause();
});
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
