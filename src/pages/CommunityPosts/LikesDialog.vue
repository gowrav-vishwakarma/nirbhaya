<template>
  <q-dialog
    ref="dialogRef"
    v-model="dialogModel"
    position="bottom"
    persistent
    :maximized="false"
    transition-show="slide-up"
    transition-hide="slide-down"
    @hide="onDialogHide"
    @touchstart="handleTouchStart"
    @touchmove="handleTouchMove"
    @touchend="handleTouchEnd"
  >
    <q-card
      class="column dialog-card"
      :style="{ '--swipe-progress': swipeProgress }"
    >
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
      <div
        class="likes-list q-px-md custom-scroll"
        style="flex: 1; overflow-y: auto"
      >
        <div v-if="isLoading" class="text-center q-pa-md">
          <q-spinner color="primary" size="2em" />
          <div class="q-mt-sm">Loading likes...</div>
        </div>

        <div v-else-if="!likes.length" class="text-grey text-center q-pa-md">
          No likes yet
        </div>

        <div
          v-else
          v-for="like in likes"
          :key="like.userId"
          class="like-item q-py-md"
        >
          <div class="row no-wrap items-center">
            <q-avatar
              size="32px"
              class="q-mr-sm cursor-pointer"
              @click="openUserProfile(like.userId)"
            >
              <img
                :src="
                  like.userId == 1
                    ? '/sos_logo_1080_1080.png'
                    : 'https://icons-for-free.com/iff/png/512/profile+profile+page+user+icon-1320186864367220794.png'
                "
                :alt="like.userName + '\'s profile'"
                style="object-fit: cover"
              />
            </q-avatar>
            <div class="col">
              <div
                class="user-name text-capitalize cursor-pointer"
                @click="openUserProfile(like.userId)"
              >
                {{ like.userName }}
              </div>
              <div class="text-grey-6 text-caption">
                {{ formatDate(like.likedAt) }}
              </div>
            </div>
          </div>
        </div>
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

const likes = ref<
  Array<{
    userId: string;
    userName: string;
    likedAt: string;
  }>
>([]);
const isLoading = ref(false);

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

const loadLikes = async () => {
  isLoading.value = true;
  try {
    const response = await communityPostService.getLikes(props.postId);
    likes.value = response;
  } catch (error) {
    console.error('Error loading likes:', error);
  } finally {
    isLoading.value = false;
  }
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

defineExpose({
  loadLikes,
});
</script>

<style lang="scss" scoped>
.dialog-card {
  width: 100%;
  max-width: 600px;
  border-radius: 16px 16px 0 0;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  position: relative;
  touch-action: pan-y;
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
  height: calc(90vh - 150px);
  -webkit-overflow-scrolling: touch;
  touch-action: pan-y;
  overscroll-behavior-y: contain;
  position: relative;
}

.like-item {
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
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
</style>
