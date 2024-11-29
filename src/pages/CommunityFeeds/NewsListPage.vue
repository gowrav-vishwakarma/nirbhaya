<template>
  <q-page padding>
    <div class="row q-col-gutter-md">
      <!-- Compact Filter Button -->
      <div class="col-12">
        <div class="row items-center justify-between q-mb-md q-ma-none">
          <div class="text-h6 q-pl-sm" style="color: white; font-weight: 900">
            Bulletin Feed
          </div>
          <q-btn flat color="text-white" class="q-px-md" @click="showFilters = true">
          </q-btn>
        </div>
      </div>

      <!-- News List -->
      <div class="col-12" style="margin-top: -15px">
        <div class="row q-col-gutter-md">
          <!-- Skeleton loader -->
          <template v-if="loading && news.length === 0">
            <div v-for="n in pageSize" :key="n" class="col-12 col-sm-6 col-md-4">
              <q-card class="news-card">
                <q-skeleton height="200px" square />
                <q-card-section>
                  <div class="row items-center q-gutter-x-sm">
                    <q-skeleton type="QChip" width="60px" />
                    <q-skeleton type="QChip" width="80px" />
                  </div>
                  <q-skeleton type="text" class="text-h6 q-mt-sm" />
                  <q-skeleton type="text" class="q-mt-sm" />
                  <q-skeleton type="text" width="60%" />
                </q-card-section>
                <q-card-actions align="right">
                  <q-skeleton type="QBtn" width="90px" />
                </q-card-actions>
              </q-card>
            </div>
          </template>

          <!-- Existing news items -->
          <div v-for="newsItem in news" :key="newsItem.id" class="col-12 col-sm-6 col-md-4">
            <q-card class="news-card">
              <q-img v-if="newsItem.mediaUrls?.length" :src="getImageUrl(newsItem.mediaUrls[0])" :ratio="16 / 9" />
              <q-card-section>
                <div class="row items-center q-gutter-x-sm">
                  <q-chip v-for="category in newsItem.categories" :key="category" size="sm"
                    :label="getCategoryLabel(category)" />
                  <q-chip size="sm" :label="newsItem.isIndianNews ? 'Indian' : 'International'"
                    :color="newsItem.isIndianNews ? 'primary' : 'secondary'" text-color="white" />
                  <q-chip size="sm" :label="getCurrentLanguageLabel(newsItem)" color="accent" text-color="white" />
                </div>
                <div class="text-h6 q-mt-sm">{{ getNewsTitle(newsItem) }}</div>
                <div class="text-body2 q-mt-sm text-grey-8 _ellipsis-3-lines">
                  {{ getNewsContent(newsItem) }}
                </div>
              </q-card-section>
              <q-card-actions align="right">
                <q-btn v-if="newsItem.source" flat color="secondary" icon="link" label="Source (English)"
                  @click="openSource(newsItem.source)" />
              </q-card-actions>
            </q-card>
          </div>
        </div>

        <!-- Load More Button -->
        <div class="row justify-center q-mt-md">
          <!-- <q-btn v-if="hasMoreNews" color="primary" :loading="loading && news.length > 0" label="Load More"
            @click="loadMore">
            <template v-slot:loading>
              <q-spinner-dots />
            </template>
          </q-btn> -->
          <q-btn v-if="hasMoreNews" color="primary" :loading="loading" label="Load More" @click="loadMore" />
        </div>
      </div>
    </div>

    <q-page-sticky position="bottom-left" :offset="[18, 18]">
      <q-btn rounded color="primary" icon="tune" @click="showFilters = true">
        Filters
        <q-badge v-if="activeFiltersCount" color="primary" floating class="q-ml-sm">
          {{ activeFiltersCount }}
        </q-badge>
      </q-btn>
    </q-page-sticky>

    <!-- Filters Dialog -->
    <q-dialog v-model="showFilters" position="right">
      <q-card style="min-width: 350px; max-width: 95vw">
        <q-card-section class="row items-center">
          <div class="text-h6">Filter Bulletin</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section class="q-pt-none">
          <div class="column q-gutter-y-md">
            <q-select v-model="selectedNewsType" :options="newsTypeOptions" label="News Type" emit-value map-options
              @update:model-value="onNewsTypeChange" />

            <q-select v-model="selectedLanguage" :options="languageOptions" label="Language" emit-value map-options
              @update:model-value="onLanguageChange" />

            <q-select ref="categorySelect" v-model="selectedCategories" :options="newsCategories" label="Categories"
              multiple emit-value map-options use-chips clearable @update:model-value="onCategoriesChange">
              <template v-slot:after-options>
                <q-separator />
                <div class="row q-pa-sm justify-center">
                  <q-btn color="primary" label="Done" v-close-popup />
                </div>
              </template>
            </q-select>
          </div>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Clear All" color="grey-7" @click="clearFilters" :disable="!activeFiltersCount"
            :loading="loading" />
          <q-btn flat label="Apply" color="primary" @click="showFilters = false" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useUserStore } from 'stores/user-store';
import { api } from 'src/boot/axios';

const userStore = useUserStore();
const news = ref([]);
const loading = ref(false);
const page = ref(1);
const pageSize = 12;
const hasMoreNews = ref(true);

const selectedLanguage = ref(userStore.newsPreferences.language || 'en');
const selectedCategories = ref(userStore.newsPreferences.categories || []);
const selectedNewsType = ref(userStore.newsPreferences.newsType || 'all');

const languageOptions = [
  { label: 'English', value: 'en' },
  { label: 'Hindi', value: 'hi' },
  { label: 'Bengali', value: 'bn' },
  { label: 'Tamil', value: 'ta' },
  { label: 'Telugu', value: 'te' },
  { label: 'Gujarati', value: 'gu' },
  { label: 'Marathi', value: 'mr' },
  { label: 'Malayalam', value: 'ml' },
];

const newsCategories = [
  { label: 'Sports', value: 'sports' },
  { label: 'Technology', value: 'technology' },
  { label: 'Business', value: 'business' },
  { label: 'Entertainment', value: 'entertainment' },
  { label: 'Science', value: 'science' },
  { label: 'Health', value: 'health' },
  { label: 'Lifestyle', value: 'lifestyle' },
  { label: 'Education', value: 'education' },
  { label: 'Politics', value: 'politics' },
];

const newsTypeOptions = [
  { label: 'All News', value: 'all' },
  { label: 'Indian News', value: 'indian' },
  { label: 'International News', value: 'international' },
];

const showFilters = ref(false);

const activeFiltersCount = computed(() => {
  let count = 0;
  if (selectedLanguage.value !== 'en') count++;
  if (selectedCategories.value?.length > 0) count++;
  if (selectedNewsType.value !== 'all') count++;
  return count;
});

const getCategoryLabel = (value: string) => {
  return newsCategories.find((cat) => cat.value === value)?.label || value;
};

const getNewsTitle = (newsItem: any) => {
  const translation = newsItem.translations?.find(
    (t: any) => t.languageCode === selectedLanguage.value
  );
  return translation?.title || newsItem.title;
};

const getNewsContent = (newsItem: any) => {
  const translation = newsItem.translations?.find(
    (t: any) => t.languageCode === selectedLanguage.value
  );
  return translation?.content || newsItem.content;
};

const getImageUrl = (url: string) => {
  const IMAGE_CDN_URL = process.env.IMAGE_CDN_URL || '';
  if (!url) return '';
  if (url.startsWith('http')) return url;
  return `${IMAGE_CDN_URL}${url}`;
};

const getLanguageLabel = (value: string) => {
  return languageOptions.find((lang) => lang.value === value)?.label || value;
};

const getCurrentLanguageLabel = (newsItem: any) => {
  const hasTranslation = newsItem.translations?.some(
    (t: any) => t.languageCode === selectedLanguage.value
  );

  if (hasTranslation) {
    return getLanguageLabel(selectedLanguage.value);
  }

  return getLanguageLabel(newsItem.defaultLanguage);
};

async function fetchNews(reset = false) {
  if (reset) {
    page.value = 1;
    news.value = [];
    hasMoreNews.value = true;
  }

  if (!hasMoreNews.value || loading.value) return;

  try {
    loading.value = true;
    const response = await api.get('/news/user-news', {
      params: {
        page: page.value,
        pageSize,
        language: selectedLanguage.value,
        categories:
          selectedCategories.value?.length > 0
            ? selectedCategories.value
            : undefined,
        newsType: selectedNewsType.value,
      },
    });

    if (reset) {
      news.value = response.data.items;
    } else {
      news.value = [...news.value, ...response.data.items];
    }

    hasMoreNews.value = news.value.length < response.data.total;
    page.value++;
  } catch (error) {
    console.error('Error fetching news:', error);
  } finally {
    loading.value = false;
  }
}

function onLanguageChange(value: string) {
  selectedLanguage.value = value;
  userStore.setNewsPreferences({ language: value });
  fetchNews(true);
}

function onCategoriesChange(value: string[] | null) {
  selectedCategories.value = value || [];
  userStore.setNewsPreferences({ categories: value || [] });
  fetchNews(true);
}

function onNewsTypeChange(value: staring) {
  selectedNewsType.value = value;
  userStore.setNewsPreferences({ newsType: value });
  fetchNews(true);
}

function loadMore() {
  fetchNews();
}

async function clearFilters() {
  selectedLanguage.value = 'en';
  selectedCategories.value = [];
  selectedNewsType.value = 'all';
  userStore.setNewsPreferences({
    language: 'en',
    categories: [],
    newsType: 'all',
  });
  showFilters.value = false;
  await fetchNews(true);
}

function openSource(url: string) {
  if (!url) return;

  // Add http:// if the URL doesn't start with http:// or https://
  const formattedUrl = url.match(/^https?:\/\//) ? url : `http://${url}`;

  // Open in new tab
  window.open(formattedUrl, '_blank', 'noopener,noreferrer');
}

onMounted(() => {
  fetchNews();
});
</script>

<style lang="scss" scoped>
.ellipsis-3-lines {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.news-card {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.q-dialog__inner--minimized {
  padding: 0;
}
</style>
