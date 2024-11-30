<template>
  <q-page class="bg-grey-1">
    <div class="container q-pa-md">
      <!-- Add Suggestion Button -->
      <!-- <div class="suggestion-button-container q-mb-md">
        <q-btn color="primary" icon="add_circle" label="Add Suggestion" class="suggestion-btn"
          @click="goToCommunityPage" />
      </div> -->

      <!-- Header -->
      <div class="row items-center justify-between q-pa-md">
        <div>
          <h4 class="text-h5 text-weight-bold q-my-none text-primary">Community Posts</h4>
          <p class="text-grey-7 q-mt-sm">Stay connected with your community</p>
        </div>
        <div style=" width: 100%; text-align: end; margin-bottom: 10px; margin-top: -20px;">
          <q-btn color="primary" class=" suggestion-btn" @click="goToCommunityPage">
            <q-icon style="font-size: 20px; " name="add_circle"></q-icon>
            <span style="font-size: 10px; font-weight: 800; padding-left: 5px;">
              Suggestion
            </span>
          </q-btn>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="row justify-center q-pa-md">
        <q-spinner-dots color="primary" size="40" />
      </div>

      <!-- No Posts Message -->
      <div v-else-if="!posts.length" class="row justify-center q-pa-xl">
        <div class="text-center">
          <q-icon name="inbox" size="48px" color="grey-5" />
          <p class="text-grey-7 q-mt-sm">No posts available</p>
        </div>
      </div>

      <!-- Posts List -->
      <div v-else class="row q-col-gutter-y-md" style="margin-top: -30px;">
        <div v-for="post in posts" :key="post.id" class="col-12">
          <q-card flat class="post-card">
            <!-- User Info Section -->
            <q-card-section class="q-pb-none">
              <div class="row items-center">
                <q-avatar size="48px" class="shadow-2">
                  <img src="/sos_logo_1080_1080.png" style="object-fit: cover;" />
                </q-avatar>
                <div class="q-ml-md">
                  <div class="text-weight-bold " style="font-size: 16px;">SOS Bharat Community</div>
                  <div class="text-caption text-grey-7">
                    <q-icon name="schedule" size="xs" class="q-mr-xs" />
                    {{ formatDate(post.createdAt) }}
                  </div>
                </div>
              </div>
            </q-card-section>

            <!-- Post Content -->
            <q-card-section style="padding: 10px 10px 0px 10px; ">
              <div class="text-h5 text-weight-bold text-primary q-mb-sm" style="font-size: 16px;">
                {{ post.title }}
              </div>
              <div class="text-body1 post-description">
                {{ showFullDescription[post.id] ? post.description : truncateText(post.description, 15) }}
                <span v-if="post.description.split(' ').length > 10" @click="toggleDescription(post.id)"
                  class="read-more-link">
                  {{ showFullDescription[post.id] ? 'Read Less' : 'Read More' }}
                </span>
              </div>

              <!-- Hashtags section -->
              <div v-if="post.tags && post.tags.length" class="hashtags-container">
                <span v-for="tag in post.tags" :key="tag" class="hashtag" @click="handleTagClick(tag)">
                  #{{ tag }}
                </span>
              </div>
            </q-card-section>

            <!-- Media Section -->
            <q-card-section v-if="post.mediaUrls || post.videoUrl" class="q-pa-none q-mt-md">
              <!-- Show YouTube video if videoUrl exists -->
              <div v-if="post.videoUrl" class="video-container" v-intersection="onVideoIntersection(post.id)">
                <iframe :key="getVideoUrl(post.id, post.videoUrl)" :src="getVideoUrl(post.id, post.videoUrl)"
                  :id="`video-${post.id}`" frameborder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowfullscreen class="video-frame">
                </iframe>
              </div>
              <!-- Show image if mediaUrls exists and no video -->
              <q-img v-else-if="post.mediaUrls"
                :src="Array.isArray(post.mediaUrls) ? post.mediaUrls[0] : post.mediaUrls" :ratio="16 / 9"
                class="post-image">
                <template v-slot:loading>
                  <q-spinner-dots color="white" size="40" />
                </template>
              </q-img>
            </q-card-section>
          </q-card>
        </div>
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, onUnmounted, nextTick, Ref } from 'vue';
import { useQuasar } from 'quasar';
import { api } from 'src/boot/axios';
import { useRouter } from 'vue-router';

interface Post {
  id: number;
  title: string;
  description: string;
  mediaUrls: string[];
  videoUrl?: string;
  priority: string;
  status: string;
  postType: string;
  tags: string[];
  createdAt: string | null;
  activeSlide?: number;
}

const $q = useQuasar();
const posts = ref<Post[]>([]);

// Add this new ref for tracking expanded descriptions
const showFullDescription = ref<{ [key: number]: boolean }>({});

// Add ref for tracking video visibility
const videoVisibility = ref<Record<number, boolean>>({});

// Add loading state
const loading = ref(true);

// Add a ref to track the currently playing video
const currentlyPlayingVideo = ref<number | null>(null);

// Add new refs for dialog
// const showSuggestionDialog = ref(false);
// const suggestionForm = ref({
//   title: '',
//   description: ''
// });

const router = useRouter();

// Update the formatDate helper function
const formatDate = (date: string | null) => {
  console.log('date.......', date);

  if (!date) return 'Recent';

  try {
    const postDate = new Date(date);
    if (isNaN(postDate.getTime())) return 'Invalid date';

    const now = new Date();
    const diffInMs = now.getTime() - postDate.getTime();
    const diffInSeconds = Math.floor(diffInMs / 1000);
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);

    // Less than a minute
    if (diffInSeconds < 60) {
      return 'Just now';
    }

    // Less than an hour
    if (diffInMinutes < 60) {
      return `${diffInMinutes} ${diffInMinutes === 1 ? 'minute' : 'minutes'} ago`;
    }

    // Less than a day
    if (diffInHours < 24) {
      return `${diffInHours} ${diffInHours === 1 ? 'hour' : 'hours'} ago`;
    }

    // Less than a week
    if (diffInDays < 7) {
      return `${diffInDays} ${diffInDays === 1 ? 'day' : 'days'} ago`;
    }

    // More than a week, format the date
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    };

    return new Intl.DateTimeFormat('en-US', options).format(postDate);
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Date error';
  }
};

// Methods
const loadPosts = async () => {
  try {
    loading.value = true;
    const response = await api.get('/posts/community-posts', {
      params: {
        status: 'active'
      }
    });

    console.log('response........', response);

    // Check if response.data is an array
    if (Array.isArray(response.data)) {
      posts.value = response.data;
    } else if (response.data.data && Array.isArray(response.data.data)) {
      posts.value = response.data.data;
    } else {
      console.error('Unexpected response format:', response.data);
      posts.value = [];
    }
  } catch (error) {
    console.error('Error loading posts:', error);
    $q.notify({
      color: 'negative',
      message: 'Failed to load posts',
      icon: 'error'
    });
    posts.value = [];
  } finally {
    loading.value = false;
  }
};

// Update truncateText to work with words instead of characters
const truncateText = (text: string, wordCount: number) => {
  if (!text) return '';
  const words = text.split(' ');
  if (words.length <= wordCount) return text;
  return words.slice(0, wordCount).join(' ') + '...';
};

// Add toggle function
const toggleDescription = (postId: number) => {
  showFullDescription.value[postId] = !showFullDescription.value[postId];
};

// Add tag click handler
const handleTagClick = (tag: string) => {
  console.log('Tag clicked:', tag);
  // You can add functionality here like filtering by tag
};

// Add function to convert YouTube URL to embed URL
const getYouTubeEmbedUrl = (url: string) => {
  if (!url) return '';

  // If it's just a video ID
  if (url.length === 11) {
    return `https://www.youtube.com/embed/${url}`;
  }

  // Handle different YouTube URL formats
  let videoId = '';

  // Handle full YouTube URLs
  if (url.includes('youtube.com/watch')) {
    videoId = new URL(url).searchParams.get('v') || '';
  }
  // Handle shortened YouTube URLs
  else if (url.includes('youtu.be/')) {
    videoId = url.split('youtu.be/')[1];
  }
  // Handle YouTube embed URLs
  else if (url.includes('youtube.com/embed/')) {
    videoId = url.split('youtube.com/embed/')[1];
  }

  // Remove any additional parameters
  videoId = videoId.split('&')[0];

  return `https://www.youtube.com/embed/${videoId}`;
};

// Update getVideoUrl function
const getVideoUrl = (postId: number, url: string) => {
  const baseUrl = getYouTubeEmbedUrl(url);
  return `${baseUrl}?enablejsapi=1&rel=0&modestbranding=1&mute=1`;
};

// Update the controlVideo function to be more reliable
const controlVideo = (postId: number, command: 'play' | 'pause') => {
  const iframe = document.getElementById(`video-${postId}`) as HTMLIFrameElement;
  if (iframe && iframe.contentWindow) {
    try {
      iframe.contentWindow.postMessage(
        JSON.stringify({
          event: 'command',
          func: command === 'play' ? 'playVideo' : 'pauseVideo',
          args: []
        }),
        '*'
      );
    } catch (error) {
      console.error('Error controlling video:', error);
    }
  }
};

// Update the onVideoIntersection handler with more precise center detection
const onVideoIntersection = (postId: number) => ({
  handler: (entry?: IntersectionObserverEntry) => {
    if (!entry) return false;

    try {
      const rect = entry.boundingClientRect;
      const windowHeight = window.innerHeight;

      // Calculate how centered the video is in the viewport
      const elementCenter = rect.top + (rect.height / 2);
      const viewportCenter = windowHeight / 2;
      const distanceFromCenter = Math.abs(elementCenter - viewportCenter);

      // Consider "centered" if within 100px of viewport center
      const isCentered = distanceFromCenter < 100;
      const isVisible = entry.isIntersecting;

      videoVisibility.value[postId] = isVisible && isCentered;

      if (isVisible && isCentered) {
        // Pause any currently playing video
        if (currentlyPlayingVideo.value !== null && currentlyPlayingVideo.value !== postId) {
          controlVideo(currentlyPlayingVideo.value, 'pause');
          videoVisibility.value[currentlyPlayingVideo.value] = false;
        }

        // Play this video
        controlVideo(postId, 'play');
        currentlyPlayingVideo.value = postId;
      } else {
        // Pause if this was the playing video and it's no longer centered
        if (currentlyPlayingVideo.value === postId) {
          controlVideo(postId, 'pause');
          currentlyPlayingVideo.value = null;
        }
      }

      return true;
    } catch (error) {
      console.error('Error in intersection handler:', error);
      return false;
    }
  },
  cfg: {
    // Update threshold and rootMargin for more precise center detection
    threshold: [0, 0.25, 0.5, 0.75, 1],
    rootMargin: '-30% 0px' // This creates a smaller "center" zone
  }
});

// Add onMounted hook back
onMounted(() => {
  loadPosts();
});

// Clean up on component unmount
onUnmounted(() => {
  if (currentlyPlayingVideo.value !== null) {
    controlVideo(currentlyPlayingVideo.value, 'pause');
  }
});

// Replace dialog methods with navigation method
const goToCommunityPage = () => {
  router.push('/community');
};
</script>

<style scoped lang="scss">
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0px;
  //background: linear-gradient(135deg, $primary, darken($primary, 20%));

}

.post-card {
  background: white;
  transition: all 0.3s ease;
  box-shadow:
    0 -10px 10px -10px rgba(0, 0, 0, 0.3),
    /* Top shadow */
    0 10px 10px -10px rgba(0, 0, 0, 0.3);
  /* Bottom shadow */
  overflow: hidden;
  border: none;
  position: relative;
  z-index: 1;
  margin-bottom: 0px;
}

.post-card:hover {
  transform: translateY(-2px);
  box-shadow:
    0 -10px 15px -10px rgba(0, 0, 0, 0.4),
    /* Enhanced top shadow on hover */
    0 10px 15px -10px rgba(0, 0, 0, 0.4);
  /* Enhanced bottom shadow on hover */
}

.post-description {
  line-height: 1.5;
  color: #4a5568;
  white-space: pre-line;
  font-size: 1rem;
  letter-spacing: 0.015em;
  margin-top: -10px;
}

.hashtags-container {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 16px;
}

.hashtag {
  color: #2563eb;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.2s ease;
  padding: 4px 8px;
  border-radius: 6px;
  background-color: #eff6ff;
}

.hashtag:hover {
  background-color: #dbeafe;
  color: #1d4ed8;
  transform: translateY(-1px);
}

.read-more-link {
  color: #2563eb;
  cursor: pointer;
  font-weight: 500;
  margin-left: 6px;
  text-decoration: none;
  transition: all 0.2s ease;
  padding: 2px 4px;
  border-radius: 4px;
}

.read-more-link:hover {
  color: #1d4ed8;
  background-color: #eff6ff;
}

.post-image {
  border-radius: 0;
  overflow: hidden;
  box-shadow: inset 0 2px 4px 0 rgba(0, 0, 0, 0.06);
}

/* Animation refinements */
.col-12 {
  animation: fadeIn 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Smooth transitions */
.q-btn,
.q-badge {
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.video-container {
  position: relative;
  padding-bottom: 56.25%;
  height: 0;
  overflow: hidden;
  transition: opacity 0.3s ease;
}

.video-frame {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border-radius: 0;
  box-shadow: inset 0 2px 4px 0 rgba(0, 0, 0, 0.06);
}

/* Add this for better background contrast */
.bg-grey-1 {
  background: #eef2f6 !important;
}

/* Update the row gutter for better spacing */
.row.q-col-gutter-y-md {
  margin: 0;
}

.suggestion-button-container {
  display: flex;
  justify-content: flex-end;
  padding: 8px 0;
}

.suggestion-btn {
  font-weight: 500;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  position: relative;
  right: 0;

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.15);
  }
}
</style>
