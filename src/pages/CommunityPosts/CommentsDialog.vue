<template>
  <q-dialog ref="dialogRef" v-model="dialogModel" position="bottom" persistent :maximized="false"
    transition-show="slide-up" transition-hide="slide-down" @hide="onDialogHide" @touchstart="handleTouchStart"
    @touchmove.prevent="handleTouchMove" @touchend="handleTouchEnd">
    <q-card class="column dialog-card" :style="{ '--swipe-progress': swipeProgress }" @touchstart="handleTouchStart"
      @touchmove="handleTouchMove" @touchend="handleTouchEnd">
      <!-- Swipe indicator -->
      <div class="swipe-indicator"></div>

      <!-- Dialog Header -->
      <q-bar class="dialog-header">
        <q-btn dense flat icon="close" v-close-popup class="q-mr-sm" />
        <q-space />
        <q-btn dense flat icon="send" class="text-primary" />
      </q-bar>
      <div style="width: 100%;">

        <p class="text-h6 text-center">Comments</p>
      </div>

      <!-- Comments List -->
      <div class="comments-list q-px-md custom-scroll" style="overflow-y: auto">
        <div v-if="isLoading" class="text-center q-pa-md">
          <q-spinner color="primary" size="2em" />
          <div class="q-mt-sm">Loading comments...</div>
        </div>

        <div v-else-if="!props.post?.comments?.length" class="text-grey text-center q-pa-md">
          No comments yet. Be the first to comment!
        </div>

        <div v-else v-for="comment in props.post.comments" :key="comment.id" class="comment-item q-py-md">
          <div class="row no-wrap">
            <q-avatar size="32px" class="q-mr-sm">
              <img
                src="https://icons-for-free.com/iff/png/512/profile+profile+page+user+icon-1320186864367220794.png" />
            </q-avatar>
            <div class="col">
              <div class="comment-content">
                <span class="username text-capitalize">{{ comment.user.name }}</span>
                <br />
                <span class="comment-text">{{ comment.content }}</span>
              </div>
              <div class="comment-actions row items-center q-gutter-x-md q-mt-xs">
                <span class="text-grey-6 text-caption">{{ formatDate(comment.createdAt) }}</span>
                <!-- <span class="text-grey-6 text-caption cursor-pointer">Reply</span>
                <span class="text-grey-6 text-caption cursor-pointer">Like</span> -->
              </div>
            </div>
            <q-btn flat round dense size="sm" icon="more_vert" class="q-ml-sm" />
          </div>
        </div>
      </div>

      <!-- Add Comment Section -->
      <div class="comment-input-section q-px-md">
        <div class="row items-center">
          <q-avatar size="32px" class="q-mr-sm">
            <img src="https://icons-for-free.com/iff/png/512/profile+profile+page+user+icon-1320186864367220794.png" />
          </q-avatar>
          <q-input v-model="newComment" class="col comment-input" placeholder="Add a comment..." maxlength="500" dense
            borderless autogrow @keyup.enter="addComment">
            <template v-slot:after>
              <q-btn flat no-caps :disable="!newComment.trim()" @click="addComment" class="post-btn" color="primary"
                label="Post" />
            </template>
          </q-input>
        </div>
      </div>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useQuasar, useDialogPluginComponent } from 'quasar';
import { useUserStore } from 'src/stores/user-store';
import type { CommunityPost } from 'src/types/CommunityPost';
import { commentService } from 'src/services/commentService';

const props = defineProps({
  modelValue: Boolean,
  post: {
    type: Object as () => CommunityPost,
    required: true
  }
});

const emit = defineEmits(['update:modelValue', 'update:post']);
const $q = useQuasar();
const userStore = useUserStore();
const newComment = ref('');
const isLoading = ref(false);

// Dialog plugin setup
const { dialogRef, onDialogHide } = useDialogPluginComponent();

// Touch handling
const touchStartY = ref(0);
const touchEndY = ref(0);
const minSwipeDistance = 100;
const swipeProgress = ref(0);

const handleTouchStart = (event: TouchEvent) => {
  touchStartY.value = event.touches[0].clientY;
};

const handleTouchMove = (event: TouchEvent) => {
  event.preventDefault();
  touchEndY.value = event.touches[0].clientY;
  const progress = Math.min(
    Math.max((touchEndY.value - touchStartY.value) / minSwipeDistance, 0),
    1
  );
  swipeProgress.value = progress;
};

const handleTouchEnd = () => {
  const swipeDistance = touchEndY.value - touchStartY.value;
  if (swipeDistance > minSwipeDistance && dialogRef.value) {
    dialogRef.value.hide();
  }
  swipeProgress.value = 0;
};

const dialogModel = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
});

const loadComments = async () => {
  isLoading.value = true;
  try {
    const comments = await commentService.getComments(String(props.post.id));
    const updatedPost = {
      ...props.post,
      comments: comments
    };
    emit('update:post', updatedPost);
  } catch (error: any) {
    console.error('Error loading comments:', error);
    $q.notify({
      message: error.response?.data?.message || 'Failed to load comments',
      color: 'negative'
    });
  } finally {
    isLoading.value = false;
  }
};

watch(() => props.modelValue, (newValue) => {
  if (newValue) {
    loadComments();
  }
});

const addComment = async () => {
  if (!newComment.value.trim()) return;

  try {
    const commentData = {
      content: newComment.value.trim(),
      userId: String(userStore.user.id)
    };

    const response = await commentService.addComment(String(props.post.id), commentData);

    // Create new comment with proper structure
    const newCommentData = {
      ...response,
      user: {
        id: userStore.user.id,
        name: userStore.user.name || userStore.user.email,
        email: userStore.user.email,
        avatar: userStore.user.avatar
      }
    };

    // Update the post with the new comment and increment comment count
    const updatedPost = {
      ...props.post,
      comments: [...(props.post.comments || []), newCommentData],
      commentsCount: (props.post.commentsCount || 0) + 1  // Increment comment count
    };

    emit('update:post', updatedPost);
    newComment.value = ''; // This will now clear the input
  } catch (error: any) {
    console.error('Error adding comment:', error);
  }
};

const formatDate = (date: string) => {
  const now = new Date();
  const postDate = new Date(date);
  const diffInSeconds = Math.floor((now.getTime() - postDate.getTime()) / 1000);

  if (diffInSeconds < 30) {
    return 'just now';
  }

  if (diffInSeconds < 60) {
    return `${diffInSeconds} seconds ago`;
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes} ${diffInMinutes === 1 ? 'minute' : 'minutes'} ago`;
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours} ${diffInHours === 1 ? 'hour' : 'hours'} ago`;
  }

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) {
    return `${diffInDays} ${diffInDays === 1 ? 'day' : 'days'} ago`;
  }

  const diffInWeeks = Math.floor(diffInDays / 7);
  if (diffInWeeks < 4) {
    return `${diffInWeeks} ${diffInWeeks === 1 ? 'week' : 'weeks'} ago`;
  }

  const diffInMonths = Math.floor(diffInDays / 30);
  if (diffInMonths < 12) {
    return `${diffInMonths} ${diffInMonths === 1 ? 'month' : 'months'} ago`;
  }

  const diffInYears = Math.floor(diffInDays / 365);
  return `${diffInYears} ${diffInYears === 1 ? 'year' : 'years'} ago`;
};

defineExpose({
  dialogRef,
  onDialogHide
});
</script>

<style lang="scss" scoped>
:deep(body) {
  overscroll-behavior-y: contain;
  overflow: hidden;
  position: fixed;
  width: 100%;
  height: 100%;
}

.dialog-card {
  width: 100%;
  max-width: 600px;
  border-radius: 16px 16px 0 0;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  position: relative;
  touch-action: none;
  overscroll-behavior-y: contain;

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

.custom-scroll {
  overflow-y: auto;
  scrollbar-width: none;
  -ms-overflow-style: none;
  -webkit-overflow-scrolling: touch;
  height: 100%;

  &::-webkit-scrollbar {
    width: 0;
    height: 0;
    display: none;
  }
}

.dialog-header {
  padding: 8px 16px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  background: white;
}

.comments-list {
  flex: 1;
  min-height: 0;
  background: white;
  padding-bottom: env(safe-area-inset-bottom);
}

.comment-item {
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
}

.comment-content {
  font-size: 14px;
  line-height: 1.4;
}

.username {
  font-weight: 700;
  margin-right: 6px;
}

.comment-text {
  color: rgba(0, 0, 0, 0.9);
}

.comment-actions {
  font-size: 12px;
}

.comment-input-section {
  border-top: 1px solid rgba(0, 0, 0, 0.1);
  padding: 8px 16px;
  background: white;
}

.comment-input {
  background: #f8f8f8;
  border-radius: 20px;
  padding: 8px 16px;
}

.comment-input :deep(.q-field__control) {
  min-height: 36px;
}

.post-btn {
  font-weight: 600;
  padding: 0 12px;
}

.cursor-pointer {
  cursor: pointer;
}

.cursor-pointer:hover {
  text-decoration: underline;
}
</style>
