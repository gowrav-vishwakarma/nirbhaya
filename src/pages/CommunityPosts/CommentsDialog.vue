<template>
  <q-dialog v-model="dialogModel" maximized transition-show="slide-up" transition-hide="slide-down">
    <q-card class="column">
      <template #default>
        <!-- Header -->
        <q-card-section class="row items-center q-pb-none">
          <div style="width: 100%;">
            <div class="text-h6 text-center">Post</div>
          </div>
          <q-btn flat round dense v-close-popup style="margin-top: -35px;">
            <div class="text-[#111418] flex size-12 shrink-0 items-center" data-icon="ArrowLeft" data-size="24px"
              data-weight="regular">
              <svg xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" fill="currentColor"
                viewBox="0 0 256 256">
                <path
                  d="M224,128a8,8,0,0,1-8,8H59.31l58.35,58.34a8,8,0,0,1-11.32,11.32l-72-72a8,8,0,0,1,0-11.32l72-72a8,8,0,0,1,11.32,11.32L59.31,120H216A8,8,0,0,1,224,128Z">
                </path>
              </svg>
            </div>
          </q-btn>
        </q-card-section>

        <!-- <q-separator class="q-my-md" /> -->

        <!-- Main Content Area -->
        <q-card-section class="col q-pt-lg scroll" style=" padding: 0px;">
          <!-- Post Author Section -->
          <div class="row items-center">
            <q-avatar size="48px" class="shadow-2">
              <img src="/sos_logo_1080_1080.png" style="object-fit: cover;" />
            </q-avatar>
            <div class="q-ml-md">
              <div class="text-weight-bold text-capitalize" style="font-size: 16px;">
                {{ post.userName == 'SOS Bharat Community' ?
                  'SOS Bharat Community' : post.userName }}</div>
              <div class="text-caption text-grey-7">
                <q-icon name="schedule" size="xs" class="q-mr-xs" />
                {{ formatDate(post.createdAt) }}
              </div>
            </div>
          </div>

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
              <span v-for="tag in post.tags" :key="tag" class="hashtag">
                #{{ tag }}
              </span>
            </div>
          </q-card-section>

          <!-- Post Images -->
          <div v-if="post.mediaUrls || post.videoUrl" class="q-pa-none q-mt-md">
            <!-- Show YouTube video if videoUrl exists -->
            <div v-if="post.videoUrl" class="video-container" v-intersection="onVideoIntersection(post.id)">
              <iframe :key="getVideoUrl(post.id, post.videoUrl)" :src="getVideoUrl(post.id, post.videoUrl)"
                :id="`video-${post.id}`" frameborder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowfullscreen class="video-frame">
              </iframe>
            </div>

            <!-- Show image collage or carousel -->
            <div v-else-if="post.mediaUrls" class="media-section">
              <!-- Show Collage when not in carousel mode -->
              <template v-if="!isCarouselMode">
                <div class="media-collage">
                  <!-- Single Image -->
                  <template v-if="!Array.isArray(post.mediaUrls) || post.mediaUrls.length === 1">
                    <q-img :src="imageCdn + (Array.isArray(post.mediaUrls) ? post.mediaUrls[0] : post.mediaUrls)"
                      :ratio="16 / 9" class="single-image" @click="showCarousel(0)" />
                  </template>

                  <!-- Two Images -->
                  <template v-else-if="post.mediaUrls.length === 2">
                    <div class="two-images-grid">
                      <div v-for="(url, index) in post.mediaUrls" :key="index" class="grid-image-container">
                        <q-img :src="imageCdn + url" class="grid-image" @click="showCarousel(index)" />
                      </div>
                    </div>
                  </template>

                  <!-- Three or More Images -->
                  <template v-else>
                    <div class="multi-images-grid">
                      <div class="main-image-container">
                        <q-img :src="imageCdn + post.mediaUrls[0]" class="main-grid-image" @click="showCarousel(0)" />
                      </div>
                      <div class="secondary-images-container">
                        <div v-for="(url, index) in post.mediaUrls.slice(1, 3)" :key="index"
                          class="secondary-image-wrapper">
                          <q-img :src="imageCdn + url" class="secondary-grid-image" @click="showCarousel(index + 1)">
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

              <!-- Show Carousel when in carousel mode -->
              <template v-else>
                <div class="custom-carousel" ref="carousel" @touchstart="handleTouchStart" @touchmove="handleTouchMove"
                  @touchend="handleTouchEnd">
                  <!-- Close button -->
                  <button class="carousel-close" @click="closeCarousel">
                    <i class="material-icons">close</i>
                  </button>

                  <!-- Image counter -->
                  <div class="carousel-counter">
                    {{ currentVisibleImage }} / {{ currentImageCount.total }}
                  </div>

                  <div class="carousel-inner" :style="carouselStyle">
                    <div v-for="(url, index) in Array.isArray(post.mediaUrls) ?
                      post.mediaUrls.map(url => imageCdn + url) :
                      [imageCdn + post.mediaUrls]" :key="index" class="carousel-slide"
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

                  <!-- Dots Navigation -->
                  <div class="carousel-dots">
                    <button v-for="index in currentImageCount.total" :key="index" class="dot"
                      :class="{ active: activeDotIndex === index - 1 }" @click.stop="goToSlide(index - 1)">
                    </button>
                  </div>
                </div>
              </template>
            </div>

            <!-- Engagement Actions -->
            <PostEngagement :post="post" @update:post="updatePost($event)" />
          </div>

          <!-- Engagement Stats -->
          <div class="row q-mb-lg justify-between">
            <!-- Likes -->
            <q-btn flat dense class="items-center" @click="handleLike(post)">
              <q-icon :name="post.liked ? 'favorite' : 'favorite_border'" size="24px" class="q-mr-sm"
                :color="post.liked ? 'red' : 'grey'" />
              <span class="text-weight-medium">{{ post.likesCount || 0 }}</span>
            </q-btn>

            <!-- Comments (disabled) -->
            <q-btn flat dense class="items-center" disable>
              <q-icon name="chat" size="24px" class="q-mr-sm text-grey" />
              <span class="text-weight-medium">{{ post.commentsCount || 0 }}</span>
            </q-btn>

            <!-- Share -->
            <q-btn flat dense class="items-center" @click="handleShare(post)">
              <q-icon name="send" size="24px" class="q-mr-sm" />
              <span class="text-weight-medium">{{ post.sharesCount || 0 }}</span>
            </q-btn>
          </div>

          <q-separator class="q-mb-md" />

          <!-- Comments Section Header -->
          <div class="comments-header q-px-md q-mb-md">
            <div class="text-h6">Comments ({{ post.comments?.length || 0 }})</div>
          </div>

          <!-- Comments List -->
          <div class="comments-list q-px-md">
            <div v-if="isLoading" class="text-center q-pa-md">
              <q-spinner color="primary" size="2em" />
              <div class="q-mt-sm">Loading comments...</div>
            </div>

            <div v-else-if="!post.comments?.length" class="text-grey text-center q-pa-md">
              No comments yet. Be the first to comment!
            </div>

            <div v-else v-for="comment in post.comments" :key="comment.id"
              :class="['comment-item row q-mb-md', { 'q-ml-xl': comment.parentId }]">
              <q-avatar size="40px" class="q-mr-md">
                <img :src="comment.userAvatar || '/default-avatar.png'" />
              </q-avatar>
              <div class="col">
                <div class="row items-center q-gutter-x-sm">
                  <span class="text-weight-bold">{{ comment.userName }}</span>
                  <span class="text-grey-7 text-caption">{{ formatDate(comment.createdAt) }}</span>
                </div>
                <p class="comment-content q-mt-sm q-mb-sm">{{ comment.content }}</p>
                <div class="row q-gutter-md">
                  <!-- Like Button -->
                  <q-btn flat dense size="sm" class="items-center" @click="handleCommentLike(comment)">
                    <q-icon :name="comment.isLiked ? 'thumb_up' : 'thumb_up_off_alt'"
                      :color="comment.isLiked ? 'primary' : 'grey'" size="18px" class="q-mr-xs" />
                    <span>{{ comment.likes || 0 }}</span>
                  </q-btn>

                  <!-- Dislike Button -->
                  <q-btn flat dense size="sm" class="items-center" @click="handleCommentDislike(comment)">
                    <q-icon :name="comment.isDisliked ? 'thumb_down' : 'thumb_down_off_alt'"
                      :color="comment.isDisliked ? 'negative' : 'grey'" size="18px" class="q-mr-xs" />
                    <span>{{ comment.dislikes || 0 }}</span>
                  </q-btn>

                  <!-- Reply Button -->
                  <q-btn flat dense size="sm" class="items-center" @click="showReplyInput(comment)">
                    <q-icon name="reply" size="18px" class="q-mr-xs" />
                    <span>Reply</span>
                  </q-btn>
                </div>

                <!-- Reply Input -->
                <div v-if="replyingTo === comment.id" class="q-mt-md">
                  <div class="row items-center">
                    <q-avatar size="32px" class="q-mr-md">
                      <img :src="userStore.user?.avatar || '/default-avatar.png'" />
                    </q-avatar>
                    <q-input v-model="replyContent" class="col" outlined dense placeholder="Write a reply..."
                      maxlength="500" autogrow @keyup.enter="addReply(comment)">
                      <template v-slot:after>
                        <q-btn unelevated color="primary" :disable="!replyContent.trim()" @click="addReply(comment)"
                          class="q-px-md">
                          Reply
                        </q-btn>
                        <q-btn flat color="grey" @click="cancelReply" class="q-ml-sm">
                          Cancel
                        </q-btn>
                      </template>
                    </q-input>
                  </div>
                </div>

                <!-- Replies Section -->
                <div v-if="comment.replies?.length" class="q-ml-lg q-mt-md">
                  <div v-for="reply in comment.replies" :key="reply.id" class="reply-item q-mb-md">
                    <div class="row items-start">
                      <q-avatar size="32px" class="q-mr-md">
                        <img :src="reply.userAvatar || '/default-avatar.png'" />
                      </q-avatar>
                      <div class="col">
                        <div class="row items-center q-gutter-x-sm">
                          <span class="text-weight-bold">{{ reply.userName }}</span>
                          <span class="text-grey-7 text-caption">{{ formatDate(reply.createdAt) }}</span>
                        </div>
                        <p class="reply-content q-mt-sm q-mb-sm">{{ reply.content }}</p>
                        <div class="row q-gutter-md">
                          <q-btn flat dense size="sm" class="items-center" @click="handleReplyLike(reply)">
                            <q-icon :name="reply.isLiked ? 'thumb_up' : 'thumb_up_off_alt'"
                              :color="reply.isLiked ? 'primary' : 'grey'" size="16px" class="q-mr-xs" />
                            <span>{{ reply.likes || 0 }}</span>
                          </q-btn>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Add Comment Section -->
          <div class="comment-input-section q-px-md q-mt-md">
            <div class="row items-center">
              <q-avatar size="40px" class="q-mr-md">
                <img :src="userStore.user?.avatar || '/default-avatar.png'" />
              </q-avatar>
              <q-input v-model="newComment" class="col" outlined dense placeholder="Add your comment" maxlength="500"
                autogrow @keyup.enter="addComment">
                <template v-slot:after>
                  <q-btn unelevated color="primary" :disable="!newComment.trim()" @click="addComment" class="q-px-md">
                    Post
                  </q-btn>
                </template>
              </q-input>
            </div>
          </div>
        </q-card-section>
      </template>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import { useQuasar } from 'quasar';
import { useUserStore } from 'src/stores/user-store';
import type { CommunityPost } from 'src/types/CommunityPost';
import { communityPostService } from 'src/services/communityPostService';
import { api } from 'src/boot/axios';

// Add this interface at the top of the script section
interface Comment {
  id: number;
  content: string;
  createdAt: string;
  userId: number;
  postId: number;
  parentId?: number;
  likes: number;
  dislikes: number;
  isLiked?: boolean;
  isDisliked?: boolean;
  replies?: Reply[];
  user?: {
    id: number;
    name: string;
    email: string;
    avatar: string;
  };
  userName: string;
  userAvatar: string;
}

interface Reply extends Omit<Comment, 'replies'> {
  parentId: number;
}

const props = defineProps<{
  modelValue: boolean;
  post: CommunityPost & { userName: string }
}>();


console.log('post........', props.post);

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void;
  (e: 'update:post', post: CommunityPost): void;
}>();

const $q = useQuasar();
const userStore = useUserStore();
const newComment = ref('');
const imageCdn = 'http://xavoc-technocrats-pvt-ltd.blr1.cdn.digitaloceanspaces.com/';

// Create computed property for v-model
const dialogModel = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
});

// Add carousel refs and computed properties
const isCarouselMode = ref(false);
const currentIndex = ref(0);
const currentVisibleImage = ref<number | null>(null);
const isTransitioning = ref(false);
const touchStart = ref(0);
const touchEnd = ref(0);
const carousel = ref<HTMLElement | null>(null);
const carouselImages = ref<HTMLElement[]>([]);
const showFullDescription = ref<{ [key: string]: boolean }>({});


const isLastSlide = computed(() => {
  return currentIndex.value === totalSlides.value - 1;
});

const totalSlides = computed(() => {
  if (!props.post.mediaUrls) return 0;
  return Array.isArray(props.post.mediaUrls) ? props.post.mediaUrls.length : 1;
});

const currentImageCount = computed(() => {
  if (!props.post.mediaUrls) return { current: 0, total: 0 };
  return {
    current: currentIndex.value + 1,
    total: Array.isArray(props.post.mediaUrls) ? props.post.mediaUrls.length : 1
  };
});

const activeDotIndex = computed(() => {
  return currentVisibleImage.value ? currentVisibleImage.value - 1 : currentIndex.value;
});

const carouselStyle = computed(() => ({
  transform: `translate3d(-${currentIndex.value * 100}%, 0, 0)`,
  willChange: 'transform'
}));



const closeCarousel = () => {
  isCarouselMode.value = false;
  currentIndex.value = 0;
  currentVisibleImage.value = null;
};

const goToSlide = (index: number) => {
  if (isTransitioning.value || !carousel.value) return;
  isTransitioning.value = true;
  currentIndex.value = index;
  currentVisibleImage.value = index + 1;

  console.log('Go To Slide:', {
    index: index + 1,
    total: totalSlides.value,
    currentVisible: currentVisibleImage.value
  });

  const scrollWidth = carousel.value.scrollWidth / totalSlides.value;
  carousel.value.scrollTo({
    left: index * scrollWidth,
    behavior: 'smooth'
  });

  setTimeout(() => {
    isTransitioning.value = false;
  }, 300);
};

const prevSlide = () => {
  if (currentIndex.value > 0) {
    goToSlide(currentIndex.value - 1);
  }
};

const nextSlide = () => {
  if (currentIndex.value < totalSlides.value - 1) {
    goToSlide(currentIndex.value + 1);
  }
};

// Touch handling methods
const handleTouchStart = (event: TouchEvent) => {
  touchStart.value = event.touches[0].clientX;
  if (carousel.value) {
    carousel.value.style.transition = 'none';
  }
};

const handleTouchMove = (event: TouchEvent) => {
  if (!touchStart.value || !carousel.value) return;

  // Prevent default to stop overscrolling
  event.preventDefault();

  const currentX = event.touches[0].clientX;
  const diff = touchStart.value - currentX;

  if (carousel.value) {
    carousel.value.scrollLeft += diff;
    touchStart.value = currentX;
  }
};

const handleTouchEnd = () => {
  if (!carousel.value) return;

  const scrollWidth = carousel.value.scrollWidth / totalSlides.value;
  const scrollPosition = carousel.value.scrollLeft;
  const slideIndex = Math.round(scrollPosition / scrollWidth);

  // Ensure index stays within bounds
  const boundedIndex = Math.max(0, Math.min(slideIndex, totalSlides.value - 1));

  currentIndex.value = boundedIndex;
  currentVisibleImage.value = boundedIndex + 1;

  carousel.value.scrollTo({
    left: boundedIndex * scrollWidth,
    behavior: 'smooth'
  });

  touchStart.value = 0;
  touchEnd.value = 0;
};

// Intersection observer
const onCarouselImageIntersection = (index: number) => ({
  handler: (entry?: IntersectionObserverEntry) => {
    if (!entry) return false;

    if (entry.isIntersecting) {
      const imageData = {
        index: index + 1,
        total: totalSlides.value,
        isIntersecting: entry.isIntersecting,
        intersectionRatio: entry.intersectionRatio,
        currentImage: props.post.mediaUrls ? (
          Array.isArray(props.post.mediaUrls) ?
            props.post.mediaUrls[index] :
            props.post.mediaUrls
        ) : null,
        activeDot: currentIndex.value
      };

      console.log('Image Data:', imageData);
      currentVisibleImage.value = index + 1;
    }
    return true;
  },
  cfg: {
    threshold: [0.5]
  }
});

// Keyboard navigation
const handleKeydown = (event: KeyboardEvent) => {
  if (!isCarouselMode.value) return;

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

// Add this computed property
const isMobile = computed(() => {
  return window.innerWidth <= 600;
});

onMounted(() => {
  window.addEventListener('keydown', handleKeydown);
  if (carousel.value) {
    carousel.value.addEventListener('touchstart', (e) => {
      e.preventDefault();
    }, { passive: false });
  }
});

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown);
  if (carousel.value) {
    carousel.value.removeEventListener('touchstart', (e) => {
      e.preventDefault();
    });
  }
});

const addComment = async () => {
  if (!newComment.value.trim()) return;

  try {
    if (!userStore.user) {
      $q.notify({
        message: 'Please login to comment',
        color: 'warning'
      });
      return;
    }

    // Create the comment data with userId
    const commentData = {
      content: newComment.value,
      userId: userStore.user.id  // Add userId to request
    };

    console.log('Adding comment with data:', commentData); // Debug log

    // Call the service method with userId
    const response = await api.post(`/posts/${props.post.id}/comments`, commentData);

    // Create complete comment object with user info
    const newCommentData = {
      ...response.data,
      userName: userStore.user.name || userStore.user.email,
      userAvatar: userStore.user.avatar || '/default-avatar.png',
      createdAt: new Date().toISOString()
    };

    // Update the post with new comment
    const updatedPost = {
      ...props.post,
      comments: [...(props.post.comments || []), newCommentData]
    };

    // Emit the updated post
    emit('update:post', updatedPost);

    // Clear input
    newComment.value = '';

    // Show success message
    $q.notify({
      message: 'Comment added successfully',
      color: 'positive'
    });

  } catch (error: any) {
    console.error('Error adding comment:', error);
    $q.notify({
      message: error.response?.data?.message || 'Failed to add comment',
      color: 'negative'
    });
  }
};

const formatDate = (date: string) => {
  try {
    const postDate = new Date(date);
    const now = new Date();
    const diffInMs = now.getTime() - postDate.getTime();
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInMinutes < 60) {
      return `${diffInMinutes}m ago`;
    } else if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else if (diffInDays < 7) {
      return `${diffInDays}d ago`;
    } else {
      return postDate.toLocaleDateString();
    }
  } catch (error) {
    return 'Invalid date';
  }
};

// Add a watcher to log changes in current index
watch(currentIndex, (newIndex) => {
  console.log('Carousel State:', {
    currentIndex: newIndex + 1,
    totalImages: totalSlides.value,
    activeDot: newIndex,
    currentImage: props.post.mediaUrls ? (
      Array.isArray(props.post.mediaUrls) ?
        props.post.mediaUrls[newIndex] :
        props.post.mediaUrls
    ) : null
  });
});

// Update truncateText to work with words instead of characters
const truncateText = (text: string, wordCount: number) => {
  if (!text) return '';
  const words = text.split(' ');
  if (words.length <= wordCount) return text;
  return words.slice(0, wordCount).join(' ') + '...';
};

// Add toggle function
const toggleDescription = (postId: string) => {
  showFullDescription.value[postId] = !showFullDescription.value[postId];
};

const showCarousel = (index: number, postId?: string): void => {
  isCarouselMode.value = true;
  currentIndex.value = index;
  currentVisibleImage.value = index + 1;
  activeCarouselPost.value = props.post.id;
};

const onVideoIntersection = (postId: string) => ({
  handler: (entry?: IntersectionObserverEntry) => {
    if (!entry) return false;

    const rect = entry.boundingClientRect;
    const windowHeight = window.innerHeight;
    const elementCenter = rect.top + (rect.height / 2);
    const viewportCenter = windowHeight / 2;
    const distanceFromCenter = Math.abs(elementCenter - viewportCenter);
    const isCentered = distanceFromCenter < 100;
    const isVisible = entry.isIntersecting;

    videoVisibility.value[postId] = isVisible && isCentered;

    if (isVisible && isCentered) {
      if (currentlyPlayingVideo.value !== null && currentlyPlayingVideo.value !== postId) {
        controlVideo(currentlyPlayingVideo.value, 'pause');
        videoVisibility.value[currentlyPlayingVideo.value] = false;
      }

      controlVideo(postId, 'play');
      currentlyPlayingVideo.value = postId;
    } else {
      if (currentlyPlayingVideo.value === postId) {
        controlVideo(postId, 'pause');
        currentlyPlayingVideo.value = null;
      }
    }

    return true;
  },
  cfg: {
    threshold: [0, 0.25, 0.5, 0.75, 1],
    rootMargin: '-30% 0px'
  }
});

// Add this method
const updatePost = (updatedPost: CommunityPost): void => {
  const postsCopy = [...posts.value];
  const index = postsCopy.findIndex(p => p.id === updatedPost.id);
  if (index !== -1) {
    postsCopy[index] = {
      ...updatedPost,
      userName: postsCopy[index].userName
    };
    posts.value = postsCopy;
  }
};

// Add this after other refs
const posts = ref<Array<CommunityPost & { userName: string }>>([props.post]);

// Add these refs at the top of the script section with other refs
const videoVisibility = ref<{ [key: string]: boolean }>({});
const currentlyPlayingVideo = ref<string | null>(null);
const activeCarouselPost = ref<string | null>(null);

// Add these methods before the onVideoIntersection function
const getVideoUrl = (postId: string, videoUrl: string): string => {
  // Extract video ID from YouTube URL
  const videoId = videoUrl.split('v=')[1];
  // Return embedded URL with autoplay parameter based on visibility
  return `https://www.youtube.com/embed/${videoId}?autoplay=${videoVisibility.value[postId] ? '1' : '0'}&enablejsapi=1`;
};

const controlVideo = (postId: string, action: 'play' | 'pause'): void => {
  const iframe = document.getElementById(`video-${postId}`) as HTMLIFrameElement;
  if (!iframe) return;

  // Send message to YouTube iframe
  iframe.contentWindow?.postMessage(
    JSON.stringify({
      event: 'command',
      func: action === 'play' ? 'playVideo' : 'pauseVideo'
    }),
    '*'
  );
};

// Add these methods
const handleLike = async (post: CommunityPost) => {
  try {
    if (!userStore.user) {
      $q.notify({
        message: 'Please login to like posts',
        color: 'warning'
      });
      return;
    }

    if (post.liked) {
      await communityPostService.unlikePost(Number(post.id), Number(userStore.user.id));
      post.liked = false;
      post.likes = (post.likes || 1) - 1;
    } else {
      await communityPostService.likePost(Number(post.id), Number(userStore.user.id));
      post.liked = true;
      post.likes = (post.likes || 0) + 1;
    }

    // Emit the updated post
    emit('update:post', post);
  } catch (error) {
    console.error('Error handling like:', error);
    $q.notify({
      message: 'Failed to update like',
      color: 'negative'
    });
  }
};

const handleShare = async (post: CommunityPost) => {
  try {
    if (navigator.share) {
      await navigator.share({
        title: post.title,
        text: post.description,
        url: window.location.href
      });

      // Update share count
      await communityPostService.sharePost(post.id);
      post.shares = (post.shares || 0) + 1;

      // Emit the updated post
      emit('update:post', post);
    } else {
      // Fallback for browsers that don't support Web Share API
      await navigator.clipboard.writeText(window.location.href);
      $q.notify({
        message: 'Link copied to clipboard!',
        color: 'positive'
      });
    }
  } catch (error) {
    console.error('Error sharing post:', error);
    $q.notify({
      message: 'Failed to share post',
      color: 'negative'
    });
  }
};

// Add these imports at the top
import { api } from 'src/boot/axios';
import { ref, computed, onMounted, watch } from 'vue';

// Add this after other refs
const isLoading = ref(false);

// Add these refs
const replyingTo = ref<number | null>(null);
const replyContent = ref('');

// Add these methods
const showReplyInput = (comment: Comment) => {
  if (!userStore.user) {
    $q.notify({
      message: 'Please login to reply',
      color: 'warning'
    });
    return;
  }
  replyingTo.value = comment.id;
  replyContent.value = '';
};

const cancelReply = () => {
  replyingTo.value = null;
  replyContent.value = '';
};

const addReply = async (comment: Comment) => {
  if (!replyContent.value.trim() || !userStore.user) return;

  try {
    const response = await api.post(`/posts/comments/${comment.id}/replies`, {
      content: replyContent.value,
      userId: userStore.user.id
    });

    // Create complete reply object
    const newReply = {
      ...response.data,
      userName: userStore.user.name || userStore.user.email,
      userAvatar: userStore.user.avatar || '/default-avatar.png',
      isLiked: false,
      likes: 0
    };

    // Update the comment with new reply
    comment.replies = [...(comment.replies || []), newReply];

    // Clear reply input
    cancelReply();

    // Show success message
    $q.notify({
      message: 'Reply added successfully',
      color: 'positive'
    });
  } catch (error) {
    console.error('Error adding reply:', error);
    $q.notify({
      message: 'Failed to add reply',
      color: 'negative'
    });
  }
};

const handleCommentLike = async (comment: Comment) => {
  if (!userStore.user) {
    $q.notify({
      message: 'Please login to like comments',
      color: 'warning'
    });
    return;
  }

  try {
    if (comment.isLiked) {
      await api.delete(`/posts/comments/${comment.id}/like`, {
        data: { userId: userStore.user.id }
      });
      comment.likes = Math.max(0, (comment.likes || 1) - 1);
      comment.isLiked = false;
    } else {
      await api.post(`/posts/comments/${comment.id}/like`, {
        userId: userStore.user.id
      });
      comment.likes = (comment.likes || 0) + 1;
      comment.isLiked = true;

      // Remove dislike if exists
      if (comment.isDisliked) {
        comment.dislikes = Math.max(0, (comment.dislikes || 1) - 1);
        comment.isDisliked = false;
      }
    }
  } catch (error) {
    console.error('Error handling comment like:', error);
    $q.notify({
      message: 'Failed to update like',
      color: 'negative'
    });
  }
};

const handleCommentDislike = async (comment: Comment) => {
  if (!userStore.user) {
    $q.notify({
      message: 'Please login to dislike comments',
      color: 'warning'
    });
    return;
  }

  try {
    if (comment.isDisliked) {
      await api.delete(`/posts/comments/${comment.id}/dislike`, {
        data: { userId: userStore.user.id }
      });
      comment.dislikes = Math.max(0, (comment.dislikes || 1) - 1);
      comment.isDisliked = false;
    } else {
      await api.post(`/posts/comments/${comment.id}/dislike`, {
        userId: userStore.user.id
      });
      comment.dislikes = (comment.dislikes || 0) + 1;
      comment.isDisliked = true;

      // Remove like if exists
      if (comment.isLiked) {
        comment.likes = Math.max(0, (comment.likes || 1) - 1);
        comment.isLiked = false;
      }
    }
  } catch (error) {
    console.error('Error handling comment dislike:', error);
    $q.notify({
      message: 'Failed to update dislike',
      color: 'negative'
    });
  }
};

// Update fetchComments to include likes and replies
const fetchComments = async () => {
  if (!props.post?.id) return;

  try {
    isLoading.value = true;
    const response = await api.get(`/posts/${props.post.id}/comments`);

    // Update the post with fetched comments
    const updatedPost = {
      ...props.post,
      comments: await Promise.all(response.data.map(async (comment: any) => {
        // Fetch replies for each comment
        const repliesResponse = await api.get(`/posts/comments/${comment.id}/replies`);

        return {
          ...comment,
          userName: comment.user?.name || comment.user?.email || 'Anonymous',
          userAvatar: comment.user?.avatar || '/default-avatar.png',
          isLiked: comment.userLikes?.includes(userStore.user?.id),
          isDisliked: comment.userDislikes?.includes(userStore.user?.id),
          replies: repliesResponse.data.map((reply: any) => ({
            ...reply,
            userName: reply.user?.name || reply.user?.email || 'Anonymous',
            userAvatar: reply.user?.avatar || '/default-avatar.png',
            isLiked: reply.userLikes?.includes(userStore.user?.id)
          }))
        };
      }))
    };

    emit('update:post', updatedPost);
  } catch (error) {
    console.error('Error fetching comments:', error);
    $q.notify({
      message: 'Failed to load comments',
      color: 'negative'
    });
  } finally {
    isLoading.value = false;
  }
};

// Add this watcher to fetch comments when dialog opens
watch(() => props.modelValue, (newValue) => {
  if (newValue) {
    fetchComments();
  }
});

// Update the comments list section in template

// Add handleReplyLike method
const handleReplyLike = async (reply: Reply) => {
  if (!userStore.user) {
    $q.notify({
      message: 'Please login to like replies',
      color: 'warning'
    });
    return;
  }

  try {
    if (reply.isLiked) {
      await api.delete(`/posts/comments/${reply.id}/like`, {
        data: { userId: userStore.user.id }
      });
      reply.likes = Math.max(0, (reply.likes || 1) - 1);
      reply.isLiked = false;
    } else {
      await api.post(`/posts/comments/${reply.id}/like`, {
        userId: userStore.user.id
      });
      reply.likes = (reply.likes || 0) + 1;
      reply.isLiked = true;
    }
  } catch (error) {
    console.error('Error handling reply like:', error);
    $q.notify({
      message: 'Failed to update like',
      color: 'negative'
    });
  }
};
</script>

<style lang="scss" scoped>
.q-card {
  font-family: "Plus Jakarta Sans", "Noto Sans", sans-serif;
}

.comments-list {
  max-height: none;
  overflow-y: visible;
  padding-bottom: 16px;
}

.q-input {
  :deep(.q-field__control) {
    border-radius: 20px;
    background: #f5f5f5;
  }

  :deep(.q-field__native) {
    padding: 8px 12px;
    min-height: 24px;
  }
}

.q-img {
  transition: transform 0.2s;

  &:hover {
    transform: scale(0.98);
  }
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

// Carousel styles
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

// Mobile styles
@media (max-width: 600px) {
  .custom-carousel {
    overflow-x: auto;
    scroll-snap-type: x mandatory;
    -webkit-overflow-scrolling: touch;
    scroll-behavior: smooth;

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

.media-section {
  position: relative;
  transition: all 0.3s ease;
}

.carousel-close {
  position: absolute;
  top: 16px;
  right: 16px;
  background: rgba(0, 0, 0, 0.6);
  color: white;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 3;
  backdrop-filter: blur(4px);

  &:hover {
    background: rgba(0, 0, 0, 0.8);
  }
}

// Add these styles for engagement buttons
.items-center {
  transition: all 0.3s ease;
  border-radius: 8px;
  padding: 4px 12px;

  &:hover {
    background: rgba(0, 0, 0, 0.05);
  }

  .q-icon {
    transition: transform 0.3s ease;
  }

  &:hover .q-icon {
    transform: scale(1.1);
  }

  // Animation for like button
  &:active .q-icon[name="favorite"] {
    animation: likeAnimation 0.3s ease;
  }
}

@keyframes likeAnimation {
  0% {
    transform: scale(1);
  }

  50% {
    transform: scale(1.3);
  }

  100% {
    transform: scale(1);
  }
}

// Style for the counts
.text-weight-medium {
  font-size: 0.9rem;
  color: #666;
}

.comments-header {
  .text-h6 {
    font-size: 1.1rem;
    color: #1d1d1d;
  }
}

.comment-item {
  padding: 12px;
  border-radius: 8px;
  transition: background-color 0.2s ease;

  &:hover {
    background-color: rgba(0, 0, 0, 0.02);
  }

  .comment-content {
    font-size: 0.95rem;
    line-height: 1.5;
    color: #333;
    margin: 4px 0;
    white-space: pre-line;
  }

  .text-caption {
    font-size: 0.8rem;
  }
}

.comment-input-section {
  border-top: 1px solid rgba(0, 0, 0, 0.12);
  padding-top: 16px;
  padding-bottom: 16px;
  background: white;
  position: sticky;
  bottom: 0;
  z-index: 2;
}

// Style for disabled comment button
.items-center.q-btn--disabled {
  opacity: 0.7;
  cursor: not-allowed;

  .q-icon {
    opacity: 0.7;
  }
}

// Animation for new comments
.comment-item {
  animation: fadeIn 0.3s ease;
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

.reply-item {
  background: rgba(0, 0, 0, 0.02);
  border-radius: 8px;
  padding: 12px;
  margin-left: 24px;

  .reply-content {
    font-size: 0.9rem;
    line-height: 1.4;
  }
}

.items-center {
  &:hover {
    background: rgba(0, 0, 0, 0.05);
  }

  .q-icon {
    transition: all 0.3s ease;
  }

  &:hover .q-icon {
    transform: scale(1.1);
  }
}
</style>
