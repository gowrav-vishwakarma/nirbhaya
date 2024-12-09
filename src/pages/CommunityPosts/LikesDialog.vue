<template>
  <q-dialog style="padding-bottom: env(safe-area-inset-bottom);" ref="dialogRef" v-model="dialogModel" position="bottom"
    persistent :maximized="false" transition-show="slide-up" transition-hide="slide-down" @hide="onDialogHide"
    @touchstart="handleTouchStart" @touchmove="handleTouchMove" @touchend="handleTouchEnd">
    <q-card class="column dialog-card" :style="{ '--swipe-progress': swipeProgress }">
      <!-- Swipe indicator -->
      <div class="swipe-indicator"></div>

      <!-- Dialog Header -->
      <q-bar class="dialog-header">
        <q-space />
        <q-btn dense flat icon="close" v-close-popup />
      </q-bar>
      <div style="width: 100%">
        <p class="text-h6 text-center">Liked by</p>
      </div>

      <!-- Likes List -->
      <div class="likes-list q-px-md custom-scroll"
        style="flex: 1; overflow-y: auto; max-height: 60vh; -webkit-overflow-scrolling: touch;" @scroll="onScroll">
        <!-- Initial loading state -->
        <div v-if="isLoading && !likes.length" class="text-center q-pa-md">
          <q-spinner color="primary" size="2em" />
          <div class="q-mt-sm">Loading likes...</div>
        </div>

        <div v-else-if="!likes.length" class="text-grey text-center q-pa-md">
          No likes yet
        </div>

        <template v-else>
          <!-- Likes list -->
          <div v-for="like in likes" :key="like.id" class="like-item q-py-md">
            <div class="row no-wrap items-center">
              <q-avatar size="32px" class="q-mr-sm cursor-pointer" @click="openUserProfile(like.user.id)">
                <img :src="Number(like.user.id) === 1
                  ? '/sos_logo_1080_1080.png'
                  : 'https://icons-for-free.com/iff/png/512/profile+profile+page+user+icon-1320186864367220794.png'
                  " :alt="like.user.name + '\'s profile'" style="object-fit: cover" />
              </q-avatar>
              <div class="col">
                <div class="user-name text-capitalize cursor-pointer" @click="openUserProfile(like.user.id)">
                  {{ like.user.name }}
                </div>
                <div class="text-grey-6 text-caption">
                  {{ formatDate(like.createdAt) }}
                </div>
              </div>
            </div>
          </div>

          <!-- Loading more indicator -->
          <div v-if="isLoading" class="text-center q-pa-md">
            <q-spinner color="primary" size="2em" />
            <div class="q-mt-sm">Loading more likes...</div>
          </div>

          <!-- End of list indicator -->
          <div v-if="!hasMoreLikes && likes.length > 0" class="text-grey text-center q-pa-md">
            No more likes to load
          </div>
        </template>
      </div>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useDialogPluginComponent, useQuasar } from 'quasar';
import { communityPostService } from 'src/services/communityPostService';
import { useRouter } from 'vue-router';

const props = defineProps<{
  modelValue: boolean;
  postId: number | string;
}>();

const emit = defineEmits(['update:modelValue']);

// Dialog plugin setup
const { dialogRef, onDialogHide } = useDialogPluginComponent();

const likes = ref<Array<{
  id: number;
  userId: number;
  postId: number;
  createdAt: string;
  updatedAt: string;
  user: {
    id: number;
    name: string;
    email: string | null;
  };
}>>([]);
const isLoading = ref(false);
const page = ref(1);
const pageSize = 7;
const hasMoreLikes = ref(true);
const totalPages = ref(0);

// Touch handling
const touchStartY = ref(0);
const touchEndY = ref(0);
const minSwipeDistance = 100;
const swipeProgress = ref(0);
const isSwipingDown = ref(false);

const dialogModel = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
});

const handleTouchStart = (event: TouchEvent) => {
  touchStartY.value = event.touches[0].clientY;
  isSwipingDown.value = false;
};

const handleTouchMove = (event: TouchEvent) => {
  const likesList = document.querySelector('.likes-list');
  const currentY = event.touches[0].clientY;

  if (likesList && likesList.scrollTop <= 0) {
    const deltaY = currentY - touchStartY.value;
    if (deltaY > 0) {
      isSwipingDown.value = true;
      touchEndY.value = currentY;
      const progress = Math.min(Math.max(deltaY / minSwipeDistance, 0), 1);
      swipeProgress.value = progress;
      event.preventDefault();
    }
  }
};

const handleTouchEnd = () => {
  const swipeDistance = touchEndY.value - touchStartY.value;
  if (
    isSwipingDown.value &&
    swipeDistance > minSwipeDistance &&
    dialogRef.value
  ) {
    dialogRef.value.hide();
  }
  swipeProgress.value = 0;
  isSwipingDown.value = false;
};

const loadMoreLikes = async () => {
  if (isLoading.value || !hasMoreLikes.value) return;

  isLoading.value = true;
  try {
    const response = await communityPostService.getLikes(props.postId, {
      page: page.value,
      pageSize: pageSize
    });

    const { likes: likesData, totalPages: total } = response.data;
    console.log('Received likes data:', likesData);
    totalPages.value = total;

    // Only update if we got data
    if (likesData && likesData.length > 0) {
      likes.value = [...likes.value, ...likesData];
      page.value++;
      console.log('Updated likes:', likes.value.length);
    }

    // Check if we've reached the last page
    hasMoreLikes.value = page.value <= totalPages.value;
    if (!hasMoreLikes.value) {
      console.log('No more likes to load');
    }

  } catch (error) {
    console.error('Error loading likes:', error);
    $q.notify({
      message: 'Error loading likes',
      color: 'negative',
    });
  } finally {
    isLoading.value = false;
  }
};

const loadLikes = async () => {
  page.value = 1;
  hasMoreLikes.value = true;
  totalPages.value = 0;
  likes.value = [];
  await loadMoreLikes();
};

const formatDate = (date: string) => {
  const now = new Date();
  const likeDate = new Date(date);
  const diffInSeconds = Math.floor((now.getTime() - likeDate.getTime()) / 1000);

  if (diffInSeconds < 30) return 'just now';
  if (diffInSeconds < 60) return `${diffInSeconds} seconds ago`;

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60)
    return `${diffInMinutes} ${diffInMinutes === 1 ? 'minute' : 'minutes'} ago`;

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24)
    return `${diffInHours} ${diffInHours === 1 ? 'hour' : 'hours'} ago`;

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7)
    return `${diffInDays} ${diffInDays === 1 ? 'day' : 'days'} ago`;

  return likeDate.toLocaleDateString();
};

const router = useRouter();
const $q = useQuasar();

const openUserProfile = (userId: string | number) => {
  try {
    router.push(`/my-posts/${userId}`);
    dialogRef.value?.hide();
  } catch (error) {
    console.error('Error navigating to user profile:', error);
    $q.notify({
      message: 'Unable to open user profile',
      color: 'negative',
    });
  }
};

const onScroll = (event: Event) => {
  const element = event.target as HTMLElement;
  const scrollBottom = element.scrollTop + element.clientHeight;
  const threshold = element.scrollHeight - 50;

  if (scrollBottom >= threshold && !isLoading.value && hasMoreLikes.value) {
    console.log('Loading more likes...', {
      page: page.value,
      totalPages: totalPages.value,
      hasMore: hasMoreLikes.value
    });
    loadMoreLikes();
  }
};

defineExpose({
  loadLikes,
});
</script>

<style lang="scss" scoped>
.dialog-card {
  width: 100%;
  max-width: 600px;
  border-radius: 16px 16px 0 0;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
  position: relative;
  overscroll-behavior: contain;

  &::before {
    content: '';
    position: absolute;
    top: 8px;
    left: 50%;
    transform: translateX(-50%);
    width: 40px;
    height: 4px;
    background: #{rgba(#000, calc(0.1 + var(--swipe-progress, 0) * 0.3))};
    border-radius: 2px;
    z-index: 1;
    transition: background-color 0.1s ease;
  }
}

.likes-list {
  flex: 1;
  overflow-y: auto;
  background: white;
  padding-bottom: env(safe-area-inset-bottom);
  min-height: 200px;
  max-height: 60vh;
  -webkit-overflow-scrolling: touch;
  overscroll-behavior-y: contain;
  position: relative;
  scroll-behavior: smooth;
}

.like-item {
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
  padding: 12px 0;
}

.user-name {
  font-weight: 600;
  font-size: 14px;
}

.custom-scroll {
  -ms-overflow-style: none;
  scrollbar-width: none;

  &::-webkit-scrollbar {
    display: none;
    width: 0;
    height: 0;
  }
}

.cursor-pointer {
  cursor: pointer;

  &:hover {
    opacity: 0.8;
  }
}

.user-name {
  &:hover {
    text-decoration: underline;
  }
}

.dialog-header {
  background-color: white;
}

.q-spinner {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
}
</style>
