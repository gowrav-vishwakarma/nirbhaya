<template>
  <q-page class="bg-grey-1">
    <div class="container q-pa-md" v-if="isUserPermitted">
      <!-- Add Suggestion Button -->
      <!-- <div class="suggestion-button-container q-mb-md">
        <q-btn color="primary" icon="add_circle" label="Add Suggestion" class="suggestion-btn"
          @click="goToCommunityPage" />
      </div> -->

      <!-- Header -->
      <div class="row items-center justify-between q-pa-md">
        <div>
          <h4 class="text-h5 text-weight-bold q-my-none text-primary">
            Community Posts
          </h4>
          <p class="text-grey-7 q-mt-sm">Stay connected with your community</p>
        </div>
        <div class="text-right">
          <q-btn color="primary" class="" @click="goToCommunityPage" style="border-radius: 9px">
            <q-icon style="font-size: 20px" name="add_circle"></q-icon>
            <span style="font-size: 10px; font-weight: 800; padding-left: 5px">
              Suggestion
            </span>
          </q-btn>
        </div>
      </div>

      <div class="q-mb-lg" v-if="userStore.user.isAmbassador" style="margin-top: -15px">
        <q-card class="create-post-card q-pa-md">
          <div class="row items-center no-wrap">
            <q-avatar size="45px">
              <img
                src="https://icons-for-free.com/iff/png/512/profile+profile+page+user+icon-1320186864367220794.png" />
            </q-avatar>
            <q-btn class="col post-input-btn" flat color="grey-7">
              <div class="row full-width items-center text-left">
                <span class="text-grey-7" style="font-size: 0.8em">What's Post on your mind?</span>
                <q-space />
                <q-btn color="primary" class="q-ml-sm suggestion-btn" @click="createPost">
                  <span style="
                      font-size: 20px;
                      font-weight: 800;
                      padding-right: 5px;
                    ">
                    +
                  </span>
                  <span class="text-capitalize" style="font-weight: 800; padding-top: 1px">
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
      <div v-else class="row q-col-gutter-y-md" style="margin-top: -30px">
        <div v-for="(post, index) in posts" :key="post.id" class="col-12"
          :ref="index === posts.length - 1 ? (el) => { lastPostRef = el as HTMLElement } : undefined">
          <q-card flat class="post-card">
            <!-- User Info Section -->
            <q-card-section class="q-pb-none">
              <div class="row items-center">
                <q-avatar size="48px" class="shadow-2">
                  <img src="/sos_logo_1080_1080.png" style="object-fit: cover" />
                </q-avatar>
                <div class="q-ml-md">
                  <div class="text-weight-bold text-capitalize" style="font-size: 16px">
                    {{
                      post.userName == 'SOS Bharat Community'
                        ? 'SOS Bharat Community'
                        : post.userName
                    }}
                  </div>
                  <div class="text-caption text-grey-7">
                    <q-icon name="schedule" size="xs" class="q-mr-xs" />
                    {{ formatDate(post.createdAt) }}
                  </div>
                </div>
              </div>
            </q-card-section>

            <!-- Post Content -->
            <q-card-section style="padding: 10px 10px 0px 10px">
              <div class="text-h5 text-weight-bold text-primary q-mb-sm" style="font-size: 16px">
                {{ post.title }}
              </div>
              <div class="text-body1 post-description">
                {{
                  showFullDescription[post.id.toString()]
                    ? post.description
                    : truncateText(post.description, 15)
                }}
                <span v-if="post.description.split(' ').length > 10" @click="toggleDescription(post.id)"
                  class="read-more-link">
                  {{
                    showFullDescription[post.id.toString()]
                      ? 'Read Less'
                      : 'Read More'
                  }}
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
              <div v-if="post.videoUrl" class="video-container"
                v-intersection="onVideoIntersection(post.id.toString())">
                <iframe :key="getVideoUrl(post.id.toString(), post.videoUrl)"
                  :src="getVideoUrl(post.id.toString(), post.videoUrl)" :id="`video-${post.id}`" frameborder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowfullscreen class="video-frame">
                </iframe>
              </div>
              <!-- Show image collage or carousel based on showCarousel state -->
              <div v-else-if="post.mediaUrls && post.mediaUrls.length" class="media-section">
                <!-- Move controls inside the carousel template -->
                <template v-if="activeCarouselPost === post.id.toString()">
                  <!-- Dots Navigation -->
                  <div class="carousel-dots">
                    <button v-for="index in currentImageCount.total" :key="index" class="dot"
                      :class="{ active: activeDotIndex === index - 1 }" @click.stop="goToSlide(index - 1)"></button>
                  </div>

                  <!-- Image Counter -->
                  <div class="carousel-counter">
                    {{ currentVisibleImage }} / {{ currentImageCount.total }}
                  </div>

                  <!-- Close Button -->
                  <button class="carousel-close" @click.stop="closeCarousel">
                    <i class="material-icons">close</i>
                  </button>

                  <div class="custom-carousel" ref="carousel" @touchstart="handleTouchStart"
                    @touchmove="handleTouchMove" @touchend="handleTouchEnd">
                    <div class="carousel-inner" :style="carouselStyle">
                      <div v-for="(url, index) in Array.isArray(post.mediaUrls)
                        ? post.mediaUrls.map((url) => imageCdn + url)
                        : [imageCdn + post.mediaUrls]" :key="index" class="carousel-slide"
                        :class="{ active: currentIndex === index }" v-intersection="onCarouselImageIntersection(index)"
                        ref="carouselImages">
                        <img :src="url" :alt="`Image ${index + 1}`" class="carousel-image" @click.stop />
                      </div>
                    </div>

                    <!-- Navigation Arrows -->
                    <button class="carousel-arrow prev" @click.stop="prevSlide" v-show="currentIndex > 0">
                      <i class="material-icons">chevron_left</i>
                    </button>
                    <button class="carousel-arrow next" @click.stop="nextSlide" v-show="!isLastSlide">
                      <i class="material-icons">chevron_right</i>
                    </button>
                  </div>
                </template>

                <!-- Show Collage by default -->
                <template v-else>
                  <div class="media-collage">
                    <!-- Single Image -->
                    <template v-if="
                      !Array.isArray(post.mediaUrls) ||
                      post.mediaUrls.length === 1
                    ">
                      <q-img :src="imageCdn +
                        (Array.isArray(post.mediaUrls)
                          ? post.mediaUrls[0]
                          : post.mediaUrls)
                        " :ratio="16 / 9" class="single-image" @click="showCarousel(post.id, 0)" />
                    </template>

                    <!-- Two Images -->
                    <template v-else-if="post.mediaUrls.length === 2">
                      <div class="two-images-grid">
                        <div v-for="(url, index) in post.mediaUrls" :key="index" class="grid-image-container">
                          <q-img :src="imageCdn + url" class="grid-image" @click="showCarousel(post.id, index)" />
                        </div>
                      </div>
                    </template>

                    <!-- Three or More Images -->
                    <template v-else>
                      <div class="multi-images-grid">
                        <div class="main-image-container">
                          <q-img :src="imageCdn + post.mediaUrls[0]" class="main-grid-image"
                            @click="showCarousel(post.id, 0)" />
                        </div>
                        <div class="secondary-images-container">
                          <div v-for="(url, index) in post.mediaUrls.slice(1, 3)" :key="index"
                            class="secondary-image-wrapper">
                            <q-img :src="imageCdn + url" class="secondary-grid-image"
                              @click="showCarousel(post.id, index + 1)">
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
              <!-- Engagement Actions -->
              <PostEngagement :post="post" :userInteractionRules="userInteractionRules"
                @update:post="updatePost($event)" />
            </q-card-section>
          </q-card>
        </div>
      </div>

      <!-- Loading indicator for infinite scroll -->
      <div v-if="isLoading" class="col-12 flex justify-center q-pa-md">
        <q-spinner-dots color="primary" size="40" />
      </div>

      <!-- No more posts message -->
      <div v-if="!hasMore && posts.length > 0" class="col-12 text-center q-pa-md text-grey-7">
        No more posts to load
      </div>
    </div>
    <div v-else class="q-pt-lg q-px-md">
      <q-banner dense inline-actions class="text-white bg-primary" style="border-radius: 10px">

        <div class="text-h5 q-pa-sm">
          <q-icon flat color="white" name="warning" />
          <span>
            Access Denied: You must be at least 13 years old to view this
            page.
          </span>
        </div>
      </q-banner>
    </div>
  </q-page>
  <CreatePostDialog v-model="showCreatePostDialog" @post-created="handlePostCreated" v-if="isUserPermitted" />
</template>

<script setup lang="ts">
import { ref, onMounted, watch, onUnmounted, computed, nextTick } from 'vue';
import { useQuasar } from 'quasar';
import { api } from 'src/boot/axios';
import { useRouter } from 'vue-router';
import CreatePostDialog from 'src/components/Community/CreatePostDialog.vue';
import { useUserStore } from 'src/stores/user-store';
// import { communityPostService } from 'src/services/communityPostService';
import type { CommunityPost } from 'src/types/CommunityPost';
import PostEngagement from 'src/pages/CommunityPosts/PostEngagement.vue';

// Add these type definitions at the top of the script section
interface Post extends Omit<CommunityPost, 'liked'> {
  userName: string;
  wasLiked: boolean;
  liked: boolean;
}

// Add this interface after the Post interface
interface UserInteractionLimits {
  dailyLikeLimit: number;
  dailyCommentLimit: number;
  dailyPostLimit: number;
  usedLikeCount: number;
  usedCommentCount: number;
  usedPostCount: number;
}

const userStore = useUserStore();

const imageCdn =
  'http://xavoc-technocrats-pvt-ltd.blr1.cdn.digitaloceanspaces.com/';

const $q = useQuasar();
const posts = ref<Post[]>([]);
const userInteractionRules = ref();

// Add this new ref for tracking expanded descriptions
const showFullDescription = ref<{ [key: string]: boolean }>({});

// Add ref for tracking video visibility
const videoVisibility = ref<Record<string, boolean>>({});

// Add loading state
const loading = ref(true);

// Add a ref to track the currently playing video
const currentlyPlayingVideo = ref<string | null>(null);
const isUserPermitted = ref(false);

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
      return `${diffInMinutes} ${diffInMinutes === 1 ? 'minute' : 'minutes'
        } ago`;
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
      hour12: true,
    };

    return new Intl.DateTimeFormat('en-US', options).format(postDate);
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Date error';
  }
};

// Add these new refs near the top of the script section
const userLocation = ref({
  latitude: null as number | null,
  longitude: null as number | null,
});

// Update the loadPosts function
const loadPosts = async (loadMore = false) => {
  if (isLoading.value || (!loadMore && !hasMore.value)) return;

  try {
    isLoading.value = true;

    // Get user's location if not already available
    if (!userLocation.value.latitude || !userLocation.value.longitude) {
      try {
        const position = await new Promise<GeolocationPosition>(
          (resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject);
          }
        );

        userLocation.value = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        };
      } catch (error) {
        console.warn('Could not get user location:', error);
      }
    }

    const response = await api.get('/posts/community-posts', {
      params: {
        status: 'active',
        userId: userStore.user?.id || null,
        page: page.value,
        limit: limit.value,
        latitude: userLocation.value.latitude,
        longitude: userLocation.value.longitude,
      },
    });

    let postsData: Post[] = [];
    if (Array.isArray(response.data)) {
      postsData = response.data;
    } else if (response.data.data && Array.isArray(response.data.data)) {
      postsData = response.data.data;
    }

    // Transform the posts data
    const transformedPosts = postsData.map((post) => ({
      ...post,
      wasLiked: post.wasLiked || post.liked || false,
      liked: post.wasLiked || post.liked || false,
    }));

    // Update posts array based on whether we're loading more or not
    if (loadMore) {
      posts.value = [...posts.value, ...transformedPosts];
    } else {
      posts.value = transformedPosts;
    }

    // Update pagination state
    hasMore.value = transformedPosts.length === limit.value;
    if (hasMore.value) {
      page.value++;
    }
  } catch (error) {
    console.error('Error loading posts:', error);
    $q.notify({
      color: 'negative',
      message: 'Failed to load posts',
      icon: 'error',
    });
  } finally {
    isLoading.value = false;
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

// Update the toggleDescription method
const toggleDescription = (postId: string | number) => {
  const key = typeof postId === 'string' ? postId : postId.toString();
  showFullDescription.value[key] = !showFullDescription.value[key];
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
const getVideoUrl = (postId: string, url: string) => {
  const baseUrl = getYouTubeEmbedUrl(url);
  return `${baseUrl}?enablejsapi=1&rel=0&modestbranding=1&mute=1`;
};

// Update the controlVideo function to be more reliable
const controlVideo = (postId: string, command: 'play' | 'pause') => {
  const iframe = document.getElementById(
    `video-${postId}`
  ) as HTMLIFrameElement;
  if (iframe && iframe.contentWindow) {
    try {
      iframe.contentWindow.postMessage(
        JSON.stringify({
          event: 'command',
          func: command === 'play' ? 'playVideo' : 'pauseVideo',
          args: [],
        }),
        '*'
      );
    } catch (error) {
      console.error('Error controlling video:', error);
    }
  }
};

// Update the onVideoIntersection handler with more precise center detection
const onVideoIntersection = (postId: string) => ({
  handler: (entry?: IntersectionObserverEntry) => {
    if (!entry) return false;

    try {
      const rect = entry.boundingClientRect;
      const windowHeight = window.innerHeight;

      // Calculate how centered the video is in the viewport
      const elementCenter = rect.top + rect.height / 2;
      const viewportCenter = windowHeight / 2;
      const distanceFromCenter = Math.abs(elementCenter - viewportCenter);

      // Consider "centered" if within 100px of viewport center
      const isCentered = distanceFromCenter < 100;
      const isVisible = entry.isIntersecting;

      videoVisibility.value[postId] = isVisible && isCentered;

      if (isVisible && isCentered) {
        // Pause any currently playing video
        if (
          currentlyPlayingVideo.value !== null &&
          currentlyPlayingVideo.value !== postId
        ) {
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
    rootMargin: '-30% 0px', // This creates a smaller "center" zone
  },
});

const calculateAge = (dob: string): number => {
  const dobDate = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - dobDate.getFullYear();
  const monthDiff = today.getMonth() - dobDate.getMonth();
  if (
    monthDiff < 0 ||
    (monthDiff === 0 && today.getDate() < dobDate.getDate())
  ) {
    age--;
  }

  return age;
};

// Add onMounted hook back
onMounted(() => {
  const dob = userStore.user?.dob;
  if (dob) {
    isUserPermitted.value = calculateAge(dob) >= 13;
  } else {
    isUserPermitted.value = false;
  }

  loadPosts();
  getUserInteraction();
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
  if (!userInteractionRules.value) {
    return;
  }

  if (
    userInteractionRules.value.usedPostCount >=
    userInteractionRules.value.dailyPostLimit
  ) {
    console.log('1111111111111111');
    $q.notify({
      message: `You've reached your daily post limit of ${userInteractionRules.value.dailyPostLimit} posts`,
      color: 'gray',
      position: 'top-right',
    });

    return;
  }

  showCreatePostDialog.value = true;
};

// Add this ref after other refs
const showCreatePostDialog = ref(false);

// Add this method to handle successful post creation
const handlePostCreated = async () => {
  await loadPosts();
  showCreatePostDialog.value = false;
  // Refresh interaction rules after post creation
  await updateInteractionRules();
};

// Add these new refs
const activeCarouselPost = ref<string | null>(null);
const carouselSlide = ref(0);

// First, add a computed property to check if we're on the last slide
const isLastSlide = computed(() => {
  return currentIndex.value === totalSlides.value - 1;
});

// Update the showCarousel method to handle number conversion
const showCarousel = (postId: string | number, startIndex: number) => {
  const numericPostId =
    typeof postId === 'string' ? parseInt(postId, 10) : postId;
  activeCarouselPost.value = numericPostId.toString();
  currentIndex.value = startIndex;

  const post = posts.value.find((p) => p.id === numericPostId);
  if (post && post.mediaUrls) {
    const imageData = {
      postId: numericPostId,
      startIndex: startIndex + 1,
      totalImages: Array.isArray(post.mediaUrls) ? post.mediaUrls.length : 1,
      allImages: Array.isArray(post.mediaUrls)
        ? post.mediaUrls.map((url, idx) => ({
          index: idx + 1,
          url: imageCdn + url,
          isActive: idx === startIndex,
        }))
        : [{ index: 1, url: imageCdn + post.mediaUrls, isActive: true }],
      activeDot: startIndex,
    };
    console.log('Carousel Opened:', imageData);
  }
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
  const activePost = posts.value.find(
    (p) => p.id.toString() === activeCarouselPost.value
  );
  if (!activePost) return 0;
  return Array.isArray(activePost.mediaUrls) ? activePost.mediaUrls.length : 1;
});

// Add this computed property to track current image count
const currentImageCount = computed(() => {
  const activePost = posts.value.find(
    (p) => p.id.toString() === activeCarouselPost.value
  );
  if (!activePost?.mediaUrls) return { current: 0, total: 0 };

  return {
    current: currentIndex.value + 1,
    total: Array.isArray(activePost.mediaUrls)
      ? activePost.mediaUrls.length
      : 1,
  };
});

// Add this computed property to track active dots
const activeDotIndex = computed(() => {
  return currentVisibleImage.value
    ? currentVisibleImage.value - 1
    : currentIndex.value;
});

// Update the slide navigation methods
const goToSlide = (index: number) => {
  if (isTransitioning.value) return;
  isTransitioning.value = true;
  currentIndex.value = index;
  currentVisibleImage.value = index + 1;

  console.log('Go To Slide:', {
    index: index + 1,
    total: totalSlides.value,
    currentVisible: currentVisibleImage.value,
  });

  setTimeout(() => {
    isTransitioning.value = false;
  }, 300);
};

const prevSlide = () => {
  if (isTransitioning.value) return;
  isTransitioning.value = true;
  currentIndex.value =
    (currentIndex.value - 1 + totalSlides.value) % totalSlides.value;
  currentVisibleImage.value = currentIndex.value + 1;

  console.log('Previous Slide:', {
    newIndex: currentIndex.value + 1,
    currentVisible: currentVisibleImage.value,
  });

  setTimeout(() => {
    isTransitioning.value = false;
  }, 300);
};

const nextSlide = () => {
  if (isTransitioning.value) return;
  isTransitioning.value = true;
  currentIndex.value = (currentIndex.value + 1) % totalSlides.value;
  currentVisibleImage.value = currentIndex.value + 1;

  console.log('Next Slide:', {
    newIndex: currentIndex.value + 1,
    currentVisible: currentVisibleImage.value,
  });

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

// Update the handleScroll method

// Update the carouselStyle computed property
const carouselStyle = computed(() => ({
  transform: `translate3d(-${currentIndex.value * 100}%, 0, 0)`,
  willChange: 'transform',
}));

// Add these new refs for touch handling
const touchStart = ref(0);
const touchEnd = ref(0);
const carousel = ref<HTMLElement | null>(null);

// Add these new methods for touch handling
const handleTouchStart = (event: TouchEvent) => {
  touchStart.value = event.touches[0].clientX;
  // Reset transition during touch
  if (carousel.value) {
    carousel.value.style.transition = 'none';
  }
};

const handleTouchMove = (event: TouchEvent) => {
  if (!touchStart.value || !carousel.value) return;

  const currentX = event.touches[0].clientX;
  const diff = touchStart.value - currentX;
  const translateX =
    -(currentIndex.value * 100) - (diff / carousel.value.offsetWidth) * 100;

  // Apply transform directly for smoother movement
  carousel.value.style.transform = `translate3d(${translateX}%, 0, 0)`;
  touchEnd.value = currentX;
};

const handleTouchEnd = () => {
  if (!touchStart.value || !touchEnd.value || !carousel.value) return;

  // Restore transition
  carousel.value.style.transition = 'transform 0.3s ease-out';

  const diff = touchStart.value - touchEnd.value;
  const threshold = carousel.value.offsetWidth * 0.2; // 20% of width

  if (Math.abs(diff) > threshold) {
    if (diff > 0 && currentIndex.value < totalSlides.value - 1) {
      nextSlide();
    } else if (diff < 0 && currentIndex.value > 0) {
      prevSlide();
    } else {
      // Reset to current slide if at bounds
      carousel.value.style.transform = `translate3d(-${currentIndex.value * 100
        }%, 0, 0)`;
    }
  } else {
    // Reset to current slide if threshold not met
    carousel.value.style.transform = `translate3d(-${currentIndex.value * 100
      }%, 0, 0)`;
  }

  touchStart.value = 0;
  touchEnd.value = 0;
};

// Update the template to add touch handlers and ref

// Then update the carousel section in the template where the images are displayed

// Add these new refs
const currentVisibleImage = ref<number | null>(null);
const carouselImages = ref<HTMLElement[]>([]);

// Update the intersection handler method to fix the type error and track image data
const onCarouselImageIntersection = (index: number) => ({
  handler: (entry?: IntersectionObserverEntry) => {
    if (!entry) return false;

    if (entry.isIntersecting) {
      const activePost = posts.value.find(
        (p) => p.id.toString() === activeCarouselPost.value
      );
      const imageData = {
        index: index + 1,
        total: totalSlides.value,
        isIntersecting: entry.isIntersecting,
        intersectionRatio: entry.intersectionRatio,
        currentImage: activePost?.mediaUrls
          ? Array.isArray(activePost.mediaUrls)
            ? activePost.mediaUrls[index]
            : activePost.mediaUrls
          : null,
        activeDot: currentIndex.value,
        postId: activeCarouselPost.value,
      };

      console.log('Image Data:', imageData);
      currentVisibleImage.value = index + 1;
    }
    return true;
  },
  cfg: {
    threshold: [0.5], // Fix type error by making threshold an array
  },
});

// Add a watcher to log changes in current index
watch(currentIndex, (newIndex) => {
  const activePost = posts.value.find(
    (p) => p.id.toString() === activeCarouselPost.value
  );
  console.log('Carousel State:', {
    currentIndex: newIndex + 1,
    totalImages: totalSlides.value,
    activeDot: newIndex,
    currentImage: activePost?.mediaUrls
      ? Array.isArray(activePost.mediaUrls)
        ? activePost.mediaUrls[newIndex]
        : activePost.mediaUrls
      : null,
    postId: activeCarouselPost.value,
  });
});

// Add this method
const updatePost = async (updatedPost: Post) => {
  const index = posts.value.findIndex((p) => p.id === updatedPost.id);
  if (index !== -1) {
    posts.value[index] = {
      ...updatedPost,
      wasLiked: updatedPost.wasLiked || updatedPost.liked,
      liked: updatedPost.wasLiked || updatedPost.liked,
    };
    // Refresh interaction rules after post update
    await updateInteractionRules();
  }
};

// Add these new refs for pagination
const page = ref(1);
const limit = ref(5);
const hasMore = ref(true);
const isLoading = ref(false);

// Add intersection observer for infinite scroll
const lastPostRef = ref<HTMLElement | null>(null);

const observeLastPost = () => {
  const observer = new IntersectionObserver(
    async ([entry]) => {
      if (entry?.isIntersecting && hasMore.value && !isLoading.value) {
        await loadPosts(true);
      }
    },
    {
      rootMargin: '100px',
    }
  );

  if (lastPostRef.value) {
    observer.observe(lastPostRef.value);
  }

  return () => {
    if (lastPostRef.value) {
      observer.unobserve(lastPostRef.value);
    }
  };
};

// Watch posts array to update the observer
watch(
  () => posts.value,
  () => {
    nextTick(() => {
      observeLastPost();
    });
  }
);

const getUserInteraction = async () => {
  const res = await api.get(`/posts/user-interaction/${userStore.user?.id}`);
  userInteractionRules.value = res.data;
  console.log('res........', userInteractionRules.value);
};

// Add this method to update interaction rules
const updateInteractionRules = async () => {
  try {
    const res = await api.get(`/posts/user-interaction/${userStore.user?.id}`);
    userInteractionRules.value = res.data;
  } catch (error) {
    console.error('Error updating interaction rules:', error);
  }
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
  box-shadow: 0 -10px 10px -10px rgba(0, 0, 0, 0.3),
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
  box-shadow: 0 -10px 15px -10px rgba(0, 0, 0, 0.4),
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
  margin-right: -10px;
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
  border-radius: 0px;
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
  background: linear-gradient(to bottom,
      rgba(0, 0, 0, 0.7) 0%,
      rgba(0, 0, 0, 0) 100%);
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
  object-fit: cover;
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
  object-fit: cover;
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
  -webkit-overflow-scrolling: touch;
  transform: translateZ(0);
  backface-visibility: hidden;
  perspective: 1000px;
  scroll-behavior: smooth;
}

.carousel-inner {
  display: flex;
  width: 100%;
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  transform: translate3d(0, 0, 0);
  backface-visibility: hidden;
  perspective: 1000px;
}

.carousel-slide {
  min-width: 100%;
  width: 100%;
  flex: 0 0 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  transform: translateZ(0);
  backface-visibility: hidden;
  will-change: transform;
  -webkit-transform: translateZ(0);
  -webkit-backface-visibility: hidden;
}

.carousel-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  pointer-events: none;
  user-select: none;
  border-radius: 0;
  -webkit-user-drag: none;
  transform: translateZ(0);
  backface-visibility: hidden;
  -webkit-transform: translateZ(0);
  -webkit-backface-visibility: hidden;
}

.carousel-arrow {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(0, 0, 0, 0.4);
  color: white;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  z-index: 10;
  opacity: 0.8;

  &:hover {
    background: rgba(0, 0, 0, 0.6);
    opacity: 1;
    transform: translateY(-50%) scale(1.1);
  }

  &.prev {
    left: 16px;
  }

  &.next {
    right: 16px;
  }

  i {
    font-size: 24px;
  }
}

@media (max-width: 600px) {
  .carousel-arrow {
    width: 36px;
    height: 36px;

    &.prev {
      left: 8px;
    }

    &.next {
      right: 8px;
    }

    i {
      font-size: 20px;
    }
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
  z-index: 1000;
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
  z-index: 1000;
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
  z-index: 1000;

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

    &.active {
      width: 10px;
      height: 6px;
    }
  }
}

// Add these new styles for better touch handling
@media (max-width: 600px) {
  .custom-carousel {
    overflow-x: auto;
    scroll-snap-type: x mandatory;
    -webkit-overflow-scrolling: touch;
    scroll-behavior: smooth;

    // Hide scrollbar in different browsers
    scrollbar-width: none;
    /* Firefox */
    -ms-overflow-style: none;

    /* IE and Edge */
    &::-webkit-scrollbar {
      display: none;
      /* Chrome, Safari and Opera */
    }
  }

  .carousel-slide {
    scroll-snap-align: center;
    touch-action: pan-x pan-y;
    scroll-snap-stop: always;
  }

  .carousel-inner {
    transform: none !important;
    transition: none !important;
    scroll-padding: 0 10%;
  }
}

.image-counter-badge {
  position: absolute;
  top: 16px;
  left: 16px;
  background: rgba(0, 0, 0, 0.6);
  color: white;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 14px;
  z-index: 20;
  backdrop-filter: blur(4px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  pointer-events: none;
}

@media (max-width: 600px) {
  .image-counter-badge {
    top: 12px;
    left: 12px;
    font-size: 12px;
    padding: 4px 10px;
  }
}

.debug-info {
  position: absolute;
  bottom: 16px;
  right: 16px;
  background: rgba(0, 0, 0, 0.6);
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  z-index: 20;
}

.engagement-btn {
  padding: 4px 12px;
  border-radius: 20px;
  min-width: 80px;

  &:hover {
    background: rgba(0, 0, 0, 0.05);
  }
}

.comments-section {
  border-top: 1px solid rgba(0, 0, 0, 0.12);
  padding-top: 16px;
}

.comment-bubble {
  background: #f5f5f5;
  padding: 8px 12px;
  border-radius: 12px;
  display: inline-block;
}

.comment-item {
  transition: all 0.2s ease;

  &:hover {
    background: rgba(0, 0, 0, 0.02);
  }
}

// Add responsive styles
@media (max-width: 600px) {
  .engagement-btn {
    min-width: 60px;
    padding: 4px 8px;
  }
}

.engagement-section {
  padding: 12px 16px;
  border-top: 1px solid rgba(0, 0, 0, 0.08);
  background: #ffffff;
}

.engagement-btn {
  padding: 8px 12px;
  border-radius: 20px;
  min-width: 80px;
  transition: all 0.3s ease;

  &:hover {
    background: rgba(0, 0, 0, 0.05);
    transform: translateY(-1px);
  }

  &.liked {
    animation: likeAnimation 0.3s ease;
  }
}

@keyframes likeAnimation {
  0% {
    transform: scale(1);
  }

  50% {
    transform: scale(1.2);
  }

  100% {
    transform: scale(1);
  }
}

.share-btn {
  padding: 8px 16px;
  border-radius: 20px;
  transition: all 0.3s ease;

  &:hover {
    background: rgba(0, 0, 0, 0.05);
    transform: translateY(-1px);
  }
}

.engagement-count {
  font-size: 0.9rem;
  font-weight: 500;
}

.comments-section {
  border-top: 1px solid rgba(0, 0, 0, 0.08);
  margin-top: 12px;
  padding-top: 16px;
}

.comment-input-container {
  background: #f8f9fa;
  border-radius: 12px;
  padding: 8px;
}

.comment-input {
  :deep(.q-field__control) {
    border-radius: 20px;
    background: white;
  }

  :deep(.q-field__marginal) {
    height: 40px;
  }
}

.send-btn {
  margin-left: 8px;
  background: $primary;
  color: white;

  &:hover {
    background: darken($primary, 5%);
  }
}

.comment-bubble {
  background: #f0f2f5;
  padding: 8px 12px;
  border-radius: 12px;
  max-width: 100%;
  word-wrap: break-word;
}

.comment-content {
  font-size: 0.95rem;
  line-height: 1.4;
  margin-top: 2px;
}

.timestamp {
  font-size: 0.75rem;
  margin-top: 4px;
  opacity: 0.7;
}

.comment-item {
  padding: 4px 8px;
  border-radius: 8px;
  transition: all 0.2s ease;

  &:hover {
    background: rgba(0, 0, 0, 0.02);
  }
}

// Comment animations
.comment-enter-active,
.comment-leave-active {
  transition: all 0.3s ease;
}

.comment-enter-from {
  opacity: 0;
  transform: translateY(20px);
}

.comment-leave-to {
  opacity: 0;
  transform: translateX(-20px);
}

// Responsive adjustments
@media (max-width: 600px) {
  .engagement-btn {
    min-width: 60px;
    padding: 6px 8px;
  }

  .engagement-count {
    font-size: 0.8rem;
  }

  .comment-bubble {
    padding: 6px 10px;
  }

  .comment-content {
    font-size: 0.9rem;
  }
}
</style>
