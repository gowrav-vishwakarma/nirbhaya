<template>
  <q-layout view="lHh Lpr lFf" class="mainlayout-page-bg-color" style="z-index: 11">
    <q-header :class="[
      'text-white',
      isScrolled ? 'header-bg-color' : 'background-color-transparent',
      { hidden: isHeaderHide },
    ]">
      <q-toolbar>
        <q-toolbar-title class="text-h6" @click="userStore.isLoggedIn ? goToDashboardPage() : goToLoginPage()">
          <q-icon name="campaign" size="2em" />
          <span class="text-weight-bold">{{ $t('common.appname') }} - {{ version }}</span>
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

    <q-drawer v-model="drawer" class="bg-grey-2" :persistent="true" bordered>
      <q-list>
        <q-item @click="goToHomePage" clickable>
          <q-item-section>Home</q-item-section>
        </q-item>
        <q-item @click="goToAboutUsPage" clickable>
          <q-item-section>About Us</q-item-section>
        </q-item>
      </q-list>
    </q-drawer>

    <q-page-container class="">
      <router-view />
    </q-page-container>
    <q-footer class="text-white footerCss background-color-transparent" style="padding: 4px; padding-bottom: 5px"
      v-if="userStore.isLoggedIn && !isFooterHide">
      <q-toolbar class="footer-toolbar">
        <q-btn class="" flat aria-label="Nearby Volunteers" :disabled="!userStore.isLoggedIn"
          @click="userStore.isLoggedIn ? goToDashboardPage() : goToLoginPage()"
          style=" padding-bottom: 0; width: 60px; margin-top: 2px;">
          <div>
            <!-- <q-icon name="home" class="font-size-25"></q-icon> -->

            <svg style="margin-top: 0px;" xmlns="http://www.w3.org/2000/svg" width="26" height="26" fill="currentColor"
              viewBox="0 0 256 256">
              <path
                d="M224,115.55V208a16,16,0,0,1-16,16H168a16,16,0,0,1-16-16V168a8,8,0,0,0-8-8H112a8,8,0,0,0-8,8v40a16,16,0,0,1-16,16H48a16,16,0,0,1-16-16V115.55a16,16,0,0,1,5.17-11.78l80-75.48.11-.11a16,16,0,0,1,21.53,0,1.14,1.14,0,0,0,.11.11l80,75.48A16,16,0,0,1,224,115.55Z">
              </path>
            </svg>
            <p class="q-ma-none q-pa-none font-size-11" style="margin-top: -11px;">Home</p>
          </div>
        </q-btn>
        <q-space />

        <q-btn style=" padding-bottom: 0; width: 60px; margin-top: 2px;" class="q-pa-none" flat
          aria-label="Nearby Volunteers" :disabled="!userStore.isLoggedIn" @click="goToVolunteersPage">
          <div>
            <q-icon name="emoji_people" class="font-size-25" style="font-weight:600; font-size: 22px;"></q-icon>
            <p class="q-ma-none q-pa-none font-size-11" style="margin-top: -1px;">Nearby</p>
          </div>
        </q-btn>

        <q-space />
        <q-btn style=" padding-bottom: 0; width: 60px;margin-top: 2px;" class="q-pa-none q-ml-sm" flat
          aria-label="Incidents" @click="goToReelsPage" :disabled="!userStore.isLoggedIn">
          <div>
            <!-- <q-icon name="video_file" class="font-size-25"></q-icon> -->
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <!-- Outer rounded rectangle with gradient -->
              <defs>
                <linearGradient id="reelGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" style="stop-color:currentColor;stop-opacity:0.9" />
                  <stop offset="100%" style="stop-color:currentColor;stop-opacity:0.7" />
                </linearGradient>
              </defs>

              <!-- Main container -->
              <rect x="2" y="2" width="20" height="20" rx="5" fill="none" stroke="url(#reelGradient)"
                stroke-width="1.5" />

              <!-- Film strip dots (top) -->
              <circle cx="7" cy="4.5" r="0.8" fill="currentColor" />
              <circle cx="12" cy="4.5" r="0.8" fill="currentColor" />
              <circle cx="17" cy="4.5" r="0.8" fill="currentColor" />

              <!-- Film strip dots (bottom) -->
              <circle cx="7" cy="19.5" r="0.8" fill="currentColor" />
              <circle cx="12" cy="19.5" r="0.8" fill="currentColor" />
              <circle cx="17" cy="19.5" r="0.8" fill="currentColor" />

              <!-- Modern play symbol -->
              <path
                d="M9.5 8.5C9.5 8.0318 9.9318 7.6 10.4 7.6C10.5858 7.6 10.7665 7.65231 10.92 7.75L16.42 11.25C16.8519 11.5259 17 12.0141 17 12C17 11.9859 16.8519 12.4741 16.42 12.75L10.92 16.25C10.7665 16.3477 10.5858 16.4 10.4 16.4C9.9318 16.4 9.5 15.9682 9.5 15.5V8.5Z"
                fill="currentColor" />
            </svg>
            <p class="q-ma-none q-pa-none font-size-11" style="margin-top: -9px;">Incidents</p>
          </div>
        </q-btn>
        <q-space />
        <q-btn style=" padding-bottom: 0; width: 60px;" class="q-pa-none q-ml-sm" flat aria-label="Incidents"
          @click="goToNewsPage" :disabled="!userStore.isLoggedIn">
          <div>
            <!-- <i class="fas fa-newspaper" style="font-size: 18px"></i> -->
            <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" fill="currentColor" viewBox="0 0 24 24">
              <path
                d="M3 4h18a1 1 0 0 1 1 1v14a3 3 0 0 1-3 3H5a3 3 0 0 1-3-3V5a1 1 0 0 1 1-1zm2 2v12a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1V6H5zm6 3h6a1 1 0 1 1 0 2h-6a1 1 0 1 1 0-2zm0 4h6a1 1 0 1 1 0 2h-6a1 1 0 1 1 0-2zm-4-4h2a1 1 0 1 1 0 2H7a1 1 0 1 1 0-2zm0 4h2a1 1 0 1 1 0 2H7a1 1 0 1 1 0-2z" />
            </svg>

            <p class="q-ma-none q-pa-none font-size-11" style="margin-top: -9px;">News</p>
          </div>
        </q-btn>
        <q-space />

        <q-btn style=" padding-bottom: 0; width: 60px;" flat aria-label="Community" @click="goToCommunityPage"
          :disabled="!userStore.isLoggedIn">
          <div>

            <q-icon name="diversity_3" class="font-size-25" style="font-size: 29px; margin-top: -4px;"></q-icon>
            <p class="q-ma-none q-pa-none font-size-11" style="margin-top: -5px;">Community</p>
          </div>
        </q-btn>
      </q-toolbar>
    </q-footer>
  </q-layout>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import { useBackgroundNotifications } from 'src/composables/useBackgroundNotifications';
import { useUserStore } from 'src/stores/user-store';
import { ref, onMounted, onUnmounted, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { version } from 'src/../package.json';

const router = useRouter();
const { unreadNotificationCount, fetchUnreadNotificationCount } =
  useBackgroundNotifications();
const userStore = useUserStore();
const { locale } = useI18n();
const drawer = ref(false);
const isScrolled = ref(false);
const handleScroll = () => {
  isScrolled.value = window.scrollY > 0;
};
// Register and unregister the scroll event listener
onMounted(() => {
  window.addEventListener('scroll', handleScroll);
  locale.value = userStore.language;
});
onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll);
});

const toggleDrawer = () => {
  drawer.value = !drawer.value; // Method to toggle drawer visibility
};

const goToAccountPage = () => {
  router.push('/account');
};

const goToDashboardPage = () => {
  router.push('/sos');
};

const goToLoginPage = () => {
  router.push('/login');
};

const refreshNotifications = async () => {
  await fetchUnreadNotificationCount();
  goToNotificationsPage(true);
};

const goToNotificationsPage = () => {
  const timestamp = Date.now();
  router
    .push({ path: '/notifications', query: { key: timestamp } })
    .catch(() => {
      console.log('forced notification');
    });
};

const goToHelpPage = () => {
  router.push('/help');
};

const goToVolunteersPage = () => {
  router.push('/volunteers');
};

const goToCommunityPage = () => {
  router.push('/community');
};

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
const goToNewsPage = () => {
  router.push('/news');
  drawer.value = false;
};
// Computed property to check if the current route is 'create-reel'
const isHeaderHide = computed(() => {
  const path = router.currentRoute.value.fullPath;
  console.log('router.currentRoute.value.fullPath:', path);
  return (
    ['/create-reel', '/incident-reels', '/account'].includes(path) ||
    /^\/news\/\d+$/.test(path)
  );
});
const isFooterHide = computed(() => {
  console.log(
    'router.currentRoute.value.fullPath....',
    router.currentRoute.value.fullPath
  );
  return ['/create-reel'].includes(router.currentRoute.value.fullPath);
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
  /* CSS class to hide elements */
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
  background-color: 'rgb(208 10 78)';
  border-radius: 0 03px 3px;
}

svg {
  transition: transform 0.2s ease;
}

svg:hover {
  transform: scale(1.05);
}

.footerCss {
  // position: absolute;
  // bottom: 63px;
  // z-index: 1111;

}
</style>
