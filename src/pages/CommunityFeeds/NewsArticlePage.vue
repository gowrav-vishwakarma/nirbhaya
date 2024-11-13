<template>
  <q-page class="article-page">
    <!-- Horizontal Snap Scroll Container for Articles -->
    <div class="articles-scroll-container" ref="scrollContainer" @scroll="handleScroll">
      <div class="articles-scroll-wrapper" :style="{ width: `${allArticles.length * 100}%` }">
        <!-- All Articles -->
        <div v-for="(article, index) in allArticles" :key="index" class="article-section"
          :style="{ width: `${100 / allArticles.length}%` }">
          <q-card flat class="article-card">
            <q-img :src="article.image" height="400px" class="rounded-borders">
              <div class="absolute-bottom text-subtitle2 text-white bg-transparent">
                {{ article.date }}
              </div>
            </q-img>
            <q-card-section>
              <div class="text-h4">{{ article.title }}</div>
              <div class="text-subtitle1 text-grey q-mt-sm">By {{ article.author }}</div>
            </q-card-section>
            <q-card-section class="q-pt-none" style="padding-bottom: 100px;">
              <div class="text-body1">{{ article.content }}</div>
            </q-card-section>
          </q-card>
        </div>
      </div>
    </div>

    <!-- Navigation Indicators -->
    <div class="navigation-indicators q-pa-md">
      <q-btn round flat color="primary" icon="chevron_left" @click="scrollToPrevious" :disable="currentIndex === 0" />
      <div class="text-caption q-mx-sm">{{ currentIndex + 1 }} / {{ allArticles.length }}</div>
      <q-btn round flat color="primary" icon="chevron_right" @click="scrollToNext"
        :disable="currentIndex === allArticles.length - 1" />
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue'
import { useRouter, useRoute } from 'vue-router'

interface NewsItem {
  title: string
  thumbnail: string
  image: string
  author: string
  date: string
  content: string
}

const router = useRouter()
const route = useRoute()
const scrollContainer = ref<HTMLElement | null>(null)

const allArticles = ref<NewsItem[]>([])
const currentIndex = ref(0)

// Load articles from localStorage
onMounted(async () => {
  try {
    const savedData = localStorage.getItem('currentArticle')
    if (savedData) {
      const parsedData = JSON.parse(savedData)
      allArticles.value = parsedData.allNews || []
      currentIndex.value = parseInt(route.params.id as string) || 0

      // Log for debugging
      console.log('Loaded articles:', allArticles.value.length)
      console.log('Current index:', currentIndex.value)

      await nextTick()
      // Scroll to current article
      if (scrollContainer.value) {
        scrollContainer.value.scrollLeft = currentIndex.value * (scrollContainer.value.clientWidth)
      }
    } else {
      console.log('No saved data found')
      router.push({ name: 'news' })
    }
  } catch (error) {
    console.error('Error loading article:', error)
    router.push({ name: 'news' })
  }
})

// Scroll handlers
const scrollToPrevious = () => {
  if (currentIndex.value > 0 && scrollContainer.value) {
    currentIndex.value--
    scrollContainer.value.scrollTo({
      left: currentIndex.value * scrollContainer.value.clientWidth,
      behavior: 'smooth'
    })
  }
}

const scrollToNext = () => {
  if (currentIndex.value < allArticles.value.length - 1 && scrollContainer.value) {
    currentIndex.value++
    scrollContainer.value.scrollTo({
      left: currentIndex.value * scrollContainer.value.clientWidth,
      behavior: 'smooth'
    })
  }
}

let isScrolling: number | null = null
const handleScroll = () => {
  if (isScrolling !== null) {
    window.clearTimeout(isScrolling)
  }

  isScrolling = window.setTimeout(() => {
    if (!scrollContainer.value) return

    const scrollPosition = scrollContainer.value.scrollLeft
    const containerWidth = scrollContainer.value.clientWidth
    const newIndex = Math.round(scrollPosition / containerWidth)

    if (newIndex !== currentIndex.value && newIndex >= 0 && newIndex < allArticles.value.length) {
      currentIndex.value = newIndex
      // Update URL without reloading
      router.replace({
        name: 'news-article',
        params: { id: newIndex.toString() }
      })
    }
  }, 150)
}
</script>

<style scoped>
.article-page {
  height: 100vh;
  position: relative;
  overflow: hidden;
  background-color: white;
}

.articles-scroll-container {
  height: 100%;
  width: 100%;
  overflow-x: scroll;
  scroll-snap-type: x mandatory;
  -webkit-overflow-scrolling: touch;
  /* padding-top: 4rem; */
}

.articles-scroll-wrapper {
  display: flex;
  height: 100%;
}

.article-section {
  flex-shrink: 0;
  scroll-snap-align: start;
  scroll-snap-stop: always;
  /* padding: 0 1rem; */
  overflow-y: auto;
}

.article-card {
  max-width: 100%;
  margin: 0 auto;
  border-radius: 0px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.navigation-indicators {
  position: fixed;
  top: 50%;
  right: 1rem;
  transform: translateY(-50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  z-index: 10;
  padding: 0.5rem;
  border-radius: 2rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  background: rgba(255, 255, 255, 0.678);
}

/* Hide scrollbar for all scrollable elements */
.article-page,
.articles-scroll-container,
.article-section {
  -ms-overflow-style: none;
  /* IE and Edge */
  scrollbar-width: none;
  /* Firefox */
}

.article-page::-webkit-scrollbar,
.articles-scroll-container::-webkit-scrollbar,
.article-section::-webkit-scrollbar {
  display: none;
  /* Chrome, Safari and Opera */
}
</style>
