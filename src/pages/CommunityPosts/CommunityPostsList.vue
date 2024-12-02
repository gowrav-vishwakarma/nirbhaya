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
        <div class="text-right">
          <q-btn color="primary" class="" @click="goToCommunityPage">
            <q-icon style="font-size: 20px; " name="add_circle"></q-icon>
            <span style="font-size: 10px; font-weight: 800; padding-left: 5px;">
              Suggestion
            </span>
          </q-btn>
        </div>
      </div>

      <div class="create-post-section q-mb-lg">
        <q-card class="create-post-card q-pa-md">
          <div class="row items-center no-wrap">
            <q-avatar size="45px">
              <img
                src="https://icons-for-free.com/iff/png/512/profile+profile+page+user+icon-1320186864367220794.png" />
            </q-avatar>
            <q-btn class="col post-input-btn" flat color="grey-7" @click="createPost">
              <div class="row full-width items-center text-left">
                <span class="text-grey-7" style="font-size: .8em;">What's Post on your mind?</span>
                <q-space />
                <q-btn color="primary" class="q-ml-sm suggestion-btn" @click="createPost">
                  <span style="font-size: 20px; font-weight: 800; padding-right: 5px;">
                    +
                  </span>
                  <span class="text-capitalize" style="font-weight: 800; padding-top: 1px;">
                    Create
                  </span>
                </q-btn>
              </div>
            </q-btn>
          </div>
        </q-card>
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
              <!-- Show image collage or carousel based on showCarousel state -->
              <div v-else-if="post.mediaUrls" class="media-section">
                <!-- Show Carousel when clicked -->
                <template v-if="activeCarouselPost === post.id">
                  <div class="custom-carousel" @wheel="handleScroll" @mouseenter="isHovered = true"
                    @mouseleave="isHovered = false">
                    <div class="carousel-inner" :style="carouselStyle">
                      <div v-for="(url, index) in Array.isArray(post.mediaUrls) ? post.mediaUrls : [post.mediaUrls]"
                        :key="index" class="carousel-slide" :class="{ active: currentIndex === index }">
                        <img :src="url" :alt="`Image ${index + 1}`" class="carousel-image" @click.stop />
                      </div>
                    </div>

                    <!-- Navigation Arrows -->
                    <button class="carousel-arrow prev" @click.stop="prevSlide" v-show="currentIndex > 0">
                      <i class="material-icons">chevron_left</i>
                    </button>
                    <button class="carousel-arrow next" @click.stop="nextSlide" v-show="currentIndex < totalSlides - 1">
                      <i class="material-icons">chevron_right</i>
                    </button>

                    <!-- Dots Navigation -->
                    <div class="carousel-dots">
                      <button v-for="(_, index) in totalSlides" :key="index" class="dot"
                        :class="{ active: currentIndex === index }" @click.stop="goToSlide(index)"></button>
                    </div>

                    <!-- Image Counter -->
                    <div class="carousel-counter">
                      {{ currentIndex + 1 }} / {{ totalSlides }}
                    </div>

                    <!-- Close Button -->
                    <button class="carousel-close" @click.stop="closeCarousel">
                      <i class="material-icons">close</i>
                    </button>
                  </div>
                </template>
                <!-- Show Collage by default -->
                <template v-else>
                  <div class="media-collage">
                    <!-- Single Image -->
                    <template v-if="!Array.isArray(post.mediaUrls) || post.mediaUrls.length === 1">
                      <q-img :src="Array.isArray(post.mediaUrls) ? post.mediaUrls[0] : post.mediaUrls" :ratio="16 / 9"
                        class="single-image" @click="showCarousel(post.id, 0)" />
                    </template>

                    <!-- Two Images -->
                    <template v-else-if="post.mediaUrls.length === 2">
                      <div class="two-images-grid">
                        <div v-for="(url, index) in post.mediaUrls" :key="index" class="grid-image-container">
                          <q-img :src="url" class="grid-image" @click="showCarousel(post.id, index)" />
                        </div>
                      </div>
                    </template>

                    <!-- Three or More Images -->
                    <template v-else>
                      <div class="multi-images-grid">
                        <div class="main-image-container">
                          <q-img :src="post.mediaUrls[0]" class="main-grid-image" @click="showCarousel(post.id, 0)" />
                        </div>
                        <div class="secondary-images-container">
                          <div v-for="(url, index) in post.mediaUrls.slice(1, 3)" :key="index"
                            class="secondary-image-wrapper">
                            <q-img :src="url" class="secondary-grid-image" @click="showCarousel(post.id, index + 1)">
                              <div v-if="index === 1 && post.mediaUrls.length > 3" class="see-all-overlay">
                                <span class="text-white text-weight-bold">+{{ post.mediaUrls.length - 3 }}</span>
                              </div>
                            </q-img>
                          </div>
                        </div>
                      </div>
                    </template>
                  </div>
                </template>
              </div>
            </q-card-section>
          </q-card>
        </div>
      </div>
    </div>
  </q-page>
  <CreatePostDialog v-model="showCreatePostDialog" @post-created="handlePostCreated" />
  <!-- Add Image Gallery Dialog -->
  <q-dialog v-model="showGallery" full-width maximized>
    <q-card class="gallery-dialog">
      <q-card-section class="gallery-header">
        <div class="text-h6 text-white">Images</div>
        <q-btn flat round icon="close" color="white" v-close-popup />
      </q-card-section>

      <q-card-section class="gallery-content">
        <q-carousel v-model="currentSlide" transition-prev="slide-right" transition-next="slide-left" swipeable animated
          control-color="white" navigation arrows height="90vh" class="gallery-carousel">
          <q-carousel-slide v-for="(url, index) in currentGalleryImages" :key="index" :name="index"
            class="gallery-slide">
            <div class="gallery-image-container">
              <q-img :src="url" class="gallery-image" fit="contain" />
            </div>
            <div class="image-counter">{{ index + 1 }} / {{ currentGalleryImages.length }}</div>
          </q-carousel-slide>
        </q-carousel>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, onUnmounted, nextTick, Ref, computed } from 'vue';
import { useQuasar } from 'quasar';
import { api } from 'src/boot/axios';
import { useRouter } from 'vue-router';
import CreatePostDialog from 'src/components/Community/CreatePostDialog.vue';

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
const createPost = () => {
  showCreatePostDialog.value = true;
};

// Add this ref after other refs
const showCreatePostDialog = ref(false);

// Add this to handle post creation
const handlePostCreated = () => {
  loadPosts();
};

// Add Image Gallery Dialog
const showGallery = ref(false);
const currentSlide = ref(0);
const currentGalleryImages = ref<string[]>([]);

// Add function to open image gallery
const openImageGallery = (images: string[], startIndex: number) => {
  if (Array.isArray(images)) {
    currentGalleryImages.value = images;
    currentSlide.value = startIndex;
    showGallery.value = true;
  }
};

// Add these new refs
const activeCarouselPost = ref<number | null>(null);
const carouselSlide = ref(0);

// Update the showCarousel method
const showCarousel = (postId: number, startIndex: number) => {
  activeCarouselPost.value = postId;
  carouselSlide.value = startIndex;
  currentIndex.value = startIndex;
};

const closeCarousel = () => {
  activeCarouselPost.value = null;
  carouselSlide.value = 0;
  currentIndex.value = 0;
};

// Add these new refs and computed properties
const currentIndex = ref(0);
const isTransitioning = ref(false);

const totalSlides = computed(() => {
  const activePost = posts.value.find(p => p.id === activeCarouselPost.value);
  if (!activePost) return 0;
  return Array.isArray(activePost.mediaUrls) ? activePost.mediaUrls.length : 1;
});

// Add these new methods
const prevSlide = () => {
  if (isTransitioning.value) return;
  isTransitioning.value = true;
  currentIndex.value = (currentIndex.value - 1 + totalSlides.value) % totalSlides.value;
  setTimeout(() => {
    isTransitioning.value = false;
  }, 300);
};

const nextSlide = () => {
  if (isTransitioning.value) return;
  isTransitioning.value = true;
  currentIndex.value = (currentIndex.value + 1) % totalSlides.value;
  setTimeout(() => {
    isTransitioning.value = false;
  }, 300);
};

const goToSlide = (index: number) => {
  if (isTransitioning.value) return;
  isTransitioning.value = true;
  currentIndex.value = index;
  setTimeout(() => {
    isTransitioning.value = false;
  }, 300);
};

// Add keyboard navigation
onMounted(() => {
  window.addEventListener('keydown', handleKeydown);
});

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown);
});

const handleKeydown = (event: KeyboardEvent) => {
  if (!activeCarouselPost.value) return;

  switch (event.key) {
    case 'ArrowLeft':
      prevSlide();
      break;
    case 'ArrowRight':
      nextSlide();
      break;
    case 'Escape':
      closeCarousel();
      break;
  }
};

// Add these new refs
const isHovered = ref(false);
const scrollTimeout = ref<number | null>(null);
const scrollThreshold = 50; // Minimum scroll amount to trigger slide change

// Update the handleScroll method
const handleScroll = (event: WheelEvent) => {
  if (!isHovered.value) return;

  // Only handle horizontal scroll (deltaX)
  if (event.deltaX === 0) return; // Ignore vertical scrolling

  // Only prevent default for horizontal scrolling
  if (Math.abs(event.deltaX) > Math.abs(event.deltaY)) {
    event.preventDefault();
  }

  // Clear any existing timeout
  if (scrollTimeout.value) {
    clearTimeout(scrollTimeout.value);
  }

  // Only use deltaX for horizontal scrolling
  const delta = event.deltaX;

  // Determine direction and change slide after threshold is met
  if (Math.abs(delta) > scrollThreshold) {
    if (delta > 0 && currentIndex.value < totalSlides.value - 1) {
      nextSlide();
    } else if (delta < 0 && currentIndex.value > 0) {
      prevSlide();
    }
  }

  // Set a timeout to reset scroll accumulation
  scrollTimeout.value = window.setTimeout(() => {
    scrollTimeout.value = null;
  }, 150);
};

// Update the carouselStyle computed property
const carouselStyle = computed(() => ({
  transform: `translateX(-${currentIndex.value * 100}%)`,
  transition: 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
  willChange: 'transform'
}));

// Clean up on unmount
onUnmounted(() => {
  if (scrollTimeout.value) {
    clearTimeout(scrollTimeout.value);
  }
});
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
  width: 100%;
  aspect-ratio: 16/9;
  height: auto;
  overflow: hidden;
  transition: opacity 0.3s ease;
  margin: 0;
  padding: 0;
}

.video-frame {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border-radius: 0;
  object-fit: cover;
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
  border-radius: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  position: relative;
  right: 0;

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.15);
  }
}

.create-post-card {
  background: white;
  border-radius: 8px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  padding: 8px;
}

.post-input-btn {
  background: #f0f2f5;
  border-radius: 20px;
  height: 45px;
  text-align: left;
  justify-content: flex-start;
}

.media-collage {
  width: 100%;
  margin: 0;
  overflow: hidden;
}

.single-image {
  width: 100%;
  aspect-ratio: 16/9;
  object-fit: cover;
}

.two-images-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4px;
  height: 400px;
}

.grid-image-container {
  height: 100%;
  overflow: hidden;
}

.grid-image {
  height: 100%;
  width: 100%;
  object-fit: cover;
}

.multi-images-grid {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 4px;
  height: 400px;
}

.main-image-container {
  height: 100%;
  overflow: hidden;

  .main-grid-image {
    height: 100%;
    width: 100%;
    object-fit: cover;
  }
}

.secondary-images-container {
  display: grid;
  grid-template-rows: 1fr 1fr;
  gap: 4px;
  height: 100%;
}

.secondary-image-wrapper {
  position: relative;
  height: 100%;
  overflow: hidden;

  .secondary-grid-image {
    height: 100%;
    width: 100%;
    object-fit: cover;
  }
}

.see-all-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;

  span {
    font-size: 1.2rem;
    background: rgba(255, 255, 255, 0.1);
    padding: 4px 12px;
    border-radius: 4px;
  }
}

// Add hover effects
.single-image,
.grid-image,
.main-grid-image,
.secondary-grid-image {
  transition: transform 0.3s ease;
  cursor: pointer;

  &:hover {
    transform: scale(1.05);
  }
}

// Responsive adjustments
@media (max-width: 600px) {

  .single-image,
  .two-images-grid,
  .multi-images-grid {
    height: 300px;
  }
}

// Replace the problematic :deep(.q-img) styles with this:

:deep(.q-img) {
  background-color: #f3f4f6;
}

:deep(.q-img__loading .q-spinner) {
  color: $primary;
}

// Add these new styles for the gallery
.gallery-dialog {
  background: rgba(0, 0, 0, 0.9);
  max-width: 100vw;
  max-height: 100vh;
}

.gallery-header {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  z-index: 2000;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 20px;
  background: linear-gradient(to bottom, rgba(0, 0, 0, 0.7) 0%, rgba(0, 0, 0, 0) 100%);
}

.gallery-content {
  padding: 0;
  height: 100vh;
}

.gallery-carousel {
  background: transparent;
}

.gallery-slide {
  padding: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.gallery-image-container {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 40px 0;
}

.gallery-image {
  max-width: 100%;
  max-height: calc(100vh - 100px);
  object-fit: contain;
}

.image-counter {
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.6);
  color: white;
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 14px;
}

.media-section {
  position: relative;
}

.carousel-view {
  background: transparent;
}

:deep(.q-carousel__slides-container) {
  border-radius: 0;
}

:deep(.q-carousel__arrow) {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: white;
  font-size: 24px;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  margin: 0 16px;
  transition: all 0.3s ease;
}

:deep(.q-carousel__arrow:hover) {
  background: rgba(255, 255, 255, 0.2);
  transform: scale(1.1);
}

:deep(.q-carousel__arrow--prev) {
  left: 0;
}

:deep(.q-carousel__arrow--next) {
  right: 0;
}

:deep(.q-carousel__navigation) {
  background: linear-gradient(to top, rgba(0, 0, 0, 0.5), transparent);
  padding: 16px 0;
}

:deep(.q-carousel__navigation-inner) {
  gap: 8px;
}

// Update mobile styles
@media (max-width: 600px) {
  :deep(.q-carousel__arrow) {
    width: 40px;
    height: 40px;
    margin: 0 8px;
  }
}

.carousel-slide {
  padding: 0;
  height: 400px;
  background: #000;
}

.full-image {
  height: 100%;
  width: 100%;
}

// Update hover effects to trigger on the collage container
.media-collage {
  cursor: pointer;
  transition: opacity 0.3s ease;

  &:hover {
    opacity: 0.9;
  }
}

// Responsive adjustments
@media (max-width: 600px) {
  .carousel-slide {
    height: 300px;
  }
}

// Update/Add these carousel styles
.carousel-container {
  position: relative;
  background: #000;
  border-radius: 0;
  overflow: hidden;
}

.carousel-view {
  background: transparent;
}

:deep(.q-carousel__slides-container) {
  border-radius: 0;
}

:deep(.q-carousel__arrow) {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: white;
  font-size: 24px;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  margin: 0 16px;
  transition: all 0.3s ease;
}

:deep(.q-carousel__arrow:hover) {
  background: rgba(255, 255, 255, 0.2);
  transform: scale(1.1);
}

:deep(.q-carousel__arrow--prev) {
  left: 0;
}

:deep(.q-carousel__arrow--next) {
  right: 0;
}

:deep(.q-carousel__navigation) {
  background: linear-gradient(to top, rgba(0, 0, 0, 0.5), transparent);
  padding: 16px 0;
}

:deep(.q-carousel__navigation-inner) {
  gap: 8px;
}

.carousel-slide {
  padding: 0;
  height: 400px;
  background: #000;
}

.image-wrapper {
  height: 100%;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.full-image {
  max-height: 100%;
  width: auto;
  object-fit: contain;
  border-radius: 0;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.carousel-controls {
  position: absolute;
  top: 16px;
  right: 16px;
  left: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  z-index: 5000;
}

.image-counter {
  background: rgba(0, 0, 0, 0.6);
  color: white;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 14px;
  backdrop-filter: blur(4px);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.close-btn {
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: all 0.3s ease;

  &:hover {
    background: rgba(0, 0, 0, 0.8);
    transform: scale(1.1);
  }
}

// Add smooth transitions for carousel slides
:deep(.q-carousel__slide) {
  transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}

// Custom transitions for slide movement
.jump-left-enter-active,
.jump-left-leave-active,
.jump-right-enter-active,
.jump-right-leave-active {
  transition: transform 0.5s cubic-bezier(0.4, 0, 0.2, 1);
  will-change: transform;
  position: absolute;
}

.jump-left-enter-from {
  transform: translateX(100%);
}

.jump-left-leave-to {
  transform: translateX(-100%);
}

.jump-right-enter-from {
  transform: translateX(-100%);
}

.jump-right-leave-to {
  transform: translateX(100%);
}

// Responsive adjustments
@media (max-width: 600px) {
  .carousel-slide {
    height: 300px;
  }

  .carousel-view {
    :deep(.q-carousel__arrow) {
      width: 40px;
      height: 40px;
      margin: 0 8px;
    }
  }

  .image-counter {
    font-size: 12px;
    padding: 4px 10px;
  }
}

.custom-carousel {
  position: relative;
  width: 100%;
  height: auto;
  background: #000;
  overflow: hidden;
  border-radius: 0;
  cursor: grab;

  &:active {
    cursor: grabbing;
  }
}

.carousel-inner {
  display: flex;
  width: 100%;
  will-change: transform;
}

.carousel-slide {
  min-width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  opacity: 0.3;
  transition: opacity 0.5s ease;
  aspect-ratio: 16/9;

  &.active {
    opacity: 1;
  }
}

.carousel-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  pointer-events: none;
  user-select: none;
  border-radius: 0;
}

.carousel-arrow {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 44px;
  height: 44px;
  z-index: 10;
  background: transparent;
  border: none;
  color: transparent;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  opacity: 0;

  &:hover {
    background: transparent;
    transform: translateY(-50%);
  }

  &.prev {
    left: 0;
    width: 40%;
    height: 100%;
  }

  &.next {
    right: 0;
    width: 40%;
    height: 100%;
  }

  i {
    display: none;
  }
}

.carousel-dots {
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 6px;
  padding: 8px 12px;
  background: rgba(0, 0, 0, 0.15);
  backdrop-filter: blur(8px);
  border-radius: 40px;
  z-index: 10;
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: all 0.3s ease;

  &:hover {
    background: rgba(0, 0, 0, 0.25);
  }
}

.dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.4);
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  padding: 0;
  margin: 0;

  &:hover {
    background: rgba(255, 255, 255, 0.6);
    transform: scale(1.1);
  }

  &.active {
    width: 10px;
    height: 6px;
    border-radius: 3px;
    background: white;
    transform: none;
    box-shadow: 0 0 10px rgba(255, 255, 255, 0.3);
  }
}

// Update mobile styles for dots
@media (max-width: 600px) {
  .carousel-dots {
    bottom: 16px;
    gap: 4px;
    padding: 6px 10px;
  }

  .dot {
    width: 6px;
    height: 6px;

    &.active {
      width: 10px;
      height: 6px;
    }
  }
}

.carousel-counter {
  position: absolute;
  top: 16px;
  left: 16px;
  background: rgba(0, 0, 0, 0.4);
  color: white;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 14px;
  backdrop-filter: blur(4px);
  z-index: 10;
}

.carousel-close {
  position: absolute;
  top: 13px;
  right: 10px;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(4px);
  border: none;
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  z-index: 10;

  &:hover {
    background: rgba(0, 0, 0, 0.6);
    transform: scale(1.1);
  }

  i {
    font-size: 20px;
  }
}

// Responsive adjustments
@media (max-width: 600px) {
  .carousel-arrow {
    width: 36px;
    height: 36px;

    i {
      font-size: 20px;
    }
  }

  .carousel-counter {
    font-size: 12px;
    padding: 4px 10px;
  }

  .dot {
    width: 6px;
    height: 6px;

    &.active {      width: 10px;
      height: 6px;
    }
  }
}
</style>
