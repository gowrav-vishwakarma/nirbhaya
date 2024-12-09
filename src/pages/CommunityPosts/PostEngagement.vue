<template>
  <div>
    <!-- Engagement Section -->
    <div class="flex flex-wrap justify-evenly gap-4 px-4 py-2 py-2 q-py-sm">
      <div class="flex items-start justify-start gap-2" style="width: 30%">
        <q-btn @click="handleLike" flat round style="margin-left: 20px">
          <div class="flex items-center justify-center gap-2 px-3 py-2 cursor-pointer hover:bg-gray-100 rounded-lg">
            <div :class="['heart-icon', { liked: post.wasLiked || post.liked }]">
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
        <p class="text-[#637588] text-[13px] font-bold leading-normal tracking-[0.015em] cursor-pointer"
          style="padding-top: 10px" @click="showLikesList">
          {{ post.likesCount }}
        </p>
      </div>

      <div class="flex items-center justify-center gap-2" style="width: 30%">
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
        <p class="text-[#637588] text-[13px] font-bold leading-normal tracking-[0.015em]" style="padding-top: 10px">
          {{ post.commentsCount || '' }}
        </p>
      </div>

      <div v-if="post.isBusinessPost" class="flex items-center justify-center gap-2" style="width: 40%">
        <q-btn flat round @click="openWhatsApp">
          <div class="flex items-center justify-center gap-2 px-3 py-2 cursor-pointer hover:bg-gray-100 rounded-lg">
            <div class="text-[#25D366]">
              <svg xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" fill="currentColor"
                viewBox="0 0 256 256">
                <path
                  d="M187.58,144.84l-32-16a8,8,0,0,0-8,.5l-14.69,9.8a40.55,40.55,0,0,1-16-16l9.8-14.69a8,8,0,0,0,.5-8l-16-32A8,8,0,0,0,104,64a40,40,0,0,0-40,40,88.1,88.1,0,0,0,88,88,40,40,0,0,0,40-40A8,8,0,0,0,187.58,144.84ZM152,176a72.08,72.08,0,0,1-72-72A24,24,0,0,1,99.29,80.46l11.48,23L101,118.12a8,8,0,0,0-.73,7.51,56.47,56.47,0,0,0,30.15,30.15A8,8,0,0,0,138,155l14.71-9.8,23,11.48A24,24,0,0,1,152,176ZM128,24A104,104,0,0,0,36.18,176.88L24.83,210.93a16,16,0,0,0,20.24,20.24l34.05-11.35A104,104,0,1,0,128,24Zm0,192a87.87,87.87,0,0,1-44.06-11.81,8,8,0,0,0-6.54-.67L40,216,52.47,178.6a8,8,0,0,0-.67-6.54A88,88,0,1,1,128,216Z" />
              </svg>
            </div>

          </div>
        </q-btn>
      </div>

      <!-- <div class="flex items-center justify-center gap-2" style="width: 40%">
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
        <p class="text-[#637588] text-[13px] font-bold leading-normal tracking-[0.015em]" style="padding-top: 10px">
          {{ post.sharesCount || '' }}
        </p>
      </div> -->
    </div>

    <!-- Comments Dialog -->
    <CommentsDialog v-model="showComments" :post="post" :userInteractionRules="userInteractionRules"
      @update:post="handlePostUpdate" @update:userInteractionRules="
        $emit('update:userInteractionRules', $event)
        " />

    <LikesDialog v-model="showLikes" :post-id="post.id" ref="likesDialogRef" />
  </div>
</template>

<script setup lang="ts">
import { ref, watch, nextTick } from 'vue';
import { useQuasar } from 'quasar';
import { useUserStore } from 'src/stores/user-store';
import type { CommunityPost } from 'src/types/CommunityPost';
import { communityPostService } from 'src/services/communityPostService';
import CommentsDialog from './CommentsDialog.vue';
import { Share } from '@capacitor/share';
import { Filesystem, Directory } from '@capacitor/filesystem';
import Konva from 'konva';
import { communityService } from 'src/services/communityService';
import LikesDialog from './LikesDialog.vue';

// Define a type that matches the actual post structure
interface PostProps extends Omit<CommunityPost, 'liked'> {
  userName: string;
  wasLiked: boolean;
  liked: boolean;
}

const props = defineProps<{
  post: PostProps;
  userInteractionRules?: {
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
const imageCdn = ref(
  'https://xavoc-technocrats-pvt-ltd.blr1.cdn.digitaloceanspaces.com/'
);

const handlePostUpdate = (updatedPost: CommunityPost | PostProps) => {
  emit('update:post', updatedPost);
};

const handleLike = async () => {
  try {
    if (!userStore.user) {
      $q.notify({
        message: 'Please login to like posts',
        color: 'warning',
      });
      return;
    }

    // Check like limits only if userInteractionRules exists
    if (
      !props.post.wasLiked &&
      !props.post.liked &&
      props.userInteractionRules
    ) {
      if (
        props.userInteractionRules.usedLikeCount >=
        props.userInteractionRules.dailyLikeLimit
      ) {
        $q.notify({
          message: 'You have reached your daily like limit',
          color: 'gray',
          position: 'top-right',
        });
        return;
      }
    }

    const updatedPost = { ...props.post };
    const postId =
      typeof updatedPost.id === 'string'
        ? parseInt(updatedPost.id)
        : updatedPost.id;

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

// Add utility function for Konva conversion
const imageToBase64WithKonva = (imageUrl: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.crossOrigin = 'Anonymous';

    image.onload = () => {
      // Create temporary container
      const container = document.createElement('div');
      container.style.display = 'none';
      document.body.appendChild(container);

      // Create Konva stage
      const stage = new Konva.Stage({
        container: container,
        width: image.width,
        height: image.height,
      });

      // Create layer and add image
      const layer = new Konva.Layer();
      const konvaImage = new Konva.Image({
        image: image,
        width: image.width,
        height: image.height,
      });

      layer.add(konvaImage);
      stage.add(layer);

      // Convert to base64
      const dataUrl = stage.toDataURL({
        mimeType: 'image/png',
        quality: 1,
      });

      // Clean up
      stage.destroy();
      document.body.removeChild(container);

      // Return base64 data without the prefix
      resolve(dataUrl.split(',')[1]);
    };

    image.onerror = () => reject(new Error('Failed to load image'));
    image.src = imageUrl;
  });
};

// Update handleShare function
const handleShare = async () => {
  try {
    const shareTitle = props.post.title || '';
    const shareText = props.post.description || '';
    const shareUrl = window.location.href;

    // For video posts
    if (props.post.videoUrl) {
      await Share.share({
        title: shareTitle,
        text: shareText,
        url: `https://www.youtube.com/embed/${props.post.videoUrl}`,
      });
    }
    // For posts with media
    else if (props.post.mediaUrls?.length) {
      const mediaUrl = props.post.mediaUrls[0];
      const fullUrl = `${imageCdn.value}${mediaUrl}`;

      try {
        // Convert image to base64 using Konva
        const base64Data = await imageToBase64WithKonva(fullUrl);

        // Get file extension and create unique filename
        const extension = mediaUrl.split('.').pop() || 'jpg';
        const fileName = `shared_image_${Date.now()}.${extension}`;

        // Save file using Filesystem
        await Filesystem.writeFile({
          path: fileName,
          data: base64Data,
          directory: Directory.Cache,
          recursive: true,
        });

        // Get the actual file path
        const fileInfo = await Filesystem.getUri({
          directory: Directory.Cache,
          path: fileName,
        });

        console.log('File path:', fileInfo.uri);

        // On Android, we need to ensure the path is properly formatted
        const filePath = fileInfo.uri.startsWith('file://')
          ? fileInfo.uri
          : `file://${fileInfo.uri}`;

        // Share with the actual file path
        await Share.share({
          title: shareTitle,
          text: shareText,
          files: [filePath], // Use the formatted file path
          dialogTitle: 'Share Image',
        });

        // Clean up - delete the temporary file
        try {
          await Filesystem.deleteFile({
            path: fileName,
            directory: Directory.Cache,
          });
        } catch (cleanupError) {
          console.warn('Error cleaning up temp file:', cleanupError);
        }
      } catch (fileError) {
        console.error('File share error:', fileError);

        // Fallback to basic share with URL
        // await Share.share({
        //   title: shareTitle,
        //   text: `${shareText}\n${fullUrl}`,
        //   url: shareUrl
        // });
      }
    }
    // For text-only posts
    // else {
    //   await Share.share({
    //     title: shareTitle,
    //     text: shareText,
    //     url: shareUrl
    //   });
    // }

    // Update share count
    await communityPostService.sharePost(props.post.id.toString());
    const updatedPost = {
      ...props.post,
      sharesCount: (props.post.sharesCount || 0) + 1,
    };
    emit('update:post', updatedPost);
  } catch (error) {
    console.error('Error sharing post:', error);
    $q.notify({
      message: 'Share not supported',
      color: 'black',
      position: 'top-right',
    });
  }
};

// Add watch for comments dialog to update comment count
watch(showComments, async (newValue) => {
  if (newValue && props.userInteractionRules) {
    if (
      props.userInteractionRules.usedCommentCount >=
      props.userInteractionRules.dailyCommentLimit
    ) {
      console.log('You have reached your daily comment limit');

      // $q.notify({
      //   me 'You have reacur daily comment limit',
      //   color: 'black',
      //sition: 'top-right'
      // });
    }
  }
});

const openWhatsApp = async () => {
  try {
    if (!props.post.id) return;

    const response = await communityService.getBusinessWhatsApp(
      props.post.id.toString()
    );
    const whatsappNumber = response.whatsappNumber;

    if (!whatsappNumber) {
      $q.notify({
        message: 'WhatsApp number not available',
        color: 'warning',
        position: 'top-right',
      });
      return;
    }

    const text = `Hi, I'm interested in your post: ${props.post.title}`;
    const encodedText = encodeURIComponent(text);
    const whatsappUrl = `https://wa.me/+91${whatsappNumber}?text=${encodedText}`;

    window.open(whatsappUrl, '_blank');
  } catch (error) {
    console.error('Error getting WhatsApp number:', error);
    $q.notify({
      message: 'Unable to connect via WhatsApp',
      color: 'negative',
      position: 'top-right',
    });
  }
};

const showLikes = ref(false);
const likesDialogRef = ref();

const showLikesList = () => {
  showLikes.value = true;
  nextTick(() => {
    if (likesDialogRef.value) {
      likesDialogRef.value.loadLikes();
    }
  });
};
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
