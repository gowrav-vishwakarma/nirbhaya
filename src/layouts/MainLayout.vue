<template>
  <q-layout view="lHh Lpr lFf" class="mainlayout-page-bg-color" style="z-index: 11" :key="ReloadKey">
    <q-header :class="[
      'text-white',
      isScrolled ? 'header-bg-color' : 'background-color-transparent',
      { hidden: isHeaderHide },
      { 'ios-community-header': isIOSCommunityRoute },
    ]">
      <q-toolbar>
        <q-toolbar-title class="text-h6" @click="userStore.isLoggedIn ? goToDashboardPage() : goToLoginPage()">
          <!-- <q-icon name="img:/public/sosLogo_512_512.png" size="2em" /> -->
          <q-icon name="campaign" size="2em" />
          <span class="text-weight-bold">&nbsp;{{ t('common.appname') }}</span>
        </q-toolbar-title>

        <div>
          <q-btn flat dense round icon="notifications" aria-label="Notifications" @click="refreshNotifications"
            :disabled="!userStore.isLoggedIn">
            <q-badge color="red" floating v-if="unreadNotificationCount > 0">
              {{ unreadNotificationCount }}
            </q-badge>
          </q-btn>
          <q-btn flat dense round icon="help" aria-label="Help" @click="goToHelpPage" />
          <q-btn flat round aria-label="Profile" @click="goToAccountPage" v-if="userStore.isLoggedIn">
            <div>
              <q-icon name="person"></q-icon>
            </div>
          </q-btn>
        </div>
      </q-toolbar>
    </q-header>
    <q-page-container>
      <router-view />
    </q-page-container>

    <q-footer class="text-white footerCss background-color-transparent" style="padding: 4px; padding-bottom: 5px"
      v-if="userStore.isLoggedIn && !isFooterHide">
      <q-toolbar class="footer-toolbar">
        <q-btn class="" flat aria-label="Home" :disabled="!userStore.isLoggedIn"
          @click="userStore.isLoggedIn ? goToDashboardPage() : goToLoginPage()"
          style="padding-bottom: 0; width: 60px; margin-top: 2px">
          <div>
            <svg style="margin-top: 0px" xmlns="http://www.w3.org/2000/svg" width="26" height="26" fill="currentColor"
              viewBox="0 0 256 256">
              <path
                d="M224,115.55V208a16,16,0,0,1-16,16H168a16,16,0,0,1-16-16V168a8,8,0,0,0-8-8H112a8,8,0,0,0-8,8v40a16,16,0,0,1-16,16H48a16,16,0,0,1-16-16V115.55a16,16,0,0,1,5.17-11.78l80-75.48.11-.11a16,16,0,0,1,21.53,0,1.14,1.14,0,0,0,.11.11l80,75.48A16,16,0,0,1,224,115.55Z">
              </path>
            </svg>
            <p class="q-ma-none q-pa-none font-size-11" style="margin-top: -11px">
              Home
            </p>
          </div>
        </q-btn>
        <q-space />

        <q-btn style="padding-bottom: 0; width: 60px; margin-top: 2px" class="q-pa-none" flat
          aria-label="Nearby Volunteers" :disabled="!userStore.isLoggedIn" @click="goToVolunteersPage">
          <div>
            <q-icon name="emoji_people" class="font-size-25" style="font-weight: 600; font-size: 22px"></q-icon>
            <p class="q-ma-none q-pa-none font-size-11" style="margin-top: -1px">
              Nearby
            </p>
          </div>
        </q-btn>

        <q-space v-if="isShortsVisible" />
        <q-btn v-if="isShortsVisible" style="padding-bottom: 0; width: 60px; margin-top: 2px" class="q-pa-none q-ml-sm"
          flat aria-label="Shorts" @click="goToReelsPage" :disabled="!userStore.isLoggedIn">
          <div>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <defs>
                <linearGradient id="reelGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" style="stop-color: currentColor; stop-opacity: 0.9" />
                  <stop offset="100%" style="stop-color: currentColor; stop-opacity: 0.7" />
                </linearGradient>
              </defs>
              <rect x="2" y="2" width="20" height="20" rx="5" fill="none" stroke="url(#reelGradient)"
                stroke-width="1.5" />
              <circle cx="7" cy="4.5" r="0.8" fill="currentColor" />
              <circle cx="12" cy="4.5" r="0.8" fill="currentColor" />
              <circle cx="17" cy="4.5" r="0.8" fill="currentColor" />
              <circle cx="7" cy="19.5" r="0.8" fill="currentColor" />
              <circle cx="12" cy="19.5" r="0.8" fill="currentColor" />
              <circle cx="17" cy="19.5" r="0.8" fill="currentColor" />
              <path
                d="M9.5 8.5C9.5 8.0318 9.9318 7.6 10.4 7.6C10.5858 7.6 10.7665 7.65231 10.92 7.75L16.42 11.25C16.8519 11.5259 17 12.0141 17 12C17 11.9859 16.8519 12.4741 16.42 12.75L10.92 16.25C10.7665 16.3477 10.5858 16.4 10.4 16.4C9.9318 16.4 9.5 15.9682 9.5 15.5V8.5Z"
                fill="currentColor" />
            </svg>
            <p class="q-ma-none q-pa-none font-size-11" style="margin-top: -9px">
              Shorts
            </p>
          </div>
        </q-btn>

        <q-space />
        <q-btn style="padding-bottom: 0; width: 60px" class="q-pa-none q-ml-sm" flat aria-label="News"
          @click="goToNewsPage" :disabled="!userStore.isLoggedIn">
          <div>
            <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" fill="currentColor" viewBox="0 0 24 24">
              <path
                d="M3 4h18a1 1 0 0 1 1 1v14a3 3 0 0 1-3 3H5a3 3 0 0 1-3-3V5a1 1 0 0 1 1-1zm2 2v12a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1V6H5zm6 3h6a1 1 0 1 1 0 2h-6a1 1 0 1 1 0-2zm0 4h6a1 1 0 1 1 0 2h-6a1 1 0 1 1 0-2zm-4-4h2a1 1 0 1 1 0 2H7a1 1 0 1 1 0-2zm0 4h2a1 1 0 1 1 0 2H7a1 1 0 1 1 0-2z" />
            </svg>
            <p class="q-ma-none q-pa-none font-size-11" style="margin-top: -9px">
              Bulletin
            </p>
          </div>
        </q-btn>

        <q-space />
        <q-btn style="padding-bottom: 0; width: 60px" flat aria-label="Community" @click="goToCommunityPage"
          :disabled="!userStore.isLoggedIn">
          <div>
            <q-icon name="diversity_3" class="font-size-25" style="font-size: 29px; margin-top: -4px"></q-icon>
            <p class="q-ma-none q-pa-none font-size-11" style="margin-top: -5px">
              Community
            </p>
          </div>
        </q-btn>
      </q-toolbar>
    </q-footer>
  </q-layout>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import { useQuasar } from 'quasar';
import { useBackgroundNotifications } from 'src/composables/useBackgroundNotifications';
import { useUserStore } from 'src/stores/user-store';
import { ref, onMounted, onUnmounted, computed, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useMediaPermissions } from 'src/composables/useMediaPermissions';
import { api } from 'src/boot/axios';
import { StatusBar } from '@capacitor/status-bar';

const $q = useQuasar();
const router = useRouter();
const { t, locale } = useI18n();
const { unreadNotificationCount, fetchUnreadNotificationCount } =
  useBackgroundNotifications();
const userStore = useUserStore();
const drawer = ref(false);
const isScrolled = ref(false);
const isShortsVisible = process.env.SHORTS_VISIBLE === 'true';
const ReloadKey = ref(8877);

const { stopAllMediaStreams } = useMediaPermissions();

const isAppOpenedToday = () => {
  const lastOpenedDate = localStorage.getItem('lastAppOpenedDate');
  const today = new Date().toDateString();

  if (lastOpenedDate !== today) {
    localStorage.setItem('lastAppOpenedDate', today);
    return false; // App wasn't opened today
  }
  return true; // App was already opened today
};

const checkFirstTimeOpen = async () => {
  const isSOSAppOpened = localStorage.getItem('isSOSAppOpened');
  if (!isSOSAppOpened) {
    localStorage.setItem('isSOSAppOpened', 'true');
    console.log('App opened for the first time');
  }
  console.log('App opened again');

  // Check if app was opened today
  if (!isAppOpenedToday()) {
    try {
      await updateEventCount('appOpen');
      console.log('App open count incremented');
    } catch (error) {
      console.error('Failed to increment app open count:', error);
    }
  }
};

// Register all lifecycle hooks first
onMounted(() => {
  window.addEventListener('scroll', handleScroll);
  locale.value = userStore.language;
  checkFirstTimeOpen();

  if ($q.platform.is.capacitor || $q.platform.is.nativeMobile) {
    StatusBar.setBackgroundColor({ color: '#db1b5d' }); // Change color code according to your theme
  }

  // Initial route check
  const currentPath = router.currentRoute.value.path;
  if (shouldStopPermissions(currentPath)) {
    void performMediaCleanup();
  }

  // Navigation guard setup
  router.beforeEach(async (to, from, next) => {
    if (shouldStopPermissions(to.path)) {
      await performMediaCleanup();
    }
    next();
  });
});

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll);
});

// Helper function to determine if permissions should be stopped
const shouldStopPermissions = (path: string) => {
  return path === '/' || path === '/sos';
};

// Enhanced cleanup function with multiple attempts
const performMediaCleanup = async () => {
  console.log('Performing media cleanup');
  try {
    await stopAllMediaStreams();

    // Multiple cleanup attempts with different intervals
    const cleanupIntervals = [50, 100, 200];
    for (const interval of cleanupIntervals) {
      setTimeout(async () => {
        try {
          await stopAllMediaStreams();
          console.log(`Cleanup attempt at ${interval}ms successful`);
        } catch (error) {
          console.error(`Cleanup attempt at ${interval}ms failed:`, error);
        }
      }, interval);
    }
  } catch (error) {
    console.error('Initial cleanup attempt failed:', error);
  }
};

// Handle scroll events
const handleScroll = () => {
  isScrolled.value = window.scrollY > 0;
  // Set the status bar color based on scroll
  // if (isScrolled.value) {
  //   StatusBar.setBackgroundColor({ color: '#000' });
  // } else {
  //   StatusBar.setBackgroundColor({ color: '#db1b5d' }); // Reset to original color if needed
  // }
};

// Navigation functions
const goToAccountPage = () => router.push('/account');
const goToDashboardPage = () => router.push('/');
const goToLoginPage = () => router.push('/login');
const goToVolunteersPage = () => router.push('/volunteers');
const goToCommunityPage = () => router.push('/comunity-post');
const goToHomePage = () => {
  router.push('/home');
  drawer.value = false;
};
const goToAboutUsPage = () => {
  router.push('/about-us');
  drawer.value = false;
};
const goToReelsPage = () => {
  router.push('/incident-reels');
  drawer.value = false;
};
const goToNewsPage = async () => {
  // Only call API if not already on news page
  if (router.currentRoute.value.path !== '/news') {
    try {
      await updateEventCount('news');
      // await api.post('global/event-count-update', {
      //   type: 'news'
      // });
    } catch (error) {
      console.error('Failed to update event count:', error);
    }
  }
  router.push('/news');
  drawer.value = false;
};

const updateEventCount = async (type: string) => {
  try {
    await api.post('global/event-count-update', {
      type: type,
      userId: userStore.user.id,
    });
  } catch (error) {
    console.error('Failed to update event count:', error);
  }
};
const goToHelpPage = () => router.push('/help');

const refreshNotifications = async () => {
  await fetchUnreadNotificationCount();
  const timestamp = Date.now();
  router
    .push({
      path: '/notifications',
      query: { key: timestamp },
    })
    .catch(() => {
      console.log('forced notification');
    });
};

// Computed properties
const isHeaderHide = computed(() => {
  const path = router.currentRoute.value.path;
  const hiddenPaths = [
    '/create-reel',
    '/incident-reels',
    '/account',
    '/sos-mode',
    '/my-posts'
  ];

  // If on iOS and path is /comunity-post, don't hide the header
  if ($q.platform.is.ios && path === '/comunity-post') {
    return false;
  }

  return (
    hiddenPaths.includes(path) ||
    /^\/news\/\d+$/.test(path) ||
    /^\/my-posts\/\d+$/.test(path) ||
    (!$q.platform.is.ios && path === '/comunity-post')
  );
});

const isFooterHide = computed(() => {
  const currentPath = router.currentRoute.value.path;
  return ['/create-reel'].includes(currentPath);
});

const isIOSCommunityRoute = computed(() => {
  return (
    $q.platform.is.ios && router.currentRoute.value.path === '/comunity-post'
  );
});
</script>

<style lang="scss" scoped>
.mainlayout-page-bg-color {
  background: linear-gradient(135deg, $primary, darken($primary, 20%));
}

.background-color-transparent {
  background-color: #00000000;
}

.hidden {
  display: none;
}

.font-size-11 {
  font-size: 9px;
  font-weight: 700;
}

.font-size-26 {
  font-size: 26px;
}

.footer-toolbar {
  padding-top: 1px;
  padding-bottom: 0px;
  border-radius: 10px;
  background-color: rgb(208 10 78);
  display: flex;
  justify-content: flex-end;
  box-shadow: 0px 4px 8px rgba(78, 25, 25, 0.699);
}

.bg-green {
  background-color: green !important;
}

.background-color-transparent {
  background-color: transparent !important;
}

.header-bg-color {
  background-color: #db1b5d;
  border-radius: 0 03px 3px;
}

svg {
  transition: transform 0.2s ease;
}

svg:hover {
  transform: scale(1.05);
}

.ios-community-header {
  // height: 2px !important;
  // min-height: 2px !important;
  background-color: #00000000 !important;

  // Hide the toolbar content when in iOS community route
  .q-toolbar {
    display: none;
  }
}
</style>
