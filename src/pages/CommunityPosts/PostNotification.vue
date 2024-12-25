<template>
  <div class="notifications-container"  style="padding-top: env(safe-area-inset-top)">
    <div
        class="row items-center"
        style="padding-top: 5px; padding-left: 10px"
      >
        <q-btn size="sm" flat class="back-button" @click="router.go(-1)">
          <i style="font-size: 14px" class="fa-solid fa-arrow-left-long"></i>
        </q-btn>
        <!-- <span class="text-weight-bold text-primary q-ml-sm text-h4"
          >Profile Page</span
        > -->
      </div>

    <div class="q-pa-sm q-pt-sm q-mb-sm"  >
      <h4 class="q-ma-none text-primary" style="font-size:20px;font-weight:900">Post Notifications</h4>
    </div>

    <div v-if="loading && !notifications.length" class="loading">
      <q-spinner-dots color="primary" size="40px" />
    </div>
    
    <div v-else-if="notifications.length === 0" class="no-notifications">
      <div class="text-primary">

        <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"></path>
              <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
            </svg>
      </div>
      <div class="text-grey-6 q-mt-sm">No notifications yet</div>
    </div>
    
    <div v-else>
      <div 
        class="notification-list"
        v-infinite-scroll="loadMore"
        :offset="250"
      >
        <!-- Loop through all notifications -->
        <div 
          v-for="post in notifications" 
          :key="post.id" 
          class="notification-card cursor-pointer"
          @click="navigateToPost(post.id)"
        >
          <div class="row no-wrap full-height">
            <!-- Image Column (40%) -->
            <div class="col-4 image-wrapper">
              <q-img 
                v-if="post.mediaUrls?.length > 0"
                :src="imageCdn + post.mediaUrls[0]"
                class="post-thumbnail"
              />
              <div v-else class="post-title-fallback">
                {{ post.title }}
              </div>
            </div>

            <!-- Notifications Column (60%) -->
            <div class="col-8 q-pa-sm">
              <!-- Likes Row -->
              <div class="notification-section">
                <span class="text-caption text-grey-8">
                  <template v-if="post.likes.length > 0">
                    <span class="text-weight-medium">{{ formatLikeNames(post.likes) }}</span> liked your post
                  </template> 
                </span>
              </div>
              
              <div class="avatars-container">
                <q-avatar
                  v-for="(like, index) in post.likes.slice(0, 5)"
                  :key="like.id"
                  size="24px"
                  class="overlapping-avatar"
                  :style="`left: ${index * 14}px`"
                >
                  <q-tooltip>{{ like.user.name }}</q-tooltip>
                  <img :src="imageCdn+like.user?.profileImage || 'https://cdn.quasar.dev/img/avatar.png'" />
                </q-avatar>
                <div
                  v-if="post.likes.length > 5"
                  class="overlapping-avatar more-count"
                  :style="`left: ${5 * 14}px`"
                >
                  +{{ post.likes.length - 5 }}
                </div>
              </div>
              <!-- Comments Row -->
              <div class="notification-section q-mt-md">
                <div class="text-caption text-grey-8">
                  <template v-if="post.comments.length > 0">
                    <span class="text-weight-medium">{{ formatCommentNames(post.comments) }}</span> commented on your post
                  </template>
                </div>
                <div class="avatars-container">
                  <q-avatar
                    v-for="(comment, index) in post.comments.slice(0, 5)"
                    :key="comment.id"
                    size="24px"
                    class="overlapping-avatar"
                    :style="`left: ${index * 14}px`"
                  >
                    <q-tooltip>{{ comment.user.name }}</q-tooltip>
                    <img :src="imageCdn+comment.user?.profileImage || 'https://cdn.quasar.dev/img/avatar.png'" />
                  </q-avatar>
                  <div
                    v-if="post.comments.length > 5"
                    class="overlapping-avatar more-count"
                    :style="`left: ${5 * 14}px`"
                  >
                    +{{ post.comments.length - 5 }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Loading indicator at bottom -->
      <div v-if="loading" class="text-center q-pa-md">
        <q-spinner-dots color="primary" size="24px" />
      </div>

      <!-- No more data indicator -->
      <div style="background-color: #eef2f6;" v-if="!hasMorePages && notifications.length > 0" class="text-center q-pa-sm   text-grey-6">
        No more notifications
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue';
import { date } from 'quasar';
import { api } from 'boot/axios';
import { useQuasar } from 'quasar';
import { useRouter } from 'vue-router';
const router = useRouter();

interface User {
  id: number;
  name: string;
  email: string | null;
  profileImage?: string;
}

interface Like {
  id: number;
  userId: number;
  postId: number;
  createdAt: string;
  updatedAt: string;
  user: User;
}

interface Comment {
  id: number;
  userId: number;
  postId: number;
  content: string;
  likesCount: number;
  repliesCount: number;
  createdAt: string;
  updatedAt: string;
  user: User;
}

interface Post {
  id: number;
  mediaUrls: string[];
  title: string;
  description: string;
  likes: Like[];
  comments: Comment[];
  notifications: Notification[];
  userId: number;
  userName: string;
}

interface Notification {
  id: number;
  postId: number;
  type: 'like' | 'comment';
  userId: number;
  userName: string;
  userEmail: string | null;
  content?: string;
  createdAt: string;
}

const props = defineProps<{
  postId: number;
  postImage?: string;
}>();
const imageCdn =
  'https://xavoc-technocrats-pvt-ltd.blr1.cdn.digitaloceanspaces.com/';
const notifications = ref<Post[]>([]);
const currentPage = ref(1);
const loading = ref(false);
const hasMorePages = ref(true);
const pageSize = 10; // Number of items per page

const groupedNotifications = computed(() => {
  const groups: { [key: string]: { likes: any[], comments: any[] } } = {};
  
  notifications.value.forEach(post => {
    // Group likes
    post.likes.forEach(like => {
      const dateKey = date.formatDate(like.createdAt, 'YYYY-MM-DD');
      if (!groups[dateKey]) {
        groups[dateKey] = { likes: [], comments: [] };
      }
      groups[dateKey].likes.push({
        ...like,
        mediaUrls: post.mediaUrls,
        title: post.title,
        user: like.user || {
          id: like.userId,
          name: post.userName,
          email: null,
          profileImage: null
        }
      });
    });

    // Group comments
    post.comments.forEach(comment => {
      const dateKey = date.formatDate(comment.createdAt, 'YYYY-MM-DD');
      if (!groups[dateKey]) {
        groups[dateKey] = { likes: [], comments: [] };
      }
      groups[dateKey].comments.push({
        ...comment,
        mediaUrls: post.mediaUrls,
        title: post.title,
        user: comment.user || {
          id: comment.userId,
          name: post.userName,
          email: null,
          profileImage: null
        }
      });
    });
  });

  // Sort dates in descending order
  return Object.keys(groups)
    .sort((a, b) => new Date(b).getTime() - new Date(a).getTime())
    .reduce((acc, key) => {
      acc[key] = groups[key];
      return acc;
    }, {} as { [key: string]: { likes: any[], comments: any[] } });
});

const formatLikeNames = (likes: Like[]) => {
  if (likes.length === 0) return '';
  
  // Get first names only
  const getFirstName = (name: string) => name.split(' ')[0];
  
  if (likes.length === 1) {
    return getFirstName(likes[0].user.name);
  }
  if (likes.length === 2) {
    return `${getFirstName(likes[0].user.name)} and ${getFirstName(likes[1].user.name)}`;
  }
  if (likes.length === 3) {
    return `${getFirstName(likes[0].user.name)}, ${getFirstName(likes[1].user.name)} and ${getFirstName(likes[2].user.name)}`;
  }
  return `${getFirstName(likes[0].user.name)}, ${getFirstName(likes[1].user.name)} and ${likes.length - 2} others`;
};

const formatCommentNames = (comments: Comment[]) => {
  if (comments.length === 0) return '';
  
  // Get first names only
  const getFirstName = (name: string) => name.split(' ')[0];
  
  if (comments.length === 1) {
    return getFirstName(comments[0].user.name);
  }
  if (comments.length === 2) {
    return `${getFirstName(comments[0].user.name)} and ${getFirstName(comments[1].user.name)}`;
  }
  if (comments.length === 3) {
    return `${getFirstName(comments[0].user.name)}, ${getFirstName(comments[1].user.name)} and ${getFirstName(comments[2].user.name)}`;
  }
  return `${getFirstName(comments[0].user.name)}, ${getFirstName(comments[1].user.name)} and ${comments.length - 2} others`;
};

const formatDateHeader = (dateStr: string) => {
  const notificationDate = new Date(dateStr);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (date.formatDate(notificationDate, 'YYYY-MM-DD') === date.formatDate(today, 'YYYY-MM-DD')) {
    return 'Today';
  }
  if (date.formatDate(notificationDate, 'YYYY-MM-DD') === date.formatDate(yesterday, 'YYYY-MM-DD')) {
    return 'Yesterday';
  }
  return date.formatDate(notificationDate, 'MMM D, YYYY');
};

const fetchNotifications = async (page: number) => {
  try {
    loading.value = true;
    const response = await api.get(`/posts/post-notifications`, {
      params: {
        page: page,
        limit: pageSize,
        postId: props.postId
      }
    });
    
    // Append new posts to existing ones
    if (page === 1) {
      notifications.value = response.data.posts;
    } else {
      notifications.value = [...notifications.value, ...response.data.posts];
    }

    // Check if we have more pages
    hasMorePages.value = response.data.posts.length === pageSize;

  } catch (error) {
    console.error('Error fetching notifications:', error);
    $q.notify({
      type: 'negative',
      message: 'Failed to load notifications'
    });
  } finally {
    loading.value = false;
  }
};

const loadMore = async () => {
  if (!loading.value && hasMorePages.value) {
    currentPage.value++;
    await fetchNotifications(currentPage.value);
  }
};

// Initial load
onMounted(() => {
  fetchNotifications(1);
});

// Reset and reload when postId changes
watch(() => props.postId, () => {
  currentPage.value = 1;
  hasMorePages.value = true;
  notifications.value = [];
  fetchNotifications(1);
});

watch(notifications, (newVal) => {
  console.log('Notifications updated:', newVal);
  console.log('Grouped notifications:', groupedNotifications.value);
}, { deep: true });

const allLikes = computed(() => {
  return notifications.value.flatMap(post => post.likes);
});

const allComments = computed(() => {
  return notifications.value.flatMap(post => post.comments);
});

const $q = useQuasar();

// Add navigation function
const navigateToPost = (postId: number) => {
  router.push(`/sos-bharat-community-post/${postId}`);
};
</script>

<style scoped>
.notifications-container {
  background-color: #eef2f6;
  max-width: 600px;
  margin: 0 auto;
  min-height: 100vh;
  /* padding: 16px; */
}

.notification-card {
  background-color: white;
  height: 130px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
  overflow: hidden;
  display: flex;
  border: 1px solid #eee;
  transition: background-color 0.2s ease; /* Add smooth transition */
}

.image-wrapper {
  padding: 0;
  height: 100%;
}

.post-thumbnail {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 0 50px 100px 0;
}

.notification-section {
  /* position: relative; */
  min-height: 0px;
  /* display: flex; */
  flex-direction: column;
  justify-content: center;
}

.avatars-container {
  position: relative;
  height: 24px;
  margin-top: 2px;
  /* display: flex; */
  align-items: center;
}

.overlapping-avatar {
  position: absolute;
  border: 1px solid white;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s ease;
  width: 24px !important;
  height: 24px !important;
}

.overlapping-avatar:hover {
  transform: translateY(-4px);
  z-index: 10;
}

.more-count {
  width: 24px;
  height: 24px;
  border: 1px solid white;
  font-size: 10px;
  border-radius: 50%;
  background: #e0e0e0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.text-caption {
  white-space: normal;
  font-size: 12px;
  line-height: 1.4;
  margin-bottom: 4px;
}

.loading {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 200px;
}

.no-notifications {
  text-align: center;
  padding: 40px 0;
}

.notification-section.q-mt-md {
  margin-top: 2px !important;
}

.col-7.q-pa-md {
  padding: 8px !important;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 8px;
}

.row.no-wrap.full-height {
  flex: 1;
}

.notification-list {
  display: flex;
  flex-direction: column;
  gap: 1px;
  background-color: #eef2f6;
}

.notification-card:hover {
  background-color: #f5f5f5; /* Lighter background on hover */
  cursor: pointer;
}

.text-center {
  background-color: white;
}
.back-button {
  background-color: rgba(102, 100, 102, 0.459);
  border-radius: 20px;
  height: 15px !important;
  display: flex;
  justify-content: center;
  align-items: center;
  color: whitesmoke;
}

.text-weight-medium {
  font-weight: 500;
}

.post-title-fallback {
  width: 100%;
  height: 100%;
  background-color: #f5f5f5;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px;
  text-align: center;
  font-size: 12px;
  color: #666;
  border-radius: 0 50px 100px 0;
}
</style>
