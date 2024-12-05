<template>
  <q-dialog ref="dialogRef" v-model="dialogModel" position="bottom" persistent :maximized="false"
    transition-show="slide-up" transition-hide="slide-down" @hide="onDialogHide" @touchstart="handleTouchStart"
    @touchmove="handleTouchMove" @touchend="handleTouchEnd">
    <q-card class="column dialog-card" :style="{ '--swipe-progress': swipeProgress }" @touchstart="handleTouchStart"
      @touchmove="handleTouchMove" @touchend="handleTouchEnd">
      <!-- Swipe indicator -->
      <div class="swipe-indicator"></div>

      <!-- Dialog Header -->
      <q-bar class="dialog-header">
        <q-space />
        <q-btn dense flat icon="close" v-close-popup class="" />
      </q-bar>
      <div style="width: 100%;">

        <p class="text-h6 text-center">Comments</p>
      </div>

      <!-- Comments List -->
      <div class="comments-list q-px-md custom-scroll" style="flex: 1; overflow-y: auto;">
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
                <span class="username text-capitalize">{{ comment.user.name }} </span>
                <span class="text-grey-6 text-caption">
                  {{ Number(comment.user.id) == Number(userStore.user.id) ? 'You' : '' }}</span>
                <br />
                <span class="comment-text">{{ comment.content }}</span>
              </div>
              <div class="comment-actions row items-center q-gutter-x-md q-mt-xs">
                <span class="text-grey-6 text-caption">{{ formatDate(comment.createdAt) }}</span>
              </div>
            </div>
            <q-btn flat round dense size="sm" :ripple="false" v-if="Number(comment.user.id) == Number(userStore.user.id)">
              <q-menu>
                <q-card>
                  <q-list>
                    <q-item clickable v-ripple>
                      <q-item-section>
                        <q-btn flat dense icon="delete" color="red" label="delete" size="sm" class="q-pa-none"
                          @click="deleteComment(comment.id,comment.user.id,comment.postId)"/>
                      </q-item-section>
                    </q-item>
                  </q-list>
                </q-card>
              </q-menu>
              <q-icon name="more_vert" />
            </q-btn>


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
              <q-btn color="primary" flat round @click="addComment" :disable="!newComment.trim()">
                <div
                  class="flex items-center justify-center gap-2 px-3 py-2 cursor-pointer hover:bg-gray-100 rounded-lg">
                  <div class="text-[#637588]" data-icon="PaperPlaneRight" data-size="24px" data-weight="regular">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" fill="currentColor"
                      viewBox="0 0 256 256">
                      <path
                        d="M223.87,114l-168-95.89A16,16,0,0,0,32.93,37.32l31,90.47a.42.42,0,0,0,0,.1.3.3,0,0,0,0,.1l-31,90.67A16,16,0,0,0,48,240a16.14,16.14,0,0,0,7.92-2.1l167.91-96.05a16,16,0,0,0,.05-27.89ZM48,224l0-.09L78.14,136H136a8,8,0,0,0,0-16H78.22L48.06,32.12,48,32l168,95.83Z">
                      </path>
                    </svg>
                  </div>
                </div>
              </q-btn>
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
import { api } from 'src/boot/axios';
const props = defineProps<{
  modelValue: boolean;
  post: CommunityPost;
  userInteractionRules: {
    dailyLikeLimit: number;
    dailyCommentLimit: number;
    dailyPostLimit: number;
    usedLikeCount: number;
    usedCommentCount: number;
    usedPostCount: number;
  };
}>();

const emit = defineEmits(['update:modelValue', 'update:post', 'update:userInteractionRules']);
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
const isSwipingDown = ref(false);

const handleTouchStart = (event: TouchEvent) => {
  touchStartY.value = event.touches[0].clientY;
  isSwipingDown.value = false;
};
const deleteComment = async (commentId: string, userId: string, postId: string) => {
  try {
    await api.post('/posts/delete-comment', {
      commentId: commentId,
      userId: userId,
      postId: postId
    });

    // Update the post by filtering out the deleted comment
    const updatedPost = {
      ...props.post,
      comments: props.post.comments.filter(comment => comment.id !== commentId),
      commentsCount: (props.post.commentsCount || 0) - 1
    };

    // Emit the updated post to parent component
    emit('update:post', updatedPost);

    // Show success notification (optional)

  } catch (error) {
    console.error('Error deleting comment:', error);
    $q.notify({
      message: 'Failed to delete comment',
      color: 'negative',
      position: 'top-right'
    });
  }
};
const handleTouchMove = (event: TouchEvent) => {
  const commentsList = document.querySelector('.comments-list');
  const currentY = event.touches[0].clientY;

  // Only handle swipe if we're at the top of the comments list
  if (commentsList && commentsList.scrollTop <= 0) {
    const deltaY = currentY - touchStartY.value;

    // Only consider downward swipes
    if (deltaY > 0) {
      isSwipingDown.value = true;
      touchEndY.value = currentY;
      const progress = Math.min(Math.max(deltaY / minSwipeDistance, 0), 1);
      swipeProgress.value = progress;

      // Prevent default only for downward swipes at the top
      event.preventDefault();
    }
  }
};

const handleTouchEnd = () => {
  const swipeDistance = touchEndY.value - touchStartY.value;

  // Only close if we were swiping down and met the distance threshold
  if (isSwipingDown.value && swipeDistance > minSwipeDistance && dialogRef.value) {
    dialogRef.value.hide();
  }

  // Reset values
  swipeProgress.value = 0;
  isSwipingDown.value = false;
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
  if (props.userInteractionRules.usedCommentCount >= props.userInteractionRules.dailyCommentLimit) {
    $q.notify({
      message: 'You have reached your daily comment limit',
      color: 'black',
      position: 'top-right'
    });
    return;
  }

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
      commentsCount: (props.post.commentsCount || 0) + 1
    };

    emit('update:post', updatedPost);
    newComment.value = '';

  } catch (error: any) {
    console.error('Error adding comment:', error);
    $q.notify({
      message: error.response?.data?.message || 'Failed to add comment',
      color: 'negative'
    });
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
  /* overflow: hidden;
  position: fixed;
  width: 100%;
  height: 100%; */
}

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

.custom-scroll {
  -ms-overflow-style: none;
  /* IE and Edge */
  scrollbar-width: none;
  /* Firefox */

  &::-webkit-scrollbar {
    display: none;
    /* Chrome, Safari and Opera */
    width: 0;
    height: 0;
  }
}

.dialog-header {
  padding: 8px 16px;
  // border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  background: white;
}

.comments-list {
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
  color: rgba(8, 8, 8, 0.9);
  font-weight: 600;

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
  border-radius: 50px;
  padding: 5px 20px;
}

.comment-input :deep(.q-field__control) {
  min-height: 36px;
}

.post-btn {
  font-weight: 600;
  padding: 0 12px;
  border: 1px solid red;

}

.cursor-pointer {
  cursor: pointer;
}

.cursor-pointer:hover {
  text-decoration: underline;
}
</style>
