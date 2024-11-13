<template>
  <q-page class="news-page q-pa-md">
    <!-- Thumbnails Carousel -->
    <div class="thumbnails-container q-mb-md">
      <q-scroll-area horizontal style="height: 120px" class="rounded-borders snap-scroll-container">
        <div class="row no-wrap q-px-md snap-scroll-wrapper">
          <q-card v-for="(news, index) in newsItems" :key="index"
            class="news-thumbnail q-mr-md cursor-pointer snap-scroll-item" :class="{ 'active': selectedNews === index }"
            @click="selectedNews = index">
            <q-img :src="news.thumbnail" height="80px" width="120px" class="rounded-borders" />
            <div class="text-caption q-pt-sm text-center ellipsis">
              {{ news.title }}
            </div>
          </q-card>
        </div>
      </q-scroll-area>
    </div>

    <!-- Main News Content -->
    <div class="news-content" v-if="newsItems[selectedNews]">
      <q-card class="main-news-card">
        <q-img :src="newsItems[selectedNews].image" height="300px" class="rounded-borders">
          <div class="absolute-bottom text-subtitle2 text-white bg-transparent">
            {{ newsItems[selectedNews].date }}
          </div>
        </q-img>

        <q-card-section>
          <div class="text-h6">{{ newsItems[selectedNews].title }}</div>
          <div class="text-subtitle2 text-grey">{{ newsItems[selectedNews].author }}</div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          {{ newsItems[selectedNews].content }}
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat color="primary" label="Share" icon="share" />
          <q-btn flat color="primary" label="Read More" icon="arrow_forward" @click="openFullArticle(selectedNews)" />
        </q-card-actions>
      </q-card>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const selectedNews = ref(0)

const newsItems = ref([
  {
    title: 'Women Safety Initiative Launched',
    thumbnail: 'https://picsum.photos/id/1/120/80',
    image: 'https://picsum.photos/id/1/800/400',
    author: 'Jane Doe',
    date: '2024-03-20',
    content: 'A groundbreaking women safety initiative has been launched nationwide, featuring emergency response systems and community support networks. The program includes self-defense training workshops and 24/7 helpline services.'
  },
  {
    title: 'New Safety App Released',
    thumbnail: 'https://picsum.photos/id/2/120/80',
    image: 'https://picsum.photos/id/2/800/400',
    author: 'Sarah Johnson',
    date: '2024-03-19',
    content: 'A revolutionary safety app has been released that allows users to send SOS alerts with just one tap. The app includes features like location tracking, emergency contacts, and direct police connection.'
  },
  {
    title: 'Self-Defense Workshop Success',
    thumbnail: 'https://picsum.photos/id/3/120/80',
    image: 'https://picsum.photos/id/3/800/400',
    author: 'Maria Garcia',
    date: '2024-03-18',
    content: 'Over 1000 women participated in this weekend\'s self-defense workshop. The event covered basic defense techniques, situational awareness, and emergency response protocols.'
  },
  {
    title: 'Government Announces Safety Measures',
    thumbnail: 'https://picsum.photos/id/4/120/80',
    image: 'https://picsum.photos/id/4/800/400',
    author: 'Emily Chen',
    date: '2024-03-17',
    content: 'The government has announced new safety measures including increased street lighting, security cameras, and police patrols in urban areas to enhance women\'s safety.'
  },
  {
    title: 'Community Watch Program Expands',
    thumbnail: 'https://picsum.photos/id/5/120/80',
    image: 'https://picsum.photos/id/5/800/400',
    author: 'Lisa Williams',
    date: '2024-03-16',
    content: 'The successful community watch program has expanded to 10 new neighborhoods. Volunteers are trained to monitor suspicious activities and maintain communication with local law enforcement.'
  },
  {
    title: 'Safety Technology Innovation',
    thumbnail: 'https://picsum.photos/id/6/120/80',
    image: 'https://picsum.photos/id/6/800/400',
    author: 'Rachel Kumar',
    date: '2024-03-15',
    content: 'New wearable safety devices with panic buttons and GPS tracking are being distributed to college students. These devices can instantly alert authorities and nearby emergency contacts.'
  },
  {
    title: 'Women Safety Campaign Launch',
    thumbnail: 'https://picsum.photos/id/7/120/80',
    image: 'https://picsum.photos/id/7/800/400',
    author: 'Amanda Foster',
    date: '2024-03-14',
    content: 'A nationwide awareness campaign focusing on women\'s safety has been launched. The campaign includes educational programs, safety tips, and resources for emergency situations.'
  },
  {
    title: 'Safe Transport Initiative',
    thumbnail: 'https://picsum.photos/id/8/120/80',
    image: 'https://picsum.photos/id/8/800/400',
    author: 'Priya Sharma',
    date: '2024-03-13',
    content: 'A new safe transport initiative ensures women\'s safety during late-night travel. The program includes verified drivers, real-time tracking, and emergency response systems.'
  },
  {
    title: 'Corporate Safety Programs',
    thumbnail: 'https://picsum.photos/id/9/120/80',
    image: 'https://picsum.photos/id/9/800/400',
    author: 'Michelle Lee',
    date: '2024-03-12',
    content: 'Major corporations are implementing comprehensive safety programs for female employees, including safe transportation, flexible working hours, and security escorts.'
  },
  {
    title: 'Safety Helpline Success Stories',
    thumbnail: 'https://picsum.photos/id/10/120/80',
    image: 'https://picsum.photos/id/10/800/400',
    author: 'Sophie Turner',
    date: '2024-03-11',
    content: 'The 24/7 women\'s safety helpline has successfully handled over 10,000 cases in its first month. The service provides immediate assistance and counseling support.'
  }
])

const router = useRouter()

const openFullArticle = (index: number) => {
  const articleData = {
    article: newsItems.value[index],
    allNews: newsItems.value
  }
  console.log('Saving article data:', articleData)
  localStorage.setItem('currentArticle', JSON.stringify(articleData))

  router.push({
    name: 'news-article',
    params: { id: index.toString() }
  })
}
</script>

<style scoped>
.news-page {
  max-width: 1200px;
  margin: 0 auto;
}

.thumbnails-container {
  background: #f5f5f5;
  border-radius: 8px;
  padding: 10px 0;
}

.news-thumbnail {
  width: 120px;
  transition: transform 0.2s;
}

.news-thumbnail:hover {
  transform: translateY(-5px);
}

.news-thumbnail.active {
  border: 2px solid #1976d2;
}

.main-news-card {
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.ellipsis {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 120px;
}

.snap-scroll-container :deep(.scroll) {
  scroll-snap-type: x mandatory;
  scroll-behavior: smooth;
  -webkit-overflow-scrolling: touch;
}

.snap-scroll-wrapper {
  scroll-padding: 0 16px;
}

.snap-scroll-item {
  scroll-snap-align: start;
  scroll-snap-stop: always
}

/* Optional: Add custom scrollbar styling */
.snap-scroll-container :deep(.scroll)::-webkit-scrollbar {
  height: 6px;
}

.snap-scroll-container :deep(.scroll)::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.snap-scroll-container :deep(.scroll)::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 3px;
}

.snap-scroll-container :deep(.scroll)::-webkit-scrollbar-thumb:hover {
  background: #555;
}
</style>
