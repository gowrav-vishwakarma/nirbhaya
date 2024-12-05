<template>
  <div>
    <!-- Engagement Section -->
    <div class="flex flex-wrap justify-evenly gap-4 px-4 py-2 py-2 q-py-sm">
      <div class="flex items-start justify-start gap-2" style="width: 30%;">
        <q-btn @click="handleLike" flat round style="margin-left: 20px;">
          <div class="flex items-center justify-center gap-2 px-3 py-2 cursor-pointer hover:bg-gray-100 rounded-lg">
            <div :class="[
              'heart-icon',
              { 'liked': post.wasLiked || post.liked }
            ]">
              <svg xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" fill="currentColor"
                viewBox="0 0 256 256">
                <path v-if="post.wasLiked || post.liked"
                  d="M240,94c0,70-103.79,126.66-108.21,129a8,8,0,0,1-7.58,0C119.79,220.66,16,164,16,94A62.07,62.07,0,0,1,78,32c20.65,0,38.73,8.88,50,23.89C139.27,40.88,157.35,32,178,32A62.07,62.07,0,0,1,240,94Z">
                </path>
                <path v-else
                  d="M178,32c-20.65,0-38.73,8.88-50,23.89C116.73,40.88,98.65,32,78,32A62.07,62.07,0,0,0,16,94c0,70,103.79,126.66,108.21,129a8,8,0,0,0,7.58,0C136.21,220.66,240,164,240,94A62.07,62.07,0,0,0,178,32ZM128,206.8C109.74,196.16,32,147.69,32,94A46.06,46.06,0,0,1,78,48c19.45,0,35.78,10.36,42.6,27a8,8,0,0,0,14.8,0c6.82-16.67,23.15-27,42.6-27a46.06,46.06,0,0,1,46,46C224,147.61,146.24,196.15,128,206.8Z">
                </path>
              </svg>
            </div>
          </div>
        </q-btn>
        <p class="text-[#637588] text-[13px] font-bold leading-normal tracking-[0.015em]" style="padding-top: 10px;">
          {{ post.likesCount }}
        </p>
      </div>

      <div class="flex items-center justify-center gap-2" style="width: 30%;">
        <q-btn flat round @click="toggleComments">
          <div class="flex items-center justify-center gap-2 px-3 py-2 cursor-pointer hover:bg-gray-100 rounded-lg">
            <div class="text-[#637588]" data-icon="ChatTeardropText" data-size="24px" data-weight="regular">
              <svg xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" fill="currentColor"
                viewBox="0 0 256 256">
                <path
                  d="M168,112a8,8,0,0,1-8,8H96a8,8,0,0,1,0-16h64A8,8,0,0,1,168,112Zm-8,24H96a8,8,0,0,0,0,16h64a8,8,0,0,0,0-16Zm72-12A100.11,100.11,0,0,1,132,224H47.67A15.69,15.69,0,0,1,32,208.33V124a100,100,0,0,1,200,0Zm-16,0a84,84,0,0,0-168,0v84h84A84.09,84.09,0,0,0,216,124Z">
                </path>
              </svg>
            </div>
          </div>
        </q-btn>
        <p class="text-[#637588] text-[13px] font-bold leading-normal tracking-[0.015em]" style="padding-top: 10px;">
          {{ post.commentsCount || '' }}
        </p>
      </div>

      <div class="flex items-center justify-center gap-2" style="width: 40%;">
        <q-btn @click="handleShare" flat round>
          <div class="flex items-center justify-center gap-2 px-3 py-2 cursor-pointer hover:bg-gray-100 rounded-lg">
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
        <p class="text-[#637588] text-[13px] font-bold leading-normal tracking-[0.015em]" style="padding-top: 10px;">
          {{ post.sharesCount || '' }}
        </p>
      </div>
    </div>

    <!-- Comments Dialog -->
    <CommentsDialog v-model="showComments" :post="post" :userInteractionRules="userInteractionRules"
      @update:post="handlePostUpdate" @update:userInteractionRules="$emit('update:userInteractionRules', $event)" />
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { useQuasar } from 'quasar';
import { useUserStore } from 'src/stores/user-store';
import type { CommunityPost } from 'src/types/CommunityPost';
import { communityPostService } from 'src/services/communityPostService';
import CommentsDialog from './CommentsDialog.vue';

// Define a type that matches the actual post structure
interface PostProps extends Omit<CommunityPost, 'liked'> {
  userName: string;
  wasLiked: boolean;
  liked: boolean;
}

const props = defineProps<{
  post: PostProps;
  userInteractionRules: {
    dailyLikeLimit: number;
    dailyCommentLimit: number;
    dailyPostLimit: number;
    usedLikeCount: number;
    usedCommentCount: number;
    usedPostCount: number;
  };
}>();

const emit = defineEmits(['update:post', 'update:userInteractionRules']);

const $q = useQuasar();
const userStore = useUserStore();
const showComments = ref(false);

const handlePostUpdate = (updatedPost: CommunityPost | PostProps) => {
  emit('update:post', updatedPost);
};

const handleLike = async () => {
  try {
    if (!userStore.user) {
      $q.notify({
        message: 'Please login to like posts',
        color: 'warning'
      });
      return;
    }

    // Check like limits
    if (!props.post.wasLiked && !props.post.liked) {
      if (props.userInteractionRules.usedLikeCount >= props.userInteractionRules.dailyLikeLimit) {
        $q.notify({
          message: 'You have reached your daily like limit',
          color: 'gray',
          position: 'top-right'
        });
        return;
      }
    }

    const updatedPost = { ...props.post };
    const postId = typeof updatedPost.id === 'string' ? parseInt(updatedPost.id) : updatedPost.id;

    if (updatedPost.wasLiked || updatedPost.liked) {
      await communityPostService.unlikePost(postId, userStore.user.id);
      updatedPost.wasLiked = false;
      updatedPost.liked = false;
      updatedPost.likesCount = Math.max((updatedPost.likesCount || 1) - 1, 0);
    } else {
      await communityPostService.likePost(postId, userStore.user.id);
      updatedPost.wasLiked = true;
      updatedPost.liked = true;
      updatedPost.likesCount = (updatedPost.likesCount || 0) + 1;
    }

    emit('update:post', updatedPost);
  } catch (error) {
    console.error('Error handling like:', error);

  }
};

const toggleComments = () => {
  showComments.value = !showComments.value;
};

const handleShare = async () => {
  try {
    // Get the first media URL if available
    console.log('props.post.mediaUrls', props.post);

    let shareobject = {}
    if (props.post.mediaUrls?.length) {
      const mediaUrl = props.post.mediaUrls?.[0] || '';
      console.log('mediaUrl', mediaUrl);
      const blob = await (await fetch(mediaUrl)).blob();
      const file = new File([blob], 'fileName.png', { type: blob.type });
      shareobject = {
        title: props.post.title,
        text: props.post.description,
        url: window.location.href,
        files: [file]
      }
    }
    if (props.post.videoUrl) {
      const mediaUrl = `https://www.youtube.com/embed/${props.post.videoUrl}`;
      shareobject = {
        title: props.post.title,
        text: props.post.description,
        url: mediaUrl,
      }
    }

    if (navigator.share) {
      await navigator.share(shareobject);

      // Update share count
      await communityPostService.sharePost(props.post.id.toString());
      const updatedPost = {
        ...props.post,
        sharesCount: (props.post.sharesCount || 0) + 1
      };
      emit('update:post', updatedPost);
    } else {
      // Fallback for browsers that don't support Web Share API
      const textToShare = `${props.post.title}\n${props.post.description}\n${window.location.href}`;
      await navigator.clipboard.writeText(textToShare);
      $q.notify({
        message: 'Link copied to clipboard!',
        color: 'black',
        position: 'top-right'
      });
    }
  } catch (error) {
    console.error('Error sharing post:', error);
  }
};

// Add watch for comments dialog to update comment count
watch(showComments, async (newValue) => {
  if (newValue) {
    // Check comment limits when opening comments
    if (props.userInteractionRules.usedCommentCount >= props.userInteractionRules.dailyCommentLimit) {
      console.log('You have reached your daily comment limit');

      // $q.notify({
      //   message: 'You have reached your daily comment limit',
      //   color: 'black',
      //   position: 'top-right'
      // });
    }
  }
});
</script>

<style lang="scss" scoped>
.heart-icon {
  color: #637588;
  transition: color 0.2s ease;

  &.liked {
    color: #ef4444;
  }
}

.comment-input {
  flex: 1;

  :deep(.q-field__control) {
    border-radius: 12px;
    min-height: 48px;
  }

  :deep(.q-field__native) {
    padding: 12px 16px;
  }
}

.comment-input-section {
  position: sticky;
  bottom: 0;
  background: white;
  z-index: 1;
}

.q-dialog__inner--bottom {
  padding-bottom: 0;
}

.q-card {
  max-height: 90vh;
  display: flex;
  flex-direction: column;
}

.comments-list {
  overflow-y: auto;
  flex: 1;
}
</style>
