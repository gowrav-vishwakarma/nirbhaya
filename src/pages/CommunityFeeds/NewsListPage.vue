<template>
  <q-page padding style="padding-top: env(safe-area-inset-top)">
    <div class="row q-col-gutter-md">
      <!-- Compact Filter Button -->
      <div class="col-12">
        <div class="row items-center justify-between q-ma-none">
          <div
            class="text-h6 q-pl-sm q-py-md"
            style="color: white; font-weight: 900"
          >
            Bulletin Feed
            <div class="text-caption text-white-6">
              AI summaries and translations may be inaccurate. Check source.
            </div>
          </div>
        </div>
      </div>

      <!-- News List -->
      <div class="col-12" style="margin-top: -15px">
        <div class="row q-col-gutter-md">
          <!-- Skeleton loader -->
          <template v-if="loading && news.length === 0">
            <div
              v-for="n in pageSize"
              :key="n"
              class="col-12 col-sm-6 col-md-4"
            >
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
          <div
            v-for="(newsItem, index) in news"
            :key="newsItem.id"
            class="col-12 col-sm-6 col-md-4"
            :ref="el => { if (el) newsRefs[index] = el as HTMLElement }"
          >
            <q-card :class="['news-card', { 'currently-playing': isPlaying(newsItem.id) }]">
              <q-img
                v-if="newsItem.mediaUrls?.length"
                :src="getImageUrl(newsItem.mediaUrls[0])"
                :ratio="16 / 9"
              />
            <q-card-section>
              <div class="row items-center q-gutter-x-sm">
                <!-- <q-icon name="schedule" size="xs" class="q-mr-xs" />-->
                <span>Added {{ formatDate(newsItem.createdAt) }}</span>
                <q-chip
                  v-for="category in newsItem.categories"
                  :key="category"
                  size="sm"
                  :label="getCategoryLabel(category)"
                />
                <q-chip
                  size="sm"
                  :label="newsItem.isIndianNews ? 'Indian' : 'International'"
                  :color="newsItem.isIndianNews ? 'primary' : 'secondary'"
                  text-color="white"
                />
                <q-chip
                  size="sm"
                  :label="getCurrentLanguageLabel(newsItem)"
                  color="accent"
                  text-color="white"
                />
              </div>
              <div class="text-h6 q-mt-sm">{{ getNewsTitle(newsItem) }}</div>
              <div class="text-body2 q-mt-sm text-grey-8 _ellipsis-3-lines">
                {{ getNewsContent(newsItem) }}
              </div>
            </q-card-section>
            <q-card-actions align="right">
                <q-btn
                  flat
                  :color="isPlaying(newsItem.id) ? 'negative' : 'primary'"
                  :icon="isPlaying(newsItem.id) ? 'stop' : 'volume_up'"
                  :label="isLoading(newsItem.id) && !isPlaying(newsItem.id) ? 'Waiting...' : (isPlaying(newsItem.id) ? 'Stop' : 'Listen')"
                  @click="toggleAudio(newsItem)"
                  :loading="isLoading(newsItem.id) && !isPlaying(newsItem.id)"
                />
              <q-btn
                v-if="newsItem.source"
                flat
                color="secondary"
                icon="link"
                label="Source (English)"
                @click="openSource(newsItem.source)"
              />
            </q-card-actions>
          </q-card>
        </div>
        </div>

        <!-- Load More Button -->
        <div class="row justify-center q-mt-md">
          <div
            ref="scrollTarget"
            style="height: 20px; width: 100%; text-align: center"
          >
            <!-- <q-inner-loading :showing="loading && news.length > 0"> -->
            <q-spinner-dots
              :showing="loading && news.length > 0"
              size="40px"
              color="white"
            />
            <!-- </q-inner-loading> -->
          </div>
        </div>
      </div>
    </div>

    <q-page-sticky position="bottom-left" class="q-mt-sm" :offset="[18, 18]">
      <q-btn rounded color="primary" icon="tune" @click="showFilters = true">
        Filters
        <q-badge
          v-if="activeFiltersCount"
          color="primary"
          floating
          class="q-ml-sm"
        >
          {{ activeFiltersCount }}
        </q-badge>
      </q-btn>
    <br><br/>
      <q-btn rounded
            :color="isPlayingAll ? 'negative' : 'primary'"
            :icon="isPlayingAll ? 'stop' : 'volume_up'"
            :label="isPlayingAll ? 'Stop All' : 'Listen All'"
            @click="togglePlayAll"
            class="q-mr-md"
          >
            <q-badge
              v-if="isPlayingAll"
              color="white"
              text-color="primary"
              floating
            >
              {{ getProgressText() }}
            </q-badge>
          </q-btn>
    </q-page-sticky>

    <!-- Filters Dialog -->
    <q-dialog v-model="showFilters" position="right">
      <q-card style="min-width: 85vw; max-width: 95vw">
        <q-card-section class="row items-center">
          <div class="text-h6">Filter Bulletin</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section class="q-pt-none">
          <div class="column q-gutter-y-md">
            <q-select
              v-model="selectedNewsType"
              :options="newsTypeOptions"
              label="News Type"
              emit-value
              map-options
              @update:model-value="onNewsTypeChange"
            />

            <q-select
              v-model="selectedLanguage"
              :options="languageOptions"
              label="Language"
              emit-value
              map-options
              @update:model-value="onLanguageChange"
            />

            <q-select
              ref="categorySelect"
              v-model="selectedCategories"
              :options="newsCategories"
              label="Categories"
              multiple
              emit-value
              map-options
              use-chips
              clearable
              @update:model-value="onCategoriesChange"
            >
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
          <q-btn
            flat
            label="Clear All"
            color="grey-7"
            @click="clearFilters"
            :disable="!activeFiltersCount"
            :loading="loading"
          />
          <q-btn
            flat
            label="Apply"
            color="primary"
            @click="showFilters = false"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, onUnmounted } from 'vue';
import { useUserStore } from 'stores/user-store';
import { api } from 'src/boot/axios';
import { date } from 'quasar';

interface NewsItem {
  id: string;
  title: string;
  content: string;
  mediaUrls?: string[];
  categories: string[];
  isIndianNews: boolean;
  source?: string;
  translations?: Array<{
    languageCode: string;
    title: string;
    content: string;
  }>;
  defaultLanguage: string;
}

const userStore = useUserStore();
const news = ref<NewsItem[]>([]);
const loading = ref(false);
const page = ref(1);
const pageSize = 6;
const hasMoreNews = ref(true);

// Define a type for the language keys
type LanguageCode = keyof typeof languageConfig;

const selectedLanguage = ref<LanguageCode>(userStore.newsPreferences.language as LanguageCode || 'en');
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
  { label: 'Startup', value: 'startup' },
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
    isScrolling.value = true;

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
    isScrolling.value = false;
  }
}

function onLanguageChange(value: LanguageCode) {
  selectedLanguage.value = value;
  userStore.setNewsPreferences({ language: value });
  fetchNews(true);
}

function onCategoriesChange(value: string[] | null) {
  selectedCategories.value = value || [];
  userStore.setNewsPreferences({ categories: value || [] });
  fetchNews(true);
}

// Add a type for the news types
type NewsType = 'all' | 'indian' | 'international';

// Update the onNewsTypeChange function with the correct type
function onNewsTypeChange(value: NewsType) {
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

const scrollTarget = ref<HTMLElement | null>(null);
const isScrolling = ref(false);

function setupInfiniteScroll() {
  const options = {
    root: null,
    rootMargin: '0px',
    threshold: 0.5,
  };

  const observer = new IntersectionObserver(([entry]) => {
    if (
      entry.isIntersecting &&
      !loading.value &&
      hasMoreNews.value &&
      !isScrolling.value
    ) {
      loadMore();
    }
  }, options);

  if (scrollTarget.value) {
    observer.observe(scrollTarget.value);
  }

  return () => {
    if (scrollTarget.value) {
      observer.unobserve(scrollTarget.value);
    }
  };
}

// Add new refs for audio control

const currentlyPlaying = ref<string | null>(null);
const audioLoading = ref<string | null>(null);
const speechSynthesis = window.speechSynthesis;
let utterance: SpeechSynthesisUtterance | null = null;
const availableVoices = ref<SpeechSynthesisVoice[]>([]);

// Language configuration with fallbacks
const languageConfig = {
  'en': {
    primary: 'en-US',
    fallbacks: ['en-GB', 'en-IN', 'en'],
    defaultVoice: 'Microsoft David - English (United States)'
  },
  'hi': {
    primary: 'hi-IN',
    fallbacks: ['hi', 'en-IN'],
    defaultVoice: 'Microsoft Hemant - Hindi (India)'
  },
  'bn': {
    primary: 'bn-IN',
    fallbacks: ['bn', 'bn-BD', 'en-IN'],
    defaultVoice: 'Microsoft Bashkar - Bangla (India)'
  },
  'ta': {
    primary: 'ta-IN',
    fallbacks: ['ta', 'ta-LK', 'en-IN'],
    defaultVoice: 'Microsoft Valluvar - Tamil (India)'
  },
  'te': {
    primary: 'te-IN',
    fallbacks: ['te', 'en-IN'],
    defaultVoice: 'Microsoft Shruthi - Telugu (India)'
  },
  'gu': {
    primary: 'gu-IN',
    fallbacks: ['gu', 'en-IN'],
    defaultVoice: 'Microsoft Dhwani - Gujarati (India)'
  },
  'mr': {
    primary: 'mr-IN',
    fallbacks: ['mr', 'en-IN'],
    defaultVoice: 'Microsoft Swara - Marathi (India)'
  },
  'ml': {
    primary: 'ml-IN',
    fallbacks: ['ml', 'en-IN'],
    defaultVoice: 'Microsoft Sobhana - Malayalam (India)'
  }
};
// Initialize voices when they're loaded
function initializeVoices() {
  availableVoices.value = speechSynthesis.getVoices();
}

// Call initializeVoices when voices are loaded
speechSynthesis.onvoiceschanged = initializeVoices;
// Initialize immediately in case voices are already loaded
initializeVoices();

function findBestVoiceMatch(languageCode: string): SpeechSynthesisVoice | null {
  const config = languageConfig[languageCode as keyof typeof languageConfig];
  if (!config) return null;

  const voices = availableVoices.value;
  let selectedVoice: SpeechSynthesisVoice | null = null;

  // Try to find the default voice first
  selectedVoice = voices.find(voice => voice.name === config.defaultVoice) || null;
  if (selectedVoice) return selectedVoice;

  // Try primary language code
  selectedVoice = voices.find(voice => voice.lang === config.primary) || null;
  if (selectedVoice) return selectedVoice;

  // Try fallbacks
  for (const fallback of config.fallbacks) {
    selectedVoice = voices.find(voice => voice.lang.startsWith(fallback)) || null;
    if (selectedVoice) return selectedVoice;
  }

  // Last resort: try to find any voice that matches the base language code
  selectedVoice = voices.find(voice => voice.lang.startsWith(languageCode)) || null;
  if (selectedVoice) return selectedVoice;

  // If no matching voice found, return the first available voice as ultimate fallback
  return voices[0] || null;
}

// Add new functions for audio control
function isPlaying(newsId: string) {
  return currentlyPlaying.value === newsId;
}

function isLoading(newsId: string) {
  return audioLoading.value === newsId;
}

function stopCurrentAudio() {
  if (utterance && speechSynthesis.speaking) {
    speechSynthesis.cancel();
  }
  currentlyPlaying.value = null;
  utterance = null;
}

// Add new refs for global playback
const isPlayingAll = ref(false);
const currentPlayingIndex = ref(-1);
const newsRefs = ref<HTMLElement[]>([]);

// Add new functions for global playback
// Add constant for delay duration
const DELAY_BETWEEN_NEWS = 2000; // 2 seconds in milliseconds
const isFirstPlay = ref(true);

// Modify the playNext function to include delay
async function playNext() {
  if (!isPlayingAll.value) return;

  currentPlayingIndex.value++;

  // Check if we've reached the end
  if (currentPlayingIndex.value >= news.value.length) {
    stopPlayAll();
    return;
  }

  // Scroll to the current news item
  const currentElement = newsRefs.value[currentPlayingIndex.value];
  if (currentElement) {
    currentElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  // Only add delay if it's not the first article
  if (!isFirstPlay.value) {
    // Add visual indicator for the delay
    audioLoading.value = news.value[currentPlayingIndex.value].id;

    // Wait for the delay
    await new Promise(resolve => setTimeout(resolve, DELAY_BETWEEN_NEWS));

    // Check if we're still playing all after delay
    if (!isPlayingAll.value) {
      audioLoading.value = null;
      return;
    }
  } else {
    isFirstPlay.value = false;
  }

  // Play the current news item
  await toggleAudio(news.value[currentPlayingIndex.value]);
}


function stopPlayAll() {
  isPlayingAll.value = false;
  isFirstPlay.value = true;
  currentPlayingIndex.value = -1;
  stopCurrentAudio();
}

function togglePlayAll() {
  if (isPlayingAll.value) {
    stopPlayAll();
  } else {
    isPlayingAll.value = true;
    isFirstPlay.value = true;
    currentPlayingIndex.value = -1;
    playNext();
  }
}

function toggleAudio(newsItem: NewsItem) {
  return new Promise<void>((resolve) => {
    // If this item is currently playing, stop it
    if (isPlaying(newsItem.id)) {
      stopCurrentAudio();
      resolve();
      return;
    }

    // Stop any currently playing audio
    stopCurrentAudio();

    // Start new audio
    audioLoading.value = newsItem.id;

    // Get the appropriate content
    const content = getNewsContent(newsItem);
    const title = getNewsTitle(newsItem);

    // Add a small pause in the text itself to create a natural break
    const text = `${title}... ${content}`;

    utterance = new SpeechSynthesisUtterance(text);

    // Find the best matching voice
    const voice = findBestVoiceMatch(selectedLanguage.value);

    if (voice) {
      utterance.voice = voice;
      utterance.lang = voice.lang;
    } else {
      utterance.lang = languageConfig[selectedLanguage.value]?.primary || selectedLanguage.value;
    }

    // Set speech properties
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    // Set up event handlers
    utterance.onstart = () => {
      audioLoading.value = null;
      currentlyPlaying.value = newsItem.id;
    };

    utterance.onend = () => {
      currentlyPlaying.value = null;
      utterance = null;
      resolve();

      // If playing all, wait and then move to next item
      if (isPlayingAll.value) {
        playNext();
      }
    };

    utterance.onerror = (event) => {
      console.error('Speech synthesis error:', event);
      audioLoading.value = null;
      currentlyPlaying.value = null;
      utterance = null;
      resolve();

      // If playing all, still try to continue to next item
      if (isPlayingAll.value) {
        playNext();
      }
    };

    // Start speaking
    speechSynthesis.speak(utterance);
  });
}

// Add progress indicator to the template
function getProgressText() {
  if (!isPlayingAll.value || currentPlayingIndex.value === -1) return '';
  const current = currentPlayingIndex.value + 1;
  const total = news.value.length;
  const isWaiting = audioLoading.value && !currentlyPlaying.value && !isFirstPlay.value;
  return isWaiting ? `Waiting... ${current}/${total}` : `Playing ${current}/${total}`;
}

const formatDate = (dateString: string | null) => {
  if (!dateString) return 'Recent';

  console.log('Input date:', dateString); // Log the input date

  try {
    // Extract the date using Quasar's extractDate method
    const parsedDate = date.extractDate(dateString, 'YYYY-MM-DD HH:mm:ss');

    // Check if the date is valid
    if (!parsedDate || isNaN(parsedDate.getTime())) {
      console.error('Invalid date after parsing:', parsedDate); // Log invalid date
      return 'Invalid date';
    }

    // Get the current time in UTC
    const nowUTC = new Date();

    const diffInMs = nowUTC.getTime() - parsedDate.getTime();
    const diffInSeconds = Math.floor(diffInMs / 1000);
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);

    // Less than a minute
    if (diffInSeconds < 60 && diffInSeconds >= 0) {
      return 'Just now';
    }

    // Less than an hour
    if (diffInMinutes < 60 && diffInMinutes >= 0) {
      return `${diffInMinutes} ${
        diffInMinutes === 1 ? 'minute' : 'minutes'
      } ago`;
    }

    // Less than a day
    if (diffInHours < 24 && diffInHours >= 0) {
      return `${diffInHours} ${diffInHours === 1 ? 'hour' : 'hours'} ago`;
    }

    // Less than a week
    if (diffInDays < 7 && diffInDays >= 0) {
      return `${diffInDays} ${diffInDays === 1 ? 'day' : 'days'} ago`;
    }

    // More than a week, format the date
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    };

    return date.formatDate(parsedDate, 'YYYY-MM-DDTHH:mm:ss.SSSZ'); // Format the date for display
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Date error';
  }
};
// Clean up audio on component unmount
onUnmounted(() => {
  stopCurrentAudio();
  stopPlayAll();
});

onMounted(() => {
  fetchNews();
  const cleanup = setupInfiniteScroll();
  onUnmounted(cleanup);
});
</script>

<style lang="scss" scoped>
.news-card {
  height: 100%;
  display: flex;
  flex-direction: column;
  transition: all 0.3s ease;

  &.currently-playing {
    border: 2px solid var(--q-primary);
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);
  }

  &.waiting {
    border: 2px dashed var(--q-primary);
    opacity: 0.9;
  }
}
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
