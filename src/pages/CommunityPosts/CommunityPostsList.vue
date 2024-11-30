<template>
  <q-page padding>
    <div class="row q-col-gutter-md">
      <!-- Header -->
      <div class="col-12">
        <h4 class="q-my-none">Community Posts</h4>
      </div>

      <!-- Posts Grid -->
      <div class="col-12">
        <div class="row q-col-gutter-md">
          <div v-for="post in posts" :key="post.id" class="col-12 col-sm-6 col-md-4">
            <q-card class="post-card">
              <!-- Media Section -->
              <q-carousel v-if="post.mediaUrls && post.mediaUrls.length" v-model="post.activeSlide" arrows navigation
                infinite>
                <q-carousel-slide v-for="(media, index) in post.mediaUrls" :key="index" :name="index">
                  <q-img :src="media" :ratio="16 / 9" />
                </q-carousel-slide>
              </q-carousel>

              <q-card-section>
                <div class="row items-center q-gutter-sm">
                  <q-badge
                    :color="post.priority === 'high' ? 'negative' : post.priority === 'medium' ? 'warning' : 'positive'">
                    {{ post.priority }}
                  </q-badge>
                  <q-badge :color="post.status === 'active' ? 'positive' : 'negative'">
                    {{ post.status }}
                  </q-badge>
                  <q-badge color="purple">{{ post.postType }}</q-badge>
                </div>

                <div class="text-h6 q-mt-sm">{{ post.title }}</div>
                <div class="text-body2 text-grey-7">{{ truncateText(post.description, 100) }}</div>

                <!-- Tags -->
                <div class="q-mt-sm">
                  <q-chip v-for="tag in post.tags" :key="tag" size="sm" outline>
                    {{ tag }}
                  </q-chip>
                </div>
              </q-card-section>

              <q-card-section>
                <div class="row items-center justify-between">
                  <div class="row q-gutter-sm">
                    <q-btn flat round size="sm" icon="thumb_up">
                      <q-badge color="primary" floating>{{ post.likesCount }}</q-badge>
                    </q-btn>
                    <q-btn flat round size="sm" icon="comment">
                      <q-badge color="primary" floating>{{ post.commentsCount }}</q-badge>
                    </q-btn>
                    <q-btn flat round size="sm" icon="share">
                      <q-badge color="primary" floating>{{ post.sharesCount }}</q-badge>
                    </q-btn>
                  </div>
                </div>
              </q-card-section>
            </q-card>
          </div>
        </div>
      </div>

      <!-- Pagination -->
      <div class="col-12 flex justify-center q-mt-md">
        <q-pagination v-model="currentPage" :max="totalPages" :max-pages="6" boundary-links direction-links />
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { useQuasar } from 'quasar';
import axios from 'axios';

interface Post {
  id: number;
  title: string;
  description: string;
  mediaUrls: string[];
  priority: string;
  status: string;
  postType: string;
  tags: string[];
  likesCount: number;
  commentsCount: number;
  sharesCount: number;
  activeSlide?: number;
}

const $q = useQuasar();

// State
const posts = ref<Post[]>([]);
const currentPage = ref(1);
const totalPages = ref(1);

// Methods
const loadPosts = async () => {
  try {
    const response = await axios.get('/posts/community-posts', {
      params: {
        page: currentPage.value,
        status: 'active'
      }
    });

    posts.value = response.data.data;
    totalPages.value = response.data.totalPages;
  } catch (error) {
    $q.notify({
      color: 'negative',
      message: 'Failed to load posts',
      icon: 'error'
    });
  }
};

const truncateText = (text: string, length: number) => {
  if (!text) return '';
  return text.length > length ? text.substring(0, length) + '...' : text;
};

// Watch for page changes
watch(currentPage, () => {
  loadPosts();
});

// Lifecycle
onMounted(() => {
  loadPosts();
});
</script>

<style scoped>
.post-card {
  height: 100%;
  display: flex;
  flex-direction: column;
}
</style>
