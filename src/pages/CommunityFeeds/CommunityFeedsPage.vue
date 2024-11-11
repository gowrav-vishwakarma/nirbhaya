<template>
  <q-page class="community-feeds-page">
    <!-- Header Section -->
    <!-- <div class="header-section q-pa-md bg-primary text-white">
      <div class="row items-center justify-between q-mx-auto" style="max-width: 1200px">
        <div>
          <h4 class="text-h4 q-ma-none">Community Feed</h4>
          <p class="text-subtitle1 q-mt-sm">Stay connected with your community</p>
        </div>
        <q-btn round color="white" text-color="primary" icon="filter_list">
          <q-tooltip>Filter Posts</q-tooltip>
        </q-btn>
      </div>
    </div> -->

    <div class="content-wrapper q-mx-xs" style="max-width: 800px">
      <!-- Create Post Section -->
      <div class="create-post-section q-pa-md">
        <q-card class="create-post-card q-pa-md">
          <div class="row items-center flex">
            <q-avatar size="45px">
              <img src="https://cdn.quasar.dev/img/avatar.png" />
              <q-badge floating color="green" rounded />
            </q-avatar>
            <q-btn class="full-width q-ml-md post-input-btn" flat color="grey-7" @click="openCreatePostDialog">
              <div class="row full-width items-center text-left">
                <span class="text-grey-7">What's on your mind?</span>
              </div>
            </q-btn>
          </div>
        </q-card>
      </div>

      <!-- Posts Feed -->
      <div class="posts-feed q-pa-md">
        <!-- Skeleton Loader -->
        <template v-if="loading">
          <q-card v-for="n in 3" :key="n" class="post-card q-mb-md" flat bordered>
            <q-card-section>
              <div class="row items-center">
                <q-skeleton type="QAvatar" size="40px" />
                <div class="q-ml-md">
                  <q-skeleton type="text" width="150px" />
                  <q-skeleton type="text" width="100px" class="q-mt-xs" />
                </div>
              </div>
            </q-card-section>
            <q-card-section>
              <q-skeleton type="text" class="text-body1" :lines="3" />
            </q-card-section>
            <q-skeleton height="200px" square />
          </q-card>
        </template>

        <!-- Actual Posts -->
        <template v-else>
          <q-card v-for="post in posts" :key="post.id" class="post-card q-mb-md" flat bordered>
            <q-card-section>
              <div class="row items-center">
                <q-avatar size="40px">
                  <img :src="post.authorAvatar" />
                  <q-badge floating color="green" rounded />
                </q-avatar>
                <div class="q-ml-md">
                  <div class="text-weight-bold">{{ post.authorName }}</div>
                  <div class="text-caption">
                    <q-icon name="far fa-clock" size="12px" class="q-mr-xs" />
                    {{ post.timestamp }}
                  </div>
                </div>
                <q-space />
                <q-btn flat round icon="fas fa-ellipsis-h">
                  <q-menu>
                    <q-list style="min-width: 150px">
                      <q-item clickable v-close-popup>
                        <q-item-section avatar>
                          <q-icon name="far fa-bookmark" />
                        </q-item-section>
                        <q-item-section>Save post</q-item-section>
                      </q-item>
                      <q-item clickable v-close-popup>
                        <q-item-section avatar>
                          <q-icon name="far fa-flag" />
                        </q-item-section>
                        <q-item-section>Report</q-item-section>
                      </q-item>
                    </q-list>
                  </q-menu>
                </q-btn>
              </div>
            </q-card-section>

            <q-card-section>
              <div class="text-body1">{{ post.content }}</div>
              <div v-if="post.tags" class="q-mt-sm">
                <q-chip v-for="tag in post.tags" :key="tag" dense color="primary" text-color="white" size="sm">
                  #{{ tag }}
                </q-chip>
              </div>
            </q-card-section>

            <div v-if="post.images?.length" class="post-images-grid q-mt-md">
              <div class="row q-col-gutter-sm">
                <!-- Single image layout -->
                <template v-if="post.images.length === 1">
                  <div class="col-12">
                    <q-img :src="post.images[0]" :ratio="16 / 9" spinner-color="primary" spinner-size="82px"
                      class="rounded-borders">
                      <template v-slot:loading>
                        <q-skeleton type="rect" />
                      </template>
                    </q-img>
                  </div>
                </template>

                <!-- Two images layout -->
                <template v-else-if="post.images.length === 2">
                  <div v-for="(img, index) in post.images" :key="index" class="col-6">
                    <q-img :src="img" :ratio="1" spinner-color="primary" class="rounded-borders">
                      <template v-slot:loading>
                        <q-skeleton type="rect" />
                      </template>
                    </q-img>
                  </div>
                </template>

                <!-- Three or more images layout -->
                <template v-else>
                  <!-- First large image -->
                  <div class="col-12">
                    <q-img :src="post.images[0]" :ratio="16 / 9" spinner-color="primary" class="rounded-borders">
                      <template v-slot:loading>
                        <q-skeleton type="rect" />
                      </template>
                    </q-img>
                  </div>
                  <!-- Remaining images in grid -->
                  <div v-for="(img, index) in post.images.slice(1, 4)" :key="index" class="col-6">
                    <div class="image-container">
                      <q-img :src="img" :ratio="1" spinner-color="primary" class="rounded-borders">
                        <template v-slot:loading>
                          <q-skeleton type="rect" />
                        </template>
                      </q-img>
                      <!-- Show remaining count on last visible image -->
                      <div v-if="index === 2 && post.images.length > 4"
                        class="remaining-overlay flex flex-center text-white">
                        <span class="text-h5">+{{ post.images.length - 4 }}</span>
                      </div>
                    </div>
                  </div>
                </template>
              </div>
            </div>

            <q-separator />
            <q-card-actions align="around">
              <div class="row items-center q-gutter-x-sm text-grey-7">
                <q-btn flat round size="sm" :icon="post.isLiked ? 'fa-solid fa-heart' : 'fa-regular fa-heart'"
                  :color="post.isLiked ? 'red' : 'grey'" />
                <span>{{ post.likes }}</span>
                <q-space />
                <span>
                  <q-icon name="fa-regular fa-comment-dots" size="xs" class="q-mr-xs" />
                  {{ post.comments }} comments
                </span>
                <span>•</span>
                <span>
                  <q-icon name="fa-solid fa-share-nodes" size="xs" class="q-mr-xs" />
                  {{ post.shares }} shares
                </span>
              </div>
            </q-card-actions>
          </q-card>
        </template>
      </div>
    </div>

    <!-- Create Post Dialog -->
    <q-dialog v-model="createPostDialog" maximized transition-show="slide-up" transition-hide="slide-down">
      <q-card class="column">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6">Create Post</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-separator class="q-my-md" />

        <q-card-section class="col q-pt-none scroll">
          <div class="row items-center q-mb-md">
            <q-avatar size="40px">
              <img src="https://cdn.quasar.dev/img/avatar.png" />
            </q-avatar>
            <div class="q-ml-md">
              <div class="text-weight-bold">Your Name</div>
              <q-btn dense flat size="sm" icon="fas fa-globe-americas" label="Public" />
            </div>
          </div>

          <q-input v-model="newPost" type="textarea" placeholder="What do you want to share?" autogrow class="text-h6"
            borderless maxlength="500" />

          <div class="row q-mt-lg">
            <q-btn flat color="primary" class="full-width">
              <div class="row items-center">
                <q-icon name="far fa-image" size="24px" class="q-mr-sm" />
                Add Photo
              </div>
            </q-btn>
          </div>
        </q-card-section>

        <q-separator />

        <q-card-actions align="right" class="q-pa-md">
          <q-btn unelevated color="primary" label="Post" :disable="!newPost.trim()" @click="submitPost"
            class="full-width" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

const createPostDialog = ref(false)
const newPost = ref('')
const loading = ref(true)

// Simulate loading
onMounted(() => {
  setTimeout(() => {
    loading.value = false
  }, 2000)
})

// Sample posts data
const posts = ref([
  {
    id: 1,
    authorName: 'Jane Doe',
    authorAvatar: 'https://cdn.quasar.dev/img/avatar2.jpg',
    timestamp: '2h ago',
    content: 'Just attended an amazing self-defense workshop! Learning these skills makes me feel more confident and secure.',
    images: [
      'https://cdn.quasar.dev/img/parallax2.jpg',
      'https://cdn.quasar.dev/img/parallax1.jpg',
      'https://cdn.quasar.dev/img/mountains.jpg',
      'https://cdn.quasar.dev/img/parallax2.jpg',
      'https://cdn.quasar.dev/img/parallax1.jpg'
    ],
    likes: 45,
    comments: 12,
    shares: 5,
    isLiked: false,
    tags: ['SelfDefense', 'WomenEmpowerment']
  },
  {
    id: 2,
    authorName: 'John Smith',
    authorAvatar: 'https://cdn.quasar.dev/img/avatar3.jpg',
    timestamp: '5h ago',
    content: 'Important safety tips for everyone in our community. Stay alert and stay safe! 🚨',
    images: [
      'https://cdn.quasar.dev/img/mountains.jpg',
      'https://cdn.quasar.dev/img/parallax1.jpg'
    ],
    likes: 89,
    comments: 23,
    shares: 15,
    isLiked: true,
    tags: ['SafetyFirst', 'CommunityAlert']
  }
])

const openCreatePostDialog = () => {
  createPostDialog.value = true
}

const submitPost = () => {
  if (newPost.value.trim()) {
    posts.value.unshift({
      id: posts.value.length + 1,
      authorName: 'Current User',
      authorAvatar: 'https://cdn.quasar.dev/img/avatar.png',
      timestamp: 'Just now',
      content: newPost.value,
      images: [],
      likes: 0,
      comments: 0,
      shares: 0,
      isLiked: false,
      tags: []
    })
    newPost.value = ''
    createPostDialog.value = false
  }
}

const likePost = (postId: number) => {
  const post = posts.value.find((p) => p.id === postId)
  if (post) {
    post.isLiked = !post.isLiked
    post.likes += post.isLiked ? 1 : -1
  }
}
</script>

<style scoped>
.community-feeds-page {
  background: #f0f2f5;
  min-height: 100vh;
}

.content-wrapper {
  /* position: relative;
  top: -20px; */
}

.header-section {
  padding-bottom: 40px;
}

.create-post-card {
  background: white;
  border-radius: 8px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.post-input-btn {
  background: #f0f2f5;
  border-radius: 20px;
  height: 45px;
}

.post-card {
  background: white;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.post-card:hover {
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

:deep(.q-chip) {
  font-size: 12px;
}

.image-preview-container {
  position: relative;
}

.remaining-photos-overlay {
  background: rgba(0, 0, 0, 0.6);
  border-radius: 4px;
}

.absolute-full {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
}

.flex-center {
  display: flex;
  align-items: center;
  justify-content: center;
}

.post-images-grid {
  overflow: hidden;
}

.image-container {
  position: relative;
}

.remaining-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  border-radius: 4px;
}

.rounded-borders {
  border-radius: 4px;
}
</style>
