<template>
  <div>
    <!-- Engagement Section -->
    <div class="flex flex-wrap justify-evenly gap-4 px-4 py-2 py-2 q-py-sm">
      <div class="flex items-start justify-start gap-2" style="width: 30%">
        <q-btn @click="handleLike" flat round style="margin-left: 20px">
          <div
            class="flex items-center justify-center gap-2 px-3 py-2 cursor-pointer hover:bg-gray-100 rounded-lg"
          >
            <div
              :class="['heart-icon', { liked: post.wasLiked || post.liked }]"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24px"
                height="24px"
                fill="currentColor"
                viewBox="0 0 256 256"
              >
                <path
                  d="M178,32c-20.65,0-38.73,8.88-50,23.89C116.73,40.88,98.65,32,78,32A62.07,62.07,0,0,0,16,94c0,70,103.79,126.66,108.21,129a8,8,0,0,0,7.58,0C136.21,220.66,240,164,240,94A62.07,62.07,0,0,0,178,32ZM128,206.8C109.74,196.16,32,147.69,32,94A46.06,46.06,0,0,1,78,48c19.45,0,35.78,10.36,42.6,27a8,8,0,0,0,14.8,0c6.82-16.67,23.15-27,42.6-27a46.06,46.06,0,0,1,46,46C224,147.61,146.24,196.15,128,206.8Z"
                ></path>
              </svg>
            </div>
          </div>
        </q-btn>
        <p
          class="text-[#637588] text-[13px] font-bold leading-normal tracking-[0.015em]"
          style="padding-top: 10px"
        >
          {{ post.likesCount }}
        </p>
      </div>

      <div class="flex items-center justify-center gap-2" style="width: 30%">
        <q-btn flat round @click="toggleComments">
          <div
            class="flex items-center justify-center gap-2 px-3 py-2 cursor-pointer hover:bg-gray-100 rounded-lg"
          >
            <div
              class="text-[#637588]"
              data-icon="ChatTeardropText"
              data-size="24px"
              data-weight="regular"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24px"
                height="24px"
                fill="currentColor"
                viewBox="0 0 256 256"
              >
                <path
                  d="M168,112a8,8,0,0,1-8,8H96a8,8,0,0,1,0-16h64A8,8,0,0,1,168,112Zm-8,24H96a8,8,0,0,0,0,16h64a8,8,0,0,0,0-16Zm72-12A100.11,100.11,0,0,1,132,224H47.67A15.69,15.69,0,0,1,32,208.33V124a100,100,0,0,1,200,0Zm-16,0a84,84,0,0,0-168,0v84h84A84.09,84.09,0,0,0,216,124Z"
                ></path>
              </svg>
            </div>
          </div>
        </q-btn>
        <p
          class="text-[#637588] text-[13px] font-bold leading-normal tracking-[0.015em]"
          style="padding-top: 10px"
        >
          {{ post.commentsCount || '' }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import type { CommunityPost } from 'src/types/CommunityPost';

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

const router = useRouter();

const handleLike = () => {
  router.push('/login');
};

const toggleComments = () => {
  router.push('/login');
};
</script>

<style lang="scss" scoped>
.heart-icon {
  color: #637588;
  transition: color 0.2s ease;

  &.liked {
    color: #637588;
  }
}
</style>
